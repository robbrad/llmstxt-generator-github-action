import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import {
  extractTitle,
  extractDescription,
  categorizeFile,
  parseMarkdownFile
} from './parser';
import type { SectionMapping } from './types';

describe('extractTitle', () => {
  it('should extract H1 heading with # format', () => {
    const content = '# My Title\n\nSome content here.';
    expect(extractTitle(content)).toBe('My Title');
  });

  it('should extract H1 heading with multiple words', () => {
    const content = '# Getting Started with the API\n\nContent...';
    expect(extractTitle(content)).toBe('Getting Started with the API');
  });

  it('should extract H1 with setext style (underline with ===)', () => {
    const content = 'My Title\n========\n\nSome content.';
    expect(extractTitle(content)).toBe('My Title');
  });

  it('should handle H1 with extra whitespace', () => {
    const content = '#    Title with spaces   \n\nContent.';
    expect(extractTitle(content)).toBe('Title with spaces');
  });

  it('should return null when no H1 exists', () => {
    const content = '## H2 Heading\n\nSome content.';
    expect(extractTitle(content)).toBeNull();
  });

  it('should return null for empty content', () => {
    expect(extractTitle('')).toBeNull();
  });

  it('should extract first H1 when multiple exist', () => {
    const content = '# First Title\n\nContent\n\n# Second Title';
    expect(extractTitle(content)).toBe('First Title');
  });
});

describe('extractDescription', () => {
  it('should extract first paragraph after H1', () => {
    const content = '# Title\n\nThis is the description.\n\nMore content.';
    expect(extractDescription(content)).toBe('This is the description.');
  });

  it('should handle H1 with setext style', () => {
    const content = 'Title\n=====\n\nThis is the description.';
    expect(extractDescription(content)).toBe('This is the description.');
  });

  it('should skip blockquotes and find first paragraph', () => {
    const content = '# Title\n\n> A quote\n\nThis is the description.';
    expect(extractDescription(content)).toBe('This is the description.');
  });

  it('should skip H2 headings and find first paragraph', () => {
    const content = '# Title\n\n## Subtitle\n\nThis is the description.';
    expect(extractDescription(content)).toBe('This is the description.');
  });

  it('should return empty string when no description exists', () => {
    const content = '# Title\n\n## Another Heading';
    expect(extractDescription(content)).toBe('');
  });

  it('should handle multi-line paragraphs', () => {
    const content = '# Title\n\nThis is a description\nthat spans multiple lines.';
    expect(extractDescription(content)).toBe('This is a description that spans multiple lines.');
  });

  it('should return empty string for content without H1', () => {
    const content = 'Just some content without heading.';
    expect(extractDescription(content)).toBe('Just some content without heading.');
  });
});

describe('categorizeFile', () => {
  it('should match file to correct section based on pattern', () => {
    const sections: SectionMapping = {
      'Docs': 'docs/**',
      'Examples': 'examples/**'
    };
    
    expect(categorizeFile('docs/getting-started.md', sections)).toBe('Docs');
    expect(categorizeFile('examples/basic.md', sections)).toBe('Examples');
  });

  it('should match nested paths correctly', () => {
    const sections: SectionMapping = {
      'API': 'docs/api/**',
      'Guides': 'docs/guides/**'
    };
    
    expect(categorizeFile('docs/api/reference.md', sections)).toBe('API');
    expect(categorizeFile('docs/guides/tutorial.md', sections)).toBe('Guides');
  });

  it('should use first matching pattern', () => {
    const sections: SectionMapping = {
      'All': '**',
      'Docs': 'docs/**'
    };
    
    // "All" pattern matches first
    expect(categorizeFile('docs/test.md', sections)).toBe('All');
  });

  it('should default to "Docs" when no pattern matches', () => {
    const sections: SectionMapping = {
      'Examples': 'examples/**'
    };
    
    expect(categorizeFile('other/file.md', sections)).toBe('Docs');
  });

  it('should handle wildcard patterns', () => {
    const sections: SectionMapping = {
      'Root': '*.md',
      'Nested': '**/*.md'
    };
    
    expect(categorizeFile('README.md', sections)).toBe('Root');
    expect(categorizeFile('docs/guide.md', sections)).toBe('Nested');
  });

  it('should handle Windows-style paths', () => {
    const sections: SectionMapping = {
      'Docs': 'docs/**'
    };
    
    expect(categorizeFile('docs\\getting-started.md', sections)).toBe('Docs');
  });
});

