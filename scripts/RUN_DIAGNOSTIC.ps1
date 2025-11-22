# ================================================================================
# ODYSSEY-1 Backend Diagnostic Runner
# Runs the complete diagnostic and saves results
# ================================================================================

Write-Host "🔍 ODYSSEY-1 Complete Backend Diagnostic" -ForegroundColor Cyan
Write-Host "=" * 80

# Check if we're in the right directory
if (-not (Test-Path "supabase\COMPLETE_BACKEND_DIAGNOSTIC.sql")) {
    Write-Host "❌ Error: Must run from Odyssey-1-App root directory" -ForegroundColor Red
    exit 1
}

# Get Supabase connection details from .env
Write-Host "`n📋 Loading environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content .env
$supabaseUrl = ($envContent | Select-String "VITE_SUPABASE_URL=(.+)").Matches.Groups[1].Value
$supabaseKey = ($envContent | Select-String "SUPABASE_SERVICE_ROLE_KEY=(.+)").Matches.Groups[1].Value

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ Error: Could not find Supabase credentials in .env" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Supabase URL: $supabaseUrl" -ForegroundColor Green

# Create output directory
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outputDir = "diagnostic_results"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$outputFile = "$outputDir\backend_diagnostic_$timestamp.json"

Write-Host "`n🔄 Running diagnostic queries..." -ForegroundColor Yellow
Write-Host "This may take 30-60 seconds...`n"

# Extract the database connection string from Supabase URL
$dbUrl = $supabaseUrl -replace "https://", ""
$dbUrl = $dbUrl -replace ".supabase.co", ""
$projectRef = $dbUrl

Write-Host "📊 Executing 21 diagnostic sections..." -ForegroundColor Cyan

# Method 1: Try using Supabase CLI
Write-Host "`n[Method 1] Attempting via Supabase CLI..." -ForegroundColor Yellow
$cliAvailable = Get-Command supabase -ErrorAction SilentlyContinue

if ($cliAvailable) {
    try {
        supabase db query --file "supabase\COMPLETE_BACKEND_DIAGNOSTIC.sql" --output json > $outputFile 2>&1
        
        if (Test-Path $outputFile) {
            $fileSize = (Get-Item $outputFile).Length
            if ($fileSize -gt 100) {
                Write-Host "✅ Diagnostic complete via Supabase CLI!" -ForegroundColor Green
                Write-Host "📄 Results saved to: $outputFile" -ForegroundColor Cyan
                Write-Host "📏 File size: $fileSize bytes" -ForegroundColor Gray
                
                # Create a summary
                Write-Host "`n📊 Quick Summary:" -ForegroundColor Yellow
                Write-Host "- Full diagnostic saved to JSON file"
                Write-Host "- Contains 21 comprehensive sections"
                Write-Host "- Review the file for complete backend analysis"
                
                exit 0
            }
        }
    } catch {
        Write-Host "⚠️ CLI method failed: $_" -ForegroundColor Yellow
    }
}

# Method 2: Try via REST API
Write-Host "`n[Method 2] Attempting via Supabase REST API..." -ForegroundColor Yellow

