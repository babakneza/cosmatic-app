#Requires -Version 5.1
<#
.SYNOPSIS
    Quick fix and start dev server
.DESCRIPTION
    Clears cache, fixes configuration, and starts dev server
#>

$projectRoot = "c:\projects\cosmatic_app_directus"

Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          TURBOPACK FIX & DEV SERVER START (Windows)           ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green

# Step 1: Clear Cache
Write-Host "`n[Step 1/5] Clearing build cache..." -ForegroundColor Cyan
Set-Location $projectRoot
$nextPath = Join-Path $projectRoot ".next"
$turboPath = Join-Path $projectRoot ".turbopack"

if (Test-Path $nextPath) {
    Remove-Item $nextPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Removed .next" -ForegroundColor Green
}

if (Test-Path $turboPath) {
    Remove-Item $turboPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Removed .turbopack" -ForegroundColor Green
}

# Step 2: Verify Environment
Write-Host "`n[Step 2/5] Verifying environment..." -ForegroundColor Cyan
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "  ✓ npm: $npmVersion" -ForegroundColor Green

# Step 3: Verify next.config.js
Write-Host "`n[Step 3/5] Verifying next.config.js..." -ForegroundColor Cyan
$configFile = Join-Path $projectRoot "next.config.js"
if (Select-String -Path $configFile -Pattern "turbopack:" -Quiet) {
    Write-Host "  ✓ Turbopack configuration present" -ForegroundColor Green
}

# Step 4: Verify .env.local
Write-Host "`n[Step 4/5] Verifying .env.local..." -ForegroundColor Cyan
$envFile = Join-Path $projectRoot ".env.local"
$envHasNodeEnv = Select-String -Path $envFile -Pattern "^\s*NODE_ENV\s*=" -Quiet
if (-not $envHasNodeEnv) {
    Write-Host "  ✓ NODE_ENV not manually set (correct)" -ForegroundColor Green
} else {
    Write-Host "  ⚠ NODE_ENV is manually set (will be overridden)" -ForegroundColor Yellow
}

# Step 5: Start Dev Server
Write-Host "`n[Step 5/5] Starting dev server..." -ForegroundColor Cyan
Write-Host "  Port: 3000" -ForegroundColor Green
Write-Host "  URL: http://localhost:3000" -ForegroundColor Green
Write-Host "`n" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "`n" -ForegroundColor Green

npm run dev