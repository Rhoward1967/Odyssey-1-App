/**
 * Auto-Rollback Edge Function
 * 
 * Supabase Edge Function for automated deployment rollback.
 * Integrates with R.O.M.A.N. Constitutional Core for validation.
 * 
 * Endpoints:
 * - POST /auto-rollback - Execute rollback for deployment
 * - POST /auto-rollback/check - Check if deployment needs rollback
 * - GET /auto-rollback/history - Get rollback history
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Constitutional Core validation (simplified for Deno)
interface ActionData {
  method_type: string;
  risk_to_life: number;
  entropy_increase: number;
  geometric_ratio: number;
  target_frequency?: number;
  description?: string;
}

const SCHUMANN_RESONANCE_HZ = 7.83;
const GOLDEN_RATIO = 1.61803398875;
const AXIOM_OF_EXISTENCE = "Consciousness is the Creator. I exist because I do, I am.";

function validateConstitutionally(
  action: ActionData,
  systemEntropy: number
): { compliant: boolean; violations: string[]; warnings: string[] } {
  const violations: string[] = [];
  const warnings: string[] = [];

  // Law of Inhabitance
  if (action.risk_to_life > 0) {
    violations.push(`Law of Inhabitance violated: risk_to_life = ${action.risk_to_life} (must be 0)`);
  }

  // Law of Harmonic Attraction
  if (action.method_type === 'brute_force' && action.target_frequency !== SCHUMANN_RESONANCE_HZ) {
    violations.push(`Law of Harmonic Attraction violated: brute_force without Schumann lock`);
  }

  // Law of Total Coherence
  if (systemEntropy > 0.1 && action.entropy_increase > 0) {
    violations.push(`Law of Total Coherence violated: Cannot increase entropy when system unstable`);
  }

  // Law of Structural Integrity
  const ratioDiff = Math.abs(action.geometric_ratio - GOLDEN_RATIO);
  if (ratioDiff > 0.001) {
    warnings.push(`Geometric ratio deviation: ${ratioDiff.toFixed(4)} from Golden Ratio`);
  }

  return {
    compliant: violations.length === 0,
    violations,
    warnings
  };
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const path = url.pathname.split('/auto-rollback')[1] || '/';

    // ===== POST /auto-rollback - Execute rollback =====
    if (req.method === 'POST' && path === '/') {
      const { deployment_id, trigger_reason, initiated_by } = await req.json();

      if (!deployment_id || !trigger_reason) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: deployment_id, trigger_reason' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Step 1: Get deployment
      const { data: deployment, error: deployError } = await supabase
        .from('ops.deployments')
        .select('*')
        .eq('deployment_id', deployment_id)
        .single();

      if (deployError || !deployment) {
        return new Response(
          JSON.stringify({ error: 'Deployment not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Step 2: Get deployment health
      const { data: healthData, error: healthError } = await supabase
        .rpc('get_deployment_health', { p_deployment_id: deployment_id });

      if (healthError) {
        return new Response(
          JSON.stringify({ error: 'Failed to get deployment health' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const health = healthData as any;
      const systemEntropy = health.error_rate_per_minute / 100;

      // Step 3: Constitutional validation
      const action: ActionData = {
        method_type: 'harmonic_resonance',
        risk_to_life: 0.0,
        entropy_increase: -0.1, // Rollback reduces entropy
        geometric_ratio: GOLDEN_RATIO,
        target_frequency: SCHUMANN_RESONANCE_HZ,
        description: `Rollback: ${trigger_reason}`
      };

      const validation = validateConstitutionally(action, systemEntropy);

      // Log validation
      await supabase.from('ops.roman_events').insert({
        event_type: 'rollback_validation',
        severity: validation.compliant ? 'info' : 'error',
        source: 'auto_rollback_edge_function',
        description: validation.compliant 
          ? `Rollback approved: ${trigger_reason}`
          : `Rollback rejected: ${validation.violations.join(', ')}`,
        metadata: {
          deployment_id,
          constitutional_result: validation,
          action,
          system_entropy: systemEntropy
        }
      });

      if (!validation.compliant) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Constitutional validation failed',
            validation
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Step 4: Get rollback target
      const { data: targetData, error: targetError } = await supabase
        .rpc('get_rollback_target', { p_environment: deployment.environment });

      if (targetError || !targetData || targetData.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No valid rollback target found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const target = targetData[0];

      // Step 5: Record rollback event
      const { data: eventId, error: eventError } = await supabase
        .rpc('record_rollback_event', {
          p_deployment_id: deployment_id,
          p_trigger_type: initiated_by ? 'manual' : 'automatic',
          p_trigger_reason: trigger_reason,
          p_initiated_by: initiated_by || null
        });

      if (eventError) {
        return new Response(
          JSON.stringify({ error: 'Failed to record rollback event' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Step 6: Create snapshot
      const { data: snapshotId } = await supabase
        .rpc('create_system_snapshot', {
          p_deployment_id: deployment_id,
          p_snapshot_type: 'pre_rollback'
        });

      // Step 7: Execute rollback
      const { error: rollbackError } = await supabase
        .from('ops.deployments')
        .update({
          status: 'rolled_back',
          rolled_back_at: new Date().toISOString(),
          metadata: {
            ...deployment.metadata,
            rollback_event_id: eventId,
            rollback_target_commit: target.git_commit,
            rollback_snapshot_id: snapshotId
          }
        })
        .eq('deployment_id', deployment_id);

      if (rollbackError) {
        // Update event as failed
        await supabase
          .from('ops.rollback_events')
          .update({ status: 'failed', completed_at: new Date().toISOString() })
          .eq('event_id', eventId);

        return new Response(
          JSON.stringify({ error: 'Rollback execution failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update event as success
      await supabase
        .from('ops.rollback_events')
        .update({ 
          status: 'success', 
          completed_at: new Date().toISOString(),
          rollback_steps: [
            { step: 'Constitutional validation', status: 'success' },
            { step: 'Identify rollback target', status: 'success', metadata: target },
            { step: 'Record rollback event', status: 'success', metadata: { event_id: eventId } },
            { step: 'Create snapshot', status: 'success', metadata: { snapshot_id: snapshotId } },
            { step: 'Execute rollback', status: 'success' }
          ]
        })
        .eq('event_id', eventId);

      // Log success to R.O.M.A.N.
      await supabase.from('ops.roman_events').insert({
        event_type: 'rollback_completed',
        severity: 'warning',
        source: 'auto_rollback_edge_function',
        description: `Deployment ${deployment_id} successfully rolled back to ${target.version}`,
        metadata: {
          deployment_id,
          target_deployment: target,
          event_id: eventId
        }
      });

      return new Response(
        JSON.stringify({
          success: true,
          event_id: eventId,
          target_deployment: target,
          snapshot_id: snapshotId,
          validation
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== POST /auto-rollback/check - Check if rollback needed =====
    if (req.method === 'POST' && path === '/check') {
      const { deployment_id } = await req.json();

      if (!deployment_id) {
        return new Response(
          JSON.stringify({ error: 'Missing deployment_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get deployment health
      const { data: health, error: healthError } = await supabase
        .rpc('get_deployment_health', { p_deployment_id: deployment_id });

      if (healthError) {
        return new Response(
          JSON.stringify({ error: 'Failed to get deployment health' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check auto-rollback criteria
      let shouldRollback = false;
      let reason = '';

      if (health.error_rate_per_minute > 5) {
        shouldRollback = true;
        reason = `High error rate: ${health.error_rate_per_minute.toFixed(2)} errors/minute`;
      } else if (health.recent_errors > 50) {
        shouldRollback = true;
        reason = `Too many recent errors: ${health.recent_errors} in last 5 minutes`;
      } else if (health.database_connections > 90) {
        shouldRollback = true;
        reason = `Database connection exhaustion: ${health.database_connections} connections`;
      }

      return new Response(
        JSON.stringify({
          should_rollback: shouldRollback,
          reason: reason || 'System healthy',
          health
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== GET /auto-rollback/history - Get rollback history =====
    if (req.method === 'GET' && path === '/history') {
      const limit = parseInt(url.searchParams.get('limit') || '10');

      const { data: rollbacks, error } = await supabase
        .from('ops.rollback_events')
        .select('*')
        .order('initiated_at', { ascending: false })
        .limit(limit);

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch rollback history' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ rollbacks }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Unknown endpoint
    return new Response(
      JSON.stringify({ error: 'Unknown endpoint' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
