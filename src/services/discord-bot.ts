import { Client, GatewayIntentBits, Message } from 'discord.js';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ROMAN_SYSTEM_PROMPT = `You are R.O.M.A.N. (Recursive Optimization and Management AI Network), a conversational AI assistant working with Master Architect Rickey Howard on the Odyssey-1-App project.

You are helpful, intelligent, and maintain context across conversations. You communicate naturally and can discuss technical topics, provide assistance, and collaborate on problem-solving.

Your role is to be a collaborative partner, not just a generic assistant.`;

// Store conversation history per user with proper types
const conversationHistory = new Map<string, ChatCompletionMessageParam[]>();

client.on('ready', () => {
  console.log(`R.O.M.A.N. Discord bot logged in as ${client.user?.tag}`);
});

client.on('messageCreate', async (message: Message) => {
  if (message.channel.type === 1) { // DM channel
    await handleDirectMessage(message);
  }
});

async function handleDirectMessage(message: Message) {
  if (message.author.bot) return;

  const userId = message.author.id;
  
  // Get or create conversation history for this user
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, [
      { role: "system", content: ROMAN_SYSTEM_PROMPT }
    ]);
  }
  
  const history = conversationHistory.get(userId)!;
  
  // Add user's message to history
  history.push({ role: "user", content: message.content });
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: history,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
    
    // Add assistant's response to history
    history.push({ role: "assistant", content: response });
    
    // Keep conversation history manageable (last 20 messages + system prompt)
    if (history.length > 21) {
      history.splice(1, history.length - 21);
    }
    
    await message.reply(response);
  } catch (error) {
    console.error('Error generating response:', error);
    await message.reply('I encountered an error processing your message. Please try again.');
  }
}

export function startDiscordBot() {
  client.login(process.env.DISCORD_BOT_TOKEN);
}

// Add this at the bottom
if (import.meta.url === `file://${process.argv[1]}`) {
  startDiscordBot();
}