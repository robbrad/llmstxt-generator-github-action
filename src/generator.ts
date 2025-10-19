import { MarkdownFile, GenerationResult } from './types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generates llms.txt content following the official spec format
 * @param files Array of parsed markdown files
 * @param projectName Project name for the H1 header
 * @param projectDescription Optional project description for blockquote
 * @returns Formatted llms.txt content
 */
export function generateLlmsTxt(
    files: MarkdownFile[],
    projectName: string,
    projectDescription: string = ''
): string {
    const lines: string[] = [];

    // Add H1 header with project name (Requirement 2.1)
    lines.push(`# ${projectName}`);
    lines.push('');

    // Add blockquote with project description if provided (Requirement 2.4)
    if (projectDescription.trim()) {
        lines.push(`> ${projectDescription}`);
        lines.push('');
    }

    // Group files by section (Requirement 2.8)
    const filesBySection = groupFilesBySection(files);

    // Sort sections: "Optional" always last, others alphabetically
    const sections = Object.keys(filesBySection).sort((a, b) => {
        if (a === 'Optional') return 1;
        if (b === 'Optional') return -1;
        return a.localeCompare(b);
    });

    // Generate section content
    for (const section of sections) {
        const sectionFiles = filesBySection[section];

        // Add H2 section header (Requirement 2.8)
        lines.push(`## ${section}`);
        lines.push('');

        // Add file entries (Requirements 2.2, 2.3, 2.4, 2.5, 2.6)
        for (const file of sectionFiles) {
            const entry = formatFileEntry(file);
            lines.push(entry);
        }

        lines.push('');
    }

    // Remove trailing empty line
    return lines.join('\n').trim() + '\n';
}

/**
 * Groups files by their section property
 * @param files Array of markdown files
 * @returns Object mapping section names to arrays of files
 */
function groupFilesBySection(files: MarkdownFile[]): Record<string, MarkdownFile[]> {
    const grouped: Record<string, MarkdownFile[]> = {};

    for (const file of files) {
        const section = file.section || 'Docs';
        if (!grouped[section]) {
            grouped[section] = [];
        }
        grouped[section].push(file);
    }

    return grouped;
}

/**
 * Formats a single file entry as a markdown list item
 * Format: "- [Title](url): Description" or "- [Title](url)" if no description
 * @param file Markdown file to format
 * @returns Formatted list item string
 */
function formatFileEntry(file: MarkdownFile): string {
    // Requirement 2.4: Format as "- [Title](url): Description"
    // Requirement 2.6: Omit colon and description if no description available
    if (file.description.trim()) {
        return `- [${file.title}](${file.url}): ${file.description}`;
    } else {
        return `- [${file.title}](${file.url})`;
    }
}

/**
 * Generates llms-full.txt content with complete markdown content and source attribution
 * @param files Array of parsed markdown files (should be in same order as llms.txt)
 * @returns Formatted llms-full.txt content
 */
export function generateLlmsFullTxt(files: MarkdownFile[]): string {
    const sections: string[] = [];

    // Process files in the same order as they appear in llms.txt (Requirement 3.6)
    // Group by section to maintain consistency
    const filesBySection = groupFilesBySection(files);
    
    // Sort sections: "Optional" always last, others alphabetically (same as llms.txt)
    const sectionNames = Object.keys(filesBySection).sort((a, b) => {
        if (a === 'Optional') return 1;
        if (b === 'Optional') return -1;
        return a.localeCompare(b);
    });

    // Process each file in order
    for (const section of sectionNames) {
        const sectionFiles = filesBySection[section];
        
        for (const file of sectionFiles) {
            // Prefix with source header (Requirement 3.2)
            sections.push(`Source: ${file.url}`);
            sections.push('');
            
            // Include complete markdown content, preserving all formatting (Requirements 3.1, 3.4)
            sections.push(file.content);
            
            // Separate files with blank lines (Requirement 3.3)
            sections.push('');
        }
    }

    // Join all sections and ensure single trailing newline
    return sections.join('\n').trim() + '\n';
}

/**
 * Writes the generated llms.txt and llms-full.txt files to the output directory
 * @param llmsTxt Content for llms.txt file
 * @param llmsFullTxt Content for llms-full.txt file
 * @param outputDirectory Directory where files will be written
 * @param filesProcessed Number of markdown files that were processed
 * @returns GenerationResult with file paths and count
 * @throws Error if directory cannot be created or files cannot be written
 */
export async function writeOutputFiles(
    llmsTxt: string,
    llmsFullTxt: string,
    outputDirectory: string,
    filesProcessed: number
): Promise<GenerationResult> {
    // Create output directory if it doesn't exist (Requirement 1.2, 6.3)
    try {
        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory, { recursive: true });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Cannot create output directory: ${errorMessage}`);
    }

    // Define output file paths
    const llmsTxtPath = path.join(outputDirectory, 'llms.txt');
    const llmsFullTxtPath = path.join(outputDirectory, 'llms-full.txt');

    // Write llms.txt to output directory (Requirement 1.2)
    try {
        fs.writeFileSync(llmsTxtPath, llmsTxt, 'utf-8');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Cannot write llms.txt: ${errorMessage}`);
    }

    // Write llms-full.txt to output directory (Requirement 1.2)
    try {
        fs.writeFileSync(llmsFullTxtPath, llmsFullTxt, 'utf-8');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Cannot write llms-full.txt: ${errorMessage}`);
    }

    // Return GenerationResult with file paths and count (Requirement 6.3)
    return {
        filesProcessed,
        llmsTxtPath,
        llmsFullTxtPath
    };
}
