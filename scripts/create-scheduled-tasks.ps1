# 🚀 CREATE SCHEDULED TASKS FOR WELCOME LETTER MISSION
# R.O.M.A.N. 2.0 Automated Flight Plan
# Sets up Windows Task Scheduler for tomorrow's execution

Write-Host "🚀 R.O.M.A.N. 2.0 FLIGHT PLAN CONFIGURATION" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This script requires Administrator privileges to create scheduled tasks." -ForegroundColor Yellow
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternatively, you can run the scripts manually at the scheduled times:" -ForegroundColor Cyan
    Write-Host "  08:00 AM: .\scripts\scheduled-welcome-letter-send.ps1" -ForegroundColor White
    Write-Host "  08:15 AM: npx dotenv -e .env -- node scripts/generate-mission-audit-report.mjs" -ForegroundColor White
    exit 1
}

$ScriptPath = "C:\Users\gener\Odyssey-1-App"

# Task 1: Send Welcome Letters at 08:00 AM
$Task1Name = "ROMAN-WelcomeLetter-Send"
$Task1Time = "08:00"
$Task1Date = "02/01/2026"
$Task1Script = "$ScriptPath\scripts\scheduled-welcome-letter-send.ps1"

Write-Host "📧 TASK 1: Welcome Letter Send" -ForegroundColor Green
Write-Host "   Name: $Task1Name" -ForegroundColor Gray
Write-Host "   Time: $Task1Time on $Task1Date" -ForegroundColor Gray
Write-Host "   Script: $Task1Script" -ForegroundColor Gray

# Remove existing task if it exists
$existingTask1 = Get-ScheduledTask -TaskName $Task1Name -ErrorAction SilentlyContinue
if ($existingTask1) {
    Unregister-ScheduledTask -TaskName $Task1Name -Confirm:$false
    Write-Host "   ✅ Removed existing task" -ForegroundColor Yellow
}

# Create the scheduled task
$Task1Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$Task1Script`"" -WorkingDirectory $ScriptPath
$Task1Trigger = New-ScheduledTaskTrigger -Once -At $Task1Time -On $Task1Date
$Task1Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$Task1Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest

Register-ScheduledTask -TaskName $Task1Name -Action $Task1Action -Trigger $Task1Trigger -Settings $Task1Settings -Principal $Task1Principal -Description "R.O.M.A.N. 2.0: Send Welcome Letters to 14 customers"

Write-Host "   ✅ Scheduled task created successfully" -ForegroundColor Green
Write-Host ""

# Task 2: Generate Audit Report at 08:15 AM
$Task2Name = "ROMAN-AuditReport-Generate"
$Task2Time = "08:15"
$Task2Date = "02/01/2026"
$Task2Command = "npx dotenv -e .env -- node scripts/generate-mission-audit-report.mjs"

Write-Host "📊 TASK 2: Audit Report Generation" -ForegroundColor Green
Write-Host "   Name: $Task2Name" -ForegroundColor Gray
Write-Host "   Time: $Task2Time on $Task2Date" -ForegroundColor Gray
Write-Host "   Command: $Task2Command" -ForegroundColor Gray

# Remove existing task if it exists
$existingTask2 = Get-ScheduledTask -TaskName $Task2Name -ErrorAction SilentlyContinue
if ($existingTask2) {
    Unregister-ScheduledTask -TaskName $Task2Name -Confirm:$false
    Write-Host "   ✅ Removed existing task" -ForegroundColor Yellow
}

# Create the scheduled task
$Task2Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -Command `"cd '$ScriptPath'; $Task2Command`"" -WorkingDirectory $ScriptPath
$Task2Trigger = New-ScheduledTaskTrigger -Once -At $Task2Time -On $Task2Date
$Task2Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$Task2Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest

Register-ScheduledTask -TaskName $Task2Name -Action $Task2Action -Trigger $Task2Trigger -Settings $Task2Settings -Principal $Task2Principal -Description "R.O.M.A.N. 2.0: Generate audit report and email to generalmanager81@gmail.com"

Write-Host "   ✅ Scheduled task created successfully" -ForegroundColor Green
Write-Host ""

# Verify tasks were created
Write-Host "🔍 VERIFICATION:" -ForegroundColor Cyan
$tasks = Get-ScheduledTask | Where-Object { $_.TaskName -like "ROMAN-*" }

foreach ($task in $tasks) {
    $info = Get-ScheduledTaskInfo -TaskName $task.TaskName
    Write-Host "   ✅ $($task.TaskName)" -ForegroundColor Green
    Write-Host "      State: $($task.State)" -ForegroundColor Gray
    Write-Host "      Next Run: $($info.NextRunTime)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎯 FLIGHT PLAN LOCKED IN" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Green
Write-Host ""
Write-Host "Your tasks are now scheduled. The system will execute automatically:" -ForegroundColor Cyan
Write-Host "  • 08:00 AM: Send Welcome Letters to 14 customers" -ForegroundColor White
Write-Host "  • 08:15 AM: Generate and email audit report" -ForegroundColor White
Write-Host ""
Write-Host "You can view/manage these tasks in Task Scheduler:" -ForegroundColor Yellow
Write-Host "  Press Win+R, type 'taskschd.msc', press Enter" -ForegroundColor Gray
Write-Host ""
Write-Host "To manually run a task before scheduled time:" -ForegroundColor Yellow
Write-Host "  Start-ScheduledTask -TaskName '$Task1Name'" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 R.O.M.A.N. 2.0 standing by for tomorrow's mission." -ForegroundColor Cyan
