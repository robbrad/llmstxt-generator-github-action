# Publishing Guide

This guide explains how to publish and release the llms.txt Generator GitHub Action.

## Prerequisites

- Write access to the repository
- Git configured locally
- Node.js 20+ installed

## Release Process

### 1. Prepare the Release

Ensure all changes are committed and tests pass:

```bash
cd .github/actions/llms-txt-generator
npm test
npm run test:integration
```

### 2. Update Version

Update the version in `package.json`:

```bash
cd .github/actions/llms-txt-generator
npm version patch  # or minor, or major
```

This will:
- Update `package.json`
- Create a git commit
- Create a git tag

### 3. Build and Bundle

```bash
npm run package
```

This ensures the `dist/` directory is up to date.

### 4. Commit the Bundle

```bash
git add dist/
git commit -m "chore: update bundle for release"
```

### 5. Push Changes and Tags

```bash
git push origin main
git push origin --tags
```

### 6. Automated Release

The GitHub Actions workflow will automatically:
- Run all tests
- Build and bundle the action
- Create a GitHub release
- Generate a changelog
- Upload release artifacts
- Update the major version tag (e.g., `v1`)

## Version Tags

The action uses semantic versioning with major version tags:

- `v1.0.0` - Specific version
- `v1` - Latest v1.x.x version (auto-updated)

Users can reference the action using:

```yaml
# Specific version (recommended for production)
uses: your-org/your-repo/.github/actions/llms-txt-generator@v1.0.0

# Major version (gets latest v1.x.x)
uses: your-org/your-repo/.github/actions/llms-txt-generator@v1

# Latest (not recommended)
uses: your-org/your-repo/.github/actions/llms-txt-generator@main
```

## Manual Release (if needed)

If you need to create a release manually:

1. Go to GitHub repository → Releases
2. Click "Draft a new release"
3. Choose or create a tag (e.g., `v1.0.1`)
4. Generate release notes
5. Attach the bundled action archive
6. Publish release

## Publishing to GitHub Marketplace

To make the action discoverable in GitHub Marketplace:

1. Ensure `action.yml` has proper metadata:
   - `name`: Unique action name
   - `description`: Clear description
   - `branding`: Icon and color

2. Go to repository → Releases
3. Edit a release
4. Check "Publish this Action to the GitHub Marketplace"
5. Accept the terms
6. Publish

## Versioning Guidelines

Follow semantic versioning:

- **Major (v1.0.0 → v2.0.0)**: Breaking changes
  - Changed input/output names
  - Removed features
  - Changed behavior that breaks existing workflows

- **Minor (v1.0.0 → v1.1.0)**: New features
  - New inputs/outputs
  - New functionality
  - Backward-compatible changes

- **Patch (v1.0.0 → v1.0.1)**: Bug fixes
  - Bug fixes
  - Documentation updates
  - Performance improvements

## Changelog

Maintain a `CHANGELOG.md` file documenting all changes:

```markdown
# Changelog

## [1.1.0] - 2024-01-15

### Added
- New `exclude-pattern` input for filtering files
- Support for `.mdx` files

### Fixed
- Fixed URL encoding for special characters

## [1.0.0] - 2024-01-01

### Added
- Initial release
- Generate llms.txt and llms-full.txt files
- Support for multiple sections
- Auto-commit functionality
```

## Testing Before Release

Always test the action before releasing:

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Test locally with a real repository
cd /path/to/test-repo
export INPUT_BASE_URL="https://example.com"
export INPUT_PROJECT_NAME="Test"
node /path/to/action/dist/index.js
```

## Rollback

If a release has issues:

1. Create a new patch release with the fix
2. Update the major version tag to point to the fixed version:

```bash
git tag -fa v1 -m "Rollback to v1.0.1"
git push origin v1 --force
```

## CI/CD Pipeline

The repository includes automated workflows:

- **CI** (`.github/workflows/ci.yml`): Runs on every push/PR
  - Unit tests
  - Integration tests
  - Build verification
  - Bundle size check

- **Release** (`.github/workflows/release.yml`): Runs on tag push
  - Full test suite
  - Build and bundle
  - Create GitHub release
  - Update major version tag

## Distribution

The action is distributed as:

1. **Source code**: Available in the repository
2. **Bundled action**: `dist/index.js` (committed to repo)
3. **Release archive**: Attached to GitHub releases

Users can reference the action directly from your repository without needing to clone or build it.

## Support

After publishing:

- Monitor GitHub Issues for bug reports
- Respond to questions in Discussions
- Update documentation based on user feedback
- Consider creating example repositories

## Security

- Never commit secrets or credentials
- Review dependencies regularly for vulnerabilities
- Use Dependabot for automated dependency updates
- Follow GitHub's security best practices
