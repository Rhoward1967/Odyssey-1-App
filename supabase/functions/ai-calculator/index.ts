// Supabase Edge Function: ai-calculator
// Supports robust math evaluation and OpenAI fallback for natural language
import { serve } from 'std/server';

// Optionally use OpenAI for advanced queries
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

function safeEval(expr: string): string {
  // Very basic math parser (no eval!)
  try {
    // Only allow numbers, operators, parentheses, decimal points, and spaces
    if (!/^[0-9+\-*/(). %^\s]+$/.test(expr)) {
      return 'Invalid characters in expression.';
    }
    // eslint-disable-next-line no-new-func
    // Use Function constructor for simple math (not recommended for untrusted input in production)
    // For production, use a library like mathjs
    // @ts-ignore
    const result = Function(`'use strict'; return (${expr})`)();
    return String(result);
  } catch {
    return 'Could not evaluate expression.';
  }
}

async function aiAnswer(query: string): Promise<string> {
  if (!OPENAI_API_KEY) return 'AI not available.';
  const prompt = `You are a financial and math assistant. Answer the following as concisely as possible.\n\nQuestion: ${query}`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 128,
      temperature: 0.2,
    }),
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || 'No answer from AI.';
}

serve(async req => {
  const { query } = await req.json();
  if (!query || typeof query !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Missing or invalid query.' }),
      { status: 400 }
    );
  }
  // Try math evaluation first
  const mathResult = safeEval(query);
  if (!isNaN(Number(mathResult))) {
    return new Response(JSON.stringify({ answer: mathResult }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // Fallback to AI if not a pure math expression
  const aiResult = await aiAnswer(query);
  return new Response(JSON.stringify({ answer: aiResult }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
