@echo off
echo 🔍 ODYSSEY-1 Quick Deployment Check
echo.
echo ✅ Latest commit: 8558514 (Phase 4 + Verification Tools)
echo ⏰ Pushed at: %date% %time%
echo.
echo 🌐 Checking live site...
node check-deployment.js
echo.
echo 💡 WHAT TO CHECK IN VERCEL DASHBOARD:
echo    1. Go to: https://vercel.com/dashboard
echo    2. Find: Odyssey-1-App project
echo    3. Verify: Latest deployment is from commit 8558514
echo    4. Status: Should show "Ready" with green checkmark
echo    5. Build time: Should be recent (within last few minutes)
echo.
echo 🔧 If site doesn't show changes:
echo    - Vercel is still building (wait 2-5 minutes)
echo    - Hard refresh browser (Ctrl+F5)
echo    - Check Vercel build logs for errors
echo.
pause