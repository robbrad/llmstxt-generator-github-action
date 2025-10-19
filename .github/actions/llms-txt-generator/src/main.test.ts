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
    it('should commit changes when commit-changes is true', async () => {
      // Requirement 7.1: Optionally commit changes
      vi.mocked(core.getInput).mockImplementation((name: string) => {
        const inputs: Record<string, string> = {
          'input-directory': './test-docs',
          'output-directory': './output',
          'base-url': 'https://example.com',
          'project-name': 'Test Project',
          'commit-changes': 'true'
        };
        return inputs[name] || '';
      });

      // Mock git status to show changes
      vi.mocked(execSync).mockImplementation((command: string, options?: any) => {
        if (command === 'git status --porcelain') {
          return 'M llms.txt\nM llms-full.txt\n';
        }
        return '';
      });

      await run();

      // Verify git configuration (Requirement 7.5)
      expect(execSync).toHaveBeenCalledWith('git config user.name "github-actions[bot]"', { stdio: 'inherit' });
      expect(execSync).toHaveBeenCalledWith('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'inherit' });

      // Verify files are staged (Requirement 7.2)
      expect(execSync).toHaveBeenCalledWith('git add "./output/llms.txt"', { stdio: 'inherit' });
      expect(execSync).toHaveBeenCalledWith('git add "./output/llms-full.txt"', { stdio: 'inherit' });

      // Verify status check was called
      expect(execSync).toHaveBeenCalledWith('git status --porcelain', { encoding: 'utf-8' });

      // Verify commit with descriptive message (Requirement 7.3)
      expect(execSync).toHaveBeenCalledWith('git commit -m "chore: update llms.txt files"', { stdio: 'inherit' });
    });

    it('should skip commit when no changes detected', async () => {
      // Requirement 7.4: Skip if no changes detected
      vi.mocked(core.getInput).mockImplementation((name: string) => {
        const inputs: Record<string, string> = {
          'input-directory': './test-docs',
          'output-directory': './output',
          'base-url': 'https://example.com',
          'project-name': 'Test Project',
          'commit-changes': 'true'
        };
        return inputs[name] || '';
      });

      // Mock git status to show no changes
      vi.mocked(execSync).mockImplementation((command: string, options?: any) => {
        if (command === 'git status --porcelain') {
          return '';
        }
        return '';
      });

      await run();

      // Verify git config was called
      expect(execSync).toHaveBeenCalledWith('git config user.name "github-actions[bot]"', { stdio: 'inherit' });

      // Verify status check was called
      expect(execSync).toHaveBeenCalledWith('git status --porcelain', { encoding: 'utf-8' });

      // Verify commit was NOT called
      const calls = vi.mocked(execSync).mock.calls;
      const commitCalls = calls.filter(call => call[0].includes('git commit'));
      expect(commitCalls).toHaveLength(0);

      // Verify info message about skipping
      expect(core.info).toHaveBeenCalledWith('No changes detected, skipping commit');
    });

    it('should configure git user correctly', async () => {
      // Requirement 7.5: Configure git user appropriately
      vi.mocked(core.getInput).mockImplementation((name: string) => {
        const inputs: Record<string, string> = {
          'input-directory': './test-docs',
          'output-directory': './output',
          'base-url': 'https://example.com',
          'project-name': 'Test Project',
          'commit-changes': 'true'
        };
        return inputs[name] || '';
      });

      vi.mocked(execSync).mockImplementation((command: string, options?: any) => {
        if (command === 'git status --porcelain') {
          return 'M llms.txt\n';
        }
        return '';
      });

      await run();

      // Verify github-actions bot configuration
      expect(execSync).toHaveBeenCalledWith('git config user.name "github-actions[bot]"', { stdio: 'inherit' });
      expect(execSync).toHaveBeenCalledWith('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'inherit' });
    });

    it('should not commit when commit-changes is false', async () => {
      // Default is false
      await run();

      // Verify git commands were NOT called
      expect(execSync).not.toHaveBeenCalledWith(
        expect.stringContaining('git'),
        expect.anything()
      );
    });

    it('should handle git errors gracefully', async () => {
      // Test that git errors don't fail the action
      vi.mocked(core.getInput).mockImplementation((name: string) => {
        const inputs: Record<string, string> = {
          'input-directory': './test-docs',
          'output-directory': './output',
          'base-url': 'https://example.com',
          'project-name': 'Test Project',
          'commit-changes': 'true'
        };
        return inputs[name] || '';
      });

      // Mock git to throw an error
      vi.mocked(execSync).mockImplementation((command: string) => {
        if (command.includes('git config')) {
          throw new Error('Git not configured');
        }
        return Buffer.from('');
      });

      await run();

      // Verify warning was logged
      expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('Failed to commit changes'));

      // Verify action didn't fail
      expect(core.setFailed).not.toHaveBeenCalled();
    });
  });
});
