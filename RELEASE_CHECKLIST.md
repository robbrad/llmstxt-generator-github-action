# Release Checklist

Use this checklist when preparing a new release of the llms.txt Generator action.

## Pre-Release

### Code Quality

- [ ] All tests pass locally
  ```bash
  cd .github/actions/llms-txt-generator
  npm test
  npm run test:integration
  ```

- [ ] TypeScript compiles without errors
  ```bash
  npm run build
  ```

- [ ] No linting errors
  ```bash
  npx tsc --noEmit
  ```

- [ ] Code is properly formatted

- [ ] No console.log or debug statements left in code

### Documentation

- [ ] README.md is up to date
- [ ] CHANGELOG.md is updated with new changes
- [ ] Action README (.github/actions/llms-txt-generator/README.md) is current
- [ ] All examples in documentation work
- [ ] JSDoc comments are complete
- [ ] Breaking changes are clearly documented

### Testing

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual testing completed
- [ ] Tested with real-world repositories
- [ ] Edge cases tested
- [ ] Error handling verified

### Dependencies

- [ ] Dependencies are up to date
- [ ] No security vulnerabilities
  ```bash
  npm audit
  ```
- [ ] Unused dependencies removed
- [ ] License compliance checked

## Release Process

### 1. Version Bump

- [ ] Decide version number (major.minor.patch)
- [ ] Update version in package.json
  ```bash
  cd .github/actions/llms-txt-generator
  npm version patch  # or minor, or major
  ```

### 2. Build and Bundle

- [ ] Build TypeScript
  ```bash
  npm run build
  ```

- [ ] Bundle with ncc
  ```bash
  npm run bundle
  ```

- [ ] Verify bundle size is reasonable
  ```bash
  ls -lh dist/index.js
  ```

- [ ] Test bundled action
  ```bash
  export INPUT_BASE_URL="https://example.com"
  export INPUT_PROJECT_NAME="Test"
  node dist/index.js
  ```

### 3. Commit Changes

- [ ] Stage all changes
  ```bash
  git add dist/ package.json package-lock.json
  ```

- [ ] Commit with descriptive message
  ```bash
  git commit -m "chore: release v1.0.0"
  ```

### 4. Create Git Tag

- [ ] Tag is created (by npm version or manually)
  ```bash
  git tag -a v1.0.0 -m "Release v1.0.0"
  ```

- [ ] Tag follows semantic versioning

### 5. Push to GitHub

- [ ] Push commits
  ```bash
  git push origin main
  ```

- [ ] Push tags
  ```bash
  git push origin --tags
  ```

### 6. Verify CI/CD

- [ ] CI workflow passes
- [ ] Release workflow runs successfully
- [ ] GitHub release is created automatically
- [ ] Release notes are generated
- [ ] Major version tag is updated (e.g., v1)

### 7. GitHub Release

- [ ] Release is published (not draft)
- [ ] Release notes are clear and complete
- [ ] Breaking changes are highlighted
- [ ] Migration guide included (if breaking changes)
- [ ] Assets are attached

### 8. Marketplace (Optional)

- [ ] Action is published to GitHub Marketplace
- [ ] Marketplace listing is accurate
- [ ] Icon and branding are correct
- [ ] Categories are appropriate

## Post-Release

### Verification

- [ ] Action works when referenced by tag
  ```yaml
  uses: your-org/your-repo/.github/actions/llms-txt-generator@v1.0.0
  ```

- [ ] Major version tag works
  ```yaml
  uses: your-org/your-repo/.github/actions/llms-txt-generator@v1
  ```

- [ ] Test in a real repository
- [ ] All inputs work as expected
- [ ] All outputs are set correctly

### Communication

- [ ] Announce release (if major/minor)
- [ ] Update any example repositories
- [ ] Respond to issues/discussions
- [ ] Update documentation sites

### Monitoring

- [ ] Monitor for issues in first 24 hours
- [ ] Check GitHub Actions usage
- [ ] Review any error reports
- [ ] Be ready to hotfix if needed

## Rollback Plan

If issues are discovered:

### Option 1: Hotfix Release

- [ ] Create fix branch
- [ ] Fix the issue
- [ ] Test thoroughly
- [ ] Release patch version
- [ ] Update major version tag

### Option 2: Revert Tag

- [ ] Identify last good version
- [ ] Update major version tag
  ```bash
  git tag -fa v1 v1.0.0 -m "Rollback to v1.0.0"
  git push origin v1 --force
  ```
- [ ] Communicate the rollback
- [ ] Plan proper fix

## Version-Specific Checklists

### Major Version (Breaking Changes)

- [ ] Migration guide written
- [ ] Breaking changes clearly documented
- [ ] Deprecation warnings added (if applicable)
- [ ] Examples updated
- [ ] Consider backward compatibility options

### Minor Version (New Features)

- [ ] New features documented
- [ ] Examples added for new features
- [ ] Backward compatibility maintained
- [ ] Feature flags considered (if appropriate)

### Patch Version (Bug Fixes)

- [ ] Bug fix is minimal and focused
- [ ] No new features added
- [ ] No breaking changes
- [ ] Regression tests added

## Security Release

If releasing a security fix:

- [ ] Security advisory created
- [ ] CVE requested (if applicable)
- [ ] Users notified through appropriate channels
- [ ] Fix doesn't reveal vulnerability details
- [ ] Coordinated disclosure followed

## Checklist for First Release (v1.0.0)

- [ ] All core features implemented
- [ ] Comprehensive documentation
- [ ] Test coverage > 80%
- [ ] No known critical bugs
- [ ] Performance is acceptable
- [ ] Security review completed
- [ ] License file included
- [ ] Contributing guide available
- [ ] Code of conduct (if applicable)

## Tools

Useful commands:

```bash
# Check current version
npm version

# View git tags
git tag -l

# View commits since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Generate changelog
git log --pretty=format:"- %s (%h)" --no-merges v1.0.0..HEAD

# Check bundle size
du -h .github/actions/llms-txt-generator/dist/index.js

# Test action locally
bash test-action.sh
```

## Notes

- Always test thoroughly before releasing
- Communicate breaking changes clearly
- Keep releases small and focused
- Document everything
- Be responsive to issues after release
- Learn from each release to improve the process

---

**Last Updated:** [Date]
**Next Review:** [Date]
