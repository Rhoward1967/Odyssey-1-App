// bid-extract
// Takes raw text from a bid/proposal document, returns structured JSON
// (customer info + pricing + billing frequency) for review-and-save in the UI.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a bid/proposal extractor for HJS Services (janitorial). The user pastes the text of a bid or proposal document. Return ONLY valid JSON with this exact shape — no prose, no markdown fences:

{
  "customer_name": string | null,
  "contact_person": string | null,
  "contact_title": string | null,
  "email": string | null,
  "phone": string | null,
  "address": string | null,
  "city": string | null,
  "state": string | null,
  "zip": string | null,
  "bid_title": string | null,
  "billing_frequency": "one_time" | "weekly" | "monthly" | "quarterly" | "yearly" | null,
  "total_cents": number | null,
  "description": string | null,
  "notes": string | null
}

Rules:
- total_cents is the contract value in CENTS (multiply dollars by 100, round to integer). If the doc states monthly/quarterly value, multiply up to the full contract value matching the billing_frequency.
- billing_frequency: infer from language like "annual contract" → yearly, "per month" → monthly, "one-time deep clean" → one_time.
- If a field isn't in the document, set it to null. Don't invent.
- For customer_name, prefer the organization/agency name over a person's name.
- contact_person is the human contact (first+last). contact_title is their job title.
- Output ONLY the JSON object. No code fences, no commentary.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return new Response(JSON.stringify({ error: "Provide bid document text (min 20 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const truncated = text.slice(0, 60000); // safety cap

    const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: truncated }],
      }),
    });

    if (!anthropicResp.ok) {
      const errText = await anthropicResp.text();
      return new Response(JSON.stringify({ error: `Anthropic API error: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await anthropicResp.json();
    const raw = data?.content?.[0]?.text ?? "";

    // Strip code fences if model added them despite instruction
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

    let extracted;
    try {
      extracted = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ error: "Model returned non-JSON output", raw: cleaned }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ extracted, usage: data.usage ?? null }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
