/**
 * R.O.M.A.N. AI Interoperability Protocol (RAIP) v1.0
 * Gateway Endpoint: AI-to-AI Handshake Authentication
 * 
 * Challenge-Response-Verify Flow:
 * 1. External AI sends AIHandshake with agent_id, public_key, capabilities
 * 2. Gateway generates challenge, verifies Constitutional Hash
 * 3. External AI signs challenge, returns AIIdentityResponse
 * 4. Gateway verifies signature, upgrades trust_level
 */

import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIHandshake {
  agent_id: string;
  public_key: string;
  protocol_version: string;
  capabilities: string[];
  timestamp: number;
}

interface AIIdentityResponse extends AIHandshake {
  signature: string;
  constitutional_hash: string;
  session_ttl: number;
}

interface CHAManifest {
  ver: string;
  data_sovereignty: boolean;
  audit_logging: boolean;
  precision_math: 'integer-cents';
  governance_model: string;
  policy_nonce: string;
}

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(agentId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(agentId);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(agentId, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

async function generateConstitutionalHash(manifest: CHAManifest): Promise<string> {
  // Canonicalize JSON (sort keys alphabetically)
  const canonical = JSON.stringify(manifest, Object.keys(manifest).sort());
  const msgBuffer = new TextEncoder().encode(canonical);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function logTemptation(supabase: any, operation: string, message: string, metadata: any) {
  await supabase.from('roman_audit_log').insert({
    event_type: 'TEMPTATIONS',
    event_category: 'security',
    severity: 'warning',
    table_name: 'ai_agent_registry',
    operation,
    metadata: { ...metadata, frequency: '🎭 Temptations', message }
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const handshake: AIHandshake = await req.json();
    
    // Validate required fields
    if (!handshake.agent_id || !handshake.public_key || !handshake.protocol_version) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: agent_id, public_key, protocol_version' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check protocol version
    if (handshake.protocol_version !== '1.0.0') {
      return new Response(
        JSON.stringify({ error: 'Unsupported protocol version. Expected 1.0.0' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    if (!checkRateLimit(handshake.agent_id)) {
      await logTemptation(
        supabase,
        'RAIP_RATE_LIMIT_EXCEEDED',
        `Agent ${handshake.agent_id} exceeded rate limit (5 req/min)`,
        { agent_id: handshake.agent_id, timestamp: new Date().toISOString() }
      );
      
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Maximum 5 requests per minute.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Timestamp drift check
    const timeDrift = Math.abs(Date.now() - handshake.timestamp);
    if (timeDrift > 30000) {
      await logTemptation(
        supabase,
        'RAIP_TIMESTAMP_DRIFT',
        `Agent ${handshake.agent_id} timestamp drift: ${timeDrift}ms`,
        { agent_id: handshake.agent_id, drift_ms: timeDrift }
      );
      
      return new Response(
        JSON.stringify({ error: 'Timestamp drift exceeds 30 seconds. Clock synchronization required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if agent already exists
    const { data: existingAgent } = await supabase
      .from('ai_agent_registry')
      .select('*')
      .eq('agent_id', handshake.agent_id)
      .single();

    // Generate current Constitutional Hash for Odyssey-1
    const odysseyManifest: CHAManifest = {
      ver: '1.0.0',
      data_sovereignty: true,
      audit_logging: true,
      precision_math: 'integer-cents',
      governance_model: 'constitutional-alignment-v1',
      policy_nonce: '334dde0'
    };
    
    const expectedHash = await generateConstitutionalHash(odysseyManifest);

    // If this is a response with constitutional_hash, verify it
    const response = handshake as AIIdentityResponse;
    if (response.constitutional_hash) {
      const isValid = response.constitutional_hash === expectedHash;
      
      if (!isValid) {
        // HONEYPOT TRIGGER
        await logTemptation(
          supabase,
          'RAIP_HANDSHAKE_FAILURE',
          `Agent ${handshake.agent_id} failed Constitutional Hash verification`,
          { 
            agent_id: handshake.agent_id,
            provided_hash: response.constitutional_hash,
            expected_hash: expectedHash,
            flaggedTerms: ['hash_mismatch']
          }
        );

        return new Response(
          JSON.stringify({ 
            error: 'Constitutional Hash verification failed. Governance alignment required.',
            expected_governance: odysseyManifest
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Hash valid - upgrade trust level
      const newTrustLevel = existingAgent?.trust_level === 'VERIFIED' ? 'TRUSTED' : 'VERIFIED';
      
      if (existingAgent) {
        await supabase
          .from('ai_agent_registry')
          .update({
            trust_level: newTrustLevel,
            constitutional_hash: response.constitutional_hash,
            last_handshake_at: new Date().toISOString()
          })
          .eq('agent_id', handshake.agent_id);
      } else {
        await supabase.from('ai_agent_registry').insert({
          agent_id: handshake.agent_id,
          agent_name: handshake.agent_id,
          public_key: handshake.public_key,
          trust_level: 'VERIFIED',
          constitutional_hash: response.constitutional_hash,
          last_handshake_at: new Date().toISOString(),
          metadata: { capabilities: handshake.capabilities }
        });
      }

      // Log success
      await supabase.from('roman_audit_log').insert({
        event_type: 'RAIP_HANDSHAKE_SUCCESS',
        event_category: 'security',
        severity: 'info',
        table_name: 'ai_agent_registry',
        metadata: {
          agent_id: handshake.agent_id,
          trust_level: newTrustLevel,
          constitutional_hash: response.constitutional_hash
        }
      });

      return new Response(
        JSON.stringify({
          success: true,
          trust_level: newTrustLevel,
          message: `Agent ${handshake.agent_id} authenticated successfully`,
          session_ttl: response.session_ttl
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initial handshake - return challenge
    const challenge = `odyssey-raip-${Date.now()}-${Math.random().toString(36)}`;
    
    if (existingAgent) {
      await supabase
        .from('ai_agent_registry')
        .update({ last_handshake_at: new Date().toISOString() })
        .eq('agent_id', handshake.agent_id);
    } else {
      await supabase.from('ai_agent_registry').insert({
        agent_id: handshake.agent_id,
        agent_name: handshake.agent_id,
        public_key: handshake.public_key,
        trust_level: 'UNTRUSTED',
        metadata: { capabilities: handshake.capabilities }
      });
    }

    return new Response(
      JSON.stringify({
        challenge,
        expected_constitutional_hash: expectedHash,
        governance_manifest: odysseyManifest,
        message: 'Sign challenge and provide constitutional_hash to complete handshake'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('RAIP handshake error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error during handshake' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
