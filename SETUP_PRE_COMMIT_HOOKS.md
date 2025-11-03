# Pre-commit Hooks Setup

This document explains how to set up pre-commit hooks using Husky and lint-staged to enforce code quality before commits.

## Installation

### 1. Install Husky and lint-staged

```bash
npm install -D husky lint-staged
npx husky install
```

### 2. Add pre-commit hook

```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

### 3. Create lint-staged configuration

Create `.lintstagedrc.json` in the project root:

```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.json": [
    "prettier --write"
  ]
}
```

Or add to `package.json`:

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.json": [
    "prettier --write"
  ]
}
```

## What happens

When you try to commit:

1. ✅ Files are automatically formatted with Prettier
2. ✅ ESLint issues are auto-fixed
3. ❌ If ESLint errors remain, the commit is blocked
4. ✅ You can then fix remaining issues and try again

## Manual checks (before pushing)

```bash
# Check code quality without fixing
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## Skip pre-commit hooks (not recommended)

```bash
git commit --no-verify
```

## Troubleshooting

### Husky hooks not running

```bash
# Ensure git hooks are installed
npx husky install

# Check that .husky/pre-commit file exists and is executable
ls -la .husky/pre-commit
```

### Permission denied errors on Windows

Add this to `.husky/pre-commit`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

### Dependencies

Make sure these are installed (or will be after setup):

```bash
npm install -D husky lint-staged prettier eslint
```

## Next Steps

After setting up pre-commit hooks, your development workflow will be:

1. Make code changes
2. Stage files: `git add .`
3. Commit: `git commit -m "your message"`
4. Pre-commit hook runs automatically:
   - Fixes formatting with Prettier
   - Fixes ESLint issues
   - If all pass, commit succeeds
   - If any errors remain, commit fails and you fix them

This ensures code quality is maintained across all commits!