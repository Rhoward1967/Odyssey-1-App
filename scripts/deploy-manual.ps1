Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "R.O.M.A.N AI INTELLIGENCE - MANUAL DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening Supabase SQL Editor..." -ForegroundColor Yellow
Write-Host ""

# Open Supabase SQL Editor
Start-Process "https://tvsxloejfsrdganemsmg.supabase.co/project/_/sql/new"

Write-Host "STEPS TO DEPLOY:" -ForegroundColor White
Write-Host ""
Write-Host "1. Copy contents of:" -ForegroundColor Green
Write-Host "   supabase\migrations\20251120_add_perpetual_compliance_engine.sql"
Write-Host ""
Write-Host "2. Paste into SQL Editor and click RUN" -ForegroundColor Green
Write-Host ""
Write-Host "3. Create NEW query and copy contents of:" -ForegroundColor Green
Write-Host "   supabase\migrations\20251120_add_roman_ai_intelligence.sql"
Write-Host ""
Write-Host "4. Paste and click RUN" -ForegroundColor Green
Write-Host ""
Write-Host "5. Test with: npx tsx test-ai-intelligence.ts" -ForegroundColor Green
Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Full guide: AI_INTELLIGENCE_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
