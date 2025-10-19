import type { MarkdownFile, SectionMapping } from './types';
/**
 * Extracts the first H1 heading from markdown content
 * Supports both # Heading and Heading\n=== formats
 * @param content - The markdown content
 * @returns The H1 heading text or null if not found
 */
export declare function extractTitle(content: string): string | null;
/**
 * Extracts the first paragraph after the H1 heading as description
 * @param content - The markdown content
 * @returns The description text or empty string if not found
 */
export declare function extractDescription(content: string): string;
/**
 * Categorizes a file into a section based on path patterns
 * @param filePath - The relative file path
 * @param sections - Mapping of section names to glob patterns
 * @returns The section name that matches the file path
 */
export declare function categorizeFile(filePath: string, sections: SectionMapping): string;
/**
 * Parses a markdown file and extracts all metadata
 * @param filePath - The relative file path from input directory
 * @param fullPath - The absolute file path to read
 * @param baseUrl - The base URL for generating links
 * @param sections - Mapping of section names to directory patterns
 * @returns A MarkdownFile object with all extracted metadata
 */
export declare function parseMarkdownFile(filePath: string, fullPath: string, baseUrl: string, sections: SectionMapping): Promise<MarkdownFile>;
