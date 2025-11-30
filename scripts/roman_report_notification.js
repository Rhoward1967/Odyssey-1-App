// R.O.M.A.N. Report Notification (Discord/Email) - Scaffold
// This module sends the latest report to a Discord channel or via email.

const fs = require('fs');
const path = require('path');

const { sendUrgentReportToDiscord } = require('../src/services/discord-bot');


// Set your Discord channel ID here
const DISCORD_CHANNEL_ID = process.env.ROMAN_URGENT_REPORT_CHANNEL_ID || '';

async function sendReportNotification() {
  // Find the latest report
  const logsDir = path.join(__dirname, '../logs');
  const files = fs.readdirSync(logsDir).filter(f => f.startsWith('roman_report_'));
  if (files.length === 0) return;
  const latest = files.sort().reverse()[0];
  const report = fs.readFileSync(path.join(logsDir, latest), 'utf-8');

  if (DISCORD_CHANNEL_ID) {
    await sendUrgentReportToDiscord(report, DISCORD_CHANNEL_ID);
  } else {
    console.log('[R.O.M.A.N. Notification] No Discord channel ID set. Would send report:', latest);
  }
}

module.exports = { sendReportNotification };
