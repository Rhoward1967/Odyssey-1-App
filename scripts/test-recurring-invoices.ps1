# TEST RECURRING INVOICE GENERATOR
# Run this manually to verify the system works before Feb 1, 2026

Write-Host "🧪 Testing Recurring Invoice Generator..." -ForegroundColor Cyan

# Get project details from .env
$envPath = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^VITE_SUPABASE_URL=(.+)$') {
            $projectUrl = $matches[1]
        }
        if ($_ -match '^SUPABASE_SERVICE_ROLE_KEY=(.+)$') {
            $serviceKey = $matches[1]
        }
    }
}

if (-not $projectUrl -or -not $serviceKey) {
    Write-Host "❌ Missing credentials in .env file" -ForegroundColor Red
    Write-Host "   Need: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "📡 Project URL: $projectUrl" -ForegroundColor Gray
Write-Host "🔑 Service key: " -NoNewline -ForegroundColor Gray
Write-Host ($serviceKey.Substring(0, 20) + "...") -ForegroundColor DarkGray

# Test the Edge Function
Write-Host "`n⚡ Calling recurring-invoice-generator..." -ForegroundColor Cyan

$url = "$projectUrl/functions/v1/recurring-invoice-generator"
$headers = @{
    "Authorization" = "Bearer $serviceKey"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Method POST -Uri $url -Headers $headers
    Write-Host "`n✅ Function responded successfully!" -ForegroundColor Green
    Write-Host "`n📊 Results:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
    
    if ($response.processed -eq 0) {
        Write-Host "`n✨ Perfect! No invoices due yet (expected before Feb 1)" -ForegroundColor Green
    }
    else {
        Write-Host "`n⚠️  Generated $($response.generated) invoices" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "`n❌ Function call failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "`n🔍 Debug info:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Gray
    }
    exit 1
}

Write-Host "`n✅ Test complete!" -ForegroundColor Green
