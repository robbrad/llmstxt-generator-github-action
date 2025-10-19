# llms.txt Generator GitHub Action

Automatically generate `llms.txt` and `llms-full.txt` files from your markdown documentation following the [official llms.txt specification](https://llmstxt.org/). This action scans your repository for markdown files, extracts metadata, and creates structured index files optimized for LLM consumption.

## Features

- 📝 Generates both `llms.txt` (index) and `llms-full.txt` (full content) files
- 🗂️ Organizes documentation into customizable sections
- 🔗 Automatically extracts titles, descriptions, and generates URLs
- 🎯 Supports glob patterns for file filtering
- 🤖 Optional auto-commit of generated files
- ⚡ Fast recursive directory scanning
- 🛡️ Robust error handling and validation

## Quick Start

Add this workflow to your repository at `.github/workflows/generate-llms-txt.yml`:

```yaml
name: Generate llms.txt

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
      - '*.md'

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate llms.txt files
        uses: ./.github/actions/llms-txt-generator
        with:
          base-url: 'https://example.com'
          project-name: 'My Project'
          project-description: 'A brief description of my project'
          commit-changes: 'true'
```

## Input Parameters

### Required Inputs

#### `base-url`
**Required:** Yes  
**Description:** Base URL for generating documentation links (e.g., `https://example.com` or `https://docs.example.com`)  
**Example:** `'https://myproject.github.io'`

#### `project-name`
**Required:** Yes  
**Description:** Project name that appears as the H1 header in `llms.txt`  
**Example:** `'My Awesome Project'`

### Optional Inputs

#### `input-directory`
**Required:** No  
**Default:** `'.'` (repository root)  
**Description:** Directory containing markdown files to process  
**Example:** `'docs'` or `'documentation'`

#### `output-directory`
**Required:** No  
**Default:** `'.'` (repository root)  
**Description:** Directory where `llms.txt` and `llms-full.txt` will be generated  
**Example:** `'public'` or `'dist'`

#### `project-description`
**Required:** No  
**Default:** `''` (empty)  
**Description:** Short project summary that appears as a blockquote in `llms.txt`  
**Example:** `'A powerful tool for automating documentation indexing'`

#### `exclude-pattern`
**Required:** No  
**Default:** `''` (no exclusions)  
**Description:** Glob pattern for files to exclude from processing  
**Example:** `'**/node_modules/**,**/archive/**'`

#### `sections`
**Required:** No  
**Default:** `'{"Docs": "**"}'`  
**Description:** JSON object mapping section names to directory patterns for organizing files  
**Example:** `'{"Docs": "docs/**", "Examples": "examples/**", "Optional": "archive/**"}'`

#### `commit-changes`
**Required:** No  
**Default:** `'false'`  
**Description:** Whether to automatically commit generated files to the repository  
**Example:** `'true'`

## Output Parameters

The action sets the following outputs that can be used in subsequent workflow steps:

- `files-processed`: Number of markdown files processed
- `llms-txt-path`: Path to the generated `llms.txt` file
- `llms-full-txt-path`: Path to the generated `llms-full.txt` file

### Using Outputs

```yaml
- name: Generate llms.txt files
  id: generate
  uses: ./.github/actions/llms-txt-generator
  with:
    base-url: 'https://example.com'
    project-name: 'My Project'

- name: Display results
  run: |
    echo "Processed ${{ steps.generate.outputs.files-processed }} files"
    echo "Generated: ${{ steps.generate.outputs.llms-txt-path }}"
```

## Usage Examples

### Basic Usage

Minimal configuration for a simple documentation site:

```yaml
- uses: ./.github/actions/llms-txt-generator
  with:
    base-url: 'https://example.com'
    project-name: 'My Project'
```

### Custom Directory Structure

Process documentation from a specific directory:

```yaml
- uses: ./.github/actions/llms-txt-generator
  with:
    input-directory: 'docs'
    output-directory: 'public'
    base-url: 'https://docs.example.com'
    project-name: 'My Project'
    project-description: 'Comprehensive documentation for developers'
```

### Multiple Sections

Organize documentation into multiple sections:

```yaml
- uses: ./.github/actions/llms-txt-generator
  with:
    base-url: 'https://example.com'
    project-name: 'My Project'
    sections: |
      {
        "Docs": "docs/**",
        "Guides": "guides/**",
        "Examples": "examples/**",
        "Optional": "archive/**"
      }
```

### Exclude Patterns

Exclude specific files or directories:

```yaml
- uses: ./.github/actions/llms-txt-generator
  with:
    base-url: 'https://example.com'
    project-name: 'My Project'
    exclude-pattern: '**/node_modules/**,**/draft/**,**/private/**'
```

### Auto-Commit Changes

Automatically commit generated files:

```yaml
- uses: actions/checkout@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}

- uses: ./.github/actions/llms-txt-generator
  with:
    base-url: 'https://example.com'
    project-name: 'My Project'
    commit-changes: 'true'
```

### Complete Workflow Example

Full-featured workflow with all options:

```yaml
name: Generate llms.txt Documentation

on:
  push:
    branches: [main, develop]
    paths:
      - 'docs/**'
      - 'guides/**'
      - '*.md'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0

      - name: Generate llms.txt files
        id: generate
        uses: ./.github/actions/llms-txt-generator
        with:
          input-directory: '.'
          output-directory: '.'
          base-url: 'https://myproject.github.io'
          project-name: 'My Awesome Project'
          project-description: 'A comprehensive guide to building amazing things'
          exclude-pattern: '**/node_modules/**,**/test/**'
          sections: |
            {
              "Docs": "docs/**",
              "Guides": "guides/**",
              "Examples": "examples/**",
              "Optional": "archive/**"
            }
          commit-changes: 'true'

      - name: Summary
        run: |
          echo "✅ Successfully processed ${{ steps.generate.outputs.files-processed }} files"
          echo "📄 Generated files:"
          echo "  - ${{ steps.generate.outputs.llms-txt-path }}"
          echo "  - ${{ steps.generate.outputs.llms-full-txt-path }}"
```

## Generated File Formats

### llms.txt

The `llms.txt` file follows the official specification:

```markdown
# My Project

> A brief description of my project

## Docs

- [Getting Started](https://example.com/docs/getting-started): Learn how to get started
- [API Reference](https://example.com/docs/api): Complete API documentation

## Examples

- [Basic Example](https://example.com/examples/basic): A simple example

## Optional

- [Archive](https://example.com/archive/old-docs)
```

### llms-full.txt

The `llms-full.txt` file contains complete content with source attribution:

```markdown
Source: https://example.com/docs/getting-started

# Getting Started

Welcome to the documentation...

Source: https://example.com/docs/api

# API Reference

Complete API documentation...
```

## How It Works

1. **File Discovery**: Recursively scans the input directory for `.md` and `.mdx` files
2. **Metadata Extraction**: Extracts H1 headings as titles and first paragraphs as descriptions
3. **Section Categorization**: Matches files to sections based on configured patterns
4. **URL Generation**: Combines base URL with relative file paths
5. **File Generation**: Creates both `llms.txt` (index) and `llms-full.txt` (full content)
6. **Optional Commit**: Commits generated files if configured

## Troubleshooting

### No markdown files found

**Problem:** Action fails with "No markdown files found"

**Solutions:**
- Verify the `input-directory` path is correct
- Check that markdown files have `.md` or `.mdx` extensions
- Ensure files aren't being excluded by `exclude-pattern`
- Confirm the directory contains actual markdown files

```yaml
# Debug by listing directory contents first
- name: List files
  run: ls -R docs/

- name: Generate llms.txt
  uses: ./.github/actions/llms-txt-generator
  with:
    input-directory: 'docs'
    base-url: 'https://example.com'
    project-name: 'My Project'
```

### Invalid sections JSON

**Problem:** Action fails with JSON parsing error

**Solutions:**
- Ensure the `sections` input is valid JSON
- Use the pipe `|` operator for multi-line JSON
- Escape quotes properly
- Validate JSON syntax before committing

```yaml
# Correct format
sections: |
  {
    "Docs": "docs/**",
    "Examples": "examples/**"
  }

# Also valid (single line)
sections: '{"Docs": "docs/**", "Examples": "examples/**"}'
```

### Permission denied when committing

**Problem:** Action fails to commit with permission error

**Solutions:**
- Add `contents: write` permission to the workflow
- Use `GITHUB_TOKEN` with checkout action
- Ensure the workflow has write access to the repository

```yaml
permissions:
  contents: write

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

### Files not being excluded

**Problem:** Files matching exclude pattern are still processed

**Solutions:**
- Verify glob pattern syntax (use `**` for recursive matching)
- Use comma-separated patterns for multiple exclusions
- Test patterns locally with glob tools
- Check for typos in directory names

```yaml
# Correct exclude patterns
exclude-pattern: '**/node_modules/**,**/test/**,**/draft/**'

# Match specific files
exclude-pattern: '**/*.draft.md,**/README.md'
```

### Missing titles or descriptions

**Problem:** Generated files show filenames instead of titles

**Solutions:**
- Ensure markdown files have H1 headings (`# Title`)
- Add a paragraph after the H1 for descriptions
- Check that files aren't empty or malformed
- Verify markdown syntax is correct

```markdown
# Correct format
# My Document Title

This is the description that will be extracted.

## Content starts here
```

### Base URL formatting issues

**Problem:** Generated URLs are malformed

**Solutions:**
- Don't include trailing slashes in `base-url`
- Use full URLs including protocol (`https://`)
- Verify URL encoding for special characters
- Test generated URLs manually

```yaml
# Correct
base-url: 'https://example.com'

# Incorrect
base-url: 'https://example.com/'
base-url: 'example.com'
```

### Action runs but no changes committed

**Problem:** Files generated but not committed to repository

**Solutions:**
- Ensure `commit-changes` is set to `'true'` (as string)
- Verify git is configured in the workflow
- Check that files actually changed (no commit if unchanged)
- Review workflow logs for git errors

```yaml
- uses: ./.github/actions/llms-txt-generator
  with:
    base-url: 'https://example.com'
    project-name: 'My Project'
    commit-changes: 'true'  # Must be string 'true', not boolean
```

### Large repositories timing out

**Problem:** Action times out on large documentation sets

**Solutions:**
- Use more specific `input-directory` to limit scope
- Add aggressive `exclude-pattern` to skip unnecessary files
- Consider splitting documentation into multiple runs
- Increase workflow timeout if needed

```yaml
- uses: ./.github/actions/llms-txt-generator
  timeout-minutes: 10
  with:
    input-directory: 'docs'  # Limit scope
    exclude-pattern: '**/archive/**,**/old/**'
```

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Bundle for Distribution

```bash
npm run bundle
```

The bundled action will be available in `dist/index.js`.

### Testing

```bash
npm test
```

### Local Testing

Test the action locally before committing:

```bash
# Build and bundle
npm run build && npm run bundle

# Set environment variables
export INPUT_BASE_URL="https://example.com"
export INPUT_PROJECT_NAME="Test Project"
export INPUT_INPUT_DIRECTORY="./docs"

# Run the action
node dist/index.js
```

## Contributing

Contributions are welcome! Please ensure:

- All tests pass (`npm test`)
- Code is properly formatted
- Documentation is updated
- Commit messages are descriptive

## License

MIT

## Resources

- [llms.txt Specification](https://llmstxt.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Markdown Guide](https://www.markdownguide.org/)
