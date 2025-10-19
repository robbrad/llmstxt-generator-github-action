# Contributing to llms.txt Generator

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 9 or higher
- Git

### Setup Development Environment

1. Fork and clone the repository:

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

2. Install dependencies:

```bash
cd .github/actions/llms-txt-generator
npm install
```

3. Build the project:

```bash
npm run build
```

## Development Workflow

### Making Changes

1. Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes in the `src/` directory

3. Write or update tests for your changes

4. Run tests:

```bash
npm test
```

5. Build and bundle:

```bash
npm run package
```

6. Test locally:

```bash
# Create a test directory
mkdir -p test-local/docs
echo "# Test" > test-local/docs/test.md

# Run the action
export INPUT_BASE_URL="https://example.com"
export INPUT_PROJECT_NAME="Test"
export INPUT_INPUT_DIRECTORY="test-local"
export INPUT_OUTPUT_DIRECTORY="test-local"
node dist/index.js
```

### Code Style

- Use TypeScript for all source code
- Follow existing code formatting
- Use meaningful variable and function names
- Add JSDoc comments for public functions
- Keep functions small and focused

### Testing

#### Unit Tests

Unit tests are located alongside source files with `.test.ts` extension:

```bash
npm test
```

#### Integration Tests

Integration tests validate the entire action workflow:

```bash
npm run test:integration
```

#### Writing Tests

Use Vitest for testing:

```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from './your-module';

describe('yourFunction', () => {
  it('should do something', () => {
    const result = yourFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Commit Messages

Follow conventional commit format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test changes
- `chore:` Build process or tooling changes
- `refactor:` Code refactoring

Examples:

```
feat: add support for .mdx files
fix: handle special characters in URLs
docs: update README with new examples
test: add integration tests for exclude patterns
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Submit pull request with clear description

### PR Checklist

- [ ] Tests pass (`npm test`)
- [ ] Integration tests pass (`npm run test:integration`)
- [ ] Code builds successfully (`npm run build`)
- [ ] Bundle is updated (`npm run bundle`)
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Commit messages follow conventions

## Project Structure

```
.github/actions/llms-txt-generator/
├── src/
│   ├── main.ts              # Entry point
│   ├── file-scanner.ts      # File discovery
│   ├── parser.ts            # Markdown parsing
│   ├── generator.ts         # Output generation
│   ├── types.ts             # TypeScript types
│   └── *.test.ts            # Unit tests
├── tests/
│   └── integration/         # Integration tests
├── dist/                    # Compiled output
├── action.yml               # Action metadata
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Adding New Features

### Example: Adding a New Input Parameter

1. Update `action.yml`:

```yaml
inputs:
  new-parameter:
    description: 'Description of the parameter'
    required: false
    default: 'default-value'
```

2. Update `src/types.ts` if needed:

```typescript
export interface Config {
  newParameter: string;
  // ... other fields
}
```

3. Read the input in `src/main.ts`:

```typescript
const newParameter = core.getInput('new-parameter') || 'default-value';
```

4. Implement the functionality

5. Add tests:

```typescript
describe('new parameter', () => {
  it('should use the new parameter', () => {
    // Test implementation
  });
});
```

6. Update documentation in README.md

## Debugging

### Local Debugging

Use Node.js debugging:

```bash
node --inspect-brk dist/index.js
```

Then attach your debugger (VS Code, Chrome DevTools, etc.)

### Action Debugging

Enable debug logging in GitHub Actions:

1. Go to repository Settings → Secrets
2. Add secret: `ACTIONS_STEP_DEBUG` = `true`
3. Re-run the workflow

### Common Issues

**Issue**: Action fails with "Cannot find module"

**Solution**: Run `npm run bundle` to ensure all dependencies are bundled

**Issue**: Tests fail locally but pass in CI

**Solution**: Check Node.js version matches CI (20.x)

**Issue**: Changes not reflected in action

**Solution**: Rebuild and bundle: `npm run package`

## Documentation

### Code Documentation

- Add JSDoc comments to all exported functions
- Include parameter descriptions and return types
- Add examples for complex functions

```typescript
/**
 * Scans directory for markdown files
 * 
 * @param directory - Directory path to scan
 * @param excludePattern - Glob pattern for exclusions
 * @returns Array of file paths
 * 
 * @example
 * const files = await scanMarkdownFiles('./docs', '**/draft/**');
 */
export async function scanMarkdownFiles(
  directory: string,
  excludePattern: string
): Promise<string[]> {
  // Implementation
}
```

### User Documentation

Update README.md when:
- Adding new features
- Changing behavior
- Adding new inputs/outputs
- Fixing important bugs

## Release Process

See [PUBLISHING.md](PUBLISHING.md) for detailed release instructions.

Quick summary:

1. Update version: `npm version patch|minor|major`
2. Build: `npm run package`
3. Commit bundle: `git add dist/ && git commit -m "chore: update bundle"`
4. Push: `git push origin main --tags`

## Getting Help

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Check existing issues and discussions first

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes
- CHANGELOG.md

Thank you for contributing! 🎉
