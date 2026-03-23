/**
 * OSC Ministerial Grant — Admin-Only Vault Issuance
 * Managing Officer of Odyssey-1 AI LLC issues OSC from the Vault
 * to partners, family, or Odyssey Ministers.
 *
 * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 * Patent Pending: USPTO #63/913,134
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL          = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const OSC_ADMIN_USER_ID     = Deno.env.get('OSC_ADMIN_USER_ID');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OSC_ADMIN_USER_ID) {
      return new Response('Missing environment variables', { status: 500 });
    }

    // Verify caller is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get the calling user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Admin gate — only the Managing Officer can issue grants
    if (user.id !== OSC_ADMIN_USER_ID) {
      return new Response(JSON.stringify({ error: 'Access denied. Managing Officer only.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { targetUserId, amount, reason } = await req.json();

    if (!targetUserId || !amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid request. Provide targetUserId, amount, and reason.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (amount > 1_000_000) {
      return new Response(JSON.stringify({ error: 'Single grant limit: 1,000,000 OSC. Contact Trust for larger issuances.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Execute the ministerial grant via RPC
    const { data, error: rpcError } = await supabase.rpc('grant_ministerial_osc', {
      target_user_id: targetUserId,
      grant_amount:   amount,
      grant_reason:   reason || `Ministerial Grant — ${new Date().toISOString()}`,
    });

    if (rpcError) {
      console.error('Grant RPC error:', rpcError);
      return new Response(JSON.stringify({ error: rpcError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`MINISTERIAL GRANT: ${amount} OSC → ${targetUserId} | Reason: ${reason} | Officer: ${user.id}`);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Ministerial grant error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Grant failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
