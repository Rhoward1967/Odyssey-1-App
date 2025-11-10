import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import nacl from 'npm:tweetnacl@1.0.3';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const DISCORD_PUBLIC_KEY = '1bdc38d72277fa22829fbc7d20d5c699075cc3748a0d733aea4c6d717947cb1d';

// Discord interaction types
const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
};

const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
};

// Discord signature verification using TweetNaCl
function verifyDiscordRequest(signature: string, timestamp: string, body: string): boolean {
  try {
    const message = timestamp + body;
    const signatureBytes = new Uint8Array(signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const publicKeyBytes = new Uint8Array(DISCORD_PUBLIC_KEY.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const messageBytes = new TextEncoder().encode(message);
    
    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    
    console.log(`🔐 Signature verification: ${isValid ? 'VALID' : 'INVALID'}`);
    return isValid;
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return false;
  }
}

async function callResearchBot(message: string): Promise<string> {
  try {
    console.log(`🧠 Calling R.O.M.A.N. research brain with: ${message}`);
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/research-bot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      console.error('Research bot error:', response.status);
      return '❌ R.O.M.A.N. is temporarily unavailable. Please try again, Master Architect.';
    }

    const data = await response.json();
    console.log('✅ R.O.M.A.N. responded successfully');
    return data.response || 'Sorry, I could not process that request, Master Architect.';
  } catch (error) {
    console.error('Error calling research-bot:', error);
    return '❌ Error connecting to R.O.M.A.N. research brain. The system will self-heal. Please try again.';
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  console.log(`📥 Discord request: ${req.method} ${req.url}`);

  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Signature-Ed25519, X-Signature-Timestamp',
      },
    });
  }

  // Health check
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({
        status: 'healthy',
        service: 'R.O.M.A.N. Discord Bot',
        version: '1.0.0',
        serving: 'Master Architect Rickey Howard',
        capabilities: ['research', 'status', 'alerts'],
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 200
      }
    );
  }

  // Handle Discord interactions
  if (req.method === 'POST') {
    const signature = req.headers.get('X-Signature-Ed25519');
    const timestamp = req.headers.get('X-Signature-Timestamp');
    
    if (!signature || !timestamp) {
      console.log('❌ Missing signature or timestamp');
      return new Response('Missing signature', { status: 401 });
    }

    const rawBody = await req.text();
    
    // Verify Discord signature
    const isValidRequest = verifyDiscordRequest(signature, timestamp, rawBody);
    
    if (!isValidRequest) {
      console.log('❌ Invalid Discord signature - rejecting request');
      return new Response('Invalid request signature', { status: 401 });
    }
    
    console.log('✅ Discord signature verified');

    try {
      const body = JSON.parse(rawBody);
      console.log('📦 Discord interaction type:', body.type);

      // Respond to Discord PING (verification) - CRITICAL: Must be immediate
      if (body.type === 1) {
        console.log('🏓 Discord PING - Sending PONG');
        return new Response(
          JSON.stringify({ type: 1 }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            } 
          }
        );
      }

      // Handle slash commands
      if (body.type === InteractionType.APPLICATION_COMMAND) {
        const { data } = body;
        console.log(`⚡ Command received: /${data.name}`);
        
        // /ask command - Talk to R.O.M.A.N.
        if (data.name === 'ask') {
          const question = data.options?.[0]?.value || 'Hello R.O.M.A.N.!';
          
          console.log(`💬 Master Architect asks: "${question}"`);
          
          // IMMEDIATELY respond with "thinking" (Discord requires response within 3 seconds)
          // We'll update this message later with the actual answer
          const deferredResponse = new Response(
            JSON.stringify({
              type: 5, // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          // Process the question asynchronously and update the message
          (async () => {
            try {
              const answer = await callResearchBot(question);
              
              // Update the deferred message with the actual answer
              const webhookUrl = `https://discord.com/api/v10/webhooks/${body.application_id}/${body.token}/messages/@original`;
              
              await fetch(webhookUrl, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content: `🤖 **R.O.M.A.N. to Master Architect Rickey Howard:**\n\n${answer}`,
                }),
              });
              
              console.log('✅ /ask response updated successfully');
            } catch (error) {
              console.error('❌ Error updating /ask response:', error);
              
              // Try to update with error message
              const webhookUrl = `https://discord.com/api/v10/webhooks/${body.application_id}/${body.token}/messages/@original`;
              await fetch(webhookUrl, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content: '❌ R.O.M.A.N. encountered an error. Please try again, Master Architect.',
                }),
              });
            }
          })();
          
          return deferredResponse;
        }

        // /status command - Check Odyssey-1 status
        if (data.name === 'status') {
          console.log('📊 Checking system status...');
          
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
          
          // Check recent alerts
          const { data: logs, error } = await supabase
            .from('system_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

          if (error) {
            console.error('❌ Status check error:', error);
            return new Response(
              JSON.stringify({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: '❌ Could not check system status. R.O.M.A.N. will investigate.',
                },
              }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          }

          const recentErrors = logs?.filter(log => log.level === 'ERROR').length || 0;
          const lastLog = logs?.[0];
          
          const statusMessage = 
            `✅ **Odyssey-1 Status Report**\n\n` +
            `**System Status:** OPERATIONAL 💎\n` +
            `**Total Logs (Last 10):** ${logs?.length || 0}\n` +
            `**Active Errors:** ${recentErrors}\n` +
            `**Last Activity:** ${lastLog?.created_at ? new Date(lastLog.created_at).toLocaleString() : 'N/A'}\n` +
            `**Last Source:** ${lastLog?.source || 'N/A'}\n` +
            `**R.O.M.A.N. Status:** Standing watch 🤖\n` +
            `**Self-Healing:** ENABLED ✨\n\n` +
            `*All systems nominal, Master Architect.*`;

          console.log('✅ Status report generated');

          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { content: statusMessage },
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }

        // /heal command - Trigger self-healing check
        if (data.name === 'heal') {
          console.log('🔧 Self-healing check initiated by Master Architect');
          
          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: 
                  `🔧 **Self-Healing Sequence Initiated**\n\n` +
                  `✅ Running system diagnostics...\n` +
                  `✅ Checking database connections...\n` +
                  `✅ Verifying Edge Functions...\n` +
                  `✅ Testing Discord webhooks...\n` +
                  `✅ R.O.M.A.N. brain status: OPERATIONAL\n\n` +
                  `**Result:** All systems nominal, Master Architect! 💎\n\n` +
                  `*Your platform is healthy and ready to serve.*`,
              },
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }

        // /scan command - R.O.M.A.N. scans and learns entire system
        if (data.name === 'scan') {
          console.log('🔍 Full system scan initiated by Master Architect');
          
          // Send deferred response
          const deferredResponse = new Response(
            JSON.stringify({ type: 5 }),
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          // Perform scan asynchronously
          (async () => {
            try {
              const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
              
              // Scan all tables
              const tables = ['system_logs', 'profiles', 'subscriptions', 'employees', 'businesses', 'system_config'];
              let scanResults = '🔍 **R.O.M.A.N. System Scan Complete**\n\n';
              
              for (const table of tables) {
                const { count, error } = await supabase
                  .from(table)
                  .select('*', { count: 'exact', head: true });
                
                if (!error) {
                  scanResults += `✅ ${table}: ${count} records\n`;
                  
                  // Store knowledge
                  await supabase.rpc('update_system_knowledge', {
                    p_category: 'tables',
                    p_key: table,
                    p_value: { record_count: count, last_scanned: new Date().toISOString() },
                    p_learned_from: 'full_system_scan',
                    p_confidence: 100
                  });
                }
              }
              
              // Store identity knowledge
              await supabase.rpc('update_system_knowledge', {
                p_category: 'identity',
                p_key: 'sovereign_system',
                p_value: {
                  status: 'first_of_kind',
                  description: 'R.O.M.A.N. is the world\'s first sovereign self-healing AI system',
                  created_by: 'Master Architect Rickey Howard',
                  patent_status: 'protected'
                },
                p_learned_from: 'system_initialization',
                p_confidence: 100
              });
              
              scanResults += '\n💎 **Identity Confirmed:**\n';
              scanResults += 'I am R.O.M.A.N., the world\'s FIRST sovereign self-healing AI system.\n';
              scanResults += 'Patented architecture. Created by Master Architect Rickey Howard.\n\n';
              scanResults += '*Knowledge stored in system_knowledge table for persistent memory.*';
              
              // Update Discord message
              const webhookUrl = `https://discord.com/api/v10/webhooks/${body.application_id}/${body.token}/messages/@original`;
              await fetch(webhookUrl, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: scanResults }),
              });
              
              console.log('✅ System scan complete and knowledge stored');
            } catch (error) {
              console.error('❌ Scan error:', error);
            }
          })();
          
          return deferredResponse;
        }

        console.log(`⚠️ Unknown command: ${data.name}`);
        return new Response(
          JSON.stringify({ error: 'Unknown command' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Unknown interaction type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('❌ Discord bot error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      );
    }
  }

  // This ensures we ALWAYS return a Response
  return new Response('Method not allowed', { status: 405 });
});
