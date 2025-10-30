# Windows Turbopack Configuration Fix

This guide provides solutions for Turbopack issues on Windows 11.

---

## **Issue**
```
Error: Next.js inferred your workspace root, but it may not be correct.
We couldn't find the Next.js package (next/package.json) from the project directory: 
C:\projects\cosmatic_app_directus\src\app
```

---

## **Root Cause**
Turbopack was incorrectly inferring the workspace root as `src/app` instead of the project root directory.

---

## **Solution 1: Enable Turbopack (RECOMMENDED) ✅**

### Configuration Applied
✓ `next.config.js` updated with explicit `turbopack.root`
✓ `.env.local` cleaned (NODE_ENV removed)
✓ Windows path resolution configured

### Step-by-Step Fix

#### 1. **Verify next.config.js**
```powershell
Get-Content "c:\projects\cosmatic_app_directus\next.config.js" | Select-String "turbopack"
```
Expected output:
```
turbopack: {
    root: projectRoot,
    resolveAlias: {
```

#### 2. **Verify Environment Files**
```powershell
# Check .env.local - should NOT have NODE_ENV
Get-Content "c:\projects\cosmatic_app_directus\.env.local" | findstr "NODE_ENV"
# Should return nothing or a comment

# Check .env.development - should NOT have NODE_ENV
Get-Content "c:\projects\cosmatic_app_directus\.env.development" | findstr "NODE_ENV"
# Should return nothing or a comment
```

#### 3. **Clear Build Cache**
```powershell
# Remove .next build folder
Remove-Item -Path "c:\projects\cosmatic_app_directus\.next" -Recurse -Force -ErrorAction SilentlyContinue

# Remove turbopack cache
Remove-Item -Path "c:\projects\cosmatic_app_directus\.turbopack" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Cache cleared successfully"
```

#### 4. **Verify Project Structure**
```powershell
# Check node_modules exists in project root
Test-Path "c:\projects\cosmatic_app_directus\node_modules"
# Should return: True

# Check next package
Test-Path "c:\projects\cosmatic_app_directus\node_modules\next\package.json"
# Should return: True

# Check project files
Get-ChildItem "c:\projects\cosmatic_app_directus" -Name | Select-Object -First 15
```

#### 5. **Start Development Server**
```powershell
Set-Location "c:\projects\cosmatic_app_directus"
npm run dev
```

Expected output:
```
⚡ Next.js 16.0.1 (Turbopack)
   - Local:        http://localhost:3000
   - Network:      http://192.168.0.162:3000
✓ Ready in 2.5s
```

---

## **Solution 2: Disable Turbopack & Use Webpack (ALTERNATIVE)**

If you still encounter Turbopack issues, disable it and use webpack instead.

### Apply This Configuration

Create/update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const path = require('path');

const projectRoot = path.resolve(__dirname);

const nextConfig = {
    // Disable Turbopack - use webpack instead
    experimental: {
        turbopack: false,  // Explicitly disable Turbopack
    },

    // Webpack configuration
    webpack: (config, { isServer }) => {
        if (!config.resolve.alias) {
            config.resolve.alias = {};
        }
        config.resolve.alias['@'] = path.join(projectRoot, 'src');
        return config;
    },

    reactStrictMode: true,
    swcMinify: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'admin.buyjan.com',
            },
        ],
        unoptimized: process.env.NODE_ENV === 'development',
    },
};

module.exports = nextConfig;
```

### Test Webpack Build
```powershell
Set-Location "c:\projects\cosmatic_app_directus"

# Clear cache
Remove-Item -Path ".\.next" -Recurse -Force -ErrorAction SilentlyContinue

# Start dev server (will use webpack)
npm run dev
```

---

## **Solution 3: Environment Variable Override (QUICK FIX)**

If you need to quickly test, set environment variables:

```powershell
$env:NEXT_PRIVATE_TURBOPACK_ROOT = "c:\projects\cosmatic_app_directus"
$env:TURBO_ROOT = "c:\projects\cosmatic_app_directus"

Set-Location "c:\projects\cosmatic_app_directus"
Remove-Item -Path ".\.next" -Recurse -Force -ErrorAction SilentlyContinue

npm run dev
```

---

## **Verification Commands (Windows PowerShell)**

### Check Node.js Installation
```powershell
node --version
npm --version
```
Required: Node 18.x+ and npm 8.x+

### Check Next.js Installation
```powershell
npm list next
# Should show: cosmatic-app-oman@0.1.0 → next@16.0.1
```

### Check Project Structure
```powershell
$projectRoot = "c:\projects\cosmatic_app_directus"

# Verify key files exist
@(
    "package.json",
    "next.config.js",
    "tsconfig.json",
    "src\app",
    "node_modules\next"
) | ForEach-Object {
    $path = Join-Path $projectRoot $_
    $exists = Test-Path $path
    Write-Host "$_`: $exists" -ForegroundColor $(if ($exists) { 'Green' } else { 'Red' })
}
```

### Check Port 3000
```powershell
# Check if port 3000 is in use
netstat -ano | findstr ":3000"

# Kill process on port 3000 if needed (replace PID with actual process ID)
Stop-Process -Id <PID> -Force
```

### View Build Logs
```powershell
# View recent server output
Get-Content "c:\projects\cosmatic_app_directus\server.log" -Tail 50
```

---

## **Troubleshooting Checklist**

- [ ] NODE_ENV not set in `.env.local` or `.env.development`
- [ ] `.next` folder deleted
- [ ] `.turbopack` folder deleted
- [ ] `node_modules` exists in project root
- [ ] `next.config.js` has `turbopack.root` set to `__dirname`
- [ ] Running `npm install` completed successfully
- [ ] Port 3000 is not already in use
- [ ] Running from project root: `c:\projects\cosmatic_app_directus`

---

## **If Still Failing**

### Option A: Force Webpack
Use Solution 2 above to disable Turbopack completely.

### Option B: Reinstall Dependencies
```powershell
Set-Location "c:\projects\cosmatic_app_directus"

# Remove node_modules
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue

# Remove package-lock.json
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

# Reinstall
npm install

# Clear build cache
Remove-Item -Path ".\.next" -Recurse -Force -ErrorAction SilentlyContinue

# Test
npm run dev
```

### Option C: Update Next.js
```powershell
Set-Location "c:\projects\cosmatic_app_directus"
npm update next
npm run dev
```

---

## **Configuration Summary**

| Setting | Value | Location |
|---------|-------|----------|
| **Turbopack Root** | `c:\projects\cosmatic_app_directus` | `next.config.js` |
| **NODE_ENV** | NOT set manually | `.env.local` (auto by Next.js) |
| **Next.js Version** | 16.0.1 | `package.json` |
| **Development Port** | 3000 | `package.json` script |
| **Windows Platform** | win32 | Auto-detected |

---

## **References**

- [Next.js Turbopack Documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Troubleshooting Turbopack Issues](https://nextjs.org/docs/messages/turbopack-build-failed)