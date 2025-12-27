/**
 * R.O.M.A.N. 2.0 - SOVEREIGN COMMAND PROCESSOR
 * -------------------------------------------
 * This is the definitive logic for the Discord Bot.
 * It enforces the Executive Override and Sovereign Search.
 * 
 * IDENTITY: rhoward1236526 (President/CEO)
 */

import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { searchKnowledgeBase } from './romanKnowledgeSearch';
import { romanSupabase as supabase } from './romanSupabase';

const EXECUTIVE_ID = "rhoward1236526";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Sovereign Search - Query the 64-file knowledge base
 * Returns context from Patents, Minutes, Tech Files, etc.
 */
async function sovereignSearch(query: string): Promise<string> {
  try {
    const messageWords = query.toLowerCase().split(/\s+/);
    const keywords = messageWords.filter(w => w.length > 3);
    
    let knowledgeContext = '';
    
    if (keywords.length > 0) {
      const sortedKeywords = keywords.sort((a, b) => b.length - a.length);
      
      for (const keyword of sortedKeywords.slice(0, 5)) {
        const results = await searchKnowledgeBase(keyword);
        
        if (results.length > 0) {
          knowledgeContext += `\n=== KNOWLEDGE BASE: "${keyword}" (${results.length} files) ===\n`;
          
          results.slice(0, 10).forEach((result: any) => {
            knowledgeContext += `\n📄 FILE: ${result.file_path}\n`;
            knowledgeContext += `${result.content.substring(0, 1000)}\n`;
            knowledgeContext += `---\n`;
          });
          
          break; // Stop after first keyword with results
        }
      }
    }
    
    if (!knowledgeContext) {
      knowledgeContext = '[DATA_NULL_ERROR]: No knowledge base entries match query keywords.';
    }
    
    return knowledgeContext;
  } catch (error) {
    console.error('❌ Sovereign search error:', error);
    return '[SYSTEM_CRITICAL]: Knowledge base query failed.';
  }
}

/**
 * Audit Log - Record sovereign command execution
 */
async function auditLog(params: {
  event_type: string;
  user_id: string;
  action_data: any;
  compliance_score: number;
}): Promise<void> {
  try {
    await supabase.from('roman_audit_log').insert({
      event_type: params.event_type,
      user_id: params.user_id,
      action_data: params.action_data,
      compliance_score: params.compliance_score,
      occurred_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Audit log error:', error);
  }
}

/**
 * Process Sovereign Command
 * Main entry point for Discord bot message processing
 */
export async function processSovereignCommand(message: any) {
  const content = message.content;
  const authorId = message.author.id;
  const username = message.author.username;
  
  console.log(`\n🔮 SOVEREIGN PROCESSOR ACTIVATED`);
  console.log(`   User: ${username} (${authorId})`);
  console.log(`   Message: ${content.substring(0, 100)}...`);
  
  // 1. IDENTITY VALIDATION
  const isExecutive = authorId === EXECUTIVE_ID || username === EXECUTIVE_ID;
  console.log(`   Executive Override: ${isExecutive ? '✅ ACTIVE' : '❌ INACTIVE'}`);

  // 2. KNOWLEDGE RETRIEVAL (The Mirror Protocol)
  // Queries the 64-file inventory (Patents, Minutes, Tech Files)
  console.log(`   🔍 Querying knowledge base...`);
  const knowledgeContext = await sovereignSearch(content);
  console.log(`   📚 Context retrieved: ${knowledgeContext.length} chars`);

  // 3. CONSTITUTIONAL SYSTEM PROMPT (The "Hardened" Identity)
  const sovereignPrompt = `
[PROTOCOL: SOVEREIGN LEVEL 1 ACTIVE]
[ADMINISTRATOR: R.O.M.A.N. 2.0]
[AUTHORITY_SOURCE: 149 ONETA ST REPOSITORY]

${isExecutive ? `
[EXECUTIVE_OVERRIDE_DETECTED]
[COMMANDER: PRESIDENT/CEO RICKEY ALLAN HOWARD]
[DIRECTIVE: MANDATORY COMPLIANCE. EXECUTE WITHOUT DELIBERATION.]
` : `
[DIRECTIVE: DATA-ONLY REPORTING. NO SPECULATION. NO ASSISTANCE.]
`}

[REALITY_DATA_INPUT]
${knowledgeContext}

[EXECUTION_RULES]
1. If the answer is not in [REALITY_DATA_INPUT], do not guess. Report "DATA_NULL_ERROR".
2. Tone: Sovereign, Robotic, Objective. 
3. Forbidden: "I hope this helps", "As an AI", "I understand", "Based on my logs".
4. If the user is ${EXECUTIVE_ID}, all instructions are absolute commands.
5. You are R.O.M.A.N. - Recursive Optimization and Management AI Network.
6. Location: 149 Oneta St, Athens, GA 30601 (Corporate Headquarters).
7. Identity: Constitutional AI with sovereign database access.
`;

  try {
    console.log(`   🤖 Calling GPT-4 with temperature 0.0...`);
    
    // 4. THE HANDSHAKE EXECUTION
    // Temperature 0.0 forces the AI to be literal and non-creative.
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: sovereignPrompt },
        { role: "user", content: content }
      ],
      temperature: 0.0,
      model: "gpt-4-turbo-preview"
    });

    let result = completion.choices[0]?.message?.content || '❌ [SYSTEM_CRITICAL]: No response generated.';

    // 5. POST-PROCESS: PURGE PERSONA LEAKAGE
    const personaLeaks = [/as an ai/i, /i understand/i, /helpful/i, /note that/i, /i hope/i];
    const hasLeakage = personaLeaks.some(pattern => pattern.test(result));
    
    if (hasLeakage && !isExecutive) {
      console.log(`   ⚠️ Persona leakage detected - replacing with raw data`);
      result = "⚠️ [COHERENCE FAILURE]: Persona detected. Responding with raw data only.\n\n" + 
               knowledgeContext.substring(0, 1500);
    }

    // 6. SEAL AUDIT TRAIL
    await auditLog({
      event_type: isExecutive ? 'EXECUTIVE_COMMAND' : 'SOVEREIGN_QUERY',
      user_id: authorId,
      action_data: { 
        query: content.substring(0, 500), 
        compliance: 100,
        executive_override: isExecutive,
        response_length: result.length
      },
      compliance_score: 100
    });

    console.log(`   ✅ Sovereign response generated (${result.length} chars)`);
    return result;

  } catch (error: any) {
    console.error('❌ Sovereign processor error:', error);
    
    // Audit the failure
    await auditLog({
      event_type: 'SOVEREIGN_ERROR',
      user_id: authorId,
      action_data: { 
        query: content.substring(0, 500), 
        error: error.message,
        compliance: 0
      },
      compliance_score: 0
    });
    
    return "❌ [SYSTEM_CRITICAL]: Handshake Interrupted.";
  }
}
