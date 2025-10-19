import { MarkdownFile, GenerationResult } from './types';
/**
 * Generates llms.txt content following the official spec format
 * @param files Array of parsed markdown files
 * @param projectName Project name for the H1 header
 * @param projectDescription Optional project description for blockquote
 * @returns Formatted llms.txt content
 */
export declare function generateLlmsTxt(files: MarkdownFile[], projectName: string, projectDescription?: string): string;
/**
 * Generates llms-full.txt content with complete markdown content and source attribution
 * @param files Array of parsed markdown files (should be in same order as llms.txt)
 * @returns Formatted llms-full.txt content
 */
export declare function generateLlmsFullTxt(files: MarkdownFile[]): string;
/**
 * Writes the generated llms.txt and llms-full.txt files to the output directory
 * @param llmsTxt Content for llms.txt file
 * @param llmsFullTxt Content for llms-full.txt file
 * @param outputDirectory Directory where files will be written
 * @param filesProcessed Number of markdown files that were processed
 * @returns GenerationResult with file paths and count
 * @throws Error if directory cannot be created or files cannot be written
 */
export declare function writeOutputFiles(llmsTxt: string, llmsFullTxt: string, outputDirectory: string, filesProcessed: number): Promise<GenerationResult>;
