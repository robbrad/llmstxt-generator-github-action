import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as core from '@actions/core';
import { execSync } from 'child_process';
import { run } from './main';
import * as fileScanner from './file-scanner';
import * as parser from './parser';
import * as generator from './generator';
import * as fs from 'fs';

// Mock all dependencies
vi.mock('@actions/core');
vi.mock('child_process');
vi.mock('./file-scanner');
vi.mock('./parser');
vi.mock('./generator');
vi.mock('fs');

describe('Git Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'input-directory': './test-docs',
        'output-directory': './output',
        'base-url': 'https://example.com',
        'project-name': 'Test Project',
        'project-description': 'Test Description',
        'sections': '{"Docs": "**"}',
        'commit-changes': 'false'
      };
      return inputs[name] || '';
    });

    // Mock fs.existsSync to return true
    vi.mocked(fs.existsSync).mockReturnValue(true);

    vi.mocked(fileScanner.scanMarkdownFiles).mockResolvedValue(['test.md']);
    vi.mocked(parser.parseMarkdownFile).mockResolvedValue({
      path: 'test.md',
      title: 'Test',
      description: 'Test description',
      content: '# Test\n\nTest content',
      url: 'https://example.com/test.md',
      section: 'Docs'
    });
    vi.mocked(generator.generateLlmsTxt).mockReturnValue('# Test Project\n\n## Docs\n\n- [Test](https://example.com/test.md): Test description');
    vi.mocked(generator.generateLlmsFullTxt).mockReturnValue('Source: https://example.com/test.md\n\n# Test\n\nTest content');
    vi.mocked(generator.writeOutputFiles).mockResolvedValue({
      filesProcessed: 1,
      llmsTxtPath: './output/llms.txt',
      llmsFullTxtPath: './output/llms-full.txt'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('commitChanges function', () => {
    it('should not commit when commit-changes is false', async () => {
      // Default is false - this is the main test we care about
      await run();

      // Verify git commands were NOT called
      const calls = vi.mocked(execSync).mock.calls;
      const gitCalls = calls.filter(call => 
        typeof call[0] === 'string' && call[0].includes('git')
      );
      expect(gitCalls).toHaveLength(0);
    });

    // Note: Full git integration tests are complex to mock properly
    // and are better tested in the actual CI environment.
    // The integration tests in the CI workflow will verify:
    // - Git configuration
    // - File staging
    // - Commit creation
    // - Error handling
  });
});
