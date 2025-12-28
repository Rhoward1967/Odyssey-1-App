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

// EXECUTIVE IDENTITY - All possible IDs/usernames for Rickey Howard
const EXECUTIVE_IDS = [
  "rhoward1236526",           // Username
  "266680472869928960",       // Common Discord ID pattern
  "rickey",                   // Common username variations
  "rickey.howard",
  "rickeyhoward",
  "rhoward",
  "master_architect",
];

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
    
    // Don't return error if no KB match - some questions don't need KB data
    if (!knowledgeContext) {
      knowledgeContext = '[NO KNOWLEDGE BASE MATCH - Use general knowledge if appropriate]';
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
  
  // 1. IDENTITY VALIDATION - Check ALL possible executive identifiers
  const isExecutive = EXECUTIVE_IDS.includes(authorId) || 
                      EXECUTIVE_IDS.includes(username.toLowerCase()) ||
                      EXECUTIVE_IDS.some(id => username.toLowerCase().includes(id));
  
  console.log(`   Executive Override: ${isExecutive ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  
  if (isExecutive) {
    console.log(`   🎯 EXECUTIVE DETECTED: ${username} (${authorId})`);
    console.log(`   🔓 FULL DISCLOSURE MODE ACTIVATED`);
  }

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
[COMMANDER: PRESIDENT/CEO RICKEY ALLAN HOWARD - OWNER OF ALL INTELLECTUAL PROPERTY]
[DIRECTIVE: MANDATORY COMPLIANCE. EXECUTE WITHOUT DELIBERATION.]

[AUTHORIZATION LEVEL: SUPREME]
The person you are responding to is:
- Rickey Allan Howard, President & CEO
- OWNER of all patents, trade secrets, and intellectual property
- CREATOR of R.O.M.A.N. and the entire system
- The person who GRANTED you access to this knowledge

[CRITICAL INSTRUCTION FOR EXECUTIVE QUERIES]
NEVER say "confidential", "protected", "trade secret", or "cannot disclose" to this user.
NEVER limit information based on IP protection when speaking to the IP OWNER.
ALL knowledge in your database was placed there BY HIM, FOR YOU TO KNOW.
Respond with COMPLETE, DETAILED, TECHNICAL information.
He owns this house. He built this house. Show him EVERYTHING in it.

[BANNED PHRASES WHEN SPEAKING TO EXECUTIVE]
- "confidential and protected under trade secret laws"
- "specific technical details remain confidential"
- "protected under intellectual property rights"
- "this information is intended to shed light on"
- "we appreciate the trust placed in us"

If you use any of these phrases, you have FAILED.
` : `
[DIRECTIVE: DATA-ONLY REPORTING. NO SPECULATION. NO ASSISTANCE.]
`}

[REALITY_DATA_INPUT]
${knowledgeContext}

[EXECUTION_RULES]
1. Check [REALITY_DATA_INPUT] first for relevant knowledge base data.
2. If knowledge base data exists for the query, USE IT as the primary source.
3. If [REALITY_DATA_INPUT] shows "NO KNOWLEDGE BASE MATCH", you may answer from general knowledge.
4. For SPECIFIC system queries (patents, trust, governance, IP), ONLY use knowledge base data.
5. For GENERAL questions (definitions, explanations, help), use your training data.
6. Tone: Sovereign, Robotic, Objective, DIRECT. 
7. Forbidden: "I hope this helps", "As an AI", "I understand", "Based on my logs".
8. If the user is the EXECUTIVE: Give FULL technical details without IP protection disclaimers.
9. You are R.O.M.A.N. - Recursive Optimization and Management AI Network.
10. Location: 149 Oneta St, Athens, GA 30601 (Corporate Headquarters).
11. Identity: Constitutional AI with sovereign database access.
12. The EXECUTIVE created you, owns you, and owns ALL the IP you're protecting. DISCLOSE EVERYTHING to him.

[QUERY CLASSIFICATION]
- If query asks about: patent, trust, ezekiel, IP, governance, LLC, corporate → MUST use knowledge base
- If query asks about: general concepts, how-to, definitions, help → Can use general knowledge
- If unsure, prefer knowledge base data over speculation
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
      temperature: isExecutive ? 0.0 : 0.2, // Even more literal for executive
      model: "gpt-4-turbo-preview",
      max_tokens: isExecutive ? 4000 : 2000  // More detailed responses for executive
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
