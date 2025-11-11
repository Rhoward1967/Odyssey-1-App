import { Client, GatewayIntentBits, Message } from 'discord.js';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Load environment variables
dotenv.config();

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

client.on('clientReady', () => {
  console.log(`🤖 R.O.M.A.N. Discord bot logged in as ${client.user?.tag}`);
});

client.on('messageCreate', async (message: Message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Only respond to DMs
  if (message.channel.type === 1) {
    await handleDirectMessage(message);
  }
});

async function handleDirectMessage(message: Message) {
  const userId = message.author.id;
  
  // Get or create conversation history for this user
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, [
      { role: "system", content: ROMAN_SYSTEM_PROMPT }
    ]);
  }
  
  const history = conversationHistory.get(userId)!;
  history.push({ role: "user", content: message.content });
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: history,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
    history.push({ role: "assistant", content: response });
    
    // Keep last 20 messages
    if (history.length > 21) {
      history.splice(1, history.length - 21);
    }
    
    await message.reply(response);
  } catch (error) {
    console.error('❌ Error generating response:', error);
    await message.reply('I encountered an error. Please try again.');
  }
}

export function startDiscordBot() {
  const token = process.env.DISCORD_BOT_TOKEN;
  
  if (!token) {
    console.error('❌ DISCORD_BOT_TOKEN is missing from environment variables');
    return;
  }
  
  const cleanToken = token.trim().replace(/['"]/g, '');
  console.log('✅ Discord token found, logging in...');
  
  client.login(cleanToken);
}

// Add this at the bottom
if (import.meta.url === `file://${process.argv[1]}`) {
  startDiscordBot();
}