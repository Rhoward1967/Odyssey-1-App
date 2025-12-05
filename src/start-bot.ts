

(async () => {
  const { startDiscordBot } = await import('./services/discord-bot.js');
  console.log('🤖 Starting R.O.M.A.N. Discord Bot...');
  startDiscordBot();
})();
