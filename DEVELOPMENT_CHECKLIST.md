# BuyJan Development Environment Checklist

Complete guide for setting up and maintaining a local development environment for the BuyJan e-commerce application.

## Quick Start (5 minutes)

For experienced developers, follow these essential steps:

```bash
# 1. Clone repository
git clone <repository-url>
cd cosmatic_app_directus

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your Directus credentials

# 4. Start development server
npm run dev

# App runs at http://localhost:3000
```

---

## Prerequisites Checklist

### System Requirements

- [ ] **Operating System**: Windows 10+, macOS 10.13+, or Linux (Ubuntu 18.04+)
- [ ] **RAM**: Minimum 4GB (8GB recommended for smooth development)
- [ ] **Disk Space**: 5GB+ available

### Required Software

- [ ] **Node.js**: v18.0.0 or higher
  ```bash
  node --version  # Check version (should be v18+)
  ```
  [Download Node.js](https://nodejs.org/en/download/)

- [ ] **npm**: v8.0.0 or higher (comes with Node.js)
  ```bash
  npm --version  # Check version
  ```

- [ ] **Git**: v2.30+
  ```bash
  git --version  # Check version
  ```
  [Download Git](https://git-scm.com/downloads)

### Optional but Recommended

- [ ] **Visual Studio Code**: Latest version
  - Extensions installed (see [VS Code Setup](#vs-code-setup))
  [Download VS Code](https://code.visualstudio.com/)

- [ ] **Git GUI**: GitHub Desktop, GitKraken, or SourceTree
  - Helpful for visual branch management

- [ ] **REST Client**: Postman or Insomnia
  - For testing API endpoints manually

---

## Initial Setup Checklist

### 1. Repository Setup

- [ ] Clone the repository
  ```bash
  git clone <repository-url>
  cd cosmatic_app_directus
  ```

- [ ] Verify git configuration
  ```bash
  git config --local user.name "Your Name"
  git config --local user.email "your.email@example.com"
  ```

- [ ] Create feature branch
  ```bash
  git checkout -b feature/your-feature-name
  ```

### 2. Dependency Installation

- [ ] Install npm packages
  ```bash
  npm install
  ```

- [ ] Verify installation
  ```bash
  npm list --depth=0  # Should show all dependencies
  ```

- [ ] Check for security vulnerabilities
  ```bash
  npm audit
  ```
  - If vulnerabilities found, run: `npm audit fix`

### 3. Environment Configuration

- [ ] Copy example environment file
  ```bash
  cp .env.local.example .env.local
  ```

- [ ] Edit `.env.local` with credentials:
  - [ ] `NEXT_PUBLIC_DIRECTUS_URL` - Directus CMS URL
  - [ ] `NEXT_PUBLIC_SITE_URL` - BuyJan website URL
  - [ ] `DIRECTUS_API_TOKEN` - Server-side API token
  - [ ] `NEXT_PUBLIC_DIRECTUS_API_TOKEN` - Client-side API token

- [ ] Verify environment variables loaded
  ```bash
  node -e "console.log(process.env.NEXT_PUBLIC_DIRECTUS_URL)"
  ```

---

## Development Server Setup

### Starting the Development Server

- [ ] Start Next.js development server
  ```bash
  npm run dev
  ```

- [ ] Verify server started
  - Application should be accessible at `http://localhost:3000`
  - Look for message: `ready started server on 0.0.0.0:3000`

- [ ] Check all pages load
  - [ ] Home page: `http://localhost:3000/`
  - [ ] Products: `http://localhost:3000/products`
  - [ ] Sign in: `http://localhost:3000/signin`
  - [ ] Arabic version: `http://localhost:3000/ar/`

### Hot Reload Verification

- [ ] Make a small change to `src/app/layout.tsx`
- [ ] Verify the page auto-refreshes without manual reload
- [ ] Revert the change

---

## Code Quality Tools

### Type Checking

- [ ] Run TypeScript type check
  ```bash
  npm run type-check
  ```
- [ ] Verify no type errors reported

### Linting

- [ ] Run ESLint
  ```bash
  npm run lint
  ```
- [ ] Fix auto-fixable issues
  ```bash
  npm run lint -- --fix
  ```

### Code Formatting

- [ ] Check code formatting
  ```bash
  npm run format:check
  ```
- [ ] Apply formatting
  ```bash
  npm run format
  ```

### All Checks Combined

- [ ] Run comprehensive checks
  ```bash
  npm run type-check && npm run lint && npm run format
  ```

---

## Testing Setup

### Unit Tests

- [ ] Run unit tests
  ```bash
  npm run test:unit
  ```

- [ ] Run tests in watch mode (for development)
  ```bash
  npm run test:unit:watch
  ```

- [ ] Generate coverage report
  ```bash
  npm run test:unit:coverage
  ```
  - Coverage report generated in `coverage/` directory
  - Target: >70% code coverage

### E2E Tests

- [ ] Install Playwright browsers (first time only)
  ```bash
  npx playwright install
  ```

- [ ] Run E2E tests
  ```bash
  npm run test:e2e
  ```

- [ ] Run E2E tests with UI
  ```bash
  npm run test:e2e:ui
  ```
  - Opens interactive test runner in browser

- [ ] Run specific test file
  ```bash
  npm run test:e2e:auth
  ```

---

## Build & Performance

### Production Build

- [ ] Create production build
  ```bash
  npm run build
  ```

- [ ] Verify build succeeded (look for `.next` folder)

### Analyze Bundle Size

- [ ] Analyze bundle
  ```bash
  npm run analyze
  ```
  - Creates `BUNDLE_ANALYSIS.md` report

- [ ] Create size baseline
  ```bash
  npm run analyze:baseline
  ```
  - Saves baseline to `build-size-baseline.json`

- [ ] Compare with baseline
  ```bash
  npm run analyze:compare
  ```

### Start Production Server

- [ ] Start production server
  ```bash
  npm run start
  ```
- [ ] Verify at `http://localhost:3000`

---

## VS Code Setup

### Recommended Extensions

- [ ] **ESLint** - dbaeumer.vscode-eslint
  ```
  Enables real-time linting in editor
  ```

- [ ] **Prettier** - esbenp.prettier-vscode
  ```
  Automatic code formatting on save
  ```

- [ ] **TypeScript Vue Plugin** - Vue.vscode-typescript-vue-plugin
  ```
  Better TypeScript support
  ```

- [ ] **Next.js Snippets** - Palanantonio.nextjs-snippets
  ```
  Helpful code snippets
  ```

- [ ] **Tailwind CSS IntelliSense** - bradlc.vscode-tailwindcss
  ```
  Autocomplete for Tailwind classes
  ```

- [ ] **REST Client** - humao.rest-client
  ```
  Test API endpoints directly in editor
  ```

- [ ] **Git Graph** - mhutchie.git-graph
  ```
  Visual git branch history
  ```

### VS Code Settings

Create/update `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/.next": true,
    "**/node_modules": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Recommended Settings in VS Code

- [ ] Install recommended extensions (VS Code will prompt)
- [ ] Enable "Format on Save" in settings
- [ ] Set default formatter to Prettier

---

## Common Development Tasks

### Creating a New Feature

- [ ] Create feature branch
  ```bash
  git checkout -b feature/feature-name
  ```

- [ ] Make code changes
- [ ] Run tests to verify
  ```bash
  npm run test:unit
  ```

- [ ] Format code
  ```bash
  npm run format
  ```

- [ ] Commit changes
  ```bash
  git add .
  git commit -m "feat: add feature description"
  ```

- [ ] Push to remote
  ```bash
  git push origin feature/feature-name
  ```

### Fixing a Bug

- [ ] Create bug fix branch
  ```bash
  git checkout -b fix/bug-description
  ```

- [ ] Fix the bug
- [ ] Add test case that reproduces bug (before fix)
- [ ] Verify test now passes
- [ ] Commit with reference to issue
  ```bash
  git commit -m "fix: resolve issue #123 - bug description"
  ```

### Updating Dependencies

- [ ] Check for updates
  ```bash
  npm outdated
  ```

- [ ] Update specific package
  ```bash
  npm install package-name@latest
  ```

- [ ] Update all dependencies
  ```bash
  npm update
  ```

- [ ] Verify no breaking changes
  ```bash
  npm run type-check && npm run test:unit
  ```

---

## Debugging

### Enable Debug Logging

```bash
# Linux/macOS
DEBUG=buyjan:* npm run dev

# Windows (PowerShell)
$env:DEBUG='buyjan:*'; npm run dev
```

### Browser DevTools

- [ ] Open Chrome DevTools: `F12` or `Ctrl+Shift+I`
- [ ] React DevTools browser extension recommended
  - [Chrome](https://chrome.google.com/webstore/)
  - [Firefox](https://addons.mozilla.org/firefox/)
- [ ] Check console for errors
- [ ] Use Network tab to inspect API calls
- [ ] Use React tab to inspect component hierarchy

### Server-Side Debugging

- [ ] Use VS Code debugger
  - Install "Debugger for Chrome" extension
  - Create `.vscode/launch.json`:
    ```json
    {
      "version": "0.2.0",
      "configurations": [
        {
          "name": "Next.js",
          "type": "node",
          "request": "launch",
          "program": "${workspaceFolder}/node_modules/.bin/next",
          "args": ["dev"],
          "console": "integratedTerminal"
        }
      ]
    }
    ```

### Check API Connectivity

- [ ] Test Directus API
  ```bash
  curl -H "Authorization: Bearer YOUR_TOKEN" \
    https://admin.buyjan.com/graphql \
    -d '{"query": "{ products_collection { id name } }"}'
  ```

- [ ] Test with REST client in VS Code
  - Create file `test-api.http`
  - Use REST Client extension to test endpoints

---

## Troubleshooting

### Issue: Port 3000 Already in Use

**Solution:**
```bash
# Linux/macOS
lsof -i :3000  # Find process
kill -9 <PID>

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Issue: Dependencies Not Installing

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: TypeScript Errors After Update

**Solution:**
```bash
# Rebuild TypeScript cache
rm -rf .next tsconfig.tsbuildinfo

# Run type check
npm run type-check
```

### Issue: API Returns 403 Forbidden

**Possible causes:**
- [ ] Token is invalid or expired
  - Get new token from Directus admin panel
  
- [ ] Token doesn't have required permissions
  - Check Directus API Token role/permissions
  
- [ ] DIRECTUS_URL is incorrect
  - Verify `NEXT_PUBLIC_DIRECTUS_URL` in `.env.local`
  
- [ ] Network connectivity issue
  - Check if Directus server is accessible
  - `curl https://admin.buyjan.com/status`

### Issue: Components Not Hot-Reloading

**Solution:**
```bash
# Stop dev server
# Delete .next folder
rm -rf .next

# Restart dev server
npm run dev
```

### Issue: Build Fails with Webpack Error

**Solution:**
```bash
# Clear build cache and rebuild
rm -rf .next node_modules/.cache
npm run build
```

---

## Daily Development Workflow

### Starting Your Day

1. [ ] Update code from remote
   ```bash
   git fetch origin
   git pull origin main
   ```

2. [ ] Install any new dependencies
   ```bash
   npm install
   ```

3. [ ] Start dev server
   ```bash
   npm run dev
   ```

4. [ ] Run tests to verify everything works
   ```bash
   npm run test:unit
   ```

### During Development

1. [ ] Make code changes
2. [ ] Test locally at `http://localhost:3000`
3. [ ] Run type check and lint frequently
   ```bash
   npm run type-check && npm run lint
   ```

4. [ ] Commit changes regularly with good messages
   ```bash
   git commit -m "type: meaningful description"
   ```

### Before Committing

- [ ] Run all checks pass
  ```bash
  npm run type-check && npm run lint && npm run test:unit
  ```

- [ ] Format code
  ```bash
  npm run format
  ```

- [ ] Verify build succeeds
  ```bash
  npm run build
  ```

### End of Day

1. [ ] Push changes to remote
   ```bash
   git push origin feature/your-feature
   ```

2. [ ] Clean up workspace
   ```bash
   git clean -fd  # Remove untracked files
   ```

---

## Performance Optimization

### Development Performance Tips

- [ ] Disable browser extensions that slow down the app
  - Redux DevTools, React DevTools can impact performance
  
- [ ] Use "Performance" tab in DevTools to find bottlenecks
  - Record performance trace
  - Analyze function call times
  
- [ ] Monitor bundle size
  ```bash
  npm run analyze
  ```
  - Keep JavaScript bundle under 500KB
  - Keep images optimized

- [ ] Enable SWR caching for API requests
  - Reduces duplicate API calls
  - See: `src/lib/requestDedup.ts`

---

## Code Standards & Best Practices

### Git Commit Messages

Follow conventional commits:
```
type(scope): description

feat(auth): add login form validation
fix(products): resolve filtering bug
docs(readme): update installation steps
style(ui): format button component
refactor(api): simplify error handling
test(checkout): add order creation tests
chore(deps): upgrade React to v19
```

### TypeScript

- [ ] Use strict mode (enabled in `tsconfig.json`)
- [ ] Avoid `any` types - use proper types
- [ ] Export types for public APIs
  - See `src/types/`

### React Components

- [ ] Use functional components with hooks
- [ ] Extract reusable logic into custom hooks
  - See `src/hooks/`
- [ ] Keep components focused and small
- [ ] Memoize expensive computations with `useMemo`

### API Requests

- [ ] Use SWR hooks for data fetching
  - See `src/hooks/useSWR*`
- [ ] Handle errors gracefully
- [ ] Show loading states
- [ ] Implement proper caching

### Testing

- [ ] Write tests for new features
- [ ] Target >70% code coverage
- [ ] Test user interactions, not implementation
- [ ] Use descriptive test names

---

## Useful Commands Reference

```bash
# Development
npm run dev                 # Start dev server
npm run build             # Production build
npm run start             # Start production server

# Code Quality
npm run type-check        # TypeScript check
npm run lint              # ESLint check
npm run lint -- --fix     # Fix linting issues
npm run format            # Format code with Prettier
npm run format:check      # Check formatting

# Testing
npm run test:unit         # Run unit tests
npm run test:unit:watch   # Watch mode
npm run test:unit:coverage # Coverage report
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # E2E with UI

# Performance
npm run analyze           # Bundle analysis
npm run analyze:baseline  # Create baseline
npm run analyze:compare   # Compare with baseline
npm run build:analyze     # Build and analyze
```

---

## Getting Help

### Documentation

- [ ] Main README: `README.md`
- [ ] API Filters: `docs/API_FILTER_FORMATS.md`
- [ ] Environment Setup: `.env.local.example`
- [ ] Type Definitions: `src/types/`
- [ ] Component Library: `src/components/ui/`

### Common Issues

- [ ] Check error logs in browser console
- [ ] Review terminal output for error messages
- [ ] Search existing GitHub issues
- [ ] Check Directus documentation: https://docs.directus.io/

### Team Support

- [ ] Slack channel: #development
- [ ] GitHub Discussions
- [ ] Code review on pull requests

---

## Checklist Summary

Print this for reference:

```
Development Environment Ready:
- [ ] Node.js v18+ installed
- [ ] npm dependencies installed
- [ ] .env.local configured
- [ ] Dev server running on port 3000
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Tests pass
- [ ] VS Code extensions installed
- [ ] First commit made

Ready to develop!
```

---

**Last Updated**: 2024-01-15  
**Version**: 1.0  
**Maintainers**: BuyJan Development Team