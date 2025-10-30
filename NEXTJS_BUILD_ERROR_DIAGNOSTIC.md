# Next.js Build Error: "TypeError: generate is not a function"

## Error Details
**Error Message**: `[TypeError: generate is not a function]`  
**Framework**: Next.js 15.5.6 (specified 15.0.3 in package.json)  
**React Version**: 19.0.0  
**TypeScript**: 5.3.3  
**Platform**: Windows 11  

## Troubleshooting Summary

### ✅ Successfully Tested (Not the Issue):
1. **Cache & Dependencies**: Cleared npm cache, deleted node_modules, .next, package-lock.json
2. **Configuration Review**: next.config.js (no misconfiguration found)
3. **TypeScript Config**: tsconfig.json (correct module resolution)
4. **API Routes**: Renamed entire src/app/api directory (error persisted)
5. **I18n Files**: Temporarily disabled middleware (error persisted)
6. **generateStaticParams**: Disabled in categories page (error persisted)
7. **generateMetadata**: Disabled in layout.tsx (error persisted)
8. **SWC Compiler**: Disabled optimizePackageImports, emotion, styledComponents
9. **Version Compatibility**: next-intl 4.4.0 supports Next.js 15.x

### ❌ Current Status
The error **"TypeError: generate is not a function"** remains after:
- Multiple cache clears and fresh npm installs
- Removing problematic pages and routes
- Disabling experimental features
- Disabling SWC optimizations
- Disabling i18n middleware

**Conclusion**: This is likely a **deep framework-level or package integration issue** rather than application code.

---

## Root Cause Analysis

The error appears to originate from Next.js or a dependency, not application code, because:

1. **Generic Error Message**: Lacks file/line numbers indicating a framework issue
2. **Persists After Route Removal**: Error remains even when entire page directories are deleted
3. **SWC Related**: Error likely occurs during build compilation phase, not runtime
4. **Module Export Issue**: Suggests a function is being called but isn't properly exported

### Potential Root Causes (in priority order):

#### 1. **SWC Compiler Incompatibility**
   - Next.js 15.5.6 uses SWC for compilation
   - Possible issue with how SWC handles specific imports or exports
   - May conflict with specific package versions

#### 2. **next-intl & Next.js Integration**
   - `getRequestConfig` from `next-intl/server` might have export issues
   - Dynamic JSON import in `src/i18n/request.ts` could trigger SWC bug
   - next-intl 4.4.0 with Next.js 15.5.6 might have undiscovered incompatibility

#### 3. **@directus/sdk CommonJS/ESM Issue**
   - SDK might be using different module formats
   - `readItems()` export could have issues with SWC

#### 4. **Babel/Webpack Configuration Conflict**
   - Next.js 15 might require specific Babel plugins
   - Missing babel configuration could cause compilation errors

---

## Solution Approaches

### Solution 1: Downgrade Next.js to Stable Version
**Why**: Next.js 15.5.6 may have unresolved SWC compiler issues  
**Risk**: Medium (breaking changes possible)

```bash
# Step 1: Update package.json
npm install next@14.2.3 --save
npm install @types/node@20.19.23 --save-dev

# Step 2: Clean and rebuild
rm -r node_modules .next package-lock.json
npm install
npm run build
```

**Configuration**: next.config.js remains the same.

---

### Solution 2: Downgrade next-intl
**Why**: Compatibility issue between next-intl 4.4.0 and Next.js 15.5.6  
**Risk**: Low (next-intl 4.3.x is stable)

```bash
# Step 1: Update to stable version
npm install next-intl@4.3.5 --save

# Step 2: Clear cache and rebuild
rm -r node_modules .next package-lock.json
npm install
npm run build
```

**Expected Result**: If this works, the issue is next-intl compatibility.

---

### Solution 3: Replace next-intl with react-intl
**Why**: Eliminate next-intl compatibility issues entirely  
**Risk**: High (requires significant refactoring)

```bash
npm install react-intl --save
npm uninstall next-intl --save
```

This requires updating:
- `src/i18n/request.ts`
- `src/middleware.ts`
- All page layout files
- Message loading strategy

Not recommended unless others fail.

---

### Solution 4: Disable SWC and Use Babel
**Why**: Force Next.js to use Babel instead of SWC  
**Risk**: Medium (performance impact, requires .babelrc)

**Step 1**: Create `.babelrc` file:
```json
{
  "presets": ["next/babel"]
}
```

