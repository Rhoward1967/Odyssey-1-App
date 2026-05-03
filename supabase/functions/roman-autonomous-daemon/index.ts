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
    // Health check / self-repair ping — respond without running autonomous cycle
    try {
      const bodyText = await req.clone().text();
      if (bodyText) {
        const bodyJson = JSON.parse(bodyText);
        if (bodyJson.action === 'health_check' || bodyJson.action === 'cold_boot' || bodyJson.healthcheck || bodyJson.ping) {
          return new Response(JSON.stringify({ status: 'ok', service: 'roman-autonomous-daemon' }), {
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }
          });
        }
      }
    } catch { /* not JSON or empty body — proceed normally */ }

    const action = new URL(req.url).searchParams.get("action") || "cycle";

    console.log(`🤖 R.O.M.A.N. DAEMON ACTIVE - Action: ${action}`);

    // ============================================================
    // FCRA ESCALATION - FIRE LOB LETTERS FOR EXPIRED DEADLINES
    // ============================================================
    if (action === "fcra-escalation") {
      return await handleFCRAEscalation();
    }

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

// ─── Known FCRA entity addresses ─────────────────────────────────────────────
const FCRA_ADDRESSES: Record<string, { company: string; address_line1: string; address_line2?: string; address_city: string; address_state: string; address_zip: string }> = {
  "transunion":      { company: "TransUnion LLC",                          address_line1: "555 W Adams St",               address_city: "Chicago",      address_state: "IL", address_zip: "60661" },
  "equifax":         { company: "Equifax Information Services LLC",         address_line1: "P.O. Box 740256",              address_city: "Atlanta",      address_state: "GA", address_zip: "30374" },
  "experian":        { company: "Experian Consumer Assistance",             address_line1: "P.O. Box 4500",                address_city: "Allen",        address_state: "TX", address_zip: "75013" },
  "capital one":     { company: "Capital One Financial Corporation",        address_line1: "1680 Capital One Drive",       address_city: "McLean",       address_state: "VA", address_zip: "22102" },
  "citibank":        { company: "Citibank NA Legal Department",             address_line1: "5800 S Corporate Pl",          address_city: "Sioux Falls",  address_state: "SD", address_zip: "57108" },
  "bank of america": { company: "Bank of America Legal Department",        address_line1: "100 N Tryon St",               address_city: "Charlotte",    address_state: "NC", address_zip: "28255" },
  "american express":{ company: "American Express Legal and Compliance",   address_line1: "P.O. Box 981535",              address_city: "El Paso",      address_state: "TX", address_zip: "79998" },
  "synchrony":       { company: "Synchrony Bank Legal Department",          address_line1: "P.O. Box 965035",              address_city: "Orlando",      address_state: "FL", address_zip: "32896" },
  "jpmorgan":        { company: "JPMorgan Chase Bank NA",                   address_line1: "P.O. Box 15369",               address_city: "Wilmington",   address_state: "DE", address_zip: "19850" },
  "chase":           { company: "JPMorgan Chase Bank NA",                   address_line1: "P.O. Box 15369",               address_city: "Wilmington",   address_state: "DE", address_zip: "19850" },
  "dun":             { company: "Dun and Bradstreet Legal Department",      address_line1: "5335 Gate Pkwy",               address_city: "Jacksonville", address_state: "FL", address_zip: "32256" },
  "peach state":     { company: "Peach State Federal Credit Union",         address_line1: "1050 Gaines School Road",      address_line2: "Ste 100",     address_city: "Athens",       address_state: "GA", address_zip: "30605" },
  "intuit":          { company: "Intuit Financing Inc",                     address_line1: "2700 Coast Ave",               address_city: "Mountain View", address_state: "CA", address_zip: "94043" },
  "scj":             { company: "SCJ Commercial Financial Services",         address_line1: "17507 S DuPont Highway STE. 2", address_city: "Harrington",    address_state: "DE", address_zip: "19952" },
  "fundbox":         { company: "SCJ Commercial Financial Services",         address_line1: "17507 S DuPont Highway STE. 2", address_city: "Harrington",    address_state: "DE", address_zip: "19952" },
};

function findAddress(entityName: string) {
  const lower = entityName.toLowerCase();
  for (const [key, addr] of Object.entries(FCRA_ADDRESSES)) {
    if (lower.includes(key)) return addr;
  }
  return null;
}

