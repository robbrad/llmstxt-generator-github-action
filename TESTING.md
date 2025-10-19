# Testing Guide

This document describes the testing strategy and how to run tests for the llms.txt Generator action.

## Test Layers

The project uses a multi-layered testing approach:

### 1. Unit Tests

Located in `src*.test.ts` files, these test individual functions in isolation.

**Run unit tests:**
```bash
cd src
npm test
```

**Coverage areas:**
- File scanning logic
- Markdown parsing
- Content generation
- URL formatting
- Section categorization

**Example:**
```typescript
describe('scanMarkdownFiles', () => {
  it('should find all markdown files', async () => {
    const files = await scanMarkdownFiles('./test-dir');
    expect(files).toContain('docs/readme.md');
  });
});
```

### 2. Integration Tests

Located in `tests/integration/`, these test the complete action workflow.

**Run integration tests:**
```bash
cd src
npm run test:integration
```

**Test scenarios:**
- Basic functionality with simple files
- Multiple sections organization
- Exclude pattern filtering
- Error handling for edge cases

**Manual integration test:**
```bash
# Build the action
npm run package

# Create test fixture
mkdir -p test-fixture/docs
echo "# Test" > test-fixture/docs/test.md

# Run action
export INPUT_BASE_URL="https://example.com"
export INPUT_PROJECT_NAME="Test"
export INPUT_INPUT_DIRECTORY="test-fixture"
export INPUT_OUTPUT_DIRECTORY="test-fixture"
node dist/index.js

# Verify output
cat test-fixture/llms.txt
```

### 3. Scenario Tests

Located in `.github/workflows/test-scenarios.yml`, these test real-world use cases in CI.

**Run scenario tests:**
```bash
# Trigger via GitHub Actions UI
# Or push to trigger automatically
```

**Scenarios covered:**
- Basic usage
- Complex directory structures
- Special characters in filenames
- Exclude patterns
- Empty and malformed files
- Different file extensions (.md, .mdx, .markdown)

### 4. End-to-End Tests

The CI workflow tests the action in a real GitHub Actions environment.

**Workflow:** `.github/workflows/ci.yml`

**What it tests:**
- Action runs successfully in GitHub Actions
- Generated files are correct
- Outputs are set properly
- Error handling works as expected

## Running Tests Locally

### Prerequisites

```bash
cd src
npm install
```

### Run All Tests

```bash
npm run test:all
```

This runs:
1. Unit tests
2. Integration tests

### Run Specific Tests

```bash
# Only unit tests
npm test

# Only integration tests
npm run test:integration

# Watch mode for development
npm test -- --watch

# Run specific test file
npm test -- srcparser.test.ts
```

### Debug Tests

```bash
# Run with debugging
node --inspect-brk node_modules/.bin/vitest --run

# Then attach your debugger (VS Code, Chrome DevTools)
```

## Test Fixtures

### Creating Test Fixtures

For integration tests, create realistic markdown files:

```bash
mkdir -p test-fixture/docs
cat > test-fixture/docs/example.md << 'EOF'
# Example Document

This is an example document for testing.

## Section

Content goes here.
EOF
```

### Fixture Best Practices

- Use realistic content
- Include edge cases (empty files, special characters)
- Test different markdown structures
- Include files that should be excluded

## Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from './your-module';

describe('yourFunction', () => {
  it('should handle normal input', () => {
    const result = yourFunction('input');
    expect(result).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(() => yourFunction('')).toThrow();
  });

  it('should handle special characters', () => {
    const result = yourFunction('special & chars');
    expect(result).toContain('special');
  });
});
```

### Integration Test Template

```bash
#!/bin/bash
set -e

echo "Test: Your test name"
echo "-------------------"

# Setup
TEST_DIR="test-fixture/your-test"
mkdir -p "$TEST_DIR/docs"

# Create fixture
cat > "$TEST_DIR/docs/test.md" << 'EOF'
# Test Document
Test content
EOF

# Run action
export INPUT_BASE_URL="https://example.com"
export INPUT_PROJECT_NAME="Test"
export INPUT_INPUT_DIRECTORY="$TEST_DIR"
export INPUT_OUTPUT_DIRECTORY="$TEST_DIR"
node dist/index.js

# Verify
if [ -f "$TEST_DIR/llms.txt" ]; then
    echo "✅ Test passed"
else
    echo "❌ Test failed"
    exit 1
fi
```

## Test Coverage

### Checking Coverage

```bash
npm test -- --coverage
```

### Coverage Goals

- Overall: > 80%
- Critical paths: > 90%
- Error handling: > 85%

### Coverage Report

After running tests with coverage, view the report:

```bash
# Open HTML report
open coverage/index.html
```

## Continuous Integration

### CI Pipeline

The CI pipeline runs automatically on:
- Every push to main/develop
- Every pull request
- Weekly schedule (scenario tests)

### CI Workflow Steps

1. **Checkout code**
2. **Setup Node.js**
3. **Install dependencies**
4. **Run unit tests**
5. **Build TypeScript**
6. **Run integration tests**
7. **Bundle action**
8. **Verify bundle**

### Viewing CI Results

- Go to Actions tab in GitHub
- Select the workflow run
- View logs for each step
- Download artifacts if needed

## Testing Checklist

Before submitting a PR:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] New tests added for new features
- [ ] Edge cases covered
- [ ] Error handling tested
- [ ] Documentation updated
- [ ] Manual testing completed

## Common Test Issues

### Issue: Tests fail locally but pass in CI

**Cause:** Different Node.js versions or environment

**Solution:**
```bash
# Use same Node version as CI
nvm use 20
npm test
```

### Issue: Integration tests can't find files

**Cause:** Incorrect paths or working directory

**Solution:**
```bash
# Use absolute paths
TEST_DIR="$(pwd)/test-fixture"
```

### Issue: Tests timeout

**Cause:** Long-running operations or infinite loops

**Solution:**
```typescript
// Increase timeout for specific test
it('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Issue: Flaky tests

**Cause:** Race conditions or timing issues

**Solution:**
- Use proper async/await
- Add explicit waits
- Mock time-dependent operations

## Performance Testing

### Measuring Performance

```bash
# Time the action execution
time node dist/index.js

# Profile with Node.js
node --prof dist/index.js
node --prof-process isolate-*.log > profile.txt
```

### Performance Benchmarks

- Small repo (< 10 files): < 1 second
- Medium repo (10-100 files): < 5 seconds
- Large repo (100-1000 files): < 30 seconds

## Test Data

### Sample Markdown Files

The `sample/` directory contains real-world examples from Home Assistant documentation (for reference only, not used in CI).

### Creating Test Data

For CI tests, create minimal fixtures:

```bash
# Minimal valid markdown
echo "# Title" > test.md
echo "Description" >> test.md

# Edge case: empty file
touch empty.md

# Edge case: no H1
echo "## Only H2" > no-h1.md
```

## Debugging Failed Tests

### Enable Debug Logging

```bash
# Set debug environment variable
export DEBUG=*
npm test
```

### Inspect Test Artifacts

```bash
# Keep test fixtures after run
export KEEP_FIXTURES=true
npm run test:integration

# Inspect generated files
ls -la test-fixture/
cat test-fixture/llms.txt
```

### Use Test Snapshots

```typescript
// Create snapshot
expect(result).toMatchSnapshot();

// Update snapshots
npm test -- -u
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [GitHub Actions Testing](https://docs.github.com/en/actions/automating-builds-and-tests)
- [Node.js Testing Best Practices](https://github.com/goldbergyoni/nodebestpractices#-testing-and-overall-quality-practices)
