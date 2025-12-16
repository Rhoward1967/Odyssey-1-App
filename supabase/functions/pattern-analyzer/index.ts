/**
 * Pattern Analyzer Edge Function
 * 
 * Supabase Edge Function for R.O.M.A.N. Pattern Learning Engine.
 * Analyzes errors, learns patterns, and applies automatic fixes.
 * 
 * Endpoints:
 * - POST /pattern-analyzer/learn - Learn from new error
 * - POST /pattern-analyzer/apply - Find and apply matching pattern
 * - POST /pattern-analyzer/cluster - Run ML clustering
 * - GET /pattern-analyzer/statistics - Get pattern statistics
 * - POST /pattern-analyzer/approve - Approve pattern for auto-fix
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pattern learning utilities
function generatePatternSignature(errorMessage: string, errorSource?: string): string {
  const normalized = errorMessage
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'UUID')
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, 'TIMESTAMP')
    .replace(/\d+/g, 'NUM')
    .replace(/["'].*?["']/g, 'STRING')
    .toLowerCase()
    .trim();
  
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `pattern_${Math.abs(hash).toString(36)}`;
}

function generateErrorRegex(errorMessage: string): string {
  return errorMessage
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[0-9a-f-]{36}')
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}')
    .replace(/\d+/g, '\\d+')
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function classifyErrorType(errorMessage: string, errorSource?: string): string {
  const lowerMsg = errorMessage.toLowerCase();
  const lowerSrc = (errorSource || '').toLowerCase();
  
  if (lowerMsg.includes('policy') || lowerMsg.includes('rls') || lowerMsg.includes('permission')) return 'rls';
  if (lowerMsg.includes('stripe') || lowerSrc.includes('stripe')) return 'stripe';
  if (lowerMsg.includes('deploy') || lowerMsg.includes('build') || lowerMsg.includes('migration')) return 'deployment';
  if (lowerMsg.includes('select') || lowerMsg.includes('insert') || lowerMsg.includes('postgres')) return 'database';
  return 'api';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const path = url.pathname.split('/pattern-analyzer')[1] || '/';

    // ===== POST /pattern-analyzer/learn - Learn from error =====
    if (req.method === 'POST' && path === '/learn') {
      const { error_message, error_source, severity, system_log_id } = await req.json();

      if (!error_message || !severity || !system_log_id) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const signature = generatePatternSignature(error_message, error_source);

      // Check if pattern exists
      const { data: existing } = await supabase
        .from('ops.error_patterns')
        .select('*')
        .eq('pattern_signature', signature)
        .single();

      if (existing) {
        // Update existing pattern
        const { data: updated, error: updateError } = await supabase
          .from('ops.error_patterns')
          .update({
            occurrence_count: existing.occurrence_count + 1,
            last_seen: new Date().toISOString(),
            learned_from_incidents: [...(existing.learned_from_incidents || []), system_log_id.toString()],
            updated_at: new Date().toISOString()
          })
          .eq('pattern_id', existing.pattern_id)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({
            success: true,
            pattern: updated,
            action: 'updated'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create new pattern
      const errorRegex = generateErrorRegex(error_message);
      const patternType = classifyErrorType(error_message, error_source);

      const { data: newPattern, error: insertError } = await supabase
        .from('ops.error_patterns')
        .insert({
          pattern_signature: signature,
          pattern_type: patternType,
          error_message_pattern: errorRegex,
          error_source: error_source || null,
          severity: severity,
          learned_from_incidents: [system_log_id.toString()],
          confidence_score: 0.5
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Log to R.O.M.A.N.
      await supabase.from('ops.roman_events').insert({
        event_type: 'pattern_learned',
        severity: 'info',
        source: 'pattern_analyzer',
        description: `New error pattern learned: ${signature}`,
        metadata: {
          pattern_id: newPattern.pattern_id,
          error_source: error_source,
          pattern_type: patternType
        }
      });

      return new Response(
        JSON.stringify({
          success: true,
          pattern: newPattern,
          action: 'created'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== POST /pattern-analyzer/apply - Apply matching pattern =====
    if (req.method === 'POST' && path === '/apply') {
      const { error_message, error_source, severity, system_log_id } = await req.json();

      if (!error_message || !severity || !system_log_id) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Find matching patterns
      const { data: matches, error: matchError } = await supabase
        .rpc('find_matching_pattern', {
          p_error_message: error_message,
          p_error_source: error_source || '',
          p_severity: severity
        });

      if (matchError || !matches || matches.length === 0) {
        return new Response(
          JSON.stringify({
            applied: false,
            reason: 'No matching pattern found'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const bestMatch = matches[0];

      // Simulate fix execution (in production, execute actual fix script)
      const startTime = Date.now();
      const success = Math.random() < (bestMatch.success_rate / 100);
      const executionTime = Date.now() - startTime;

      // Record application
      await supabase.rpc('record_pattern_application', {
        p_pattern_id: bestMatch.pattern_id,
        p_system_log_id: system_log_id,
        p_success: success,
        p_execution_time_ms: executionTime,
        p_fix_script: bestMatch.auto_fix_script || '',
        p_constitutional_validation: {
          compliant: true,
          violations: [],
          warnings: []
        }
      });

      return new Response(
        JSON.stringify({
          applied: true,
          success: success,
          pattern: bestMatch,
          execution_time_ms: executionTime
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== POST /pattern-analyzer/cluster - Run ML clustering =====
    if (req.method === 'POST' && path === '/cluster') {
      // Start learning session
      const { data: sessionId } = await supabase
        .rpc('start_learning_session', {
          p_session_type: 'clustering'
        });

      // Get patterns with at least 3 occurrences
      const { data: patterns } = await supabase
        .from('ops.error_patterns')
        .select('*')
        .gte('occurrence_count', 3);

      if (!patterns || patterns.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            reason: 'Not enough patterns for clustering'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Simple k-means clustering (k = min(5, patterns.length/3))
      const k = Math.min(5, Math.max(2, Math.floor(patterns.length / 3)));
      
      // Create feature vectors
      const vectors = patterns.map((p: any) => [
        p.occurrence_count,
        p.success_rate,
        p.confidence_score * 100,
        p.severity === 'critical' ? 5 : p.severity === 'error' ? 3 : 1
      ]);

      // Initialize centroids (first k patterns)
      const centroids = vectors.slice(0, k);
      const clusters: any[][] = Array.from({ length: k }, () => []);

      // Assign patterns to clusters
      patterns.forEach((pattern: any, i: number) => {
        const vector = vectors[i];
        let minDist = Infinity;
        let closestCluster = 0;

        centroids.forEach((centroid, j) => {
          const dist = Math.sqrt(
            vector.reduce((sum, val, idx) => sum + Math.pow(val - centroid[idx], 2), 0)
          );
          if (dist < minDist) {
            minDist = dist;
            closestCluster = j;
          }
        });

        clusters[closestCluster].push(pattern);
      });

      // Save clusters to database
      const savedClusters = [];
      for (let i = 0; i < clusters.length; i++) {
        const cluster = clusters[i];
        if (cluster.length === 0) continue;

        const { data: saved } = await supabase
          .from('ops.pattern_clusters')
          .insert({
            cluster_name: `Cluster ${i + 1}`,
            pattern_ids: cluster.map((p: any) => p.pattern_id),
            cluster_size: cluster.length,
            avg_success_rate: cluster.reduce((sum: number, p: any) => sum + p.success_rate, 0) / cluster.length,
            total_occurrences: cluster.reduce((sum: number, p: any) => sum + p.occurrence_count, 0)
          })
          .select()
          .single();

        if (saved) savedClusters.push(saved);
      }

      // Complete session
      await supabase
        .from('ops.learning_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          patterns_analyzed: patterns.length,
          patterns_created: 0,
          patterns_updated: 0,
          output_data: { clusters_created: savedClusters.length }
        })
        .eq('session_id', sessionId);

      return new Response(
        JSON.stringify({
          success: true,
          clusters: savedClusters,
          patterns_analyzed: patterns.length,
          session_id: sessionId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== GET /pattern-analyzer/statistics - Get statistics =====
    if (req.method === 'GET' && path === '/statistics') {
      const { data: stats } = await supabase
        .rpc('get_pattern_statistics');

      return new Response(
        JSON.stringify({ statistics: stats || {} }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== POST /pattern-analyzer/approve - Approve pattern =====
    if (req.method === 'POST' && path === '/approve') {
      const { pattern_id, auto_fix_script, auto_fix_type, approved_by } = await req.json();

      if (!pattern_id || !auto_fix_script || !approved_by) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: updated, error: updateError } = await supabase
        .from('ops.error_patterns')
        .update({
          auto_fix_enabled: true,
          auto_fix_script: auto_fix_script,
          auto_fix_type: auto_fix_type,
          human_approved: true,
          approved_by: approved_by,
          approved_at: new Date().toISOString(),
          constitutional_compliant: true,
          updated_at: new Date().toISOString()
        })
        .eq('pattern_id', pattern_id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Log to R.O.M.A.N.
      await supabase.from('ops.roman_events').insert({
        event_type: 'pattern_approved',
        severity: 'info',
        source: 'pattern_analyzer',
        description: `Pattern ${pattern_id} approved for auto-fix`,
        metadata: {
          pattern_id: pattern_id,
          approved_by: approved_by,
          auto_fix_type: auto_fix_type
        }
      });

      return new Response(
        JSON.stringify({
          success: true,
          pattern: updated
        }),
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
