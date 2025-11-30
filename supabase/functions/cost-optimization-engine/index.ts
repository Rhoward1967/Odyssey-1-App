// Supabase Edge Function: cost-optimization-engine
// Reads API keys from environment variables and returns cost/budget data for OpenAI, Anthropic, HuggingFace, Replicate
// Add your own API logic as needed. This is a secure backend-only function.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Helper to fetch cost data from OpenAI (example)
async function fetchOpenAICost(apiKey: string) {
  // OpenAI provides usage info at https://api.openai.com/v1/dashboard/billing/usage
  // and subscription info at https://api.openai.com/v1/dashboard/billing/subscription
  // We'll fetch both for a complete picture
  const usageRes = await fetch("https://api.openai.com/v1/dashboard/billing/usage?start_date=2025-11-01&end_date=2025-11-28", {
    headers: { "Authorization": `Bearer ${apiKey}` }
  });
  const usageData = usageRes.ok ? await usageRes.json() : null;

  const subRes = await fetch("https://api.openai.com/v1/dashboard/billing/subscription", {
    headers: { "Authorization": `Bearer ${apiKey}` }
  });
  const subData = subRes.ok ? await subRes.json() : null;

  return {
    provider: "OpenAI",
    monthlySpent: usageData?.total_usage ? usageData.total_usage / 100 : 0, // OpenAI returns cents
    hardLimitUsd: subData?.hard_limit_usd ?? null,
    usage: usageData,
    subscription: subData
  };
}

// Helper to fetch cost data from Anthropic (example)
// Anthropic does not currently provide a public billing API. This is a placeholder.
function fetchAnthropicCost(apiKey: string) {
  // If Anthropic adds a billing endpoint, implement it here.
  return { provider: "Anthropic", monthlySpent: null, usage: null, note: "No public billing API" };
}

// Helper to fetch cost data from HuggingFace (example)
// HuggingFace does not provide a public billing API for usage/costs. This is a placeholder.
function fetchHuggingFaceCost(apiKey: string) {
  // If HuggingFace adds a billing endpoint, implement it here.
  return { provider: "HuggingFace", monthlySpent: null, usage: null, note: "No public billing API" };
}

// Helper to fetch cost data from Replicate (example)
// Replicate provides usage via https://api.replicate.com/v1/account/usage
async function fetchReplicateCost(apiKey: string) {
  const usageRes = await fetch("https://api.replicate.com/v1/account/usage", {
    headers: { "Authorization": `Token ${apiKey}` }
  });
  const usageData = usageRes.ok ? await usageRes.json() : null;
  return {
    provider: "Replicate",
    monthlySpent: usageData?.total_usage?.amount ?? null,
    usage: usageData
  };
}


serve(async (req) => {
  // Read API keys from environment variables
  const apiKeys = {
    OPENAI_API_KEY: Deno.env.get("OPENAI_API_KEY") || null,
    ANTHROPIC_API_KEY: Deno.env.get("ANTHROPIC_API_KEY") || null,
    HUGGINGFACE_API_TOKEN: Deno.env.get("HUGGINGFACE_API_TOKEN") || null,
    REPLICATE_API_TOKEN: Deno.env.get("REPLICATE_API_TOKEN") || null,
    // Add more as needed
  };

  // Fetch cost/usage for each provider
  const [openai, anthropic, huggingface, replicate] = await Promise.all([
    apiKeys.OPENAI_API_KEY ? fetchOpenAICost(apiKeys.OPENAI_API_KEY) : null,
    apiKeys.ANTHROPIC_API_KEY ? fetchAnthropicCost(apiKeys.ANTHROPIC_API_KEY) : null,
    apiKeys.HUGGINGFACE_API_TOKEN ? fetchHuggingFaceCost(apiKeys.HUGGINGFACE_API_TOKEN) : null,
    apiKeys.REPLICATE_API_TOKEN ? fetchReplicateCost(apiKeys.REPLICATE_API_TOKEN) : null,
  ]);

  // Aggregate costs and usage
  let dailySpent = 0;
  let monthlySpent = 0;
  let apiCosts = 0;
  const monthlyBudget = 1000; // Default, can be set from env or config
  const providerBreakdown: Record<string, any> = {};

  if (openai) {
    providerBreakdown["openai"] = {
      cost: openai.monthlySpent || 0,
      usage: openai.usage || null,
      details: openai
    };
    monthlySpent += openai.monthlySpent || 0;
    apiCosts += openai.monthlySpent || 0;
  }
  if (replicate) {
    providerBreakdown["replicate"] = {
      cost: replicate.monthlySpent || 0,
      usage: replicate.usage || null,
      details: replicate
    };
    monthlySpent += replicate.monthlySpent || 0;
    apiCosts += replicate.monthlySpent || 0;
  }
  if (anthropic) {
    providerBreakdown["anthropic"] = {
      cost: anthropic.monthlySpent || 0,
      usage: anthropic.usage || null,
      details: anthropic
    };
    // No cost data for Anthropic
  }
  if (huggingface) {
    providerBreakdown["huggingface"] = {
      cost: huggingface.monthlySpent || 0,
      usage: huggingface.usage || null,
      details: huggingface
    };
    // No cost data for HuggingFace
  }

  // For demo: dailySpent is monthlySpent / 30
  dailySpent = monthlySpent / 30;

  return new Response(
    JSON.stringify({
      dailySpent,
      monthlySpent,
      monthlyBudget,
      apiCosts,
      providerBreakdown,
      updatedAt: new Date().toISOString(),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
