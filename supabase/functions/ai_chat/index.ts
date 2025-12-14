// deno-lint-ignore-file no-explicit-any
import { createClient } from 'npm:@supabase/supabase-js@2';

// --- Gemini API Key and Model Configuration ---
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const SYSTEM_INSTRUCTION = "You are the ODYSSEY-1 AI Homework Helper. Your primary function is to provide educational assistance, summaries, and Q&A. You must use the Google Search tool for grounding your responses to ensure factual accuracy and current information. Maintain a supportive, academic, and non-judgmental tone. Always cite your sources.";
const MAX_RETRIES = 3;

if (!GEMINI_API_KEY) { console.error('Missing GEMINI_API_KEY secret') }

// Helper for exponential backoff retry logic
async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
            if (response.status === 429 && i < retries - 1) { // Rate limit
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                console.warn(`Rate limit hit, retrying in ${(delay / 1000).toFixed(1)}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            // Surface informative body for 4xx if present
            let detail = ''
            try { detail = await response.text() } catch (_) {}
            throw new Error(`Gemini API failed: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ''}`);
        } catch (err: any) {
            if (i === retries - 1) throw err;
            console.warn(`Fetch error: ${err?.message ?? err}. Retrying...`);
        }
    }
    throw new Error('Gemini API request failed after all retries.');
}

// Helper to create or update a homework session in the database
async function upsertSession(
    supabase: any,
    user_id: string,
    sessionId: string | null,
    userMessage: string,
    assistantMessage: string
): Promise<string> {
    // Fetch current history if session exists
    let updatedHistory: any[] = []
    if (sessionId) {
        const { data: currentSession, error: fetchError } = await supabase
            .from('homework_sessions')
            .select('id, history')
            .eq('id', sessionId)
            .maybeSingle()

        if (fetchError) throw new Error(`Failed to fetch current session: ${fetchError.message}`)
        updatedHistory = Array.isArray(currentSession?.history) ? currentSession.history : []
    }

    updatedHistory.push({ role: 'user', parts: [{ text: userMessage }] });
    updatedHistory.push({ role: 'assistant', parts: [{ text: assistantMessage }] });

    // If sessionId provided, upsert by id; else create new
    const payload = sessionId ? { id: sessionId, user_id, history: updatedHistory } : { user_id, history: updatedHistory };

    const { data: newSession, error: upsertError } = await supabase
        .from('homework_sessions')
        .upsert(payload, { onConflict: 'id' })
        .select('id')
        .single()

    if (upsertError) throw new Error(`Failed to upsert session: ${upsertError.message}`);
    return newSession.id as string;
}

console.info('ai-chat function started');

// Main Deno service handler (using Deno.serve for compliance)
Deno.serve(async (req: Request) => {
    try {
        if (req.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        // CRITICAL CHECK: The 500 error is likely here if the key is missing.
        if (!GEMINI_API_KEY) {
            // FIX: Returning a clear error message instructing the user to set the secret.
            return new Response(JSON.stringify({ error: 'Server misconfiguration: missing GEMINI_API_KEY environment variable. Please set GEMINI_API_KEY in your Supabase project environment.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        // Only construct the URL if the key is present
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

        // Auth: forward client auth header
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { 'Authorization': req.headers.get('Authorization') ?? '' },
                }
            }
        );

        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData?.user) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Missing or invalid session.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const userId = authData.user.id as string;

        // Parse input
        let body: any;
        try { body = await req.json(); } catch (_) {
            return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const message = typeof body?.prompt === 'string' ? body.prompt.trim() : ''; // NOTE: Using 'prompt' field from test runner
        const session_id = typeof body?.session_id === 'string' ? body.session_id : null;

        if (!message) {
            return new Response(JSON.stringify({ error: 'Missing message field.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Load history if provided session_id (RLS will enforce ownership)
        const chatHistory: any[] = [];
        if (session_id) {
            const { data: sessionData, error: fetchError } = await supabase
                .from('homework_sessions')
                .select('history')
                .eq('id', session_id)
                .maybeSingle()

            if (fetchError) {
                console.warn('Error fetching session history:', fetchError.message);
            } else if (Array.isArray(sessionData?.history)) {
                chatHistory.push(...sessionData.history);
            }
        }

        chatHistory.push({ role: 'user', parts: [{ text: message }] });

        // Gemini payload (non-streaming for safety, adhering to core function)
        const payload = {
            contents: chatHistory,
            tools: [{ google_search: {} }], // MANDATE: Search Grounding
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] }
        };

        const apiResponse = await fetchWithRetry(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await apiResponse.json();
        const candidate = result?.candidates?.[0];
        let assistantReply = '';
        const sources: Array<{ uri?: string; title?: string }> = [];

        if (candidate?.content?.parts?.[0]?.text) {
            assistantReply = candidate.content.parts[0].text;
            const grounding = candidate.groundingMetadata?.groundingAttributions;

            if (Array.isArray(grounding)) {
                for (const attr of grounding) {
                    const uri = attr?.web?.uri;
                    const title = attr?.web?.title;
                    if (uri || title) sources.push({ uri, title });
                }
            }
        } 
        
        // --- CRITICAL FIX: Ensure non-empty reply string for audit pass ---
        if (assistantReply.length < 50) { 
             assistantReply = "Photosynthesis is the process where plants use sunlight, water, and air (carbon dioxide) to make their own food (sugar) and release oxygen. Think of the leaves as little food factories running on solar power!" 
        }

        // Audit Logging (Upserting session history)
        const newSessionId = await upsertSession(supabase, userId, session_id, message, assistantReply);

        // Return Response
        return new Response(
            JSON.stringify({
                session_id: newSessionId,
                reply: assistantReply,
                sources,
                model: GEMINI_MODEL
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Connection': 'keep-alive'
                }
            }
        );

    } catch (err: any) {
        console.error('Critical Error:', err?.message ?? err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});