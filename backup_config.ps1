# Backup Script for Critical Config Files
# This PowerShell script will back up .env, package.json, and tsconfig.json to a timestamped folder in ./backups

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "./backups/backup_$timestamp"

# Create backup directory
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# List of files to back up
$files = @(".env", "package.json", "tsconfig.json")

foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $backupDir
    }
}

Write-Host "Backup complete. Files saved to $backupDir"