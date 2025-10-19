import * as core from '@actions/core';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { scanMarkdownFiles } from './file-scanner';
import { parseMarkdownFile } from './parser';
import { generateLlmsTxt, generateLlmsFullTxt, writeOutputFiles } from './generator';
import type { SectionMapping, MarkdownFile } from './types';

/**
 * Commits changes to git repository
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 * 
 * @param files - Array of file paths to commit
 * @param commitMessage - Commit message to use
 */
async function commitChanges(files: string[], commitMessage: string): Promise<void> {
  try {
    // Configure git user (github-actions bot) (Requirement 7.5)
    core.info('Configuring git user...');
    execSync('git config user.name "github-actions[bot]"', { stdio: 'inherit' });
    execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'inherit' });

    // Stage llms.txt and llms-full.txt files (Requirement 7.2)
    core.info(`Staging files: ${files.join(', ')}`);
    for (const file of files) {
      execSync(`git add "${file}"`, { stdio: 'inherit' });
    }

    // Check if there are changes to commit (Requirement 7.4)
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    
    if (!status.trim()) {
      // Skip if no changes detected (Requirement 7.4)
      core.info('No changes detected, skipping commit');
      return;
    }

    // Commit with descriptive message (Requirement 7.3)
    core.info(`Committing changes with message: "${commitMessage}"`);
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    
    core.info('✓ Changes committed successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    core.warning(`Failed to commit changes: ${errorMessage}`);
    // Don't fail the action if git commit fails, just warn
  }
}

/**
 * Main entry point for the GitHub Action
 * Orchestrates the entire generation process
 * Requirements: 4.5, 6.1, 6.2, 6.3, 6.4, 6.6
 */
