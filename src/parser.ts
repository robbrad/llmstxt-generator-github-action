import { readFile } from 'fs/promises';
import { basename } from 'path';
import { minimatch } from 'minimatch';
import type { MarkdownFile, SectionMapping } from './types';

/**
 * Extracts YAML frontmatter from markdown content
 * @param content - The markdown content
 * @returns Object with frontmatter data and content without frontmatter
 */
function extractFrontmatter(content: string): { frontmatter: Record<string, any>, contentWithoutFrontmatter: string } {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  
  if (!frontmatterMatch) {
    return { frontmatter: {}, contentWithoutFrontmatter: content };
  }

  const frontmatterText = frontmatterMatch[1];
  const contentWithoutFrontmatter = frontmatterMatch[2];
  
  // Simple YAML parsing for title and description
  const frontmatter: Record<string, any> = {};
  const lines = frontmatterText.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^\s*(\w+):\s*["']?(.+?)["']?\s*$/);
    if (match) {
      frontmatter[match[1]] = match[2];
    }
  }
  
  return { frontmatter, contentWithoutFrontmatter };
}

/**
 * Extracts the first H1 heading from markdown content
 * Supports both # Heading and Heading\n=== formats
 * @param content - The markdown content
 * @returns The H1 heading text or null if not found
 */
export function extractTitle(content: string): string | null {
  // Match # Heading format
  const hashMatch = content.match(/^#\s+(.+)$/m);
  if (hashMatch) {
    return hashMatch[1].trim();
  }

  // Match Heading\n=== format (setext style)
  const setextMatch = content.match(/^(.+)\n=+\s*$/m);
  if (setextMatch) {
    return setextMatch[1].trim();
  }

  return null;
}

/**
 * Extracts the first paragraph after the H1 heading as description
 * @param content - The markdown content
 * @returns The description text or empty string if not found
 */
export function extractDescription(content: string): string {
  // Remove the H1 heading first
  let contentAfterH1 = content;
  
  // Remove # Heading format
  contentAfterH1 = contentAfterH1.replace(/^#\s+.+$/m, '');
  
  // Remove Heading\n=== format
  contentAfterH1 = contentAfterH1.replace(/^.+\n=+\s*$/m, '');

  // Find the first non-empty paragraph
  // Split by double newlines and filter out empty lines
  const paragraphs = contentAfterH1
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0 && !p.startsWith('#') && !p.startsWith('>'));

  if (paragraphs.length > 0) {
    // Return first paragraph, removing any inline markdown formatting for cleaner description
    return paragraphs[0].replace(/\n/g, ' ').trim();
  }

  return '';
}

/**
 * Categorizes a file into a section based on path patterns
 * @param filePath - The relative file path
 * @param sections - Mapping of section names to glob patterns
 * @returns The section name that matches the file path
 */
export function categorizeFile(
  filePath: string,
  sections: SectionMapping
): string {
  // Normalize path separators to forward slashes for consistent matching
  const normalizedPath = filePath.replace(/\\/g, '/');

  // Check each section pattern in order
  for (const [sectionName, pattern] of Object.entries(sections)) {
    if (minimatch(normalizedPath, pattern)) {
      return sectionName;
    }
  }

  // Default to "Docs" if no pattern matches
  return 'Docs';
}

/**
 * Generates a URL for a markdown file
 * @param filePath - The relative file path
 * @param baseUrl - The base URL for the site
 * @returns The full URL to the file
 */
function generateUrl(filePath: string, baseUrl: string): string {
  // Normalize path separators to forward slashes
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Remove .md, .mdx, or .markdown extension for cleaner URLs
  const pathWithoutExt = normalizedPath.replace(/\.(md|mdx|markdown)$/, '');
  
  // Ensure baseUrl doesn't end with slash and path doesn't start with slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanPath = pathWithoutExt.replace(/^\//, '');
  
  return `${cleanBaseUrl}/${cleanPath}`;
}

/**
 * Parses a markdown file and extracts all metadata
 * @param filePath - The relative file path from input directory
 * @param fullPath - The absolute file path to read
 * @param baseUrl - The base URL for generating links
 * @param sections - Mapping of section names to directory patterns
 * @returns A MarkdownFile object with all extracted metadata
 */
export async function parseMarkdownFile(
  filePath: string,
  fullPath: string,
  baseUrl: string,
  sections: SectionMapping
): Promise<MarkdownFile> {
  // Read the file content
  const content = await readFile(fullPath, 'utf-8');

  // Extract frontmatter if present
  const { frontmatter, contentWithoutFrontmatter } = extractFrontmatter(content);

  // Extract title (frontmatter > H1 > filename)
  let title = frontmatter.title || extractTitle(contentWithoutFrontmatter);
  if (!title) {
    // Fallback to filename without extension
    const filename = basename(filePath, '.md');
    const filenameWithoutMdx = basename(filename, '.mdx');
    const filenameWithoutMarkdown = basename(filenameWithoutMdx, '.markdown');
    title = filenameWithoutMarkdown;
  }

  // Extract description (frontmatter > first paragraph)
  let description = frontmatter.description || extractDescription(contentWithoutFrontmatter);

  // Categorize into section
  const section = categorizeFile(filePath, sections);

  // Generate URL
  const url = generateUrl(filePath, baseUrl);

  return {
    path: filePath,
    title,
    description,
    content,
    url,
    section
  };
}
