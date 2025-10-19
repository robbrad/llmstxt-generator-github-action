import { describe, it, expect } from 'vitest';
import { generateLlmsTxt, generateLlmsFullTxt, writeOutputFiles } from './generator';
import { MarkdownFile } from './types';

describe('generateLlmsTxt', () => {
  // Test spec-compliant output format (Requirement 2.1)
  it('should generate spec-compliant output with H1 header', () => {
    const files: MarkdownFile[] = [
      {
        path: 'docs/guide.md',
        title: 'Getting Started',
        description: 'A guide to get started',
        content: '# Getting Started\n\nA guide to get started',
        url: 'https://example.com/docs/guide',
        section: 'Docs'
      }
    ];

    const result = generateLlmsTxt(files, 'My Project');

    expect(result).toContain('# My Project');
    expect(result.startsWith('# My Project\n')).toBe(true);
  });

  // Test blockquote with project description (Requirement 2.4)
  it('should include blockquote when project description is provided', () => {
    const files: MarkdownFile[] = [
      {
        path: 'docs/guide.md',
        title: 'Getting Started',
        description: 'A guide to get started',
        content: '# Getting Started\n\nA guide to get started',
        url: 'https://example.com/docs/guide',
        section: 'Docs'
      }
    ];

    const result = generateLlmsTxt(files, 'My Project', 'This is a test project');

    expect(result).toContain('> This is a test project');
  });

  // Test omitting blockquote when no description (Requirement 2.4)
  it('should omit blockquote when project description is empty', () => {
    const files: MarkdownFile[] = [
      {
        path: 'docs/guide.md',
        title: 'Getting Started',
        description: 'A guide to get started',
        content: '# Getting Started\n\nA guide to get started',
        url: 'https://example.com/docs/guide',
        section: 'Docs'
      }
    ];

    const result = generateLlmsTxt(files, 'My Project', '');

    expect(result).not.toContain('>');
    expect(result).toContain('# My Project\n\n## Docs');
  });

  // Test section grouping (Requirement 2.8)
  it('should group files by section under H2 headers', () => {
    const files: MarkdownFile[] = [
      {
        path: 'docs/guide.md',
        title: 'Getting Started',
        description: 'A guide',
        content: '',
        url: 'https://example.com/docs/guide',
        section: 'Docs'
      },
      {
        path: 'examples/basic.md',
        title: 'Basic Example',
        description: 'An example',
        content: '',
        url: 'https://example.com/examples/basic',
        section: 'Examples'
      },
      {
        path: 'docs/api.md',
        title: 'API Reference',
        description: 'API docs',
        content: '',
        url: 'https://example.com/docs/api',
        section: 'Docs'
      }
    ];

    const result = generateLlmsTxt(files, 'My Project');

    expect(result).toContain('## Docs');
    expect(result).toContain('## Examples');
    
    // Check that files are grouped correctly
    const docsSection = result.split('## Docs')[1].split('## Examples')[0];
    expect(docsSection).toContain('Getting Started');
    expect(docsSection).toContain('API Reference');
    
    const examplesSection = result.split('## Examples')[1];
    expect(examplesSection).toContain('Basic Example');
  });

  // Test list item format with description (Requirements 2.4, 2.5)
  it('should format list items as "- [Title](url): Description"', () => {
    const files: MarkdownFile[] = [
      {
        path: 'docs/guide.md',
        title: 'Getting Started',
        description: 'A comprehensive guide',
        content: '',
        url: 'https://example.com/docs/guide',
        section: 'Docs'
      }
    ];

    const result = generateLlmsTxt(files, 'My Project');

    expect(result).toContain('- [Getting Started](https://example.com/docs/guide): A comprehensive guide');
  });

  // Test optional description handling (Requirement 2.6)
  it('should omit colon and description when description is empty', () => {
    const files: MarkdownFile[] = [
      {
        path: 'docs/guide.md',
        title: 'Getting Started',
        description: '',
        content: '',
        url: 'https://example.com/docs/guide',
        section: 'Docs'
      }
    ];

    const result = generateLlmsTxt(files, 'My Project');

    expect(result).toContain('- [Getting Started](https://example.com/docs/guide)');
    expect(result).not.toContain('- [Getting Started](https://example.com/docs/guide):');
  });

  // Test Optional section handling (Requirement 2.8)
  it('should place Optional section last', () => {
    const files: MarkdownFile[] = [
      {
        path: 'optional/old.md',
        title: 'Old Doc',
        description: 'Deprecated',
        content: '',
        url: 'https://example.com/optional/old',
        section: 'Optional'
      },
      {
        path: 'docs/guide.md',
        title: 'Getting Started',
        description: 'A guide',
        content: '',
        url: 'https://example.com/docs/guide',
        section: 'Docs'
      },
      {
        path: 'examples/basic.md',
        title: 'Basic Example',
        description: 'An example',
        content: '',
        url: 'https://example.com/examples/basic',
        section: 'Examples'
      }
    ];

    const result = generateLlmsTxt(files, 'My Project');

    // Optional should be last
    const sections = result.match(/## \w+/g) || [];
    expect(sections[sections.length - 1]).toBe('## Optional');
  });

  // Test alphabetical section ordering (except Optional)
  it('should sort sections alphabetically with Optional last', () => {
    const files: MarkdownFile[] = [
      {
        path: 'z.md',
        title: 'Z',
        description: '',
        content: '',
        url: 'https://example.com/z',
        section: 'Zebra'
      },
      {
        path: 'a.md',
        title: 'A',
        description: '',
        content: '',
        url: 'https://example.com/a',
        section: 'Apple'
      },
      {
        path: 'o.md',
        title: 'O',
        description: '',
        content: '',
        url: 'https://example.com/o',
        section: 'Optional'
      },
      {
        path: 'm.md',
        title: 'M',
        description: '',
        content: '',
        url: 'https://example.com/m',
        section: 'Mango'
      }
    ];

    const result = generateLlmsTxt(files, 'My Project');

    const sections = result.match(/## \w+/g) || [];
    expect(sections).toEqual(['## Apple', '## Mango', '## Zebra', '## Optional']);
  });

  // Test complete spec-compliant structure
  it('should generate complete spec-compliant structure', () => {
    const files: MarkdownFile[] = [
      {
        path: 'docs/guide.md',
        title: 'Getting Started',
        description: 'Quick start guide',
        content: '',
        url: 'https://example.com/docs/guide',
        section: 'Docs'
      }
    ];

    const result = generateLlmsTxt(files, 'Test Project', 'A test project description');

    // Should have all required elements in order
    expect(result).toMatch(/# Test Project\n\n> A test project description\n\n## Docs\n\n- \[Getting Started\]\(https:\/\/example\.com\/docs\/guide\): Quick start guide\n/);
  });

  // Test handling files with no section (default to Docs)
  it('should default to Docs section when section is empty', () => {
    const files: MarkdownFile[] = [
      {
        path: 'readme.md',
        title: 'README',
        description: 'Main readme',
        content: '',
        url: 'https://example.com/readme',
        section: ''
      }
    ];

    const result = generateLlmsTxt(files, 'My Project');

    expect(result).toContain('## Docs');
    expect(result).toContain('- [README](https://example.com/readme): Main readme');
  });

  // Test multiple files in same section maintain order
  it('should maintain file order within sections', () => {
    const files: MarkdownFile[] = [
      {
        path: 'docs/first.md',
        title: 'First',
        description: 'First doc',
        content: '',
        url: 'https://example.com/docs/first',
        section: 'Docs'
      },
      {
        path: 'docs/second.md',
        title: 'Second',
        description: 'Second doc',
        content: '',
        url: 'https://example.com/docs/second',
        section: 'Docs'
      },
      {
        path: 'docs/third.md',
        title: 'Third',
        description: 'Third doc',
        content: '',
        url: 'https://example.com/docs/third',
        section: 'Docs'
      }
    ];

    const result = generateLlmsTxt(files, 'My Project');

    const docsSection = result.split('## Docs')[1];
    const firstIndex = docsSection.indexOf('First');
    const secondIndex = docsSection.indexOf('Second');
    const thirdIndex = docsSection.indexOf('Third');

    expect(firstIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(thirdIndex);
  });
});

describe('generateLlmsFullTxt', () => {
  // Test source attribution format (Requirement 3.2)
  it('should prefix each file with "Source: {url}" header', () => {
    const files: MarkdownFile[] = [
      {
        path: 'docs/guide.md',
        title: 'Getting Started',
        description: 'A guide',
        content: '# Getting Started\n\nThis is the guide content.',
        url: 'https://example.com/docs/guide',
        section: 'Docs'
      }
    ];

    const result = generateLlmsFullTxt(files);

    expect(result).toContain('Source: https://example.com/docs/guide');
    expect(result.startsWith('Source: https://example.com/docs/guide\n')).toBe(true);
  });

  // Test content preservation (Requirements 3.1, 3.4)
  it('should include complete markdown content and preserve all formatting', () => {
    const content = '# Getting Started\n\nThis is **bold** and *italic*.\n\n```js\nconst x = 1;\n```\n\n- List item 1\n- List item 2';
    const files: MarkdownFile[] = [
      {
        path: 'docs/guide.md',
        title: 'Getting Started',
        description: 'A guide',
        content: content,
        url: 'https://example.com/docs/guide',
        section: 'Docs'
      }
    ];

    const result = generateLlmsFullTxt(files);

    // Should contain the exact content
    expect(result).toContain(content);
    // Should preserve markdown formatting
    expect(result).toContain('**bold**');
    expect(result).toContain('*italic*');
    expect(result).toContain('```js');
    expect(result).toContain('const x = 1;');
    expect(result).toContain('- List item 1');
  });

  // Test file separation (Requirement 3.3)
  it('should separate files with blank lines', () => {
    const files: MarkdownFile[] = [
      {
        path: 'docs/first.md',
        title: 'First',
        description: 'First doc',
        content: '# First\n\nFirst content.',
        url: 'https://example.com/docs/first',
        section: 'Docs'
      },
      {
        path: 'docs/second.md',
        title: 'Second',
        description: 'Second doc',
        content: '# Second\n\nSecond content.',
        url: 'https://example.com/docs/second',
        section: 'Docs'
      }
    ];

    const result = generateLlmsFullTxt(files);

    // Check that files are separated by blank lines
    expect(result).toContain('First content.\n\nSource: https://example.com/docs/second');
  });

  // Test ordering consistency (Requirement 3.6)
  it('should maintain same ordering as llms.txt', () => {
    const files: MarkdownFile[] = [
      {
        path: 'optional/old.md',
        title: 'Old Doc',
        description: 'Deprecated',
        content: '# Old Doc\n\nOld content.',
        url: 'https://example.com/optional/old',
        section: 'Optional'
      },
      {
        path: 'docs/guide.md',
        title: 'Getting Started',
        description: 'A guide',
        content: '# Getting Started\n\nGuide content.',
        url: 'https://example.com/docs/guide',
        section: 'Docs'
      },
      {
        path: 'examples/basic.md',
        title: 'Basic Example',
        description: 'An example',
        content: '# Basic Example\n\nExample content.',
        url: 'https://example.com/examples/basic',
        section: 'Examples'
      }
    ];

    const result = generateLlmsFullTxt(files);

    // Find positions of each file's content
    const docsIndex = result.indexOf('Guide content.');
    const examplesIndex = result.indexOf('Example content.');
    const optionalIndex = result.indexOf('Old content.');

    // Should be in same order as llms.txt: Docs, Examples, Optional
    expect(docsIndex).toBeLessThan(examplesIndex);
    expect(examplesIndex).toBeLessThan(optionalIndex);
  });

  // Test multiple files in same section
  it('should handle multiple files in the same section', () => {
    const files: MarkdownFile[] = [
      {
        path: 'docs/first.md',
        title: 'First',
        description: 'First doc',
        content: '# First\n\nFirst content.',
        url: 'https://example.com/docs/first',
        section: 'Docs'
      },
      {
        path: 'docs/second.md',
        title: 'Second',
        description: 'Second doc',
        content: '# Second\n\nSecond content.',
        url: 'https://example.com/docs/second',
        section: 'Docs'
      },
      {
        path: 'docs/third.md',
        title: 'Third',
        description: 'Third doc',
        content: '# Third\n\nThird content.',
        url: 'https://example.com/docs/third',
        section: 'Docs'
      }
    ];

    const result = generateLlmsFullTxt(files);

    // All files should be present
    expect(result).toContain('Source: https://example.com/docs/first');
    expect(result).toContain('First content.');
    expect(result).toContain('Source: https://example.com/docs/second');
    expect(result).toContain('Second content.');
    expect(result).toContain('Source: https://example.com/docs/third');
    expect(result).toContain('Third content.');
  });

  // Test section ordering matches llms.txt (alphabetical with Optional last)
  it('should order sections alphabetically with Optional last', () => {
    const files: MarkdownFile[] = [
      {
        path: 'z.md',
        title: 'Z',
        description: '',
        content: '# Z\n\nZebra content.',
        url: 'https://example.com/z',
        section: 'Zebra'
      },
      {
        path: 'a.md',
        title: 'A',
        description: '',
        content: '# A\n\nApple content.',
        url: 'https://example.com/a',
        section: 'Apple'
      },
      {
        path: 'o.md',
        title: 'O',
        description: '',
        content: '# O\n\nOptional content.',
        url: 'https://example.com/o',
        section: 'Optional'
      }
    ];

    const result = generateLlmsFullTxt(files);

    const appleIndex = result.indexOf('Apple content.');
    const zebraIndex = result.indexOf('Zebra content.');
    const optionalIndex = result.indexOf('Optional content.');

    // Should be in alphabetical order with Optional last
    expect(appleIndex).toBeLessThan(zebraIndex);
    expect(zebraIndex).toBeLessThan(optionalIndex);
  });

  // Test empty files array
  it('should handle empty files array', () => {
    const files: MarkdownFile[] = [];

    const result = generateLlmsFullTxt(files);

    expect(result).toBe('\n');
  });

  // Test single file
  it('should handle single file correctly', () => {
    const files: MarkdownFile[] = [
      {
        path: 'readme.md',
        title: 'README',
        description: 'Main readme',
        content: '# README\n\nThis is the readme.',
        url: 'https://example.com/readme',
        section: 'Docs'
      }
    ];

    const result = generateLlmsFullTxt(files);

    expect(result).toBe('Source: https://example.com/readme\n\n# README\n\nThis is the readme.\n');
  });

  // Test content with special characters and formatting
  it('should preserve special characters and complex formatting', () => {
    const complexContent = '# API Reference\n\n## Authentication\n\n```bash\ncurl -H "Authorization: Bearer $TOKEN" https://api.example.com\n```\n\n### Response\n\n```json\n{\n  "status": "success",\n  "data": {\n    "user": "john@example.com"\n  }\n}\n```\n\n> **Note:** This is important!\n\n- Item with `code`\n- Item with [link](https://example.com)\n- Item with **bold** and *italic*';
    
    const files: MarkdownFile[] = [
      {
        path: 'api.md',
        title: 'API Reference',
        description: 'API docs',
        content: complexContent,
        url: 'https://example.com/api',
        section: 'Docs'
      }
    ];

    const result = generateLlmsFullTxt(files);

    // Should preserve all special characters and formatting
    expect(result).toContain(complexContent);
    expect(result).toContain('"Authorization: Bearer $TOKEN"');
    expect(result).toContain('{\n  "status": "success"');
    expect(result).toContain('> **Note:** This is important!');
    expect(result).toContain('Item with `code`');
  });
});

describe('writeOutputFiles', () => {
  // Import modules at the top
  const fs = require('fs');
  const path = require('path');
  const os = require('os');

  // Helper to create a temporary test directory
  const createTempDir = (): string => {
    const tempDir = path.join(os.tmpdir(), `llms-txt-test-${Date.now()}`);
    return tempDir;
  };

  // Helper to clean up test directory
  const cleanupDir = (dir: string): void => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  };

  // Test directory creation (Requirement 1.2, 6.3)
  it('should create output directory if it does not exist', async () => {
    const tempDir = createTempDir();
    const outputDir = path.join(tempDir, 'nested', 'output');

    try {
      // Ensure directory doesn't exist
      expect(fs.existsSync(outputDir)).toBe(false);

      await writeOutputFiles(
        '# Test Project\n\n## Docs\n\n- [Test](https://example.com/test)\n',
        'Source: https://example.com/test\n\n# Test\n',
        outputDir,
        1
      );

      // Directory should now exist
      expect(fs.existsSync(outputDir)).toBe(true);
    } finally {
      cleanupDir(tempDir);
    }
  });

  // Test file writing (Requirement 1.2)
  it('should write llms.txt to output directory', async () => {
    const tempDir = createTempDir();

    try {
      const llmsTxtContent = '# Test Project\n\n## Docs\n\n- [Test](https://example.com/test): Test description\n';

      await writeOutputFiles(
        llmsTxtContent,
        'Source: https://example.com/test\n\n# Test\n',
        tempDir,
        1
      );

      const llmsTxtPath = path.join(tempDir, 'llms.txt');
      expect(fs.existsSync(llmsTxtPath)).toBe(true);

      const content = fs.readFileSync(llmsTxtPath, 'utf-8');
      expect(content).toBe(llmsTxtContent);
    } finally {
      cleanupDir(tempDir);
    }
  });

  // Test file writing (Requirement 1.2)
  it('should write llms-full.txt to output directory', async () => {
    const tempDir = createTempDir();

    try {
      const llmsFullTxtContent = 'Source: https://example.com/test\n\n# Test\n\nTest content.\n';

      await writeOutputFiles(
        '# Test Project\n\n## Docs\n\n- [Test](https://example.com/test)\n',
        llmsFullTxtContent,
        tempDir,
        1
      );

      const llmsFullTxtPath = path.join(tempDir, 'llms-full.txt');
      expect(fs.existsSync(llmsFullTxtPath)).toBe(true);

      const content = fs.readFileSync(llmsFullTxtPath, 'utf-8');
      expect(content).toBe(llmsFullTxtContent);
    } finally {
      cleanupDir(tempDir);
    }
  });

  // Test result object generation (Requirement 6.3)
  it('should return GenerationResult with file paths and count', async () => {
    const tempDir = createTempDir();

    try {
      const result = await writeOutputFiles(
        '# Test Project\n\n## Docs\n\n- [Test](https://example.com/test)\n',
        'Source: https://example.com/test\n\n# Test\n',
        tempDir,
        5
      );

      expect(result.filesProcessed).toBe(5);
      expect(result.llmsTxtPath).toBe(path.join(tempDir, 'llms.txt'));
      expect(result.llmsFullTxtPath).toBe(path.join(tempDir, 'llms-full.txt'));
    } finally {
      cleanupDir(tempDir);
    }
  });

  // Test overwriting existing files
  it('should overwrite existing files', async () => {
    const tempDir = createTempDir();

    try {
      fs.mkdirSync(tempDir, { recursive: true });

      // Write initial content
      const initialContent = '# Initial Content\n';
      await writeOutputFiles(
        initialContent,
        'Initial full content\n',
        tempDir,
        1
      );

      // Verify initial content
      const llmsTxtPath = path.join(tempDir, 'llms.txt');
      let content = fs.readFileSync(llmsTxtPath, 'utf-8');
      expect(content).toBe(initialContent);

      // Overwrite with new content
      const newContent = '# Updated Content\n';
      await writeOutputFiles(
        newContent,
        'Updated full content\n',
        tempDir,
        2
      );

      // Verify content was overwritten
      content = fs.readFileSync(llmsTxtPath, 'utf-8');
      expect(content).toBe(newContent);
    } finally {
      cleanupDir(tempDir);
    }
  });

  // Test with existing directory
  it('should work with existing output directory', async () => {
    const tempDir = createTempDir();

    try {
      // Create directory first
      fs.mkdirSync(tempDir, { recursive: true });
      expect(fs.existsSync(tempDir)).toBe(true);

      const result = await writeOutputFiles(
        '# Test Project\n',
        'Source: test\n',
        tempDir,
        1
      );

      expect(result.filesProcessed).toBe(1);
      expect(fs.existsSync(result.llmsTxtPath)).toBe(true);
      expect(fs.existsSync(result.llmsFullTxtPath)).toBe(true);
    } finally {
      cleanupDir(tempDir);
    }
  });

  // Test with complex content
  it('should handle complex content with special characters', async () => {
    const tempDir = createTempDir();

    try {
      const complexLlmsTxt = '# Test Project\n\n> Project with "quotes" and \'apostrophes\'\n\n## Docs\n\n- [Test](https://example.com/test?param=value&other=123): Description with $pecial ch@rs!\n';
      const complexLlmsFull = 'Source: https://example.com/test\n\n# Test\n\n```javascript\nconst x = "hello";\n```\n\n> Quote block\n';

      await writeOutputFiles(
        complexLlmsTxt,
        complexLlmsFull,
        tempDir,
        1
      );

      const llmsTxtPath = path.join(tempDir, 'llms.txt');
      const llmsFullTxtPath = path.join(tempDir, 'llms-full.txt');

      const llmsTxtContent = fs.readFileSync(llmsTxtPath, 'utf-8');
      const llmsFullTxtContent = fs.readFileSync(llmsFullTxtPath, 'utf-8');

      expect(llmsTxtContent).toBe(complexLlmsTxt);
      expect(llmsFullTxtContent).toBe(complexLlmsFull);
    } finally {
      cleanupDir(tempDir);
    }
  });

  // Test with zero files processed
  it('should handle zero files processed', async () => {
    const tempDir = createTempDir();

    try {
      const result = await writeOutputFiles(
        '# Test Project\n\n## Docs\n\n',
        '',
        tempDir,
        0
      );

      expect(result.filesProcessed).toBe(0);
      expect(fs.existsSync(result.llmsTxtPath)).toBe(true);
      expect(fs.existsSync(result.llmsFullTxtPath)).toBe(true);
    } finally {
      cleanupDir(tempDir);
    }
  });

  // Test with deeply nested directory
  it('should create deeply nested directory structure', async () => {
    const tempDir = createTempDir();
    const deepDir = path.join(tempDir, 'a', 'b', 'c', 'd', 'e', 'output');

    try {
      await writeOutputFiles(
        '# Test\n',
        'Source: test\n',
        deepDir,
        1
      );

      expect(fs.existsSync(deepDir)).toBe(true);
      expect(fs.existsSync(path.join(deepDir, 'llms.txt'))).toBe(true);
      expect(fs.existsSync(path.join(deepDir, 'llms-full.txt'))).toBe(true);
    } finally {
      cleanupDir(tempDir);
    }
  });
});
