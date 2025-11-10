// Run with: node scripts/register-discord-commands.js

// SECURITY: Never commit bot tokens to Git!
// Get token from environment variable instead
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const APPLICATION_ID = '1437291719690289224';

if (!DISCORD_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN environment variable not set!');
  console.log('Set it with: $env:DISCORD_BOT_TOKEN="YOUR_TOKEN"');
  process.exit(1);
}

const commands = [
  {
    name: 'ask',
    description: 'Ask R.O.M.A.N. anything - Master Architect',
    options: [
      {
        name: 'question',
        description: 'Your question for R.O.M.A.N.',
        type: 3, // STRING type
        required: true,
      },
    ],
  },
  {
    name: 'status',
    description: 'Check Odyssey-1 system status',
  },
  {
    name: 'heal',
    description: 'Run self-healing diagnostics',
  },
  {
    name: 'scan',
    description: 'R.O.M.A.N. performs full system scan and learns everything',
    options: [
      {
        name: 'depth',
        description: 'Scan depth: quick, normal, or deep',
        type: 3, // STRING
        required: false,
        choices: [
          { name: 'Quick scan (tables only)', value: 'quick' },
          { name: 'Normal scan (tables + configs)', value: 'normal' },
          { name: 'Deep scan (everything)', value: 'deep' },
        ],
      },
    ],
  },
];

async function registerCommands() {
  const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/commands`;
  
  console.log('🚀 Registering R.O.M.A.N. commands for Master Architect Rickey Howard...\n');
  
  for (const command of commands) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${DISCORD_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (response.ok) {
        console.log(`✅ Registered command: /${command.name}`);
      } else {
        const error = await response.text();
        console.error(`❌ Failed to register /${command.name}:`, error);
      }
    } catch (error) {
      console.error(`❌ Error registering /${command.name}:`, error);
    }
  }
  
  console.log('\n✨ Command registration complete! R.O.M.A.N. is ready to serve!');
}

registerCommands().catch(console.error);
