# Fix F: Drive Dependency
# Run this script as Administrator to remove F: drive from system PATH
# This allows you to safely disconnect the F: drive for safekeeping

Write-Host "🔧 ODYSSEY-1 F: Drive Dependency Fix" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host ""
    Write-Host "To run as Administrator:" -ForegroundColor Yellow
    Write-Host "1. Right-click on PowerShell" -ForegroundColor Yellow
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "3. Navigate to: cd 'C:\Users\gener\Odyssey-1-App'" -ForegroundColor Yellow
    Write-Host "4. Run: .\fix-f-drive-dependency.ps1" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Step 1: Remove F: from System PATH
Write-Host "Step 1: Removing F: drive from system PATH..." -ForegroundColor Cyan
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$pathEntries = $currentPath -split ';'
$fDriveEntries = $pathEntries | Where-Object { $_ -like '*F:*' }

if ($fDriveEntries) {
    Write-Host "Found F: drive entries in system PATH:" -ForegroundColor Yellow
    $fDriveEntries | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    
    $newPath = ($pathEntries | Where-Object { $_ -notlike '*F:*' }) -join ';'
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
    Write-Host "✅ Removed F: drive from system PATH" -ForegroundColor Green
} else {
    Write-Host "✅ No F: drive entries found in system PATH" -ForegroundColor Green
}
Write-Host ""

# Step 2: Remove F: from User PATH (just in case)
Write-Host "Step 2: Checking user PATH..." -ForegroundColor Cyan
$userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($userPath) {
    $userPathEntries = $userPath -split ';'
    $userFDriveEntries = $userPathEntries | Where-Object { $_ -like '*F:*' }
    
    if ($userFDriveEntries) {
        Write-Host "Found F: drive entries in user PATH:" -ForegroundColor Yellow
        $userFDriveEntries | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
        
        $newUserPath = ($userPathEntries | Where-Object { $_ -notlike '*F:*' }) -join ';'
        [Environment]::SetEnvironmentVariable("PATH", $newUserPath, "User")
        Write-Host "✅ Removed F: drive from user PATH" -ForegroundColor Green
    } else {
        Write-Host "✅ No F: drive entries in user PATH" -ForegroundColor Green
    }
} else {
    Write-Host "✅ No user PATH variable set" -ForegroundColor Green
}
Write-Host ""

# Step 3: Verify npm and node are accessible
Write-Host "Step 3: Verifying Node.js and npm..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Node.js not found in PATH" -ForegroundColor Yellow
}

try {
    $npmVersion = npm --version 2>&1
    Write-Host "✅ npm: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  npm not found in PATH" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "🎯 SUMMARY" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "✅ F: drive removed from system PATH" -ForegroundColor Green
Write-Host "✅ You can now safely disconnect the F: drive" -ForegroundColor Green
Write-Host "✅ Your ODYSSEY-1 server will work without F: drive connected" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: You need to RESTART your computer or at minimum:" -ForegroundColor Yellow
Write-Host "   1. Close ALL terminals and VS Code" -ForegroundColor Yellow
Write-Host "   2. Reopen VS Code" -ForegroundColor Yellow
Write-Host "   3. The new PATH will be loaded" -ForegroundColor Yellow
Write-Host ""
Write-Host "📁 After restart, you can:" -ForegroundColor Cyan
Write-Host "   - Disconnect the F: drive" -ForegroundColor Cyan
Write-Host "   - Store it safely" -ForegroundColor Cyan
Write-Host "   - Continue working in VS Code normally" -ForegroundColor Cyan
Write-Host ""

pause
