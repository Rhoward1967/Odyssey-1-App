# Patent Dashboard Sync Automation

This script (`auto_sync_patent_dashboard.js`) will automatically run the patent dashboard sync every day at 2:00 AM, ensuring R.O.M.A.N. always has the latest patent status in its knowledge base.

## Setup Instructions

1. **Install dependencies:**
   - Run `npm install node-cron` in your project root if not already installed.

2. **Add to package.json scripts:**
   ```json
   "scripts": {
     ...existing scripts...
     "auto-sync-patent-dashboard": "node scripts/auto_sync_patent_dashboard.js"
   }
   ```

3. **Start the automation:**
   - Run `npm run auto-sync-patent-dashboard` in a background terminal or as a service.
   - For persistent automation, consider using a process manager like PM2 or a Windows Task Scheduler entry.

## What it does
- Runs `scripts/sync_patent_dashboard.ts` daily at 2:00 AM.
- Logs output and errors to the console.
- Keeps R.O.M.A.N.'s knowledge up to date for patent status queries and alerts.

---

**Note:**
- Ensure `scripts/sync_patent_dashboard.ts` is working and has correct permissions.
- For production, use a process manager to keep the automation running after reboots.
