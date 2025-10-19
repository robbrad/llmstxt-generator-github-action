#!/bin/bash
cd src
npm run build && npm run bundle
cd ../../..

export "INPUT_BASE-URL"="https://example.com"
export "INPUT_PROJECT-NAME"="Sample Documentation"
export "INPUT_INPUT-DIRECTORY"="sample"
export "INPUT_OUTPUT-DIRECTORY"="sample"
export "INPUT_SECTIONS"='{"Docs": "**"}'

node src/dist/index.js
