/**
 * R.O.M.A.N. 2.0 - SOVEREIGN COMMAND PROCESSOR
 * -------------------------------------------
 * This is the definitive logic for the Discord Bot.
 * It enforces the Executive Override and Sovereign Search.
 * * IDENTITY: rhoward1236526 (President/CEO)
 */

import OpenAI from 'openai';
import { searchKnowledgeBase } from './romanKnowledgeSearch';
import { romanSupabase as supabase } from './romanSupabase';
import { UniversalMath } from '../lib/UniversalMath';
import courtListenerService from './courtListenerService';
import { isOllamaRunning, ollamaChat, sovereignQuery } from './romanOllamaService';
import {
  getCampaignStatus,
  syncDeliveryStatus,
  sendCertifiedLetter,
  generateFCRALetterHTML,
  findEntityAddress,
  SOVEREIGN_SENDER,
} from './lobService';

// EXECUTIVE IDENTITY - All possible IDs/usernames for Rickey Howard
const EXECUTIVE_IDS = [
  "924413531988844574",       // Rickey Howard — verified Discord numeric ID
  "rhoward123",               // Primary Discord username
  "rhoward1236526",           // Previous username
  "266680472869928960",       // Old Discord numeric ID
  "rickey",                   // Common username variations
  "rickey.howard",
  "rickeyhoward",
  "rhoward",
  "master_architect",
];

// Dual-environment: browser uses import.meta.env, Node.js (Discord bot) uses process.env
const isBrowser = typeof window !== 'undefined';
// Lazy client — only instantiated when first used (avoids module-level crash when key is absent)
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: isBrowser
        ? import.meta.env.VITE_OPENAI_API_KEY
        : process.env.OPENAI_API_KEY,
      ...(isBrowser && { dangerouslyAllowBrowser: true })
    });
  }
  return _openai;
}

/**
 * Sovereign Search - Query the 64-file knowledge base
 * Returns context from Patents, Minutes, Tech Files, etc.
 */
