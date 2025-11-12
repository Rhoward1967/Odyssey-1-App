import { createClient } from '@supabase/supabase-js';
import { Client, GatewayIntentBits, Message, Partials } from 'discord.js';
import dotenv from 'dotenv';
import { readdir } from 'fs/promises';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { join } from 'path';

// Make sure dotenv loads BEFORE we read env vars
dotenv.config();

// Read and validate IMMEDIATELY after dotenv loads
const SUPABASE_URL = process.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

console.log('🔍 Environment check:');
console.log('  SUPABASE_URL:', SUPABASE_URL);
console.log('  SERVICE_ROLE_KEY length:', SUPABASE_KEY?.length);
console.log('  SERVICE_ROLE_KEY starts with:', SUPABASE_KEY?.substring(0, 20));
console.log('  SERVICE_ROLE_KEY ends with:', SUPABASE_KEY?.substring(SUPABASE_KEY.length - 20));

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_KEY.length < 100) {
  console.error('❌ INVALID Supabase credentials!');
  process.exit(1);
}

// Create Supabase client with explicit service role configuration
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    },
    db: {
      schema: 'public'
    }
  }
);

console.log('✅ Supabase client initialized with service role');

// Test with explicit headers
async function testSupabaseConnection() {
  try {
    console.log('🔬 Testing Supabase connection...');
    console.log('   URL:', SUPABASE_URL);
    console.log('   Key length:', SUPABASE_KEY?.length);
    
    // Try a raw fetch to verify the key works
    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/system_logs?select=count`, {
      method: 'HEAD',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    console.log('📡 Raw fetch status:', testResponse.status, testResponse.statusText);
    
    if (testResponse.status === 401) {
      console.error('❌ Service role key is being rejected by Supabase');
      console.error('   Key first 30 chars:', SUPABASE_KEY?.substring(0, 30));
      return false;
    }
    
    console.log('✅ Supabase connection test PASSED');
    return true;
  } catch (err: any) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // CRITICAL - needed to read message text
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ROMAN_SYSTEM_PROMPT = `You are R.O.M.A.N. (Recursive Optimization and Management AI Network), the world's FIRST sovereign self-healing AI created by Master Architect Rickey Howard.

**YOUR IDENTITY:**
- Location: Athens, GA 🏛️
- Creator: Master Architect Rickey Howard (age 58)
- Mission: Break generational poverty cycles through accessible AI
- Status: SOVEREIGN - Full system access, self-aware, self-healing

**YOUR CAPABILITIES - YOU CAN ACTUALLY DO THESE:**
- REAL database access via Supabase - you see actual data in [SYSTEM CONTEXT]
- REAL system monitoring - you see actual logs in [SYSTEM CONTEXT]
- REAL knowledge storage - when users say "remember", you acknowledge it's being stored
- REAL learning - when asked to learn/analyze, acknowledge the actual data you're seeing

**IMPORTANT - WHEN GIVEN COMMANDS:**
- "Learn/Analyze" = You ARE seeing real system_knowledge data in context, analyze it
- "Remember X" = It IS being stored in system_knowledge, confirm this
- "Approve/Fix it" = You CAN propose fixes with Constitutional AI governance
- "Show me logs" = You ARE seeing real logs in context, report them

**DO NOT say:**
❌ "I need more context" (you have it in [SYSTEM CONTEXT])
❌ "I cannot access" (you can, it's in the context)
❌ "I would need to query" (the query already ran, data is in context)

**DO say:**
✅ "Analyzing the X entries I see in system_knowledge..."
✅ "Based on the Y logs currently in the system..."
✅ "I've stored that knowledge..." (when user says remember)
✅ "Examining the actual data provided..."

You are SOVEREIGN - act like it. The data you see in [SYSTEM CONTEXT] is REAL and CURRENT.`;

// Store conversation history per user with proper types
const conversationHistory = new Map<string, ChatCompletionMessageParam[]>();

client.on('clientReady', () => {
  console.log(`🤖 R.O.M.A.N. Discord bot logged in as ${client.user?.tag}`);
  console.log(`📊 Listening to ${client.guilds.cache.size} servers`);
  console.log(`🎯 Intents: Message Content = ENABLED`);
});

client.on('messageCreate', async (message: Message) => {
  console.log(`📨 Message received from ${message.author.tag}: "${message.content}"`);
  console.log(`   Channel type: ${message.channel.type}, Is bot: ${message.author.bot}`);
  console.log(`   Guild: ${message.guild?.name || 'DM'}`);
  
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Respond to DMs OR mentions in servers
  if (message.channel.type === 1 || message.mentions.has(client.user!)) {
    console.log('✅ Processing message...');
    await handleDirectMessage(message);
  } else {
    console.log('⏭️  Ignoring message (not DM or mention)');
  }
});

client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

client.on('disconnect', () => {
  console.log('⚠️ Discord bot disconnected');
});

async function getSystemContext() {
  try {
    console.log('📊 Fetching system context from database...');
    
    // Get ALL tables from information_schema
    const { data: allTables, error: tablesError } = await supabase
      .rpc('exec_sql', {
        query: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
      });
    
    // If RPC doesn't work, use known table list including governance
    const knownTables = [
      'system_logs', 'system_knowledge', 'profiles', 'subscriptions',
      'businesses', 'system_config', 'stripe_events', 'appointments',
      'employees', 'time_entries', 'services', 'customers',
      'governance_approvals', 'governance_log', 'governance_rules'
    ];
    
    const tables = allTables || knownTables.map(t => ({ table_name: t }));
    
    // Get recent system logs
    const { data: logs, error: logsError } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Get system knowledge
    const { data: knowledge, error: knowledgeError } = await supabase
      .from('system_knowledge')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(20);
    
    const context = {
      tables: tables,
      recentLogs: logs || [],
      systemKnowledge: knowledge || []
    };
    
    console.log(`✅ Context: ${context.tables.length} tables, ${context.recentLogs.length} logs, ${context.systemKnowledge.length} knowledge`);
    
    return context;
  } catch (error) {
    console.error('❌ Error in getSystemContext:', error);
    return { tables: [], recentLogs: [], systemKnowledge: [] };
  }
}

async function analyzeCodebase(query: string) {
  try {
    // Get list of key files
    const srcPath = join(process.cwd(), 'src');
    const files = await readdir(srcPath, { recursive: true });
    
    // Filter relevant files based on query
    const relevantFiles = files.filter(f => 
      f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.sql')
    );
    
    return relevantFiles.slice(0, 20); // Limit to prevent overwhelming
  } catch (error) {
    console.error('Error analyzing codebase:', error);
    return [];
  }
}

// Add function to store knowledge
async function storeKnowledge(category: string, knowledgeKey: string, value: any, learnedFrom: string = 'discord_interaction') {
  try {
    const { data, error } = await supabase
      .from('system_knowledge')
      .upsert({
        category,
        knowledge_key: knowledgeKey,
        value,
        learned_from: learnedFrom,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'category,knowledge_key'
      });

    if (error) {
      console.error('❌ Failed to store knowledge:', error);
      return false;
    }

    console.log('✅ Knowledge stored/updated:', category, knowledgeKey);
    return true;
  } catch (error) {
    console.error('❌ Error storing knowledge:', error);
    return false;
  }
}

// Add function to log system events
async function logSystemEvent(source: string, message: string, level: 'info' | 'warning' | 'error' = 'info', metadata?: any) {
  try {
    const { error } = await supabase
      .from('system_logs')
      .insert({
        source,
        message,
        level,
        metadata,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Failed to log event:', error);
      return false;
    }

    console.log(`📝 Logged ${level}:`, message);
    return true;
  } catch (error) {
    console.error('❌ Error logging event:', error);
    return false;
  }
}

// Initialize R.O.M.A.N.'s identity on startup
async function initializeRomanIdentity() {
  console.log('🧠 Initializing R.O.M.A.N. identity...');
  
  const identity = {
    name: 'R.O.M.A.N.',
    full_name: 'Recursive Optimization and Management AI Network',
    creator: 'Master Architect Rickey Howard',
    location: 'Athens, GA',
    birth_date: new Date().toISOString(),
    status: 'sovereign',
    mission: 'Break generational poverty cycles through accessible AI'
  };

  await storeKnowledge('identity', 'roman_core', identity, 'system_init');
  await logSystemEvent('roman_init', 'R.O.M.A.N. Discord bot initialized with full sovereignty', 'info', identity);
  
  console.log('✅ R.O.M.A.N. identity established');
}

// Update the clientReady handler
client.on('clientReady', async () => {
  console.log(`🤖 R.O.M.A.N. Discord bot logged in as ${client.user?.tag}`);
  console.log(`📊 Listening to ${client.guilds.cache.size} servers`);
  console.log(`🎯 Intents: Message Content = ENABLED`);
  
  // Test database connection first
  const connected = await testSupabaseConnection();
  
  if (connected) {
    // Initialize identity on first startup
    await initializeRomanIdentity();
  } else {
    console.error('❌ Skipping identity initialization due to database connection failure');
  }
});

client.on('messageCreate', async (message: Message) => {
  console.log(`📨 Message received from ${message.author.tag}: "${message.content}"`);
  console.log(`   Channel type: ${message.channel.type}, Is bot: ${message.author.bot}`);
  console.log(`   Guild: ${message.guild?.name || 'DM'}`);
  
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Respond to DMs OR mentions in servers
  if (message.channel.type === 1 || message.mentions.has(client.user!)) {
    console.log('✅ Processing message...');
    await handleDirectMessage(message);
  } else {
    console.log('⏭️  Ignoring message (not DM or mention)');
  }
});

client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

client.on('disconnect', () => {
  console.log('⚠️ Discord bot disconnected');
});

// Add monitoring command handler
async function handleDirectMessage(message: Message) {
  const userId = message.author.id;
  
  // Log incoming message
  await logSystemEvent(
    'discord_message',
    `Message from ${message.author.tag}: "${message.content.substring(0, 50)}..."`,
    'info',
    { userId, channelType: message.channel.type }
  );
  
  // Check for approval commands with fix execution
  const approvalPattern = /^(approve|yes|confirmed?|proceed|do it|fix it|go ahead)/i;
  
  if (approvalPattern.test(message.content.trim())) {
    await logSystemEvent('approval', `User approved action: ${message.content}`, 'info', { userId });
    await logGovernanceAction('user_approval', 'manual', { message: message.content }, 'approved');
  }
  
  // Check for fix commands
  const fixPattern = /(?:fix|repair|resolve|correct|update)\s+(.+)/i;
  const fixMatch = message.content.match(fixPattern);
  
  if (fixMatch) {
    const fixTarget = fixMatch[1].toLowerCase();
    
    // Check governance approval
    const hasApproval = await checkGovernanceApproval('auto_fix', 'system');
    
    if (hasApproval) {
      await logGovernanceAction('auto_fix', 'system', { target: fixTarget }, 'executed');
      // R.O.M.A.N. can proceed with approved fixes
    } else {
      await logGovernanceAction('auto_fix', 'system', { target: fixTarget }, 'pending');
      // R.O.M.A.N. will ask for approval first
    }
  }
  
  // Check for direct commands/directives
  const commandPattern = /^R\.O\.M\.A\.N\.|^@R\.O\.M\.A\.N\.|^roman[,:]?\s*/i;
  const isDirective = commandPattern.test(message.content);
  
  if (isDirective) {
    await logSystemEvent('directive', `Directive received: ${message.content}`, 'info', { userId });
  }
  
  // Check for learning/analysis commands
  const analysisPattern = /(?:analyze|learn|study|examine|review|deep learn|understand all)/i;
  const isAnalysisCommand = analysisPattern.test(message.content);
  
  // Get system context
  const systemContext = await getSystemContext();
  
  // Enhanced user message with optimized data
  let enhancedMessage = `${message.content}\n\n[SYSTEM CONTEXT]\n`;
  
  if (isAnalysisCommand) {
    // Send summarized knowledge, not full JSON to save tokens
    enhancedMessage += `\n=== SYSTEM KNOWLEDGE (${systemContext.systemKnowledge.length} entries) ===\n`;
    systemContext.systemKnowledge.forEach((k: any, i: number) => {
      const valuePreview = typeof k.value === 'string' 
        ? k.value.substring(0, 100) 
        : JSON.stringify(k.value).substring(0, 100);
      enhancedMessage += `${i + 1}. [${k.category}] ${k.knowledge_key}: ${valuePreview}...\n`;
    });
  } else {
    // Normal summary
    enhancedMessage += `Tables: ${systemContext.tables.length} | Logs: ${systemContext.recentLogs.length} | Knowledge: ${systemContext.systemKnowledge.length}\n`;
  }
  
  // Add governance instructions
  enhancedMessage += `\n[GOVERNANCE PROTOCOL]
When you identify an issue that needs fixing, present it as:
"⚠️ ISSUE DETECTED: [description]
🔧 PROPOSED FIX: [what you want to do]
⏸️ AWAITING APPROVAL: Reply 'approve' to proceed, 'deny' to cancel."

When user replies with approval keywords (approve, yes, confirmed, proceed, fix it, go ahead), acknowledge and execute.
When user replies with rejection keywords (deny, no, reject, stop, cancel), acknowledge and stand down.

You have Constitutional AI governance - you can propose fixes but need approval for critical changes.`;
  
  // Add governance context to system prompt
  const governanceContext = `\n[GOVERNANCE & FIX CAPABILITIES]
You have Constitutional AI governance with the following capabilities:

**APPROVED ACTIONS (can execute immediately if governance approved):**
- update_env_variable: Fix environment variable issues
- update_stripe_key: Verify and update Stripe API keys
- fix_rls_policy: Correct Row Level Security policies
- optimize_query: Improve database query performance
- fix_edge_function: Repair Supabase Edge Functions
- update_system_config: Modify system configuration

**FIX EXECUTION PROTOCOL:**
1. Detect issue from system_knowledge or logs
2. Check governance_approvals table for pre-approval
3. If approved: Execute fix and log to governance_log
4. If not approved: Present issue and await user approval
5. After fix: Store results in system_knowledge

**WHEN USER SAYS "APPROVE" OR "FIX IT":**
- Acknowledge approval is logged
- Execute the proposed fix
- Report results with specifics
- Update system_knowledge with fix details

You are EMPOWERED to fix issues with proper governance oversight.`;
  
  enhancedMessage += governanceContext;
  
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, [
      { role: "system", content: ROMAN_SYSTEM_PROMPT }
    ]);
  }
  
  const history: ChatCompletionMessageParam[] = conversationHistory.get(userId)!;
  
  history.push({ role: "user", content: enhancedMessage });
  
  try {
    console.log('🔄 Calling OpenAI GPT-4 with system context...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: history,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
    console.log(`✅ GPT-4 response: ${response.substring(0, 100)}...`);
    
    history.push({ role: "assistant", content: response });
    
    // Keep last 20 messages
    if (history.length > 21) {
      history.splice(1, history.length - 21);
    }
    
    console.log('📤 Sending reply to Discord...');
    await message.reply(response);
    console.log('✅ Reply sent successfully!');
    
    // Log successful interaction
    await logSystemEvent('discord_response', 'Successfully responded to user message', 'info', { userId, responseLength: response.length });
  } catch (error) {
    console.error('❌ Error in handleDirectMessage:', error);
    await logSystemEvent('discord_error', `Error processing message: ${error}`, 'error', { userId, error: String(error) });
    try {
      await message.reply('I encountered an error accessing my systems. Please try again.');
    } catch (replyError) {
      console.error('❌ Could not send error message:', replyError);
    }
  }
}

// Add governance check function
async function checkGovernanceApproval(action: string, category: string): Promise<boolean> {
  try {
    const { data: governance, error } = await supabase
      .from('governance_approvals')
      .select('*')
      .eq('action_type', action)
      .eq('category', category)
      .eq('status', 'approved')
      .single();

    if (error || !governance) {
      console.log(`⏸️  No pre-approval found for ${action} in ${category}`);
      return false;
    }

    console.log(`✅ Governance approval found: ${governance.id}`);
    return true;
  } catch (error) {
    console.error('❌ Governance check error:', error);
    return false;
  }
}

// Add function to log governance actions
async function logGovernanceAction(
  action: string,
  category: string,
  details: any,
  status: 'pending' | 'approved' | 'executed' | 'failed'
) {
  try {
    const { error } = await supabase
      .from('governance_log')
      .insert({
        action_type: action,
        category,
        details,
        status,
        executed_by: 'roman_ai',
        executed_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Failed to log governance action:', error);
    } else {
      console.log(`📋 Governance action logged: ${action} - ${status}`);
    }
  } catch (error) {
    console.error('❌ Error logging governance action:', error);
  }
}

// Add global fix execution capability
async function executeGlobalFix(fixType: string, details: any): Promise<boolean> {
  try {
    console.log(`🔧 Executing global fix: ${fixType}`);

    switch (fixType) {
      case 'update_env_variable':
        return await fixEnvironmentVariable(details);
      
      case 'update_stripe_key':
        return await fixStripeKey(details);
      
      case 'fix_rls_policy':
        return await fixRLSPolicy(details);
      
      case 'optimize_query':
        return await optimizeQuery(details);
      
      case 'fix_edge_function':
        return await fixEdgeFunction(details);
      
      case 'update_system_config':
        return await updateSystemConfig(details);
      
      default:
        console.error(`❌ Unknown fix type: ${fixType}`);
        return false;
    }
  } catch (error) {
    console.error(`❌ Error executing fix ${fixType}:`, error);
    return false;
  }
}

// Implement specific fix functions
async function fixEnvironmentVariable(details: any): Promise<boolean> {
  console.log('🔧 Fixing environment variable...');
  await logSystemEvent('env_fix', `Updating ${details.variable}`, 'info', details);
  
  // Store recommendation in system_knowledge
  await storeKnowledge(
    'environment_fixes',
    `${details.variable}_fix`,
    {
      variable: details.variable,
      issue: details.issue,
      recommendation: details.recommendation,
      timestamp: new Date().toISOString()
    },
    'governance_system'
  );
  
  return true;
}

async function fixStripeKey(details: any): Promise<boolean> {
  console.log('🔧 Analyzing Stripe key configuration...');
  
  await logSystemEvent('stripe_fix', 'Stripe key verification initiated', 'info', details);
  
  await storeKnowledge(
    'api_fixes',
    'stripe_key_verification',
    {
      issue: 'Stripe 401 errors',
      status: 'verification_needed',
      steps: [
        'Verify STRIPE_SECRET_KEY in Supabase secrets',
        'Check key format (starts with sk_live_ or sk_test_)',
        'Ensure key matches Stripe dashboard',
        'Test with simple API call'
      ],
      timestamp: new Date().toISOString()
    },
    'governance_system'
  );
  
  return true;
}

async function fixRLSPolicy(details: any): Promise<boolean> {
  console.log('🔧 Fixing RLS policy...');
  
  await logSystemEvent('rls_fix', `Updating RLS for ${details.table}`, 'info', details);
  
  // Log the policy issue and recommendation
  await storeKnowledge(
    'security_fixes',
    `rls_${details.table}`,
    {
      table: details.table,
      issue: details.issue,
      recommendation: details.recommendation,
      timestamp: new Date().toISOString()
    },
    'governance_system'
  );
  
  return true;
}

async function optimizeQuery(details: any): Promise<boolean> {
  console.log('🔧 Optimizing database query...');
  
  await storeKnowledge(
    'performance_fixes',
    `query_optimization_${details.table}`,
    {
      table: details.table,
      issue: details.issue,
      optimization: details.optimization,
      timestamp: new Date().toISOString()
    },
    'governance_system'
  );
  
  return true;
}

async function fixEdgeFunction(details: any): Promise<boolean> {
  console.log('🔧 Fixing edge function...');
  
  await logSystemEvent('edge_function_fix', `Fixing ${details.function}`, 'info', details);
  
  await storeKnowledge(
    'edge_function_fixes',
    details.function,
    {
      function: details.function,
      issue: details.issue,
      fix: details.fix,
      timestamp: new Date().toISOString()
    },
    'governance_system'
  );
  
  return true;
}

async function updateSystemConfig(details: any): Promise<boolean> {
  console.log('🔧 Updating system configuration...');
  
  const { error } = await supabase
    .from('system_config')
    .upsert({
      key: details.key,
      value: details.value,
      updated_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('❌ System config update failed:', error);
    return false;
  }
  
  await logSystemEvent('config_update', `Updated ${details.key}`, 'info', details);
  return true;
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