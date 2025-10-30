# Windows Turbopack Configuration - Quick Reference Guide

## **Project Details**
- **Project Root**: `c:\projects\cosmatic_app_directus`
- **Next.js Version**: 16.0.1 (Turbopack enabled)
- **Node.js Required**: 18.x+ (Currently: v22.19.0)
- **npm Required**: 8.x+ (Currently: 11.5.2)
- **Platform**: Windows 11 PowerShell

---

## **✅ Configuration Status**

| Check | Status | Details |
|-------|--------|---------|
| **Turbopack Root** | ✓ | Set to `c:\projects\cosmatic_app_directus` |
| **NODE_ENV in .env** | ✓ | Removed (auto-set by Next.js) |
| **Next.js Package** | ✓ | Found in `node_modules\next` |
| **Project Structure** | ✓ | All directories verified |
| **Environment Files** | ✓ | `.env.local` and `.env.development` configured |
| **Port 3000** | ✓ | Available and ready |

---

## **🚀 Quick Start (Recommended)**

### **Option 1: Using Clean PowerShell Script**
```powershell
powershell -ExecutionPolicy Bypass -File "c:\projects\cosmatic_app_directus\start-clean.ps1" -ClearCache
```

### **Option 2: Manual Steps (Step-by-Step)**

```powershell
# Step 1: Navigate to project
Set-Location "c:\projects\cosmatic_app_directus"

# Step 2: Clear build cache
Remove-Item -Path ".\.next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\.turbopack" -Recurse -Force -ErrorAction SilentlyContinue

# Step 3: Clear NODE_ENV override
$env:NODE_ENV = $null

# Step 4: Start dev server
npm run dev
```

### **Option 3: Direct npm Command**
```powershell
Set-Location "c:\projects\cosmatic_app_directus"; $env:NODE_ENV = $null; npm run dev
```

---

## **📋 Verification Commands**

### **Check Configuration**
```powershell
# Run verification script
powershell -ExecutionPolicy Bypass -File "c:\projects\cosmatic_app_directus\verify-turbopack.ps1"
```

### **Check Project Structure**
```powershell
$root = "c:\projects\cosmatic_app_directus"

# Verify key files
@("package.json", "next.config.js", ".env.local", "tsconfig.json") | 
    ForEach-Object { Write-Host "$_`: $(Test-Path (Join-Path $root $_))" }

# Verify key directories
@("src\app", "src\components", "node_modules\next") | 
    ForEach-Object { Write-Host "$_`: $(Test-Path (Join-Path $root $_))" }
```

### **Check Node.js/npm**
```powershell
node --version   # Should be 18.x+
npm --version    # Should be 8.x+
npm list next    # Should show next@16.0.1
```

### **Check Port 3000**
```powershell
# Check if port is in use
netstat -ano | findstr ":3000"

# Kill process on port 3000 if needed (replace XXXX with actual PID)
Stop-Process -Id XXXX -Force
```

---

## **🔧 Configuration Files**

### **next.config.js** (Turbopack Configuration)
```javascript
turbopack: {
    root: projectRoot,  // c:\projects\cosmatic_app_directus
    resolveAlias: {
        '@': path.join(projectRoot, 'src'),
    },
},
```

### **.env.local** (Environment Variables)
```
NEXT_PUBLIC_DIRECTUS_URL=https://admin.buyjan.com
NEXT_PUBLIC_SITE_URL=https://buyjan.com
DIRECTUS_API_TOKEN=gA_XCHBw42I5BxcfLroKxWLY67GwmxL0
NEXT_PUBLIC_DIRECTUS_API_TOKEN=gA_XCHBw42I5BxcfLroKxWLY67GwmxL0

