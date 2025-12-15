
(async () => {
  // Initialize R.O.M.A.N.'s Constitutional Core (Sacred Geometry Framework)
  const { initializeConstitutionalCore } = await import('./lib/roman-constitutional-core.js');
  initializeConstitutionalCore();
  
  // Start Discord Bot
  const { startDiscordBot } = await import('./services/discord-bot.js');
  console.log('🤖 Starting R.O.M.A.N. Discord Bot...');
  startDiscordBot();
})();
