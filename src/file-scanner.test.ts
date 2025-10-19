import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { scanMarkdownFiles } from './file-scanner';

const TEST_DIR = path.join(__dirname, '../test-fixtures');

describe('file-scanner', () => {
  beforeEach(async () => {
    // Create test directory structure
    await fs.promises.mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.promises.rm(TEST_DIR, { recursive: true, force: true });
  });

  describe('scanMarkdownFiles', () => {
    it('should find all markdown files recursively', async () => {
      // Create test files
      await fs.promises.mkdir(path.join(TEST_DIR, 'docs'), { recursive: true });
      await fs.promises.mkdir(path.join(TEST_DIR, 'docs/nested'), { recursive: true });
      await fs.promises.writeFile(path.join(TEST_DIR, 'README.md'), '# Test');
      await fs.promises.writeFile(path.join(TEST_DIR, 'docs/guide.md'), '# Guide');
      await fs.promises.writeFile(path.join(TEST_DIR, 'docs/nested/deep.mdx'), '# Deep');
      await fs.promises.writeFile(path.join(TEST_DIR, 'other.txt'), 'not markdown');

      const files = await scanMarkdownFiles(TEST_DIR);

      expect(files).toHaveLength(3);
      expect(files).toContain('README.md');
      expect(files).toContain('docs/guide.md');
      expect(files).toContain('docs/nested/deep.mdx');
      expect(files).not.toContain('other.txt');
    });

    it('should exclude files matching the exclude pattern', async () => {
      // Create test files
      await fs.promises.mkdir(path.join(TEST_DIR, 'docs'), { recursive: true });
      await fs.promises.mkdir(path.join(TEST_DIR, 'node_modules'), { recursive: true });
      await fs.promises.writeFile(path.join(TEST_DIR, 'README.md'), '# Test');
      await fs.promises.writeFile(path.join(TEST_DIR, 'docs/guide.md'), '# Guide');
      await fs.promises.writeFile(path.join(TEST_DIR, 'node_modules/package.md'), '# Package');

      const files = await scanMarkdownFiles(TEST_DIR, '**/node_modules/**');

      expect(files).toHaveLength(2);
      expect(files).toContain('README.md');
      expect(files).toContain('docs/guide.md');
      expect(files).not.toContain('node_modules/package.md');
    });

    it('should handle empty directories', async () => {
      // Create empty directory structure
      await fs.promises.mkdir(path.join(TEST_DIR, 'empty'), { recursive: true });
      await fs.promises.mkdir(path.join(TEST_DIR, 'empty/nested'), { recursive: true });

      const files = await scanMarkdownFiles(TEST_DIR);

      expect(files).toHaveLength(0);
    });

    it('should handle non-existent directories', async () => {
      const nonExistentDir = path.join(TEST_DIR, 'does-not-exist');

      const files = await scanMarkdownFiles(nonExistentDir);

      expect(files).toHaveLength(0);
    });

    it('should find .md, .mdx, and .markdown files', async () => {
      await fs.promises.writeFile(path.join(TEST_DIR, 'file1.md'), '# MD File');
      await fs.promises.writeFile(path.join(TEST_DIR, 'file2.mdx'), '# MDX File');
      await fs.promises.writeFile(path.join(TEST_DIR, 'file3.markdown'), '# Markdown File');

      const files = await scanMarkdownFiles(TEST_DIR);

      expect(files).toHaveLength(3);
      expect(files).toContain('file1.md');
      expect(files).toContain('file2.mdx');
      expect(files).toContain('file3.markdown');
    });

    it('should normalize path separators', async () => {
      await fs.promises.mkdir(path.join(TEST_DIR, 'sub'), { recursive: true });
      await fs.promises.writeFile(path.join(TEST_DIR, 'sub/file.md'), '# Test');

      const files = await scanMarkdownFiles(TEST_DIR);

      expect(files).toHaveLength(1);
      // Should use forward slashes regardless of platform
      expect(files[0]).toBe('sub/file.md');
    });

    it('should handle multiple exclude patterns', async () => {
      await fs.promises.mkdir(path.join(TEST_DIR, 'docs'), { recursive: true });
      await fs.promises.mkdir(path.join(TEST_DIR, 'archive'), { recursive: true });
      await fs.promises.writeFile(path.join(TEST_DIR, 'README.md'), '# Test');
      await fs.promises.writeFile(path.join(TEST_DIR, 'docs/guide.md'), '# Guide');
      await fs.promises.writeFile(path.join(TEST_DIR, 'archive/old.md'), '# Old');

      const files = await scanMarkdownFiles(TEST_DIR, '**/archive/**');

      expect(files).toHaveLength(2);
      expect(files).toContain('README.md');
      expect(files).toContain('docs/guide.md');
      expect(files).not.toContain('archive/old.md');
    });

    it('should handle comma-separated exclude patterns', async () => {
      await fs.promises.mkdir(path.join(TEST_DIR, 'docs'), { recursive: true });
      await fs.promises.mkdir(path.join(TEST_DIR, 'draft'), { recursive: true });
      await fs.promises.mkdir(path.join(TEST_DIR, 'node_modules'), { recursive: true });
      await fs.promises.writeFile(path.join(TEST_DIR, 'README.md'), '# Test');
      await fs.promises.writeFile(path.join(TEST_DIR, 'docs/guide.md'), '# Guide');
      await fs.promises.writeFile(path.join(TEST_DIR, 'draft/wip.md'), '# WIP');
      await fs.promises.writeFile(path.join(TEST_DIR, 'node_modules/dep.md'), '# Dep');

      const files = await scanMarkdownFiles(TEST_DIR, '**/draft/**,**/node_modules/**');

      expect(files).toHaveLength(2);
      expect(files).toContain('README.md');
      expect(files).toContain('docs/guide.md');
      expect(files).not.toContain('draft/wip.md');
      expect(files).not.toContain('node_modules/dep.md');
    });

    it('should handle comma-separated patterns with spaces', async () => {
      await fs.promises.mkdir(path.join(TEST_DIR, 'docs'), { recursive: true });
      await fs.promises.mkdir(path.join(TEST_DIR, 'draft'), { recursive: true });
      await fs.promises.writeFile(path.join(TEST_DIR, 'README.md'), '# Test');
      await fs.promises.writeFile(path.join(TEST_DIR, 'docs/guide.md'), '# Guide');
      await fs.promises.writeFile(path.join(TEST_DIR, 'draft/wip.md'), '# WIP');

      // Test with spaces around commas
      const files = await scanMarkdownFiles(TEST_DIR, '**/draft/** , **/test/**');

      expect(files).toHaveLength(2);
      expect(files).toContain('README.md');
      expect(files).toContain('docs/guide.md');
      expect(files).not.toContain('draft/wip.md');
    });
  });
});