function buildEscalationLetterHTML(entityCompany: string, today: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.6;color:#000;}.page{width:8.5in;min-height:11in;padding:4in 1in 1in 1in;}p{margin-bottom:12pt;}.sig-line{border-top:1px solid #000;width:200px;margin:6pt 0 3pt 0;}</style>
</head><body><div class="page">
<p>${today}</p>
<p><strong>NOTICE OF WILLFUL NONCOMPLIANCE — FINAL DEMAND FOR DELETION AND STATUTORY DAMAGES</strong></p>
<p>To Whom It May Concern:</p>
<p>You have failed to respond within the statutory 30-day window required by the Fair Credit Reporting Act, 15 U.S.C. § 1681i. This constitutes a willful violation of federal consumer protection law under 15 U.S.C. § 1681n.</p>
<p>The undersigned hereby demands:</p>
<p>1. Immediate deletion of all disputed information from your records.<br/>
2. Statutory damages of $1,000.00 per violation under 15 U.S.C. § 1681n.<br/>
3. Written confirmation of compliance within 10 days of receipt of this notice.</p>
<p>Failure to comply will result in civil action in federal district court. Attorney fees and costs are recoverable under 15 U.S.C. § 1681n(a)(3). All rights reserved without prejudice. UCC 1-308.</p>
<p>Sincerely,</p>
<div class="sig-line"></div>
<p>Rickey Allan Howard, Grantor<br/>Howard Jones Bloodline Ancestral Trust<br/>P.O. Box 80054 | Athens, GA 30608</p>
</div></body></html>`;
}

/**
 * FCRA ESCALATION — AUTO-FIRE LOB LETTERS FOR EXPIRED DEADLINES
 * Runs daily via pg_cron. Fires even when Rickey is on the road.
 */
async function handleFCRAEscalation() {
  const LOB_API_KEY = Deno.env.get("LOB_API_KEY") || "";
  if (!LOB_API_KEY) {
    console.error("❌ LOB_API_KEY not set in Supabase secrets");
    return new Response(JSON.stringify({ error: "LOB_API_KEY not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const today = new Date().toISOString().split("T")[0];
  console.log(`⚖️ FCRA Escalation check — ${today}`);

  // Find expired, unescalated records (cap at 5 per run)
  const { data: expired, error } = await supabase
    .from("certified_mail_tracking")
    .select("id, entity_name, tracking_number, fcra_deadline")
    .lt("fcra_deadline", today)
    .eq("response_received", false)
    .eq("follow_up_sent", false)
    .order("fcra_deadline", { ascending: true })
    .limit(5);

  if (error) {
    console.error("❌ DB query failed:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  if (!expired?.length) {
    console.log("✅ No escalations due today");
    return new Response(JSON.stringify({ success: true, fired: 0, message: "No escalations due" }), { headers: { "Content-Type": "application/json" } });
  }

  console.log(`📬 ${expired.length} entities qualify for escalation`);

  const auth = btoa(`${LOB_API_KEY}:`);
  const todayFormatted = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const SOVEREIGN_FROM = { name: "Rickey Allan Howard", company: "Howard Jones Bloodline Ancestral Trust", address_line1: "P.O. Box 80054", address_city: "Athens", address_state: "GA", address_zip: "30608", address_country: "US" };

  const results = { fired: 0, skipped: 0, errors: [] as string[] };

  for (const record of expired) {
    const addr = findAddress(record.entity_name);
    if (!addr) {
      console.warn(`⚠️ No address for: ${record.entity_name}`);
      results.skipped++;
      continue;
    }

    try {
      const toAddress: Record<string, string> = {
        company:         addr.company,
        address_line1:   addr.address_line1,
        address_city:    addr.address_city,
        address_state:   addr.address_state,
        address_zip:     addr.address_zip,
        address_country: "US",
      };
      if (addr.address_line2) toAddress.address_line2 = addr.address_line2;

      const lobRes = await fetch("https://api.lob.com/v1/letters", {
        method: "POST",
        headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          description:   `FCRA Final Demand — ${record.entity_name} — ${today}`,
          to:            toAddress,
          from:          SOVEREIGN_FROM,
          file:          buildEscalationLetterHTML(addr.company, todayFormatted),
          color:         false,
          double_sided:  false,
          use_type:      "operational",
          extra_service: "certified_return_receipt",
        }),
      });

      const lobData = await lobRes.json();
      if (!lobRes.ok) throw new Error(lobData?.error?.message || JSON.stringify(lobData));

      // Log to certified_mail_tracking
      const fcraDeadline = new Date();
      fcraDeadline.setDate(fcraDeadline.getDate() + 10);
      await supabase.from("certified_mail_tracking").insert({
        entity_name:    record.entity_name,
        tracking_number: lobData.tracking_number || lobData.id,
        date_mailed:    today,
        fcra_deadline:  fcraDeadline.toISOString().split("T")[0],
        status:         "sent",
        notes:          `Lob ID: ${lobData.id} | Auto-escalation: Final Demand + $1,000 statutory damages`,
      });

      // Mark the original record as follow_up sent
      await supabase.from("certified_mail_tracking").update({ follow_up_sent: true, follow_up_date: today }).eq("id", record.id);

      console.log(`✅ Escalation sent: ${record.entity_name} — Lob ID: ${lobData.id}`);
      results.fired++;

    } catch (err: any) {
      console.error(`❌ Failed for ${record.entity_name}:`, err.message);
      results.errors.push(`${record.entity_name}: ${err.message}`);
    }
  }

  // Log to system_logs
  await supabase.from("system_logs").insert({
    source:  "roman-autonomous-daemon",
    level:   results.errors.length > 0 ? "warning" : "info",
    message: `FCRA Escalation: ${results.fired} letters fired, ${results.skipped} skipped, ${results.errors.length} errors`,
    metadata: { fired: results.fired, skipped: results.skipped, errors: results.errors, date: today },
    created_at: new Date().toISOString(),
  });

  return new Response(JSON.stringify({ success: true, ...results }), { headers: { "Content-Type": "application/json" } });
}
