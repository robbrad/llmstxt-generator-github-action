# llms.txt Generator

[![CI](https://github.com/your-org/your-repo/workflows/CI/badge.svg)](https://github.com/your-org/your-repo/actions/workflows/ci.yml)
[![Release](https://github.com/your-org/your-repo/workflows/Release/badge.svg)](https://github.com/your-org/your-repo/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A GitHub Action that automatically generates `llms.txt` and `llms-full.txt` files from your markdown documentation, following the [official llms.txt specification](https://llmstxt.org/).

## Features

- 📝 Generates both `llms.txt` (index) and `llms-full.txt` (full content)
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
    permissions:
      contents: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate llms.txt files
        uses: your-org/your-repo/.github/actions/llms-txt-generator@v1
        with:
          base-url: 'https://example.com'
          project-name: 'My Project'
          project-description: 'A brief description of my project'
          commit-changes: 'true'
```

## Documentation

- [Action README](.github/actions/llms-txt-generator/README.md) - Complete usage guide
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Publishing Guide](PUBLISHING.md) - How to release new versions

## Usage Examples

### Basic Usage

```yaml
- uses: your-org/your-repo/.github/actions/llms-txt-generator@v1
  with:
    base-url: 'https://example.com'
    project-name: 'My Project'
```

### Multiple Sections

```yaml
- uses: your-org/your-repo/.github/actions/llms-txt-generator@v1
  with:
    base-url: 'https://example.com'
    project-name: 'My Project'
    sections: |
      {
        "Docs": "docs/**",
        "Guides": "guides/**",
        "Examples": "examples/**"
      }
```

### Custom Directory

```yaml
- uses: your-org/your-repo/.github/actions/llms-txt-generator@v1
  with:
    input-directory: 'documentation'
    output-directory: 'public'
    base-url: 'https://docs.example.com'
    project-name: 'My Project'
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `base-url` | Yes | - | Base URL for generating links |
| `project-name` | Yes | - | Project name for the H1 header |
| `input-directory` | No | `.` | Directory containing markdown files |
| `output-directory` | No | `.` | Directory for output files |
| `project-description` | No | `''` | Short project summary |
| `exclude-pattern` | No | `''` | Glob pattern for exclusions |
| `sections` | No | `{"Docs": "**"}` | JSON mapping of sections |
| `commit-changes` | No | `false` | Auto-commit generated files |

## Outputs

| Output | Description |
|--------|-------------|
| `files-processed` | Number of markdown files processed |
| `llms-txt-path` | Path to generated llms.txt |
| `llms-full-txt-path` | Path to generated llms-full.txt |

## Development

### Setup

```bash
cd .github/actions/llms-txt-generator
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# All tests
npm run test:all
```

### Bundle

```bash
npm run bundle
```

## Project Structure

```
.
├── .github/
│   ├── actions/
│   │   └── llms-txt-generator/    # Main action code
│   │       ├── src/               # TypeScript source
│   │       ├── tests/             # Integration tests
│   │       ├── dist/              # Compiled bundle
│   │       └── action.yml         # Action metadata
│   └── workflows/
│       ├── ci.yml                 # CI pipeline
│       ├── release.yml            # Release automation
│       └── test-scenarios.yml     # Comprehensive tests
├── CONTRIBUTING.md                # Contribution guide
├── PUBLISHING.md                  # Release guide
└── README.md                      # This file
```

## CI/CD Pipeline

The project includes comprehensive CI/CD:

- **CI Workflow**: Runs on every push/PR
  - Unit tests
  - Integration tests
  - Build verification
  - Bundle size check
  - TypeScript compilation check

- **Release Workflow**: Runs on tag push
  - Full test suite
  - Build and bundle
  - Create GitHub release
  - Generate changelog
  - Update major version tag

- **Test Scenarios**: Comprehensive test coverage
  - Basic usage
  - Complex structures
  - Special characters
  - Exclude patterns
  - Empty/malformed files
  - Different file extensions

## Testing

The action includes multiple test layers:

1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test the complete workflow
3. **Scenario Tests**: Test real-world use cases

Run all tests:

```bash
cd .github/actions/llms-txt-generator
npm run test:all
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Publishing

To publish a new version:

1. Update version: `npm version patch|minor|major`
2. Build: `npm run package`
3. Commit: `git add dist/ && git commit -m "chore: update bundle"`
4. Push: `git push origin main --tags`

See [PUBLISHING.md](PUBLISHING.md) for detailed instructions.

## License

MIT

## Resources

- [llms.txt Specification](https://llmstxt.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Action README](.github/actions/llms-txt-generator/README.md)

## Support

- 🐛 [Report a bug](https://github.com/your-org/your-repo/issues/new?labels=bug)
- 💡 [Request a feature](https://github.com/your-org/your-repo/issues/new?labels=enhancement)
- 💬 [Ask a question](https://github.com/your-org/your-repo/discussions)

## Acknowledgments

Built following the [llms.txt specification](https://llmstxt.org/) by Anthropic.
