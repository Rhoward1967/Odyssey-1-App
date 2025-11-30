# Patent Deadline Alert Automation

This script (`auto_patent_deadline_alerts.js`) will automatically check for upcoming patent deadlines and send alerts via the Discord bot every day at 9:00 AM.

## Setup Instructions

1. **Install dependencies:**
   - Run `npm install node-cron` in your project root if not already installed.

2. **Import and schedule in your Discord bot service:**
   - Add `require('../scripts/auto_patent_deadline_alerts.js');` to your Discord bot startup file (e.g., `src/services/discord-bot.ts` or its entry point).

3. **Start your Discord bot as usual.**
   - The alert automation will run in the background as long as the bot is running.

## What it does
- Runs the `checkPatentDeadlinesAndAlert` function daily at 9:00 AM.
- Sends reminders/alerts for upcoming patent deadlines to the appropriate Discord channels/users.
- Ensures no patent deadline is missed.

---

**Note:**
- Make sure your Discord bot has the correct permissions and is running continuously.
- For production, use a process manager to keep the bot and automation running after reboots.
