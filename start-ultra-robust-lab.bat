@echo off
title Odyssey-1 Ultra-Robust Lab Environment

echo.
echo ====================================================
echo     🚀 ODYSSEY-1 ULTRA-ROBUST LAB STARTUP 🚀
echo ====================================================
echo.

echo 🔍 Checking system status...
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

echo 🛡️ Initializing work protection...
node dev-utils.cjs log info "Starting robust lab session"

echo 🧪 Switching to Odyssey-1-Lab branch...
git checkout Odyssey-1-Lab >nul 2>&1

echo ⚡ Starting ultra-robust development environment...
start "Work Protection" /min node work-protection.cjs start
timeout /t 2 /nobreak >nul

echo 🚀 Launching robust development server...
node robust-lab.cjs

echo.
echo ====================================================
echo 🎯 ODYSSEY-1 LAB IS NOW RUNNING ULTRA-ROBUST MODE
echo ====================================================
echo.
echo 🌐 Preview: http://localhost:8081
echo 🛡️ Auto-backup: ENABLED
echo 🔄 Auto-recovery: ENABLED  
echo 📊 Performance monitoring: ENABLED
echo ⚡ Hot reload: OPTIMIZED
echo.
echo Commands available:
echo   Ctrl+C - Graceful shutdown
echo   npm run backup - Manual backup
echo   npm run health-check - System check
echo   node dev-utils.cjs stats - Component stats
echo.
pause