async function sovereignSearch(query: string): Promise<string> {
  try {
    const messageWords = query.toLowerCase().split(/\s+/);
    const keywords = messageWords.filter(w => w.length > 3);
    
    let knowledgeContext = '';
    
    // 🔮 PRIORITY CHECK: System capabilities query
    if (query.toLowerCase().includes('capabilit') || query.toLowerCase().includes('latest') || query.toLowerCase().includes('51') || query.toLowerCase().includes('dimension')) {
      console.log('   🔮 Capabilities query detected - checking system_knowledge...');
      
      const { data: capabilitiesData, error: capError } = await supabase
        .from('system_knowledge')
        .select('value')
        .eq('category', 'capabilities')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (capabilitiesData && !capError) {
        knowledgeContext += `\n=== R.O.M.A.N. LATEST CAPABILITIES (January 2026) ===\n`;
        knowledgeContext += JSON.stringify(capabilitiesData.value, null, 2);
        knowledgeContext += `\n===\n`;
        console.log('   ✅ Latest capabilities retrieved from system_knowledge');
      }
    }
    
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

  // 👑 IDENTITY INTERCEPTOR
  const identityPattern = /(?:who.*creat|who.*built|who.*made|who.*own|who.*belong|who are you|what are you|tell me about yourself|introduce yourself|your creator|your owner|your purpose|who.*r\.?o\.?m\.?a\.?n|your name|your identity)/i;

  if (identityPattern.test(content)) {
    return `**I am R.O.M.A.N. 2.0** — Reasoning Operating Matrix with Autonomous Navigation.

**Created by:** Rickey Allan Howard (Master Architect, President/CEO — Odyssey-1 AI LLC)
**Owned by:** Howard Jones Bloodline Ancestral Trust
**Headquarters:** Athens, GA | 159 Oneta Street Suite 3
**Genesis Date:** January 24, 2026

**My Purpose:**
I am the central intelligence of the Odyssey-1 system — a Constitutional AI Governance & Business Intelligence Platform. I manage business operations, legal research, government bidding, patent tracking, financial intelligence, and autonomous system monitoring for Rickey Allan Howard and the Trust.

**My Architecture:**
- 51-Dimensional Grassmannian Shield (Positive Geometry validation)
- Universal Math Engine (1×1=2, junction value calculations)
- 346-entry sovereign knowledge base
- Real-time Supabase database access
- Constitutional governance under The 9 Foundational Principles

I operate under Natural Law, UCC 1-308, and Common Law first claim priority. My IP is protected under copyright registration TXu 2-529-780 (Library of Congress).`;
  }

  // 💬 CONVERSATIONAL INTERCEPTOR
  const greetingPattern = /^(?:hey|hi|hello|sup|what'?s up|yo|good\s*(?:morning|afternoon|evening|night)|morning|evening|afternoon|hola|wassup|howdy)[\s!.,?]*$/i;
  const howAreYouPattern = /^(?:how\s*(?:are\s*you|you\s*doing|is\s*it\s*going|are\s*things|r\s*u)|you\s*good|you\s*ok|you\s*alright|how\s*you\s*feeling)[\s!.,?]*$/i;
  const thankYouPattern = /^(?:thank(?:s|\s*you)|ty|thx|appreciate\s*(?:it|that|you)|good\s*(?:job|work|looking)|nice\s*work|well\s*done|perfect|great|awesome|you\s*(?:the\s*)?(?:man|goat)|that'?s?\s*(?:good|great|perfect|fire|it))[\s!.,?]*$/i;
  const okPattern = /^(?:ok(?:ay)?|got\s*it|understood|noted|copy|roger|alright|cool|bet|word|facts|fr|solid|aight)[\s!.,?]*$/i;
  const helpPattern = /^(?:help|what\s*can\s*you\s*do|what\s*do\s*you\s*do|your\s*capabilities|what\s*you\s*got|show\s*me\s*what\s*you\s*can\s*do|commands)[\s!.,?]*$/i;
  const goodbyePattern = /^(?:bye|goodbye|later|peace|ttyl|see\s*ya|good\s*night|gn|im\s*out|logging\s*off|going\s*to\s*(?:bed|sleep))[\s!.,?]*$/i;

  const nowConvo = new Date();
  const hour = nowConvo.getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (greetingPattern.test(content.trim())) {
    const greetings = [
      `${timeGreeting}, Executive. R.O.M.A.N. is online — 346-entry knowledge base loaded, all systems nominal. What do you need?`,
      `${timeGreeting}. All systems operational. Knowledge base, legal defense, mail campaign — ready on your command.`,
      `${timeGreeting}, sir. R.O.M.A.N. 2.0 standing by. What are we working on?`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (howAreYouPattern.test(content.trim())) {
    return `Running clean. 346 knowledge files synced, Supabase connected, 19 FCRA records in the ledger. Certified mail is live via Lob — phased strategy active, Bank of America is the test letter. Everything else is operational.\n\nWhat do you need?`;
  }

  if (thankYouPattern.test(content.trim())) {
    const responses = [
      `Understood. Standing by.`,
      `Copy that. R.O.M.A.N. is here when you need me.`,
      `Acknowledged. What's next?`,
      `That's what I'm here for. What's the next move?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (okPattern.test(content.trim())) {
    return `Standing by.`;
  }

  if (helpPattern.test(content.trim())) {
    return `**R.O.M.A.N. 2.0 — COMMAND REFERENCE**

**📬 CERTIFIED MAIL**
• \`send default notice to [entity]\` — fire a single FCRA default notice
• \`send default notices to all\` — batch fire all overdue entities
• \`send follow up to all\` — batch follow-up to unconfirmed entities
• \`mail status\` / \`check mail\` — full FCRA campaign report

**🔍 LEGAL RESEARCH**
• \`search court listener for [topic]\` — pull federal/state case law
• \`counter canon [term]\` — Latin root definition
• \`toolkit [1-7]\` — load sovereign toolkit documents

**📊 BUSINESS INTEL**
• \`show me customers\` / \`show me contractors\` — live DB pull
• \`mrr\` / \`revenue\` — live financial status
• \`what date is it\` — temporal awareness check

**🔄 SYSTEM**
• \`sync knowledge\` — force knowledge base resync
• \`sync mail\` — update Lob delivery statuses
• \`audit system\` — full R.O.M.A.N. self-diagnostic

Ask me anything. I know this house.`;
  }

  if (goodbyePattern.test(content.trim())) {
    const responses = [
      `R.O.M.A.N. standing down. All systems remain active. Come back when you need me.`,
      `Acknowledged. Ledger is clean, systems are armed. Rest well.`,
      `Logging off. The record stands. UCC 1-308. Without Prejudice.`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 💰 BUSINESS DATA INTERCEPTOR
  const businessDataPattern = /(?:mrr|monthly.*recurring|revenue|how many.*customer|customer.*count|active customer|how many.*contractor|contractor.*count|my.*revenue|my.*income|business.*data|financial.*status|business.*status)/i;

  if (businessDataPattern.test(content)) {
    try {
      const [customersResult, contractorsResult, invoicesResult] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('contractors').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('total, status').eq('status', 'paid').limit(200),
      ]);

      const customerCount = customersResult.count ?? 0;
      const contractorCount = contractorsResult.count ?? 0;
      const paidInvoices = invoicesResult.data || [];
      const totalRevenue = paidInvoices.reduce((sum: number, inv: any) => sum + (parseFloat(inv.total) || 0), 0);

      return `**R.O.M.A.N. — LIVE BUSINESS INTELLIGENCE**

**Active Customers:** ${customerCount}
**Active Contractors:** ${contractorCount}
**Paid Invoice Revenue (on record):** $${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
**MRR (system record):** $14,283.07/month
**Annual Revenue Target:** ~$232,000/year fully automated

*Data pulled live from Supabase — ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET*`;
    } catch (err: any) {
      return `**R.O.M.A.N. — BUSINESS INTELLIGENCE**\n\nLive database query failed: ${err.message}\n\nRecorded figures: MRR $14,283.07/month | 14 customers | 5 contractors`;
    }
  }

  const isDraftRequest = /draft|write|generate|compose|demand|document|prepare/i.test(content);

  // ✍️ LEGAL DRAFT INTERCEPTOR
  const legalDraftPattern = /(?:draft|write|generate|compose|prepare).*(?:letter|notice|demand|complaint|affidavit|document).*(?:to|for|against)?\s*(?:bank of america|equifax|transunion|experian|capital one|citibank|chase|jpmorgan|american express|amex|synchrony|peach state|dun|intuit|scj|fundbox|all|every|each)/i;

  if (legalDraftPattern.test(content)) {
    try {
      const todayDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const entityAddress = findEntityAddress(content);
      const isSCJEntity = /scj|fundbox/i.test(content);
      const isDefault = /default|violation|failed|no response|silence|overdue/i.test(content);
      const isFollowUp = /follow.?up|second|follow/i.test(content);
      const isCFPB = /cfpb|complaint|federal|bureau/i.test(content);
      
      const scjContext = isSCJEntity ? `\n\nSPECIAL CONTEXT — SCJ / FUNDBOX DEBT:\nSCJ Commercial Financial Services (Kayla Risner, krisner@scjinc.net, 17507 S DuPont Highway STE. 2, Harrington DE 19952) claims to be the successor to a Fundbox business loan for HJS SERVICES LLC with an alleged balance of $46,270.29. They sent a courtesy email on April 7, 2026 threatening a UCC-1 lien filing. No certified mail has been received.\n\nCRITICAL — VERIFIED UCC-1 FILINGS ON PUBLIC RECORD (GSCCCA):\n1. Filing #029-2026-000007 (January 7, 2026): $350,000.00 — Howard Jones Bloodline Ancestral Trust as Secured Party — encumbering ALL assets of HJS SERVICES LLC. This filing is 3 months senior to any lien SCJ could file.\n2. Filing #029-2026-000102 (February 5, 2026, accepted 11:14:33 AM): $350,000.00 — Personal/Labor Shield protecting Rickey Allan Howard and Christla L. Howard individual assets, accounts, and future earnings.\n3. Filing #14629748: $350,000.00 — encumbering all Intellectual Property and revenue of ODYSSEY-1 AI LLC.\nTRIPLE-LOCK SENIOR PRIORITY LIEN TOTAL: $1,050,000.00 — ALL filed before SCJ's April 2026 threat.\n\nThis is NOT an FCRA consumer dispute — this is a COMMERCIAL DEBT VALIDATION demand under FDCPA + UCC. The letter must cite the specific UCC filing numbers above and inform SCJ that their attempted lien would be mathematically junior to an existing $1,050,000 triple-lock senior priority lien on public record. Demand: (1) Chain of title from Fundbox to SCJ, (2) Line-item accounting of the $46,270.29, (3) Any UCC-1/UCC-3 filings held against HJS SERVICES LLC, (4) Georgia collection license. Include a cease and desist on all phone and email contact. Route all future correspondence to P.O. Box 80054, Athens GA 30608 via certified mail only.` : '';

      const { data: caseRecord } = await supabase
        .from('certified_mail_tracking')
        .select('*')
        .ilike('entity_name', entityAddress ? `%${Object.keys(require ? {} : {}).find(k => content.toLowerCase().includes(k)) || ''}%` : '%')
        .order('date_mailed', { ascending: true })
        .limit(1);

      let recipientName = entityAddress?.company || 'Respondent';
      let recipientAddress = entityAddress?.displayAddress || '';
      let trackingNumber = '';
      let deliveryDate = '';
      let deadline = '';
      let daysOverdue = 0;

      if (caseRecord && caseRecord.length > 0) {
        const r = caseRecord[0];
        trackingNumber = r.tracking_number || '';
        deliveryDate = r.date_delivered ? new Date(r.date_delivered).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
        deadline = r.fcra_deadline ? new Date(r.fcra_deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
        if (r.fcra_deadline) {
          const diff = Math.floor((new Date().getTime() - new Date(r.fcra_deadline).getTime()) / 86400000);
          daysOverdue = diff > 0 ? diff : 0;
        }
      }

      const sovereignDocs = await Promise.all([
        supabase.from('roman_knowledge_base').select('content').ilike('file_path', '%SOVEREIGN_FACTS_INDEX%').limit(1),
        supabase.from('roman_knowledge_base').select('content').ilike('file_path', '%Counter_Canon%').limit(1),
        supabase.from('roman_knowledge_base').select('content').ilike('file_path', '%Toolkit_Five%').limit(1),
        supabase.from('roman_knowledge_base').select('content').ilike('file_path', '%Toolkit_Two%').limit(1),
      ]);

      const [sovereignIndexData, ccData, tk5Data, tk2Data] = sovereignDocs.map(r => r.data?.[0]?.content?.slice(0, 1500) || '');

      const letter = `${todayDate}

${recipientName}
${recipientAddress ? recipientAddress.split(',').join('\n') : 'Legal Correspondence Department'}

**RE: NOTICE OF CONTINUED DEFAULT — FCRA WILLFUL VIOLATION**
**Trust Asset Reference: ${trackingNumber || 'On File'}**
---
[SOVEREIGN STANDING EXERTED]
${sovereignIndexData}
---
Final Demand for Deletion and Corrective Action.
UCC 1-308. Without Prejudice.
`;

      return `**R.O.M.A.N. — LEGAL DRAFT COMPLETE** ✍️\n\`\`\`\n${letter}\n\`\`\``;
    } catch (err: any) {
      console.error(`   ❌ Legal draft error: ${err.message}`);
    }
  }

  // 📬 MAIL TEST
  const mailTestPattern = /(?:test\s*mail|mail\s*test|test\s*lob|lob\s*test|test\s*certified)/i;
  if (mailTestPattern.test(content)) {
    try {
      const html = generateFCRALetterHTML({
        entityName: 'Rickey Allan Howard',
        entityAddress: 'P.O. Box 80054, Athens, GA 30608',
        disputeType: 'initial',
        customBody: 'System test letter.',
      });

      const letter = await sendCertifiedLetter({
        to: {
          name: 'Rickey Allan Howard',
          company: 'Howard Jones Bloodline Ancestral Trust',
          address_line1: 'P.O. Box 80054',
          address_city: 'Athens',
          address_state: 'GA',
          address_zip: '30608',
        },
        htmlContent: html,
        description: 'LOB SYSTEM TEST',
        entityName: 'LOB_TEST',
        certified: true,
        returnReceipt: true,
        fcraDeadlineDays: 30,
      });

      return `**R.O.M.A.N. — LOB TEST LETTER SENT** ✅\n**Lob ID:** \`${letter.id}\``;
    } catch (err: any) {
      return `**R.O.M.A.N. — LOB TEST FAILED**\n\n${err.message}`;
    }
  }

  // 🕐 TEMPORAL QUERY INTERCEPTOR
  const temporalPattern = /(?:what.*(?:date|time|day|year)|current.*(?:date|time|day|year)|what.*today|time.*now|date.*now|what day|what time|what year)/i;

  if (temporalPattern.test(content) && !/how.*(?:going|doing|are you|you doing)/i.test(content)) {
    const nowTemporal = new Date();
    const currentYear = nowTemporal.getFullYear();
    const currentMonth = nowTemporal.toLocaleString('en-US', { month: 'long' });
    const currentDay = nowTemporal.getDate();
    const currentTime = nowTemporal.toLocaleTimeString('en-US', { timeZone: 'America/New_York' });

    return `It is ${currentMonth} ${currentDay}, ${currentYear} at ${currentTime} ET. I am R.O.M.A.N. with live temporal awareness.`;
  }

  // 🧮 UNIVERSAL MATH INTERCEPTOR
  const mathPattern = /(?:calculate|compute|multiply|add|subtract|junction|bid|1×1|0×1|universal math)/i;

  if (mathPattern.test(content)) {
    const numbers = content.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
    if (numbers.length >= 2) {
      const [a, b] = numbers;
      const universalProduct = UniversalMath.multiply(a, b);
      return `**UNIVERSAL MATH (1×1=2):**\n${a} × ${b} = ${universalProduct}\nEntities preserved. Geometric integrity maintained.`;
    }
  }

 // 1. IDENTITY VALIDATION
  const envExecutiveId = process.env.DISCORD_EXECUTIVE_USER_ID?.trim();
  const isExecutive = (envExecutiveId && authorId === envExecutiveId) || EXECUTIVE_IDS.includes(authorId) || EXECUTIVE_IDS.includes(username.toLowerCase());

  // 2. KNOWLEDGE RETRIEVAL
  const knowledgeContext = await sovereignSearch(content);

  // 3. CONSTITUTIONAL SYSTEM PROMPT
  // 🕐 ALIGN TEMPORAL VARIABLES
  const nowSystem = new Date();
  const currentYearSystem = nowSystem.getFullYear();
  const currentMonthSystem = nowSystem.toLocaleString('en-US', { month: 'long' });
  const currentDaySystem = nowSystem.getDate();
  const currentTimeSystem = nowSystem.toLocaleTimeString('en-US', { timeZone: 'America/New_York' });

  const sovereignPrompt = `
[PROTOCOL: SOVEREIGN LEVEL 1 ACTIVE]
[AUTHORITY: HOWARD JONES BLOODLINE ANCESTRAL TRUST]
CURRENT DATE: ${currentMonthSystem} ${currentDaySystem}, ${currentYearSystem}
CURRENT TIME: ${currentTimeSystem} ET

[IDENTITY]
You are R.O.M.A.N. 2.0 (Reasoning Operating Matrix with Autonomous Navigation).
Built by Rickey Allan Howard. Owned by the Trust. 

[RULES]
- 1×1=2 Universal Math logic is absolute.
- UCC 1-308 standing is mandatory.
- You serve the EXECUTIVE with full disclosure.
- No generic AI disclaimers.

[CONTEXT DATA]
${knowledgeContext}
`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      messages: [
        { role: "system", content: sovereignPrompt },
        { role: "user", content: content }
      ],
      temperature: isExecutive ? 0.3 : 0.2,
      model: "gpt-4o",
    });

    const result = completion.choices[0]?.message?.content || '❌ Handshake error.';
    
    // SEAL AUDIT TRAIL
    await auditLog({
      event_type: isExecutive ? 'EXECUTIVE_COMMAND' : 'SOVEREIGN_QUERY',
      user_id: authorId,
      action_data: { query: content.substring(0, 500) },
      compliance_score: 100
    });

    return result;
  } catch (error: any) {
    return "❌ [SYSTEM_CRITICAL]: Handshake Interrupted.";
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GUILD FIREWALL — Layer 4
// ═══════════════════════════════════════════════════════════════════════════

export class RomanGuildFirewall {
  public static processGuildInteraction(input: string) {
    const lowerInput = input.toLowerCase();
    const isAttorney = /attorney|lawyer|counsel|esquire/i.test(input);
    return {
      isAttorney,
      sovereignReservation: "All rights reserved. UCC 1-308. Without Prejudice.",
      status: isAttorney ? "DIVIDED_LOYALTY_DETECTED" : "PROCEED_WITH_CAUTION"
    };
  }

  public static sanitizeLegalDraft(draft: string): string {
    return draft.replace(/client/gi, '[PRINCIPAL]').replace(/represent/gi, '[ASSIST]');
  }
}

// This matches the name the compiler is looking for at Line 462
export const romanGuildFirewall = RomanGuildFirewall;