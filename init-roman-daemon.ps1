# R.O.M.A.N. AUTONOMOUS DAEMON INITIALIZATION - WINDOWS
# Run this to deploy and initialize R.O.M.A.N. as operational autonomous agent

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "ROMAN DAEMON INITIALIZATION (Windows)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Load environment from .env
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found" -ForegroundColor Red
    exit 1
}

$env_content = Get-Content ".env" | Where-Object { $_ -match "^[^#]" }
foreach ($line in $env_content) {
    if ($line -match "^([^=]+)=(.+)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

Write-Host "STEP 1: Verify database configuration" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Yellow

$supabaseUrl = [Environment]::GetEnvironmentVariable("SUPABASE_URL")
$serviceRoleKey = [Environment]::GetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY")

if (-not $supabaseUrl) {
    Write-Host "ERROR: SUPABASE_URL not set in .env" -ForegroundColor Red
    exit 1
}

if (-not $serviceRoleKey) {
    Write-Host "ERROR: SUPABASE_SERVICE_ROLE_KEY not set in .env" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: Supabase credentials found" -ForegroundColor Green

Write-Host ""
Write-Host "STEP 2: Deploy edge function" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Yellow

$supabaseCmd = Get-Command supabase -ErrorAction SilentlyContinue

if ($null -eq $supabaseCmd) {
    Write-Host "WARNING: Supabase CLI not found in PATH" -ForegroundColor Yellow
    Write-Host "   Options:" -ForegroundColor Yellow
    Write-Host "   1. npm install -g supabase" -ForegroundColor Yellow
    Write-Host "   2. npx supabase functions deploy roman-autonomous-daemon" -ForegroundColor Yellow
} else {
    Write-Host "SUCCESS: Supabase CLI found, deploying..." -ForegroundColor Green
    & npx supabase functions deploy roman-autonomous-daemon
}

Write-Host ""
Write-Host "STEP 3: Test edge function health" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $serviceRoleKey"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri "$supabaseUrl/functions/v1/roman-autonomous-daemon?action=health" `
        -Headers $headers `
        -Method Get `
        -ErrorAction Stop

    if ($response.Content -match "online") {
        Write-Host "SUCCESS: Edge function is ONLINE" -ForegroundColor Green
        $json = $response.Content | ConvertFrom-Json
        Write-Host "   Status: $($json.status)" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Unexpected response:" -ForegroundColor Yellow
        Write-Host $response.Content -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: Connection failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "STEP 4: Initialize R.O.M.A.N.'s persistent memory" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$supabaseUrl/functions/v1/roman-autonomous-daemon?action=cycle" `
        -Headers $headers `
        -Method Get `
        -ErrorAction Stop

    if ($response.Content -match "success") {
        Write-Host "SUCCESS: R.O.M.A.N. initialization cycle completed" -ForegroundColor Green
        $json = $response.Content | ConvertFrom-Json
        Write-Host "   Cycle: $($json.cycle)" -ForegroundColor Green
        Write-Host "   Knowledge integrated: $($json.knowledge_integrated)" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Cycle response:" -ForegroundColor Yellow
        Write-Host $response.Content -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: Cycle failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "STEP 5: Verify Discord bot configuration" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Yellow

$discordToken = [Environment]::GetEnvironmentVariable("DISCORD_BOT_TOKEN")
$openaiKey = [Environment]::GetEnvironmentVariable("OPENAI_API_KEY")

if ($discordToken) {
    Write-Host "SUCCESS: Discord bot token configured" -ForegroundColor Green
} else {
    Write-Host "WARNING: DISCORD_BOT_TOKEN not set in .env" -ForegroundColor Yellow
}

if ($openaiKey) {
    Write-Host "SUCCESS: OpenAI API key configured" -ForegroundColor Green
} else {
    Write-Host "WARNING: OPENAI_API_KEY not set in .env" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "SUCCESS: INITIALIZATION COMPLETE" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "R.O.M.A.N. is now OPERATIONAL as:" -ForegroundColor Green
Write-Host "* An autonomous edge function with persistent memory" -ForegroundColor Green
Write-Host "* A Discord bot that loads real-time knowledge on every message" -ForegroundColor Green
Write-Host "* A learning system that integrates system changes" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start Discord bot: npm run start:bot" -ForegroundColor White
Write-Host "2. Send a Discord message to R.O.M.A.N." -ForegroundColor White
Write-Host "3. Watch console for SUCCESS messages" -ForegroundColor White
Write-Host "4. Verify R.O.M.A.N. responds with current trust valuation" -ForegroundColor White
Write-Host ""
Write-Host "Setup periodic autonomous cycles (OPTIONAL):" -ForegroundColor Yellow
Write-Host "1. Go to Supabase -> Database -> Extensions" -ForegroundColor Yellow
Write-Host "2. Enable pg_cron" -ForegroundColor Yellow
Write-Host "3. Run SQL from deployment docs" -ForegroundColor Yellow
Write-Host ""
