# F: Drive Dependency Fix - Instructions

## Problem
The ODYSSEY-1 server won't start when the F: drive is disconnected because F:\ was added to your Windows system PATH environment variable. This happened when you moved data to prepare for your new PC in April.

## Root Cause
- F:\ is in your **system PATH** environment variable
- Windows looks for programs/tools in F:\ when the system starts
- When F: drive is disconnected, Windows can't find those paths
- This breaks server startup and other tools

## Solution
Run the fix script as Administrator to remove F: from your system PATH.

## Steps to Fix

### 1. Run the Fix Script as Administrator
```powershell
# Right-click PowerShell and select "Run as Administrator"
# Then navigate to your project and run:
cd C:\Users\gener\Odyssey-1-App
.\fix-f-drive-dependency.ps1
```

### 2. Restart Your Computer
**Critical:** After running the script, you MUST restart your computer (or at minimum close ALL terminals and VS Code completely, then reopen).

This is because:
- Environment variables are loaded when Windows starts
- Running processes (like VS Code) keep the old PATH cached
- A restart ensures all processes use the new PATH

### 3. Verify the Fix
After restarting:
```powershell
# Check that F: is no longer in PATH
[Environment]::GetEnvironmentVariable("PATH", "Machine") -split ';' | Select-String -Pattern "F:"

# Should return nothing
```

### 4. Test Without F: Drive
1. Close VS Code
2. Safely eject/disconnect the F: drive
3. Reopen VS Code
4. Navigate to ODYSSEY-1-App
5. Run your dev server:
   ```
   npm run dev
   ```

### 5. Store F: Drive Safely
Once confirmed working:
- The F: drive can be safely disconnected
- Store it in a secure location
- All ODYSSEY-1 operations will work from the C: drive

## What the Script Does

1. **Removes F:\ from System PATH** - Prevents Windows from looking for programs on F: drive
2. **Removes F:\ from User PATH** - Just in case it was added there too
3. **Verifies Node.js and npm** - Ensures they're still accessible after the change
4. **Provides summary** - Shows what was changed and next steps

## Why This Happened

When you moved ODYSSEY-1 data to the F: drive to prepare for your April PC upgrade, something (possibly an installer or manual PATH addition) added F:\ to your system PATH. This created a dependency on the F: drive being connected.

## After the Fix

✅ **You can work in VS Code normally** - No F: drive required
✅ **Server will start without F: drive** - All dependencies on C: drive
✅ **F: drive can be stored safely** - Keep it as backup/archive
✅ **Ready for new PC in April** - Clean system, no external drive dependencies

## Troubleshooting

### If npm or node not found after fix:
```powershell
# Check if Node.js is installed
node --version
npm --version

# If not found, Node.js may need to be reinstalled
# Or check if it was installed on F: drive
```

### If you need to add Node.js to PATH:
```powershell
# Find where Node.js is installed
Get-ChildItem -Path "C:\Program Files\nodejs" -ErrorAction SilentlyContinue

# Typical locations:
# C:\Program Files\nodejs
# C:\Program Files (x86)\nodejs
```

## Questions?
If you have any issues after running the fix, we can troubleshoot together.
