/**
 * Recursively scans a directory for markdown files (.md, .mdx, and .markdown)
 * @param directory - The directory to scan
 * @param excludePattern - Glob pattern for files to exclude
 * @returns Array of relative file paths
 */
export declare function scanMarkdownFiles(directory: string, excludePattern?: string): Promise<string[]>;
