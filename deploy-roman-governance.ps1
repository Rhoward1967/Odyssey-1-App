# ============================================================================
# R.O.M.A.N. GOVERNANCE DEPLOYMENT HELPER
# ============================================================================

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🤖 R.O.M.A.N. GOVERNANCE DEPLOYMENT" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "📋 STEP 1: Deploy app_admins table (Pre-requisite)" -ForegroundColor Yellow
Write-Host "   File: 20251219_create_app_admins_table.sql`n" -ForegroundColor White

Get-Content "supabase\migrations\20251219_create_app_admins_table.sql" | Set-Clipboard
Write-Host "✅ Copied to clipboard! Paste into Supabase SQL Editor and RUN.`n" -ForegroundColor Green

Read-Host "Press ENTER after Step 1 completes successfully"

Write-Host "`n📋 STEP 2: Deploy governance monitoring" -ForegroundColor Yellow
Write-Host "   File: 20251219_roman_governance_monitoring.sql`n" -ForegroundColor White

Get-Content "supabase\migrations\20251219_roman_governance_monitoring.sql" | Set-Clipboard
Write-Host "✅ Copied to clipboard! Paste into Supabase SQL Editor and RUN.`n" -ForegroundColor Green

Read-Host "Press ENTER after Step 2 completes successfully"

Write-Host "`n📋 STEP 3: Verify deployment" -ForegroundColor Yellow
Write-Host "   Running: node verify-roman-governance.mjs`n" -ForegroundColor White

node verify-roman-governance.mjs

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎯 R.O.M.A.N. GOVERNANCE DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
