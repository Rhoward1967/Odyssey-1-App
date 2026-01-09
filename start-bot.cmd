@echo off
REM ODYSSEY-1 Discord Bot Starter (No npm required)
REM Works even with F: drive disconnected
REM Uses PowerShell to load .env file

echo Starting ODYSSEY-1 Discord Bot...
powershell.exe -ExecutionPolicy Bypass -File .\start-bot.ps1
