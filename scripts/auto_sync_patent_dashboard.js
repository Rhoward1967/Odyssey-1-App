// Patent Dashboard Sync Automation
// This script runs daily to keep R.O.M.A.N.'s knowledge up to date with the latest patent status.

const cron = require('node-cron');
const { exec } = require('child_process');

// Run every day at 2:00 AM
cron.schedule('0 2 * * *', () => {
  console.log('⏰ Running daily patent dashboard sync...');
  exec('npx ts-node scripts/sync_patent_dashboard.ts', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Sync error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`❌ Sync stderr: ${stderr}`);
      return;
    }
    console.log(`✅ Sync output: ${stdout}`);
  });
});

console.log('🛡️ Patent dashboard sync automation scheduled (daily at 2:00 AM).');
