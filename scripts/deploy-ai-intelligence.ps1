# ============================================================================
# DEPLOY AI INTELLIGENCE SYSTEM
# ============================================================================
# Deploys both Perpetual Compliance Engine and AI Technology Intelligence
# ============================================================================

Write-Host "🚀 Deploying R.O.M.A.N AI Intelligence System..." -ForegroundColor Cyan
Write-Host ""

# Load environment variables
$envPath = Join-Path $PSScriptRoot ".env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

$SUPABASE_URL = $env:VITE_SUPABASE_URL
$SERVICE_ROLE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SUPABASE_URL -or -not $SERVICE_ROLE_KEY) {
    Write-Host "❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env" -ForegroundColor Red
    exit 1
}

Write-Host "📊 Supabase Project: $SUPABASE_URL" -ForegroundColor Green
Write-Host ""

# Check if psql is available
$psqlAvailable = Get-Command psql -ErrorAction SilentlyContinue

if ($psqlAvailable) {
    Write-Host "✅ PostgreSQL client found" -ForegroundColor Green
    Write-Host ""
    
    # Extract project ref from URL
    if ($SUPABASE_URL -match 'https://([^.]+)\.supabase\.co') {
        $projectRef = $matches[1]
        $dbHost = "db.$projectRef.supabase.co"
        
        Write-Host "📡 Connecting to: $dbHost" -ForegroundColor Cyan
        Write-Host ""
        
        # Set password for psql
        $env:PGPASSWORD = $SERVICE_ROLE_KEY
        
        # Deploy Perpetual Compliance Engine
        Write-Host "1️⃣ Deploying Perpetual Compliance Engine..." -ForegroundColor Yellow
        $migration1 = "supabase\migrations\20251120_add_perpetual_compliance_engine.sql"
        
        if (Test-Path $migration1) {
            psql -h $dbHost -p 5432 -U postgres -d postgres -f $migration1
            Write-Host "   ✅ Migration 1 executed" -ForegroundColor Green
        } else {
            Write-Host "   ❌ File not found: $migration1" -ForegroundColor Red
        }
        
        Write-Host ""
        
        # Deploy AI Technology Intelligence
        Write-Host "2️⃣ Deploying AI Technology Intelligence..." -ForegroundColor Yellow
        $migration2 = "supabase\migrations\20251120_add_roman_ai_intelligence.sql"
        
        if (Test-Path $migration2) {
            psql -h $dbHost -p 5432 -U postgres -d postgres -f $migration2
            Write-Host "   ✅ Migration 2 executed" -ForegroundColor Green
        } else {
            Write-Host "   ❌ File not found: $migration2" -ForegroundColor Red
        }
        
        # Clear password
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
        
        Write-Host ""
        Write-Host "============================================================================" -ForegroundColor Cyan
        Write-Host "✅ DEPLOYMENT COMPLETE" -ForegroundColor Green
        Write-Host "============================================================================" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️ PostgreSQL client not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual deployment required:" -ForegroundColor Cyan
    Write-Host "1. Go to Supabase SQL Editor: $SUPABASE_URL/project/_/sql" -ForegroundColor White
    Write-Host "2. Run: supabase\migrations\20251120_add_perpetual_compliance_engine.sql" -ForegroundColor White
    Write-Host "3. Run: supabase\migrations\20251120_add_roman_ai_intelligence.sql" -ForegroundColor White
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Verify tables in Supabase Dashboard" -ForegroundColor Gray
Write-Host "2. Test AI Intelligence System" -ForegroundColor Gray
Write-Host "3. View AIIntelligenceDashboard" -ForegroundColor Gray
Write-Host ""
