#Requires -Version 5.1
param()

$projectRoot = "c:\projects\cosmatic_app_directus"
$green = 'Green'
$red = 'Red'
$yellow = 'Yellow'

Write-Host "======================================================================" -ForegroundColor $green
Write-Host "TURBOPACK CONFIGURATION VERIFICATION (Windows)" -ForegroundColor $green
Write-Host "======================================================================" -ForegroundColor $green

# 1. Check Project Root
Write-Host "`n[1/8] Checking Project Root..." -ForegroundColor $yellow
if (Test-Path $projectRoot) {
    Write-Host "[OK] Project root exists: $projectRoot" -ForegroundColor $green
} else {
    Write-Host "[FAIL] Project root NOT found: $projectRoot" -ForegroundColor $red
    exit 1
}

# 2. Check Critical Files
Write-Host "`n[2/8] Checking Critical Files..." -ForegroundColor $yellow
$criticalFiles = @("package.json", "next.config.js", "tsconfig.json", ".env.local")
foreach ($file in $criticalFiles) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        Write-Host "[OK] $file exists" -ForegroundColor $green
    } else {
        Write-Host "[FAIL] $file NOT found" -ForegroundColor $red
    }
}

# 3. Check Directories
Write-Host "`n[3/8] Checking Directories..." -ForegroundColor $yellow
$dirs = @("src\app", "src\components", "node_modules\next")
foreach ($dir in $dirs) {
    $dirPath = Join-Path $projectRoot $dir
    if (Test-Path $dirPath) {
        Write-Host "[OK] $dir exists" -ForegroundColor $green
    } else {
        Write-Host "[FAIL] $dir NOT found" -ForegroundColor $red
    }
}

# 4. Check next.config.js Configuration
Write-Host "`n[4/8] Checking next.config.js Configuration..." -ForegroundColor $yellow
$configFile = Join-Path $projectRoot "next.config.js"
$configContent = Get-Content $configFile -Raw

if ($configContent -match "turbopack:\s*{") {
    Write-Host "[OK] Turbopack configuration found" -ForegroundColor $green
} else {
    Write-Host "[WARN] Turbopack configuration NOT found - Webpack will be used" -ForegroundColor $yellow
}

if ($configContent -match "root:\s*projectRoot") {
    Write-Host "[OK] Turbopack root is set to projectRoot" -ForegroundColor $green
} else {
    Write-Host "[WARN] Turbopack root not explicitly set" -ForegroundColor $yellow
}

# 5. Check .env.local for NODE_ENV
Write-Host "`n[5/8] Checking Environment Configuration..." -ForegroundColor $yellow
$envFile = Join-Path $projectRoot ".env.local"
$envContent = Get-Content $envFile -Raw

if ($envContent -match "^\s*NODE_ENV\s*=" -and -not ($envContent -match "^#.*NODE_ENV")) {
    Write-Host "[WARN] NODE_ENV is set in .env.local (should NOT be manually set)" -ForegroundColor $yellow
} else {
    Write-Host "[OK] NODE_ENV is not manually set in .env.local" -ForegroundColor $green
}

# 6. Check Node.js & npm
Write-Host "`n[6/8] Checking Node.js & npm..." -ForegroundColor $yellow
$nodeVersion = node --version 2>$null
$npmVersion = npm --version 2>$null

if ($nodeVersion) {
    Write-Host "[OK] Node.js: $nodeVersion" -ForegroundColor $green
} else {
    Write-Host "[FAIL] Node.js NOT found" -ForegroundColor $red
}

if ($npmVersion) {
    Write-Host "[OK] npm: $npmVersion" -ForegroundColor $green
} else {
    Write-Host "[FAIL] npm NOT found" -ForegroundColor $red
}

# 7. Check Next.js Installation
Write-Host "`n[7/8] Checking Next.js Installation..." -ForegroundColor $yellow
$nextPkgJson = Join-Path $projectRoot "node_modules\next\package.json"
if (Test-Path $nextPkgJson) {
    $nextPkg = Get-Content $nextPkgJson | ConvertFrom-Json
    Write-Host "[OK] Next.js version: $($nextPkg.version)" -ForegroundColor $green
} else {
    Write-Host "[FAIL] Next.js NOT installed in node_modules" -ForegroundColor $red
}

# 8. Check Port 3000
Write-Host "`n[8/8] Checking Port 3000 Availability..." -ForegroundColor $yellow
$portInUse = netstat -ano 2>$null | Select-String ":3000"
if ($portInUse) {
    Write-Host "[WARN] Port 3000 is already in use" -ForegroundColor $yellow
    Write-Host "Process info: $portInUse" -ForegroundColor $yellow
} else {
    Write-Host "[OK] Port 3000 is available" -ForegroundColor $green
}

# Summary
Write-Host "`n======================================================================" -ForegroundColor $green
Write-Host "NEXT STEPS" -ForegroundColor $green
Write-Host "======================================================================" -ForegroundColor $green

Write-Host "`n1. CLEAR CACHE:" -ForegroundColor $yellow
Write-Host "   Remove-Item -Path `"c:\projects\cosmatic_app_directus\.next`" -Recurse -Force -ErrorAction SilentlyContinue" -ForegroundColor Cyan

Write-Host "`n2. START DEV SERVER:" -ForegroundColor $yellow
Write-Host "   Set-Location `"c:\projects\cosmatic_app_directus`"" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan

Write-Host "`n3. ACCESS APPLICATION:" -ForegroundColor $yellow
Write-Host "   http://localhost:3000" -ForegroundColor Cyan

Write-Host "`n======================================================================" -ForegroundColor $green