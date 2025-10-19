# Testing the llms.txt Generator Action

This repository includes test scripts to verify the GitHub Action works correctly against the `sample` folder.

## Quick Test

The easiest way to test the action locally:

```bash
node test-wrapper.js
```

This will:
- Process all markdown files in the `sample` directory
- Generate `sample/llms.txt` and `sample/llms-full.txt`
- Show detailed output of what was processed

## Alternative: Bash Script

You can also use the bash script (works with Git Bash on Windows):

```bash
bash test-action.sh
```

Note: The bash script may have output buffering issues, so `test-wrapper.js` is recommended.

## Building the Action

If you make changes to the action source code, rebuild it:

```bash
cd src
npm install
npm run build
npm run bundle
cd ../../..
```

Then run the test again.

## What Gets Generated

The action will:
- Find all `.md`, `.mdx`, and `.markdown` files in the sample directory
- Extract titles and descriptions from each file
- Organize them into sections based on directory structure
- Generate two files:
  - `llms.txt` - Index with links and descriptions
  - `llms-full.txt` - Full content of all files

## Checking the Results

After running the test, check the generated files:

```bash
cat sample/llms.txt
cat sample/llms-full.txt
```

Or open them in your editor to review the output.
