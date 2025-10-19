# Error Handling Implementation

This document describes the comprehensive error handling implemented in the llms-txt-generator action.

## Requirements Coverage

### Requirement 6.1: Input Directory Validation
- **Location**: `main.ts` lines 73-82
- **Implementation**: 
  - Validates that input directory exists
  - Validates that input path is actually a directory (not a file)
  - Provides clear error message with absolute path

### Requirement 6.2: Markdown File Discovery Validation
- **Location**: `main.ts` lines 95-97
- **Implementation**:
  - Validates at least one markdown file was found
  - Includes exclude pattern in error message if applicable
  - Provides clear error message with directory path

### Requirement 4.5 & 6.4: Graceful File Read Error Handling
- **Location**: `main.ts` lines 103-116
- **Implementation**:
  - Wraps individual file parsing in try-catch
  - Logs warning for each failed file with specific error message
  - Continues processing remaining files
  - Tracks count of failed files
  - Provides summary of parsing results

### Requirement 6.3: Output Directory and File Write Errors
- **Location**: `main.ts` lines 130-137 and `generator.ts` lines 109-145
- **Implementation**:
  - Validates output directory can be created
  - Validates llms.txt can be written
  - Validates llms-full.txt can be written
  - Provides specific error messages for each failure type
  - Includes permission hints in error messages

### Requirement 6.6: Critical Error Handling
- **Location**: `main.ts` lines 157-167
- **Implementation**:
  - Catches all unhandled errors in main try-catch
  - Logs error message using `core.error()`
  - Logs stack trace using `core.debug()` for debugging
  - Sets action status to failed using `core.setFailed()`

## Additional Validations

### Input Validation
- **Base URL Format**: Validates base URL is a valid URL format
- **Required Inputs**: Validates base-url and project-name are not empty
- **Sections JSON**: Validates sections input is valid JSON object

### File Scanner Error Handling
- **Location**: `main.ts` lines 88-92
- **Implementation**: Wraps file scanner call in try-catch with descriptive error

### Generator Error Handling
- **Location**: `main.ts` lines 121-127
- **Implementation**: Wraps content generation in try-catch with descriptive error

## Error Message Quality

All error messages follow these principles:
1. **Descriptive**: Clearly state what went wrong
2. **Actionable**: Provide hints on how to fix the issue
3. **Contextual**: Include relevant paths, patterns, or values
4. **Consistent**: Use similar formatting and structure

## Examples

### Input Directory Not Found
```
Error: Input directory does not exist: /path/to/directory
```

### No Markdown Files Found
```
Error: No markdown files found in directory: /path/to/directory (exclude pattern: **/node_modules/**)
```

### File Parse Failure (Warning)
```
Warning: Failed to parse file docs/example.md: ENOENT: no such file or directory
```

### All Files Failed to Parse
```
Error: No markdown files could be successfully parsed. All 5 file(s) failed.
```

### Output Write Failure
```
Error: Failed to write output files to /path/to/output: EACCES: permission denied. Check directory permissions.
```

## Testing Recommendations

To verify error handling, test these scenarios:
1. Non-existent input directory
2. Empty directory with no markdown files
3. Directory with only excluded files
4. Corrupted markdown files
5. Read-only output directory
6. Invalid base URL format
7. Invalid sections JSON
8. Mixed success/failure file parsing
