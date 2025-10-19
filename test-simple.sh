#!/bin/bash
cd .github/actions/llms-txt-generator
npm run build && npm run bundle
cd ../../..

export "INPUT_BASE-URL"="https://example.com"
export "INPUT_PROJECT-NAME"="Sample Documentation"
export "INPUT_INPUT-DIRECTORY"="sample"
export "INPUT_OUTPUT-DIRECTORY"="sample"
export "INPUT_SECTIONS"='{"Docs": "**"}'

node .github/actions/llms-txt-generator/dist/index.js