**Step 2**: Update `next.config.js`:
```javascript
const nextConfig = {
    images: {
        // ... existing config
    },
    swcMinify: false,
    experimental: {
        esmExternals: false,
    },
};
module.exports = nextConfig;
```

**Step 3**: Install Babel dependencies:
```bash
npm install --save-dev @babel/core babel-loader
npm run build
```

---

### Solution 5: Isolate Module Import Issue
**Why**: The error might be in how modules are imported/exported  
**Risk**: Low (diagnostic only)

**Step 1**: Create minimal reproduction file `src/test-imports.ts`:
```typescript
// Test each problematic import
try {
    const { getRequestConfig } = require('next-intl/server');
    console.log('next-intl/server:', typeof getRequestConfig);
} catch (e) {
    console.error('next-intl/server import failed:', e);
}

try {
    const { readItems } = require('@directus/sdk');
    console.log('@directus/sdk readItems:', typeof readItems);
} catch (e) {
    console.error('@directus/sdk import failed:', e);
}

try {
    const { createDirectus, rest } = require('@directus/sdk');
    console.log('@directus/sdk createDirectus:', typeof createDirectus);
} catch (e) {
    console.error('@directus/sdk import failed:', e);
}
```

**Step 2**: Run with Node:
```bash
node -r esbuild-register src/test-imports.ts
```

---

### Solution 6: Clean TypeScript Build
**Why**: TypeScript compilation issue might be interfering with SWC  
**Risk**: Low

```bash
# Step 1: Run type check
npm run type-check 2>&1 | Tee-Object -FilePath "type-errors.log"

# Step 2: Clear TypeScript cache
rm -r tsconfig.tsbuildinfo

# Step 3: Clean everything
rm -r node_modules .next .turbo package-lock.json

# Step 4: Fresh install with strict TypeScript
npm install
npm run type-check
npm run build
```

---

### Solution 7: Update All Dependencies
**Why**: Mixed dependency versions might cause incompatibility  
**Risk**: Medium (breaking changes possible)

```bash
# Step 1: Update major dependencies
npm install next@latest react@latest react-dom@latest next-intl@latest --save

# Step 2: Update dev dependencies
npm install @types/node@latest @types/react@latest typescript@latest --save-dev

# Step 3: Rebuild
rm -r node_modules .next package-lock.json
npm install
npm run build
```

---

## Recommended Execution Order

1. **First Try (Safest)**: Solution 2 (Downgrade next-intl to 4.3.5)
2. **Second Try**: Solution 4 (Disable SWC, use Babel)
3. **Third Try**: Solution 1 (Downgrade Next.js to 14.2.3)
4. **If Still Failing**: Solution 7 (Update all dependencies)

---

## Diagnostic Commands

Run these to gather more information:

```bash
# Check exact versions installed
npm ls next next-intl "@directus/sdk" react react-dom

# Run TypeScript type check
npm run type-check 2>&1 > type-check-output.txt

# Try build with more verbose output
NODE_OPTIONS="--trace-warnings" npm run build 2>&1 > build-trace.log

# Check for any module resolution issues
npm ls --all 2>&1 > npm-ls-all.txt
```

---

## Known Issues with This Stack

1. **Next.js 15.5.6** (auto-installed by npm) differs from specified 15.0.3
2. **SWC Compiler**: Known issues with certain module formats in Next.js 15
3. **next-intl 4.4.0**: May have edge cases with Next.js 15.5+
4. **Dynamic JSON imports**: `require(...).default` pattern can cause SWC issues

---

## Prevention for Future

1. **Lock exact versions** in package.json (use exact versions, not ^)
2. **Test build after npm install** to catch version mismatches early
3. **Use Next.js LTS versions** for production (14.2.x instead of 15.x)
4. **Document all configuration** changes in separate `next.config.docs.md`

---

## If None of These Work

This would suggest a critical issue that requires:
1. Checking Next.js GitHub issues for version-specific bugs
2. Filing a bug report to Next.js team with minimal reproduction
3. Temporarily using alternative deployment: `npm run build` with `next export` fallback
4. Considering migration to different meta-framework (Remix, Astro)

---

## Quick Emergency Fix (Temporary)

If you need the app to work immediately:

```bash
npm install next@14.2.3 --save
npm run build
```

This downgrades to stable Next.js 14, which should resolve SWC-related issues. It's not a permanent fix but allows deployment.