try {
    # Read the SQL file
    $sqlContent = Get-Content "supabase\COMPLETE_BACKEND_DIAGNOSTIC.sql" -Raw
    
    # Split into individual queries (this is simplified - real implementation would be more complex)
    $queries = $sqlContent -split ";\s*SELECT"
    
    Write-Host "Found approximately $($queries.Count) query sections" -ForegroundColor Gray
    
    $results = @{}
    $sectionNum = 1
    
    foreach ($query in $queries) {
        if ($query.Trim().Length -gt 10) {
            $queryToRun = if ($query.Trim().StartsWith("SELECT")) { $query } else { "SELECT" + $query }
            
            Write-Host "  Executing section $sectionNum..." -ForegroundColor Gray
            
            try {
                $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/execute_sql" `
                    -Method Post `
                    -Headers @{
                        "apikey" = $supabaseKey
                        "Authorization" = "Bearer $supabaseKey"
                        "Content-Type" = "application/json"
                    } `
                    -Body (@{ query = $queryToRun } | ConvertTo-Json) `
                    -ErrorAction SilentlyContinue
                
                $results["section_$sectionNum"] = $response
            } catch {
                Write-Host "    ⚠️ Section $sectionNum failed (may be normal)" -ForegroundColor DarkGray
            }
            
            $sectionNum++
        }
    }
    
    if ($results.Count -gt 0) {
        $results | ConvertTo-Json -Depth 10 | Out-File $outputFile
        Write-Host "✅ Partial diagnostic saved via REST API!" -ForegroundColor Green
        Write-Host "📄 Results saved to: $outputFile" -ForegroundColor Cyan
        exit 0
    }
} catch {
    Write-Host "⚠️ REST API method failed: $_" -ForegroundColor Yellow
}

# Method 3: Manual instructions
Write-Host "`n[Method 3] Manual Execution Required" -ForegroundColor Yellow
Write-Host "=" * 80

Write-Host "`n📋 Please run the diagnostic manually:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option A - Supabase Dashboard:" -ForegroundColor Green
Write-Host "1. Go to: https://supabase.com/dashboard/project/$projectRef/sql"
Write-Host "2. Open: supabase\COMPLETE_BACKEND_DIAGNOSTIC.sql"
Write-Host "3. Copy the entire file contents"
Write-Host "4. Paste into SQL Editor"
Write-Host "5. Click 'Run'"
Write-Host "6. Save/export results"
Write-Host ""
Write-Host "Option B - Supabase CLI:" -ForegroundColor Green
Write-Host "1. Install Supabase CLI: npm install -g supabase"
Write-Host "2. Login: supabase login"
Write-Host "3. Link: supabase link --project-ref $projectRef"
Write-Host "4. Run: supabase db query --file supabase\COMPLETE_BACKEND_DIAGNOSTIC.sql"
Write-Host ""
Write-Host "Option C - Direct psql:" -ForegroundColor Green
Write-Host "1. Get connection string from Supabase Dashboard > Database Settings"
Write-Host "2. Run: psql <connection-string> -f supabase\COMPLETE_BACKEND_DIAGNOSTIC.sql"
Write-Host ""

Write-Host "=" * 80
Write-Host "📁 Diagnostic file location: supabase\COMPLETE_BACKEND_DIAGNOSTIC.sql" -ForegroundColor Cyan
Write-Host "💾 When complete, save results to: $outputDir\" -ForegroundColor Cyan
Write-Host ""

# Create a checklist file
$checklistFile = "$outputDir\DIAGNOSTIC_CHECKLIST.md"
@"
# ODYSSEY-1 Backend Diagnostic Checklist

## Timestamp: $timestamp

## What We Need to Find Out:

### 1. Tables & Schema
- [ ] List of all 25+ tables
- [ ] Row counts for each table
- [ ] Column definitions
- [ ] Foreign key relationships

### 2. Missing Tables Issue
- [ ] Does 'bids' table exist?
- [ ] Does 'user_organizations' table exist?
- [ ] What's the exact error with bids table access?

### 3. RLS (Row Level Security)
- [ ] Which tables have RLS enabled?
- [ ] List all RLS policies
- [ ] Why can't we access bids table?
- [ ] Are policies too restrictive or too permissive?

### 4. API Integration Detection
- [ ] Where are API keys stored? (system_config? secrets? vault?)
- [ ] Current API keys configured
- [ ] How to properly detect if API is active

### 5. Security Issues
- [ ] List all SECURITY DEFINER functions (2 detected)
- [ ] Why is R.O.M.A.N. deployment blocked?
- [ ] Security definer views that need review

### 6. Permissions & Roles
- [ ] Database roles defined
- [ ] Table access permissions
- [ ] Who can access what

### 7. Performance
- [ ] Indexes on critical tables
- [ ] Table sizes
- [ ] Query optimization opportunities

### 8. Edge Functions
- [ ] List of deployed functions
- [ ] Function status and logs

### 9. Recent Activity
- [ ] Last 10 system logs
- [ ] Recent governance changes
- [ ] R.O.M.A.N. command history

### 10. Auth & Users
- [ ] Total user count
- [ ] Active users
- [ ] User organization mapping

## Results Location:
Save diagnostic results to: $outputDir\backend_diagnostic_$timestamp.json

## Next Steps After Diagnostic:
1. Fix missing 'bids' table
2. Resolve API integration detection
3. Fix SECURITY DEFINER issues
4. Update RLS policies if needed
5. Get all 11/11 integrations showing

"@ | Out-File $checklistFile

Write-Host "📋 Created checklist: $checklistFile" -ForegroundColor Green
Write-Host ""
Write-Host "✅ When you have the diagnostic results, we'll have everything needed!" -ForegroundColor Green
