
(async () => {
  // Initialize R.O.M.A.N.'s Constitutional Core (Sacred Geometry Framework)
  const { initializeConstitutionalCore } = await import('./lib/roman-constitutional-core.js');
  initializeConstitutionalCore();
  
  // Initialize R.O.M.A.N.'s Temporal Awareness (Ever-Current Protocol)
  const { initializeTemporalSentinel } = await import('./services/RomanTemporalAwareness.js');
  await initializeTemporalSentinel();
  
  // Perform Sovereign Induction Protocol (Self-Briefing)
  const { inductAISystem } = await import('./services/SovereignInductionProtocol.js');
  const inductionStatus = await inductAISystem('R.O.M.A.N. 2.0 Discord Bot');
  if (!inductionStatus.inducted) {
    console.error('❌ R.O.M.A.N. self-induction failed - startup aborted');
    process.exit(1);
  }
  
  // Start Discord Bot
  const { startDiscordBot } = await import('./services/discord-bot.js');
  console.log('🤖 Starting R.O.M.A.N. Discord Bot...');
  startDiscordBot();
})();
