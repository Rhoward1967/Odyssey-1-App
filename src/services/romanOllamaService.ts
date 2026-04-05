/**
 * R.O.M.A.N. OLLAMA SERVICE — Sovereign Local Brain
 * ===================================================
 * This is R.O.M.A.N.'s independent intelligence layer.
 * Runs on YOUR hardware. No corporate API. No data leaves the machine.
 *
 * Priority chain for all AI calls:
 *   1. Ollama (local, sovereign, free, private)
 *   2. Claude via Supabase edge (cloud backup)
 *   3. GPT-4o (last resort fallback)
 *
 * Hardware: F: drive (external SSD) — portable, pre-5090 setup
 * Models: llama3 (reasoning) | nomic-embed-text (embeddings)
 *
 * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
// nomic-embed-text produces 384-dimensional vectors (not 768)

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatResponse {
  model: string;
  message: OllamaMessage;
  done: boolean;
}

// ─── Health Check ────────────────────────────────────────────────────────────

/**
 * Check if Ollama is running on this machine.
 * Fast — 2 second timeout.
 */
export async function isOllamaRunning(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Get list of models currently downloaded in Ollama.
 */
export async function getOllamaModels(): Promise<string[]> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    const data = await res.json();
    return (data.models || []).map((m: any) => m.name);
  } catch {
    return [];
  }
}

// ─── Chat Inference ──────────────────────────────────────────────────────────

/**
 * Send a message to R.O.M.A.N.'s local brain (Ollama).
 * This is the primary inference call — sovereign, private, no API cost.
 */
export async function ollamaChat(
  messages: OllamaMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const model = options.model || OLLAMA_MODEL;
  const temperature = options.temperature ?? 0.3;

  const body = {
    model,
    messages,
    stream: false,
    options: {
      temperature,
      num_predict: options.maxTokens || 4096,
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000); // 2 min max

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama error ${res.status}: ${err}`);
    }

    const data: OllamaChatResponse = await res.json();
    return data.message?.content || '';
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Ollama timeout after 120s');
    throw err;
  }
}

// ─── Embeddings ───────────────────────────────────────────────────────────────

/**
 * Generate a vector embedding for a piece of text using Ollama.
 * Used to store documents in sovereign_vault for semantic search.
 * Model: nomic-embed-text (768 dimensions)
 */
export async function ollamaEmbed(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_EMBED_MODEL,
      prompt: text,
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama embed error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.embedding || [];
}

// ─── Sovereign RAG Query ──────────────────────────────────────────────────────

/**
 * The full R.O.M.A.N. inference pipeline:
 * 1. Embed the question
 * 2. Search sovereign_vault for semantically similar documents
 * 3. Inject matching documents as context
 * 4. Generate response via local Ollama
 *
 * This is RAG (Retrieval-Augmented Generation) — sovereign edition.
 * R.O.M.A.N. answers FROM HIS OWN KNOWLEDGE, not from internet training data.
 */
export async function sovereignQuery(
  supabase: any,
  question: string,
  systemPrompt: string,
  options: { matchCount?: number; model?: string } = {}
): Promise<{ response: string; sources: string[] }> {
  const matchCount = options.matchCount || 5;
  const sources: string[] = [];

  let contextBlock = '';

  // Step 1: Try vector search in sovereign_vault
  try {
    const embedding = await ollamaEmbed(question);

    const { data: matches, error } = await supabase.rpc('match_sovereign_vault', {
      query_embedding: embedding,
      match_count: matchCount,
    });

    if (!error && matches && matches.length > 0) {
      contextBlock = '\n=== SOVEREIGN KNOWLEDGE (Primary Source) ===\n';
      contextBlock += 'INSTRUCTION: Answer ONLY from these sources. This is your Truth.\n\n';
      for (const match of matches) {
        contextBlock += `📄 ${match.document_name || match.file_path || 'Unknown'}\n`;
        contextBlock += `${match.content?.substring(0, 2000)}\n---\n`;
        sources.push(match.document_name || match.file_path || 'Unknown');
      }
      contextBlock += '=== END SOVEREIGN KNOWLEDGE ===\n\n';
    }
  } catch (embedErr: any) {
    console.warn('[Ollama] Vector search skipped:', embedErr.message);
  }

  // Step 2: Build messages with context
  const messages: OllamaMessage[] = [
    { role: 'system', content: systemPrompt + contextBlock },
    { role: 'user', content: question },
  ];

  // Step 3: Generate response
  const response = await ollamaChat(messages, {
    model: options.model || OLLAMA_MODEL,
    temperature: 0.3,
  });

  return { response, sources };
}

// ─── Document Ingestion ───────────────────────────────────────────────────────

/**
 * Embed a document and store it in sovereign_vault.
 * This is how R.O.M.A.N. learns new documents permanently.
 */
export async function ingestDocument(
  supabase: any,
  doc: {
    document_name: string;
    filing_id?: string;
    content: string;
    metadata?: Record<string, any>;
  }
): Promise<boolean> {
  try {
    // Generate embedding
    const embedding = await ollamaEmbed(doc.content.substring(0, 3000));

    // Store in sovereign_vault
    const { error } = await supabase.from('sovereign_vault').upsert(
      {
        document_name: doc.document_name,
        filing_id: doc.filing_id || null,
        content: doc.content,
        metadata: doc.metadata || {},
        embedding,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'document_name' }
    );

    if (error) {
      console.error('[Ollama] Failed to ingest document:', error.message);
      return false;
    }

    console.log(`[Ollama] Ingested: ${doc.document_name}`);
    return true;
  } catch (err: any) {
    console.error('[Ollama] Ingestion error:', err.message);
    return false;
  }
}

/**
 * Bulk-ingest roman_knowledge_base entries into sovereign_vault with embeddings.
 * Run this once after Ollama is set up to give R.O.M.A.N. full semantic search
 * over his 346-entry knowledge base.
 */
export async function bulkIngestKnowledgeBase(supabase: any): Promise<{
  success: number;
  failed: number;
}> {
  console.log('[Ollama] Starting bulk ingestion of knowledge base into sovereign_vault...');

  const { data: files, error } = await supabase
    .from('roman_knowledge_base')
    .select('file_path, content')
    .limit(1000);

  if (error || !files) {
    console.error('[Ollama] Failed to fetch knowledge base:', error?.message);
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  for (const file of files) {
    const ok = await ingestDocument(supabase, {
      document_name: file.file_path,
      content: file.content || '',
      metadata: { source: 'roman_knowledge_base', type: 'codebase' },
    });

    if (ok) { success++; process.stdout.write('+'); }
    else { failed++; process.stdout.write('x'); }

    // Small delay to not overload Ollama
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n[Ollama] Bulk ingestion complete: ${success} success, ${failed} failed`);
  return { success, failed };
}

// ─── Status Report ────────────────────────────────────────────────────────────

export async function getOllamaStatus(): Promise<{
  running: boolean;
  models: string[];
  sovereign_model_ready: boolean;
  embed_model_ready: boolean;
  base_url: string;
}> {
  const running = await isOllamaRunning();
  const models = running ? await getOllamaModels() : [];

  return {
    running,
    models,
    sovereign_model_ready: models.some(m => m.includes(OLLAMA_MODEL.split(':')[0])),
    embed_model_ready: models.some(m => m.includes(OLLAMA_EMBED_MODEL.split(':')[0])),
    base_url: OLLAMA_BASE_URL,
  };
}
