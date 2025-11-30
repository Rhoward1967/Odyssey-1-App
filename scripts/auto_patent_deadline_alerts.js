// Discord Bot Patent Alert Automation
// This script should be imported and scheduled in the Discord bot service to check for patent deadlines and send alerts.

const { checkPatentDeadlinesAndAlert } = require('./patentDeadlineTracker');
const cron = require('node-cron');

// Run every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Checking patent deadlines for Discord alerts...');
  await checkPatentDeadlinesAndAlert();
});

console.log('🤖 Patent deadline alert automation scheduled (daily at 9:00 AM).');
