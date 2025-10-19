# Integration Tests

This directory contains integration test fixtures for the llms.txt generator action.

## Test Fixtures

The integration tests create temporary test fixtures during CI runs to validate:

- File discovery and scanning
- Markdown parsing
- Section categorization
- URL generation
- Output file generation
- Error handling

## Running Integration Tests Locally

You can run integration tests locally using the provided scripts:

```bash
# Run the integration test workflow
npm run test:integration
```

Or manually:

```bash
# Build and bundle the action
cd src
npm run package

# Create a test fixture
mkdir -p test-fixture/docs
echo "# Test Doc" > test-fixture/docs/test.md

# Run the action
export INPUT_BASE_URL="https://example.com"
export INPUT_PROJECT_NAME="Test Project"
export INPUT_INPUT_DIRECTORY="test-fixture"
export INPUT_OUTPUT_DIRECTORY="test-fixture"
node dist/index.js
```

## Test Scenarios

The CI pipeline tests:

1. **Basic functionality**: Simple markdown files with standard structure
2. **Multiple sections**: Files organized into different sections
3. **Edge cases**: Empty files, missing headers, special characters
4. **Error handling**: Invalid inputs, missing directories, permission issues
