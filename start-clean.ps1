#Requires -Version 5.1
<#
.SYNOPSIS
    Start dev server with clean environment (removes NODE_ENV override)
.DESCRIPTION
    Clears NODE_ENV from PowerShell environment and starts Next.js dev server
#>

param(
    [switch]$ClearCache
)

$projectRoot = "c:\projects\cosmatic_app_directus"

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           START DEV SERVER (Clean Environment)                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green

# Clear system NODE_ENV if set
if ($env:NODE_ENV) {
    Write-Host "`n[*] Clearing NODE_ENV from environment..." -ForegroundColor Yellow
    $env:NODE_ENV = $null
    Write-Host "    NODE_ENV cleared" -ForegroundColor Green
}

# Clear cache if requested
if ($ClearCache) {
    Write-Host "`n[*] Clearing build cache..." -ForegroundColor Yellow
    Set-Location $projectRoot
    Remove-Item -Path ".\.next" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path ".\.turbopack" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "    Cache cleared" -ForegroundColor Green
}

# Display configuration
Write-Host "`n[Configuration]" -ForegroundColor Cyan
Write-Host "  Project Root: $projectRoot" -ForegroundColor White
Write-Host "  Port: 3000" -ForegroundColor White
Write-Host "  URL: http://localhost:3000" -ForegroundColor White
Write-Host "  NODE_ENV: Not set (auto-set by Next.js)" -ForegroundColor Green

# Start server
Write-Host "`n[*] Starting dev server..." -ForegroundColor Yellow
Write-Host "    Press Ctrl+C to stop`n" -ForegroundColor Yellow

Set-Location $projectRoot
npm run dev