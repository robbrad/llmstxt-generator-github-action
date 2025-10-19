/**
 * Represents a parsed markdown file with extracted metadata
 */
export interface MarkdownFile {
  /** Relative path from input directory */
  path: string;
  /** Extracted H1 heading or filename */
  title: string;
  /** First paragraph after H1 */
  description: string;
  /** Full markdown content */
  content: string;
  /** Generated URL for the file */
  url: string;
  /** Section category (Docs, Examples, etc.) */
  section: string;
}

/**
 * Configuration options for the generator
 */
export interface GeneratorConfig {
  /** Directory containing markdown files */
  inputDirectory: string;
  /** Directory where llms.txt files will be generated */
  outputDirectory: string;
  /** Base URL for generating links */
  baseUrl: string;
  /** Project name for the H1 header */
  projectName: string;
  /** Short summary for the blockquote section */
  projectDescription: string;
  /** Glob pattern for files to exclude */
  excludePattern: string;
  /** Mapping of section names to directory patterns */
  sections: SectionMapping;
}

/**
 * Result of the generation process
 */
export interface GenerationResult {
  /** Number of markdown files processed */
  filesProcessed: number;
  /** Path to the generated llms.txt file */
  llmsTxtPath: string;
  /** Path to the generated llms-full.txt file */
  llmsFullTxtPath: string;
}

/**
 * Mapping of section names to glob patterns
 * Example: { "Docs": "docs/**", "Examples": "examples/**" }
 */
export type SectionMapping = Record<string, string>;

/**
 * Function type for filtering files based on patterns
 */
export type FileFilter = (filePath: string, pattern: string) => boolean;
