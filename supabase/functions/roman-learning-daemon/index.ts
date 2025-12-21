// ============================================================
// R.O.M.A.N. LEARNING DAEMON v3.4
// ============================================================
// DESCRIPTION: Autonomous research engine for R.O.M.A.N. to ingest
// external knowledge from arXiv, Wikipedia, and PubMed.
// UPDATES (v3.4): Migrated to public schema for SDK compatibility
// ============================================================

import { createClient } from "npm:@supabase/supabase-js@2.46.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

// ============================================================
// DATABASE HELPERS
// ============================================================

async function getTopics() {
  const { data, error } = await supabase
    .from("authorized_topics")
    .select("*")
    .eq("is_active", true)
    .order("last_researched_at", { ascending: true, nullsFirst: true })
    .limit(3);
  
  if (error) throw error;
  return data ?? [];
}

async function initLog(topics: string[]) {
  const { data, error } = await supabase
    .from("autonomous_learning_log")
    .insert({
      topics_covered: topics,
      status: "in_progress",
      counts: {},
      started_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function finalizeLog(logId: string, status: string, counts: any, errorLog?: string) {
  await supabase
    .from("autonomous_learning_log")
    .update({
      status,
      counts,
      error_log: errorLog,
      finished_at: new Date().toISOString(),
    })
    .eq("id", logId);
}

async function insertExternalKnowledge(source: string, title: string, topic: string, url: string, metadata: any) {
  await supabase
    .from("external_knowledge")
    .insert({
      source,
      title,
      topic,
      url,
      metadata,
    });
}

async function updateTopicTimestamp(topic: string) {
  await supabase
    .from("authorized_topics")
    .update({ last_researched_at: new Date().toISOString() })
    .eq("topic", topic);
}

// ============================================================
// EXTERNAL API RESEARCH ENGINES
// ============================================================

async function researchArxiv(query: string) {
  try {
    const resp = await fetch(
      `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=3`
    );
    const text = await resp.text();
    
    if (text.includes("<entry>")) {
      const titleMatch = text.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1].replace(/\n/g, " ").trim() : `arXiv Research: ${query}`;
      
      await insertExternalKnowledge(
        "arxiv",
        title,
        query,
        `https://arxiv.org/search/?query=${encodeURIComponent(query)}`,
        { raw_snippet: text.slice(0, 1000), academic_source: "arXiv.org" }
      );
      return 1;
    }
  } catch (e) {
    console.error("arXiv failure:", query, e);
  }
  return 0;
}

async function researchWikipedia(query: string) {
  try {
    const resp = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&origin=*`
    );
    const data = await resp.json();
    const first = data?.query?.search?.[0];
    
    if (first) {
      const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(first.title.replace(/\s+/g, "_"))}`;
      await insertExternalKnowledge(
        "wikipedia",
        first.title,
        query,
        wikiUrl,
        { snippet: first.snippet || "", search_score: first.score ?? 0 }
      );
      return 1;
    }
  } catch (e) {
    console.error("Wikipedia failure:", query, e);
  }
  return 0;
}

async function researchPubMed(query: string) {
  try {
    const resp = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=2&term=${encodeURIComponent(query)}`
    );
    const data = await resp.json();
    const ids: string[] = data?.esearchresult?.idlist ?? [];
    
    if (ids.length) {
      await insertExternalKnowledge(
        "pubmed",
        `NCBI Clinical Findings: ${query}`,
        query,
        `https://pubmed.ncbi.nlm.nih.gov/${ids[0]}/`,
        { pubmed_ids: ids, total_results: data.esearchresult.count }
      );
      return 1;
    }
  } catch (e) {
    console.error("PubMed failure:", query, e);
  }
  return 0;
}

async function performResearch(topic: string) {
  const counts = {
    arxiv: await researchArxiv(topic),
    wikipedia: await researchWikipedia(topic),
    pubmed: await researchPubMed(topic),
  };
  await updateTopicTimestamp(topic);
  return counts;
}

// ============================================================
// ACTIONS
// ============================================================

async function handleTargetedResearch(topic: string, trigger: string) {
  const log = await initLog([topic]);
  
  try {
    const counts = await performResearch(topic);
    await finalizeLog(log.id, "completed", { ...counts, trigger_source: trigger });
    
    return {
      ok: true,
      topic,
      counts,
      log_id: log.id,
      message: `Targeted research completed for: ${topic}`,
    };
  } catch (error: any) {
    await finalizeLog(log.id, "failed", {}, error.message);
    throw error;
  }
}

async function handleQuery(question: string) {
  const { data, error } = await supabase
    .from("learned_insights")
    .select("*")
    .ilike("insight_summary", `%${question}%`)
    .limit(5);
  
  if (error) throw error;
  
  return {
    ok: true,
    question,
    matches: data?.length ?? 0,
    insights: data ?? [],
  };
}

async function handleAutonomousCycle(trigger: string) {
  const topics = await getTopics();
  if (!topics.length) {
    return { ok: true, message: "No active topics to research" };
  }
  
  const topicNames = topics.map((t) => t.topic);
  const log = await initLog(topicNames);
  
  try {
    const allCounts: any = { trigger_source: trigger };
    
    for (const topic of topics) {
      const counts = await performResearch(topic.topic);
      allCounts[topic.topic] = counts;
    }
    
    await finalizeLog(log.id, "completed", allCounts);
    
    return {
      ok: true,
      topics: topicNames,
      counts: allCounts,
      log_id: log.id,
      message: `Autonomous cycle completed for ${topicNames.length} topics`,
    };
  } catch (error: any) {
    await finalizeLog(log.id, "failed", {}, error.message);
    throw error;
  }
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, topic, question, trigger } = await req.json();

    // Health Check
    if (action === "health") {
      return new Response(
        JSON.stringify({ ok: true, status: "Cognitive core online", version: "v3.4", ts: new Date().toISOString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Targeted Research
    if (action === "targeted_research" && topic) {
      const result = await handleTargetedResearch(topic, trigger || "manual");
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Query
    if (action === "query" && question) {
      const result = await handleQuery(question);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Autonomous Cycle
    if (action === "autonomous_cycle") {
      const result = await handleAutonomousCycle(trigger || "scheduled");
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Handler error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
