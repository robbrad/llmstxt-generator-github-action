import { glob } from 'glob';

/**
 * Recursively scans a directory for markdown files (.md, .mdx, and .markdown)
 * @param directory - The directory to scan
 * @param excludePattern - Glob pattern for files to exclude
 * @returns Array of relative file paths
 */
export async function scanMarkdownFiles(
  directory: string,
  excludePattern: string = ''
): Promise<string[]> {
  // Find all markdown files recursively
  const pattern = '**/*.{md,mdx,markdown}';
  
  // Parse exclude pattern - split by comma if multiple patterns provided
  const ignorePatterns = excludePattern
    ? excludePattern.split(',').map(p => p.trim()).filter(p => p.length > 0)
    : [];
  
  const options: any = {
    cwd: directory,
    nodir: true,
    dot: false,
    ignore: ignorePatterns
  };
  
  try {
    const files = await glob(pattern, options);
    // Normalize path separators for consistency
    return files.map(file => file.replace(/\\/g, '/'));
  } catch (error) {
    // If directory cannot be read or doesn't exist, return empty array
    return [];
  }
}
