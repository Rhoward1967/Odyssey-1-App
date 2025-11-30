// R.O.M.A.N. Config Backup Automation
// This Node.js script runs the PowerShell backup script automatically on a schedule.

const { exec } = require('child_process');
const path = require('path');
const cron = require('node-cron');

// Path to the PowerShell backup script
const backupScript = path.join(__dirname, '../backup_config.ps1');

// Schedule: every day at 3:00 AM (adjust as needed)
cron.schedule('0 3 * * *', () => {
  console.log('⏰ [R.O.M.A.N.] Running daily config backup...');
  exec(`powershell -ExecutionPolicy Bypass -File "${backupScript}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[R.O.M.A.N.] ❌ Backup error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`[R.O.M.A.N.] ❌ Backup stderr: ${stderr}`);
      return;
    }
    console.log(`[R.O.M.A.N.] ✅ Backup complete: ${stdout}`);
  });
});

console.log('[R.O.M.A.N.] Config backup automation scheduled (daily at 3:00 AM).');
