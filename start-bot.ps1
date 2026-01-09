# ODYSSEY-1 Discord Bot Starter (No npm required)
# Works even with F: drive disconnected

Write-Host "Starting ODYSSEY-1 Discord Bot..." -ForegroundColor Cyan

# Load .env file
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "Environment variables loaded from .env" -ForegroundColor Green
} else {
    Write-Host "Warning: .env file not found" -ForegroundColor Yellow
}

# Start the bot
& node .\node_modules\tsx\dist\cli.mjs src/start-bot.ts