export async function run(): Promise<void> {
  try {
    // Read all GitHub Action inputs (Requirement 1.1, 5.1-5.6)
    const inputDirectory = core.getInput('input-directory') || '.';
    const outputDirectory = core.getInput('output-directory') || '.';
    const baseUrl = core.getInput('base-url', { required: true });
    const projectName = core.getInput('project-name', { required: true });
    const projectDescription = core.getInput('project-description') || '';
    const excludePattern = core.getInput('exclude-pattern') || '';
    const sectionsInput = core.getInput('sections') || '{"Docs": "**"}';

    // Validate required inputs (Requirement 5.3, 5.5)
    if (!baseUrl || !baseUrl.trim()) {
      throw new Error('base-url is required and cannot be empty');
    }
    if (!projectName || !projectName.trim()) {
      throw new Error('project-name is required and cannot be empty');
    }

    // Validate base URL format
    try {
      new URL(baseUrl);
    } catch (error) {
      throw new Error(`Invalid base-url format: ${baseUrl}. Must be a valid URL (e.g., https://example.com)`);
    }

    // Parse sections JSON input (Requirement 5.1)
    let sections: SectionMapping;
    try {
      sections = JSON.parse(sectionsInput);
      if (typeof sections !== 'object' || sections === null || Array.isArray(sections)) {
        throw new Error('Sections must be a JSON object');
      }
    } catch (error) {
      throw new Error(`Invalid sections JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Validate input directory exists (Requirement 6.1)
    const absoluteInputDir = path.resolve(inputDirectory);
    if (!fs.existsSync(absoluteInputDir)) {
      throw new Error(`Input directory does not exist: ${absoluteInputDir}`);
    }

    // Validate input directory is actually a directory
    const inputStats = fs.statSync(absoluteInputDir);
    if (!inputStats.isDirectory()) {
      throw new Error(`Input path is not a directory: ${absoluteInputDir}`);
    }

    core.info(`Scanning for markdown files in: ${absoluteInputDir}`);

    // Call file scanner to discover markdown files (Requirement 1.1)
    let filePaths: string[];
    try {
      filePaths = await scanMarkdownFiles(absoluteInputDir, excludePattern);
    } catch (error) {
      throw new Error(`Failed to scan directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Validate at least one markdown file found (Requirement 6.2)
    if (filePaths.length === 0) {
      throw new Error(`No markdown files found in directory: ${absoluteInputDir}${excludePattern ? ` (exclude pattern: ${excludePattern})` : ''}`);
    }

    core.info(`Found ${filePaths.length} markdown file(s)`);

    // Call parser for each discovered file (Requirement 1.1)
    const parsedFiles: MarkdownFile[] = [];
    let failedFiles = 0;
    
    for (const filePath of filePaths) {
      try {
        const fullPath = path.join(absoluteInputDir, filePath);
        const parsedFile = await parseMarkdownFile(filePath, fullPath, baseUrl, sections);
        parsedFiles.push(parsedFile);
        core.debug(`Parsed: ${filePath} -> ${parsedFile.title}`);
      } catch (error) {
        // Handle file read errors gracefully (Requirement 4.5, 6.4)
        failedFiles++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        core.warning(`Failed to parse file ${filePath}: ${errorMessage}`);
        // Continue processing other files
      }
    }

    // Check if we have any successfully parsed files
    if (parsedFiles.length === 0) {
      throw new Error(`No markdown files could be successfully parsed. All ${filePaths.length} file(s) failed.`);
    }

    // Log summary of parsing results
    if (failedFiles > 0) {
      core.warning(`Successfully parsed ${parsedFiles.length} of ${filePaths.length} file(s). ${failedFiles} file(s) failed.`);
    } else {
      core.info(`Successfully parsed ${parsedFiles.length} file(s)`);
    }

    // Call generators to create both output files (Requirement 1.2)
    let llmsTxt: string;
    let llmsFullTxt: string;
    
    try {
      llmsTxt = generateLlmsTxt(parsedFiles, projectName, projectDescription);
      llmsFullTxt = generateLlmsFullTxt(parsedFiles);
      core.info('Generated llms.txt and llms-full.txt content');
    } catch (error) {
      throw new Error(`Failed to generate output content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Call writeOutputFiles to save results (Requirement 1.2, 6.3)
    const absoluteOutputDir = path.resolve(outputDirectory);
    let result: any;
    
    try {
      result = await writeOutputFiles(llmsTxt, llmsFullTxt, absoluteOutputDir, parsedFiles.length);
      core.info(`Files written to: ${absoluteOutputDir}`);
    } catch (error) {
      // Provide more specific error message for write failures (Requirement 6.3)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to write output files to ${absoluteOutputDir}: ${errorMessage}. Check directory permissions.`);
    }

    // Set action outputs (Requirement 1.2, 6.5)
    core.setOutput('files-processed', result.filesProcessed.toString());
    core.setOutput('llms-txt-path', result.llmsTxtPath);
    core.setOutput('llms-full-txt-path', result.llmsFullTxtPath);

    core.info(`✓ Successfully processed ${result.filesProcessed} files`);
    core.info(`✓ Generated: ${result.llmsTxtPath}`);
    core.info(`✓ Generated: ${result.llmsFullTxtPath}`);

    // Optionally commit changes (Requirement 7.1)
    const commitChangesInput = core.getInput('commit-changes') || 'false';
    if (commitChangesInput.toLowerCase() === 'true') {
      core.info('Committing generated files...');
      await commitChanges(
        [result.llmsTxtPath, result.llmsFullTxtPath],
        'chore: update llms.txt files'
      );
    }

  } catch (error) {
    // Catch and report critical errors (Requirement 6.3, 6.6)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    core.error(`Action failed: ${errorMessage}`);
    if (errorStack) {
      core.debug(`Stack trace: ${errorStack}`);
    }
    
    // Set action status to failed on critical errors (Requirement 6.6)
    core.setFailed(errorMessage);
  }
}

// Execute the run function
// Note: When bundled with ncc, require.main === module may not work as expected,
// so we call run() unconditionally
run();
