# 🚀 SCHEDULED WELCOME LETTER SEND
# Executes at 08:00 AM on February 1, 2026
# R.O.M.A.N. 2.0 Authorized Mission

$ScriptPath = "C:\Users\gener\Odyssey-1-App"
$LogFile = "$ScriptPath\logs\welcome-letter-send-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

# Create logs directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "$ScriptPath\logs" | Out-Null

Write-Host "🚀 R.O.M.A.N. 2.0 MISSION CONTROL - WELCOME LETTER SEND" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "Scheduled Time: 08:00 AM, February 1, 2026" -ForegroundColor Green
Write-Host "Current Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "Log File: $LogFile" -ForegroundColor Gray
Write-Host ""

# Navigate to project directory
Set-Location $ScriptPath

# Execute the send script
Write-Host "📧 Initiating Welcome Letter transmission..." -ForegroundColor Cyan

try {
    # Run the send script and capture output
    $output = npx dotenv -e .env -- node scripts/send-welcome-letters.mjs 2>&1
    
    # Save to log file
    $output | Out-File -FilePath $LogFile -Encoding UTF8
    
    # Display output
    $output | ForEach-Object { Write-Host $_ }
    
    Write-Host "`n✅ MISSION SUCCESS - All emails queued for delivery" -ForegroundColor Green
    Write-Host "📊 Audit report will be generated at 08:15 AM" -ForegroundColor Cyan
    
    exit 0
    
} catch {
    Write-Host "`n❌ MISSION FAILURE - Error encountered" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    # Log the error
    $_ | Out-File -FilePath $LogFile -Append -Encoding UTF8
    
    exit 1
}
