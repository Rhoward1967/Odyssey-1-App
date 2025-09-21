@echo off
REM Odyssey-1 Lab Startup Script for Windows

echo 🚀 Starting Odyssey-1 Lab Environment...

REM Ensure we're on the lab branch
git checkout Odyssey-1-Lab >nul 2>&1 || echo Already on Odyssey-1-Lab branch

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Start the development server
echo 🔧 Starting development server...
start "Odyssey-1 Dev Server" npm run dev

REM Wait a moment for server to start
timeout /t 5 /nobreak >nul

echo 🌐 Lab environment ready at http://localhost:8081
echo ✅ Odyssey-1 Lab is ready for development!