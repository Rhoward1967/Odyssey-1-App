console.info('odyssey-perceive started');

type LogRow = {
  id: number;
  created_at: string;
  source: string;
  level: string;
  message: string | null;
  metadata: Record<string, unknown> | null;
};

function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get('authorization') || '';
  const expectedToken = Deno.env.get('ODYSSEY_INGEST_TOKEN') || '';
  
  // Extract token from "Bearer <token>"
  const receivedToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  
  // Return true only if tokens match (both must exist)
  return !!expectedToken && !!receivedToken && receivedToken === expectedToken;
}

async function postToDiscord(webhookUrl: string, content: string) {
  const payload = { content };
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error('Discord webhook error', await res.text());
  }
}

function stringify(obj: unknown): string {
  try { return JSON.stringify(obj); } catch { return String(obj); }
}

function romanConsensus(log: LogRow) {
  const code = typeof log.metadata?.['code'] === 'number' ? (log.metadata as Record<string, number>).code : undefined;
  
  if (log.source === 'stripe_api' && code === 401) {
    return {
      action: 'ESCALATE_TO_ARCHITECT',
      diagnosis: 'Stripe API key is invalid or missing.',
      proposedFix: 'Approve re-loading of Stripe API key from secure config (proc_fix_stripe_key).',
      criticality: 'HIGH' as const,
    };
  }
  
  return {
    action: 'LOG_FOR_REVIEW',
    diagnosis: 'No immediate threat.',
    proposedFix: 'None',
    criticality: 'LOW' as const,
  };
}

Deno.serve(async (req) => {
  console.log('🔔 Request received:', req.method);
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return new Response('Method not allowed', { status: 405 });
  }
  
  const authHeader = req.headers.get('authorization') || '';
  const expectedToken = Deno.env.get('ODYSSEY_INGEST_TOKEN') || '';
  
  // SUPER DETAILED DEBUG LOGGING
  console.log('🔍 DEBUG INFO:');
  console.log('  Auth header present:', !!authHeader);
  console.log('  Auth header length:', authHeader.length);
  console.log('  Auth header starts with "Bearer ":', authHeader.startsWith('Bearer '));
  console.log('  Auth header first 30 chars:', authHeader.substring(0, 30));
  console.log('  Expected token present:', !!expectedToken);
  console.log('  Expected token length:', expectedToken.length);
  console.log('  Expected token first 30 chars:', expectedToken.substring(0, 30));
  
  // Extract received token
  const receivedToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  console.log('  Received token length (after extraction):', receivedToken.length);
  console.log('  Received token first 30 chars:', receivedToken.substring(0, 30));
  console.log('  Tokens match:', receivedToken === expectedToken);
  
  if (!isAuthorized(req)) {
    console.log('❌ Authorization failed! Token mismatch.');
    console.log('  Received length:', receivedToken.length);
    console.log('  Expected length:', expectedToken.length);
    return new Response(
      JSON.stringify({ error: 'Unauthorized', message: 'Invalid token' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 401 
      }
    );
  }
  
  console.log('✅ Authorization successful!');
  
  const logData: LogRow = await req.json();
  console.log('📦 Log data:', JSON.stringify(logData));
  
  const decision = romanConsensus(logData);
  console.log('🧠 R.O.M.A.N. decision:', decision.action);
  
  const webhook = Deno.env.get('DISCORD_WEBHOOK_URL') || '';
  console.log('🔗 Discord webhook present:', !!webhook);
  
  if (webhook && decision.action === 'ESCALATE_TO_ARCHITECT') {
    console.log('🚨 Sending Discord alert...');
    const content =
      `🚨 **Odyssey-1 Self-Healing Alert**\n` +
      `**Source:** ${logData.source}\n` +
      `**Level:** ${logData.level}\n` +
      `**Message:** ${logData.message ?? '(none)'}\n` +
      `**Diagnosis:** ${decision.diagnosis}\n` +
      `**Proposed Fix:** ${decision.proposedFix}\n` +
      `**Criticality:** ${decision.criticality}\n` +
      `**Metadata:** ${stringify(logData.metadata)}`;
    
    await postToDiscord(webhook, content);
    console.log('✅ Discord alert sent!');
  } else {
    console.log('⏭️ Not escalating (action:', decision.action, ', webhook present:', !!webhook, ')');
  }
  
  return new Response(
    JSON.stringify({ status: 'Log processed', decision: decision.action }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
