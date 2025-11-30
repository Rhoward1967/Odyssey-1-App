// R.O.M.A.N. Automation Scheduler
// This script schedules all observer, repair, audit, and report modules to run at appropriate intervals.

const cron = require('node-cron');
const { observeSystem } = require('./roman_system_observer');
const { runSelfRepair } = require('./roman_self_repair');
const { auditApiKeys } = require('./roman_api_audit');
const { detectChanges } = require('./roman_change_detection');
const { generateReport } = require('./roman_dual_hemisphere_report');
const fs = require('fs');
const path = require('path');

// Observer: every hour
cron.schedule('0 * * * *', async () => {
  await observeSystem();
});

// API Key Audit: every 6 hours
cron.schedule('0 */6 * * *', () => {
  auditApiKeys();
});

// Change Detection: every 2 hours
cron.schedule('0 */2 * * *', () => {
  detectChanges();
});

// Self-Repair: after every observer run (simulate by reading last observer log)
cron.schedule('5 * * * *', () => {
  const logPath = path.join(__dirname, '../logs/roman_observer.log');
  if (fs.existsSync(logPath)) {
    const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
    if (lines.length > 0) {
      const lastObservation = JSON.parse(lines[lines.length - 1]);
      runSelfRepair(lastObservation);
    }
  }
});

// Report: daily at 4:00 AM
cron.schedule('0 4 * * *', () => {
  generateReport();
});

console.log('[R.O.M.A.N. Automation] All modules scheduled.');