# NOTE: NODE_ENV should NOT be set here
# Next.js sets it automatically:
#   - "development" when running npm run dev
#   - "production" when running npm run build or npm start
```

---

## **⚠️ Common Issues & Solutions**

### **Issue 1: Turbopack Error - "Couldn't find Next.js package"**
```
Error: Next.js inferred your workspace root, but it may not be correct.
We couldn't find the Next.js package (next/package.json) from the project directory
```

**Solution:**
- ✓ Configuration already applied to `next.config.js`
- Clear cache: `Remove-Item -Path ".\.next" -Recurse -Force -ErrorAction SilentlyContinue`
- Restart dev server: `npm run dev`

### **Issue 2: NODE_ENV Warning**
```
You are using a non-standard "NODE_ENV" value in your environment.
```

**Solution:**
- Remove NODE_ENV from system environment or `.env` files
- Use clean PowerShell script: `powershell -ExecutionPolicy Bypass -File "start-clean.ps1"`
- Or clear temporarily: `$env:NODE_ENV = $null; npm run dev`

### **Issue 3: Port 3000 Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```powershell
# Find process using port 3000
netstat -ano | findstr ":3000"

# Stop the process (replace XXXX with PID from output)
Stop-Process -Id XXXX -Force

# Retry dev server
npm run dev
```

### **Issue 4: node_modules Not Found**
```
Error: Cannot find module...
```

**Solution:**
```powershell
Set-Location "c:\projects\cosmatic_app_directus"
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
npm install
npm run dev
```

---

## **🛠️ Advanced Troubleshooting**

### **Force Rebuild**
```powershell
# Complete clean rebuild
Remove-Item -Path ".\.next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

npm install
npm run dev
```

### **View Build Logs**
```powershell
# View last 50 lines of server log
Get-Content "c:\projects\cosmatic_app_directus\server-final-test.log" -Tail 50

# Full log file
Get-Content "c:\projects\cosmatic_app_directus\server-final-test.log"
```

### **Debug Environment**
```powershell
# Check all environment variables
Get-ChildItem env: | Where-Object { $_.Name -like "*NODE*" -or $_.Name -like "*NEXT*" }

# Check specific variables
$env:NODE_ENV
$env:NEXT_PUBLIC_DIRECTUS_URL
```

---

## **📦 Reinstall Dependencies**

If issues persist, reinstall all dependencies:

```powershell
Set-Location "c:\projects\cosmatic_app_directus"

# Step 1: Remove old installations
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

# Step 2: Clear npm cache
npm cache clean --force

# Step 3: Reinstall
npm install

# Step 4: Clear Next.js cache
Remove-Item -Path ".\.next" -Recurse -Force -ErrorAction SilentlyContinue

# Step 5: Test
npm run dev
```

---

## **✅ Expected Output on Successful Start**

When the dev server starts correctly, you should see:

```
⚡ Next.js 16.0.1 (Turbopack)
   - Local:        http://localhost:3000
   - Network:      http://192.168.0.162:3000
   - Environments: .env.local, .env.development
✓ Ready in X.Xs
```

**OR** (if using Webpack):

```
▲ Next.js 16.0.1
   - Local:        http://localhost:3000
   - Network:      http://192.168.0.162:3000
✓ Ready in X.Xs
```

Then access: **http://localhost:3000**

---

## **📝 File Locations**

| File | Path | Purpose |
|------|------|---------|
| **next.config.js** | `c:\projects\cosmatic_app_directus\next.config.js` | Turbopack & webpack config |
| **.env.local** | `c:\projects\cosmatic_app_directus\.env.local` | Environment variables |
| **.env.development** | `c:\projects\cosmatic_app_directus\.env.development` | Dev-specific variables |
| **package.json** | `c:\projects\cosmatic_app_directus\package.json` | Dependencies & scripts |
| **verify-turbopack.ps1** | `c:\projects\cosmatic_app_directus\verify-turbopack.ps1` | Verification script |
| **start-clean.ps1** | `c:\projects\cosmatic_app_directus\start-clean.ps1` | Clean start script |

---

## **🎯 Next Steps**

1. **Run the verification script:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File "verify-turbopack.ps1"
   ```

2. **Start the dev server:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File "start-clean.ps1" -ClearCache
   ```

3. **Access the application:**
   ```
   http://localhost:3000
   ```

4. **Stop the server:**
   ```
   Press Ctrl+C in the PowerShell window
   ```

---

## **📚 References**

- [Next.js Turbopack Root Configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Next.js Windows Issues](https://github.com/vercel/next.js/discussions/turbopack-windows)
- [NODE_ENV Configuration](https://nextjs.org/docs/basic-features/environment-variables#system-environment-variables)

---

**Last Updated**: Windows 11 | PowerShell 7.x | Next.js 16.0.1