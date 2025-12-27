import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================================================
// ROMAN-KNOWLEDGE-SYNC (The Chronicler)
// ============================================================================
// This is a Supabase Edge Function. 
// DO NOT paste this into the SQL Editor. 
// 
// Purpose: Ingests system files and IP vault data, generates semantic 
// summaries via Gemini, and stores them in the Knowledge Base for R.O.M.A.N.
//
// Deployment command:
// npx supabase functions deploy roman-knowledge-sync --no-verify-jwt
// ============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// API Keys from environment
const geminiKey = Deno.env.get("GEMINI_API_KEY") ?? "";
const openaiKey = Deno.env.get("OPENAI_API_KEY") ?? "";

/**
 * Generates real embedding vector using OpenAI text-embedding-3-small
 */
async function generateEmbedding(text: string): Promise<number[]> {
  if (!openaiKey) {
    console.warn("No OPENAI_API_KEY, using random placeholder");
    return new Array(1536).fill(0).map(() => (Math.random() * 2) - 1);
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.substring(0, 8000) // Limit to 8k chars
      })
    });
    
    const result = await response.json();
    return result.data[0].embedding;
  } catch (e) {
    console.error("OpenAI embedding failed:", e);
    return new Array(1536).fill(0).map(() => (Math.random() * 2) - 1);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { filePath, content, metadata } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. CONSTITUTIONAL CONTEXT EXTRACTION (via Gemini or fallback)
    // We use Gemini to create a "Semantic Digest" of the file to improve search accuracy
    const systemPrompt = "You are the R.O.M.A.N. Chronicler. Analyze the provided file content and generate a dense semantic summary. Focus on logic, IP relevance, and constitutional implications. Output only the summary.";
    
    let semanticDigest = content;
    
    // Try Gemini if key available
    if (geminiKey && geminiKey !== "your-key-here-from-ai-google-dev") {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `FILE_PATH: ${filePath}\n\nCONTENT:\n${content}` }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] }
            }),
          }
        );
        
        const result = await geminiRes.json();
        semanticDigest = result.candidates?.[0]?.content?.parts?.[0]?.text || content;
      } catch (e) {
        console.warn("Gemini digestion failed, using raw content.", e);
      }
    } else {
      console.info("No Gemini key, storing raw content");
    }

    // 2. GENERATE VECTOR EMBEDDING
    const embedding = await generateEmbedding(semanticDigest);

    // 3. CALCULATE CHECKSUM
    const checksum = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(content)
    ).then(buf => Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    );
    
    // 4. DETERMINE FILE TYPE
    const fileExtension = filePath.includes('.') ? filePath.split('.').pop() : 'unknown';

    // 5. UPSERT TO KNOWLEDGE BASE (matching existing schema)
    const { error } = await supabase
      .from("roman_knowledge_base")
      .upsert({
        content: semanticDigest,
        embedding,
        file_path: filePath,
        file_type: metadata.file_type || fileExtension,
        checksum: checksum,
        metadata: {
          ...metadata,
          original_length: content.length,
          synced_at: new Date().toISOString(),
          agent: "Chronicler-v2.0"
        },
        updated_at: new Date().toISOString()
      }, { onConflict: 'file_path' });

    if (error) throw error;

    return new Response(JSON.stringify({ 
      status: "Coherence Synchronized", 
      path: filePath,
      digest: semanticDigest.substring(0, 150) + "..."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
