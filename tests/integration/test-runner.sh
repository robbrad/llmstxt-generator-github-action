#!/bin/bash
set -e

# Integration test runner for llms.txt generator
# This script creates test fixtures and runs the action against them

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ACTION_DIR="$SCRIPT_DIR/../.."
TEST_FIXTURE_DIR="$SCRIPT_DIR/fixtures"

echo "🧪 Running integration tests..."
echo ""

# Clean up previous test runs
rm -rf "$TEST_FIXTURE_DIR"
mkdir -p "$TEST_FIXTURE_DIR"

# Build and bundle the action
echo "📦 Building action..."
cd "$ACTION_DIR"
npm run package > /dev/null 2>&1
echo "✅ Action built successfully"
echo ""

# Test 1: Basic functionality
echo "Test 1: Basic functionality"
echo "----------------------------"
TEST_DIR="$TEST_FIXTURE_DIR/test1"
mkdir -p "$TEST_DIR/docs"

cat > "$TEST_DIR/docs/getting-started.md" << 'EOF'
# Getting Started

Learn how to get started with our project.

## Installation

Install the package using npm.
EOF

cat > "$TEST_DIR/docs/api.md" << 'EOF'
# API Reference

Complete API documentation.
EOF

export INPUT_BASE_URL="https://example.com"
export INPUT_PROJECT_NAME="Test Project"
export INPUT_PROJECT_DESCRIPTION="A test project"
export INPUT_INPUT_DIRECTORY="$TEST_DIR"
export INPUT_OUTPUT_DIRECTORY="$TEST_DIR"
export INPUT_SECTIONS='{"Docs": "**"}'

node "$ACTION_DIR/dist/index.js" > /dev/null 2>&1

if [ -f "$TEST_DIR/llms.txt" ] && [ -f "$TEST_DIR/llms-full.txt" ]; then
    echo "✅ Test 1 passed"
else
    echo "❌ Test 1 failed: Output files not generated"
    exit 1
fi
echo ""

# Test 2: Multiple sections
echo "Test 2: Multiple sections"
echo "-------------------------"
TEST_DIR="$TEST_FIXTURE_DIR/test2"
mkdir -p "$TEST_DIR/docs"
mkdir -p "$TEST_DIR/guides"

cat > "$TEST_DIR/docs/intro.md" << 'EOF'
# Introduction

Welcome to the documentation.
EOF

cat > "$TEST_DIR/guides/tutorial.md" << 'EOF'
# Tutorial

Step-by-step guide.
EOF

export INPUT_INPUT_DIRECTORY="$TEST_DIR"
export INPUT_OUTPUT_DIRECTORY="$TEST_DIR"
export INPUT_SECTIONS='{"Docs": "docs/**", "Guides": "guides/**"}'

node "$ACTION_DIR/dist/index.js" > /dev/null 2>&1

if grep -q "## Docs" "$TEST_DIR/llms.txt" && grep -q "## Guides" "$TEST_DIR/llms.txt"; then
    echo "✅ Test 2 passed"
else
    echo "❌ Test 2 failed: Sections not properly categorized"
    exit 1
fi
echo ""

# Test 3: Exclude pattern
echo "Test 3: Exclude pattern"
echo "-----------------------"
TEST_DIR="$TEST_FIXTURE_DIR/test3"
mkdir -p "$TEST_DIR/docs"
mkdir -p "$TEST_DIR/draft"

cat > "$TEST_DIR/docs/public.md" << 'EOF'
# Public Document

This should be included.
EOF

cat > "$TEST_DIR/draft/private.md" << 'EOF'
# Private Document

This should be excluded.
EOF

export INPUT_INPUT_DIRECTORY="$TEST_DIR"
export INPUT_OUTPUT_DIRECTORY="$TEST_DIR"
export INPUT_EXCLUDE_PATTERN="**/draft/**"
export INPUT_SECTIONS='{"Docs": "**"}'

node "$ACTION_DIR/dist/index.js" > /dev/null 2>&1

if grep -q "Public Document" "$TEST_DIR/llms.txt" && ! grep -q "Private Document" "$TEST_DIR/llms.txt"; then
    echo "✅ Test 3 passed"
else
    echo "❌ Test 3 failed: Exclude pattern not working"
    exit 1
fi
echo ""

# Test 4: Error handling - no markdown files
echo "Test 4: Error handling - no markdown files"
echo "------------------------------------------"
TEST_DIR="$TEST_FIXTURE_DIR/test4"
mkdir -p "$TEST_DIR"

export INPUT_INPUT_DIRECTORY="$TEST_DIR"
export INPUT_OUTPUT_DIRECTORY="$TEST_DIR"
unset INPUT_EXCLUDE_PATTERN

if node "$ACTION_DIR/dist/index.js" > /dev/null 2>&1; then
    echo "❌ Test 4 failed: Should have failed with no markdown files"
    exit 1
else
    echo "✅ Test 4 passed"
fi
echo ""

echo "🎉 All integration tests passed!"
