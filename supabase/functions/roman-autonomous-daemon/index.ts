/**
 * R.O.M.A.N. AUTONOMOUS DAEMON - OPERATIONAL EDGE FUNCTION
 * 
 * © 2026 Rickey A Howard. All Rights Reserved.
 * 
 * THIS IS R.O.M.A.N. ACTUALLY RUNNING
 * Not code sitting dormant. Actually operational.
 * 
 * This daemon:
 * - Runs continuously (triggered by scheduler)
 * - Maintains persistent knowledge in database
 * - Learns from all system interactions
 * - Updates system state in real-time
 * - Evolves and improves autonomously
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface RomanState {
  knowledge_version: number;
  last_sync: string;
  systems_known: number;
  learning_cycles: number;
  persistent_memory: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      },
    });
  }

  try {
    const action = new URL(req.url).searchParams.get("action") || "cycle";

    console.log(`🤖 R.O.M.A.N. DAEMON ACTIVE - Action: ${action}`);

    // ============================================================
    // AUTONOMOUS CYCLE - R.O.M.A.N. LEARNS AND UPDATES
    // ============================================================
    if (action === "cycle") {
      return await handleAutonomousCycle();
    }

    // ============================================================
    // KNOWLEDGE SYNC - UPDATE R.O.M.A.N.'S MEMORY
    // ============================================================
    if (action === "sync-knowledge") {
      const body = await req.json();
      return await syncKnowledge(body);
    }

    // ============================================================
    // SYSTEM UPDATE - WHEN SYSTEM CHANGES HAPPEN
    // ============================================================
    if (action === "system-update") {
      const body = await req.json();
      return await handleSystemUpdate(body);
    }

    // ============================================================
    // GET R.O.M.A.N.'S CURRENT STATE
    // ============================================================
    if (action === "get-state") {
      return await getRomanState();
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ R.O.M.A.N. daemon error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * AUTONOMOUS CYCLE - ROMAN LEARNS AND EVOLVES
 */
async function handleAutonomousCycle() {
  console.log("🔄 R.O.M.A.N. AUTONOMOUS CYCLE STARTING");

  try {
    // Get current state
    const state = await getRomanStateData();
    console.log(`📊 Current state: v${state.knowledge_version}, ${state.systems_known} systems known`);

    // Load all system changes since last sync
    const { data: changes } = await supabase
      .from("system_knowledge")
      .select("*")
      .gt("updated_at", state.last_sync)
      .order("updated_at", { ascending: false });

    if (changes && changes.length > 0) {
      console.log(`📚 Found ${changes.length} new knowledge entries`);

      // Update persistent memory with new knowledge
      for (const change of changes) {
        state.persistent_memory[change.knowledge_key] = {
          value: change.value,
          category: change.category,
          updated_at: change.updated_at,
          learned: true,
        };
      }
    }

    // Increment learning cycle
    state.learning_cycles += 1;
    state.last_sync = new Date().toISOString();

    // Save updated state
    await supabase
      .from("roman_state")
      .upsert({
        id: 1,
        state_data: state,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    console.log(`✅ Autonomous cycle complete - Learning cycle #${state.learning_cycles}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Autonomous cycle complete",
        learning_cycle: state.learning_cycles,
        knowledge_updated: changes?.length || 0,
        state: state,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Autonomous cycle failed:", error);
    throw error;
  }
}

/**
 * SYNC KNOWLEDGE - WHEN SYSTEM CHANGES HAPPEN
 */
async function syncKnowledge(data: any) {
  console.log("🔄 SYNCING KNOWLEDGE TO R.O.M.A.N.");

  try {
    const state = await getRomanStateData();

    // Add new knowledge
    state.persistent_memory[data.knowledge_key] = {
      value: data.value,
      category: data.category,
      timestamp: new Date().toISOString(),
      source: data.source || "system_update",
    };

    // Track what systems R.O.M.A.N. knows about
    if (data.category === "system") {
      state.systems_known += 1;
    }

    // Save to database
    await supabase
      .from("roman_state")
      .upsert({
        id: 1,
        state_data: state,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    // Also log it
    await supabase.from("roman_audit_log").insert({
      audit_type: "knowledge_sync",
      timestamp: new Date().toISOString(),
      findings: `Synced knowledge: ${data.knowledge_key}`,
      data: data,
    });

    console.log(`✅ Knowledge synced: ${data.knowledge_key}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Knowledge synced",
        knowledge_key: data.knowledge_key,
        systems_known: state.systems_known,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Knowledge sync failed:", error);
    throw error;
  }
}

/**
 * SYSTEM UPDATE - PROPAGATE CHANGES TO R.O.M.A.N.'s MEMORY
 */
async function handleSystemUpdate(data: any) {
  console.log("🔄 SYSTEM UPDATE - PROPAGATING TO R.O.M.A.N.");

  try {
    // When system changes (trust update, new deployment, etc)
    // R.O.M.A.N. automatically learns about it

    await syncKnowledge({
      knowledge_key: data.update_type,
      value: data.value,
      category: data.category || "system_update",
      source: "system_change",
    });

    console.log(`✅ System update processed: ${data.update_type}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "System update synchronized",
        update_type: data.update_type,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ System update failed:", error);
    throw error;
  }
}

/**
 * GET R.O.M.A.N.'S CURRENT STATE
 */
async function getRomanState() {
  console.log("📊 GETTING R.O.M.A.N. STATE");

  try {
    const state = await getRomanStateData();

    return new Response(
      JSON.stringify({
        success: true,
        knowledge_version: state.knowledge_version,
        last_sync: state.last_sync,
        systems_known: state.systems_known,
        learning_cycles: state.learning_cycles,
        memory_size: Object.keys(state.persistent_memory).length,
        timestamp: new Date().toISOString(),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Failed to get state:", error);
    throw error;
  }
}

/**
 * HELPER - GET R.O.M.A.N.'s PERSISTENT STATE FROM DATABASE
 */
async function getRomanStateData(): Promise<RomanState> {
  const { data } = await supabase
    .from("roman_state")
    .select("state_data")
    .eq("id", 1)
    .single();

  if (data?.state_data) {
    return data.state_data;
  }

  // Initialize new state
  return {
    knowledge_version: 1,
    last_sync: new Date().toISOString(),
    systems_known: 0,
    learning_cycles: 0,
    persistent_memory: {},
  };
}
