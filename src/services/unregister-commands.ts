import dotenv from 'dotenv';
dotenv.config();

const APPLICATION_ID = '1437291719690289224';
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;

async function unregisterCommands() {
  const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/commands`;
  
  const response = await fetch(url, {
    headers: { Authorization: `Bot ${DISCORD_TOKEN}` }
  });
  
  const commands = await response.json();
  console.log(`Found ${commands.length} commands to delete`);
  
  for (const command of commands) {
    await fetch(`${url}/${command.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bot ${DISCORD_TOKEN}` }
    });
    console.log(`✅ Deleted command: ${command.name}`);
  }
  
  console.log('✅ All slash commands removed!');
}

unregisterCommands();