describe('parseMarkdownFile', () => {
  const testDir = join(process.cwd(), 'test-temp-parser');
  
  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should parse markdown file with H1 and description', async () => {
    const content = '# Test Title\n\nThis is a test description.\n\nMore content.';
    const filePath = 'test.md';
    const fullPath = join(testDir, filePath);
    await writeFile(fullPath, content);

    const sections: SectionMapping = { 'Docs': '**' };
    const result = await parseMarkdownFile(
      filePath,
      fullPath,
      'https://example.com',
      sections
    );

    expect(result.title).toBe('Test Title');
    expect(result.description).toBe('This is a test description.');
    expect(result.content).toBe(content);
    expect(result.url).toBe('https://example.com/test');
    expect(result.section).toBe('Docs');
    expect(result.path).toBe(filePath);
  });

  it('should fallback to filename when no H1 exists', async () => {
    const content = 'Just some content without a heading.';
    const filePath = 'my-document.md';
    const fullPath = join(testDir, filePath);
    await writeFile(fullPath, content);

    const sections: SectionMapping = { 'Docs': '**' };
    const result = await parseMarkdownFile(
      filePath,
      fullPath,
      'https://example.com',
      sections
    );

    expect(result.title).toBe('my-document');
  });

  it('should handle .mdx files', async () => {
    const content = '# MDX File\n\nDescription here.';
    const filePath = 'component.mdx';
    const fullPath = join(testDir, filePath);
    await writeFile(fullPath, content);

    const sections: SectionMapping = { 'Docs': '**' };
    const result = await parseMarkdownFile(
      filePath,
      fullPath,
      'https://example.com',
      sections
    );

    expect(result.title).toBe('MDX File');
    expect(result.url).toBe('https://example.com/component');
  });

  it('should categorize file based on path', async () => {
    const content = '# Example\n\nAn example file.';
    const filePath = 'examples/basic.md';
    const fullPath = join(testDir, 'examples', 'basic.md');
    await mkdir(join(testDir, 'examples'), { recursive: true });
    await writeFile(fullPath, content);

    const sections: SectionMapping = {
      'Examples': 'examples/**',
      'Docs': '**'
    };
    const result = await parseMarkdownFile(
      filePath,
      fullPath,
      'https://example.com',
      sections
    );

    expect(result.section).toBe('Examples');
  });

  it('should generate correct URL with nested paths', async () => {
    const content = '# Nested Doc\n\nDescription.';
    const filePath = 'docs/api/reference.md';
    const fullPath = join(testDir, 'docs', 'api', 'reference.md');
    await mkdir(join(testDir, 'docs', 'api'), { recursive: true });
    await writeFile(fullPath, content);

    const sections: SectionMapping = { 'Docs': '**' };
    const result = await parseMarkdownFile(
      filePath,
      fullPath,
      'https://example.com',
      sections
    );

    expect(result.url).toBe('https://example.com/docs/api/reference');
  });

  it('should handle base URL with trailing slash', async () => {
    const content = '# Test\n\nDescription.';
    const filePath = 'test.md';
    const fullPath = join(testDir, filePath);
    await writeFile(fullPath, content);

    const sections: SectionMapping = { 'Docs': '**' };
    const result = await parseMarkdownFile(
      filePath,
      fullPath,
      'https://example.com/',
      sections
    );

    expect(result.url).toBe('https://example.com/test');
  });

  it('should preserve full markdown content', async () => {
    const content = '# Title\n\nParagraph 1.\n\n## Section\n\nParagraph 2.\n\n```js\ncode\n```';
    const filePath = 'test.md';
    const fullPath = join(testDir, filePath);
    await writeFile(fullPath, content);

    const sections: SectionMapping = { 'Docs': '**' };
    const result = await parseMarkdownFile(
      filePath,
      fullPath,
      'https://example.com',
      sections
    );

    expect(result.content).toBe(content);
  });
});
