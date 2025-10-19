# Quick Start Guide

Get the llms.txt Generator action up and running in 5 minutes.

## Step 1: Add the Workflow

Create `.github/workflows/generate-llms-txt.yml` in your repository:

```yaml
name: Generate llms.txt

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
      - '*.md'

permissions:
  contents: write

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate llms.txt files
        uses: your-org/your-repo/src@v1
        with:
          base-url: 'https://your-site.com'
          project-name: 'Your Project Name'
          commit-changes: 'true'
```

**Replace:**
- `your-org/your-repo` with your GitHub repository path
- `https://your-site.com` with your documentation URL
- `Your Project Name` with your project name

## Step 2: Commit and Push

```bash
git add .github/workflows/generate-llms-txt.yml
git commit -m "Add llms.txt generator workflow"
git push
```

## Step 3: Verify

1. Go to your repository on GitHub
2. Click the "Actions" tab
3. You should see the "Generate llms.txt" workflow running
4. Once complete, check your repository for `llms.txt` and `llms-full.txt`

## Step 4: Customize (Optional)

### Organize into Sections

```yaml
- uses: your-org/your-repo/src@v1
  with:
    base-url: 'https://your-site.com'
    project-name: 'Your Project'
    sections: |
      {
        "Documentation": "docs/**",
        "Guides": "guides/**",
        "API": "api/**"
      }
```

### Exclude Files

```yaml
- uses: your-org/your-repo/src@v1
  with:
    base-url: 'https://your-site.com'
    project-name: 'Your Project'
    exclude-pattern: '**/node_modules/**,**/draft/**'
```

### Custom Directories

```yaml
- uses: your-org/your-repo/src@v1
  with:
    input-directory: 'documentation'
    output-directory: 'public'
    base-url: 'https://your-site.com'
    project-name: 'Your Project'
```

## Common Configurations

### Documentation Site

```yaml
- uses: your-org/your-repo/src@v1
  with:
    input-directory: 'docs'
    base-url: 'https://docs.example.com'
    project-name: 'My Documentation'
    project-description: 'Comprehensive documentation for developers'
    sections: |
      {
        "Getting Started": "docs/getting-started/**",
        "API Reference": "docs/api/**",
        "Guides": "docs/guides/**"
      }
```

### GitHub Pages

```yaml
- uses: your-org/your-repo/src@v1
  with:
    output-directory: 'docs'
    base-url: 'https://username.github.io/repo'
    project-name: 'My Project'
    commit-changes: 'true'
```

### Monorepo

```yaml
- uses: your-org/your-repo/src@v1
  with:
    input-directory: 'packages/docs'
    output-directory: 'packages/docs'
    base-url: 'https://example.com'
    project-name: 'Package Documentation'
```

## Troubleshooting

### No files generated

**Check:**
- Markdown files exist in `input-directory`
- Files have `.md`, `.mdx`, or `.markdown` extensions
- Files aren't excluded by `exclude-pattern`

**Debug:**
```yaml
- name: List markdown files
  run: find . -name "*.md" -type f

- name: Generate llms.txt
  uses: your-org/your-repo/src@v1
  with:
    # ... your config
```

### Permission denied

**Fix:** Add permissions to workflow:
```yaml
permissions:
  contents: write
```

### Files not committed

**Check:**
- `commit-changes` is set to `'true'` (string, not boolean)
- Workflow has write permissions
- Files actually changed (no commit if unchanged)

## Next Steps

- Read the [full documentation](src/README.md)
- Check out [example workflows](.github/workflows/)
- Learn about [contributing](CONTRIBUTING.md)
- See [testing guide](TESTING.md)

## Support

- 🐛 [Report a bug](https://github.com/your-org/your-repo/issues/new?template=bug_report.md)
- 💡 [Request a feature](https://github.com/your-org/your-repo/issues/new?template=feature_request.md)
- 💬 [Ask a question](https://github.com/your-org/your-repo/discussions)

## Example Output

### llms.txt
```markdown
# My Project

> A brief description of my project

## Documentation

- [Getting Started](https://example.com/docs/getting-started): Learn how to get started
- [Installation](https://example.com/docs/installation): Installation guide

## Guides

- [Tutorial](https://example.com/guides/tutorial): Step-by-step tutorial
```

### llms-full.txt
```markdown
Source: https://example.com/docs/getting-started

# Getting Started

Welcome to the documentation...

Source: https://example.com/docs/installation

# Installation

Follow these steps to install...
```

That's it! You're now generating llms.txt files automatically. 🎉
