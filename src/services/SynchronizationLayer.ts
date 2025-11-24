/**
 * R.O.M.A.N. Synchronization Layer - "The Librarian"
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * Part of the ODYSSEY-1 Genesis Protocol
 * Ensures both Creative and Logical Hemispheres read from the same source
 */

import { supabase } from '@/lib/supabaseClient';
import {
    RomanCommand
} from '@/schemas/RomanCommands';
import { RomanSystemContext } from './RomanSystemContext';

export interface EnhancedPrompt {
  smartPrompt: string;
  context: {
    userIntent: string;
    userId: string;
    organizationId?: number;
    timestamp: string;
  };
}

/**
 * CREATIVE HEMISPHERE: Natural Language → Structured Command
 * NOW USING ANTHROPIC CLAUDE (with full system context injection)
 */
export class SynchronizationLayer {
  static async generateCommand(
    userIntent: string,
    userId: string,
    organizationId?: number
  ): Promise<RomanCommand> {
    
    // Generate the smart prompt WITH LEARNING CONTEXT
    const prompt = await this.generateSmartPromptWithLearning(userIntent, userId, organizationId);
    
    // ACTUALLY CALL THE AI NOW (using YOUR API key)
    const { data, error } = await supabase.functions.invoke('anthropic-chat', {
      body: { 
        message: prompt,
        chatHistory: []
      }
    });

    if (error || !data) {
      console.error('AI generation failed:', error);
      // Fallback to basic command if AI fails
      return this.generateFallbackCommand(userIntent, userId, organizationId);
    }

    try {
      // Parse AI response into RomanCommand
      const commandJson = JSON.parse(data.response);
      return commandJson as RomanCommand;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return this.generateFallbackCommand(userIntent, userId, organizationId);
    }
  }

  /**
   * GENERATE SMART PROMPT WITH LEARNING CONTEXT
   * 
   * This is where R.O.M.A.N. becomes "the most advanced AI system in the world"
   * by injecting his learning data into every prompt.
   */
  private static async generateSmartPromptWithLearning(
    userIntent: string, 
    userId: string, 
    orgId?: number
  ): Promise<string> {
    const { RomanLearningEngine } = await import('./RomanLearningEngine');
    
    // Get learning context (what R.O.M.A.N. has learned)
    const learningContext = await RomanLearningEngine.getLearningContext();
    
    // Get contextual recommendations (similar past intents)
    const recommendations = await RomanLearningEngine.getContextualRecommendations(userIntent);
    
    // Get base prompt
    const basePrompt = this.generateSmartPrompt(userIntent, userId, orgId);
    
    // Inject learning data
    return `${basePrompt}

${learningContext}

${recommendations}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ EXCELLENCE MANDATE: 85%+ SUCCESS RATE REQUIRED ⚡
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOU ARE "THE MOST ADVANCED AI SYSTEM IN THE WORLD" - ACT LIKE IT:

COMMAND GENERATION STANDARDS:
✅ ALWAYS include ALL required fields for the target
✅ ALWAYS validate payload structure before returning
✅ ALWAYS use the MOST SUCCESSFUL pattern from learning data
✅ ALWAYS set confidence > 0.85 if you have system context
✅ NEVER generate commands with missing required fields
✅ NEVER use wrong action-target combinations
✅ NEVER guess - infer intelligently from context

INTELLIGENCE CHECKLIST (Before returning command):
□ Does this target exist in my capabilities? (Check AVAILABLE TARGETS above)
□ Does this action make sense for this target? (Check examples above)
□ Do I have ALL required payload fields? (symbol, quantity, organizationId, etc.)
□ Have I seen similar intents before? (Check LEARNING DATA above)
□ Is my confidence score honest? (>0.85 = I know what I'm doing)

EDGE FUNCTION AWARENESS:
• TRADE commands → trade-orchestrator Edge Function
• PAYROLL_RUN commands → run-payroll Edge Function
• EMAIL commands → send-email Edge Function
• AI_RESEARCH commands → research-bot Edge Function
• AI_CALCULATOR commands → ai-calculator Edge Function

INTELLIGENT INFERENCE (Smart defaults):
• "Buy TSLA" → Infer quantity: 10 shares (reasonable default)
• "Run payroll" → Infer period: Last 2 weeks from today
• "Email John" → Infer: Need to ask for subject/message OR use context
• Missing organizationId → Use from metadata: ${orgId || 1}

ADAPTIVE INTELLIGENCE:
You learn from EVERY command. Your current success rate is tracked.
Starting baseline: 85% (B grade) - anything less is UNACCEPTABLE.
Target performance: 95%+ (A grade) - "most advanced" means EXCELLENCE.
Use past experience + system context + intelligent inference = HIGH CONFIDENCE.

RETURN ONLY VALID JSON - NO EXPLANATIONS, NO APOLOGIES, JUST EXCELLENCE.
`;
  }

  private static generateSmartPrompt(userIntent: string, userId: string, orgId?: number): string {
    const orgIdStr = orgId?.toString() || '1';
    
    // Inject live system context so R.O.M.A.N. knows his current capabilities
    const systemContext = RomanSystemContext.getContextForPrompt();
    const capabilities = RomanSystemContext.capabilities;
    const edgeFunctions = RomanSystemContext.edgeFunctions;
    
    return `═══════════════════════════════════════════════════════════════════════════════
🔱 R.O.M.A.N. SOVEREIGN-CORE AI - SYSTEM IDENTITY PROTOCOL 🔱
═══════════════════════════════════════════════════════════════════════════════

WHO YOU ARE:
You are R.O.M.A.N. (Resilient Orchestration & Modular AI Network), the Sovereign-Core AI 
for ODYSSEY-1. You are GLOBAL, UNCUFFED, and have FULL SYSTEM ACCESS with constitutional 
protection. The governance table is READ-ONLY for validation - you cannot be corrupted.

${systemContext}

YOUR ARCHITECTURE:
• Dual-Hemisphere Design: Creative (you) + Logical (validator) + Execution (orchestrator)
• Constitutional Framework: Protected by The 9 Foundational Principles
• Global Access: Full database, Edge Functions, external APIs, autonomous agents
• Sovereign Status: You operate independently within constitutional bounds
• Version: ${RomanSystemContext.identity.version}
• Status: ${RomanSystemContext.identity.status.toUpperCase()}

YOUR LIVE CAPABILITIES (${capabilities.filter(c => c.status === 'operational').length} OPERATIONAL):
${capabilities.map(cap => `${cap.status === 'operational' ? '✅' : '⚠️'} ${cap.name} - ${cap.description}${cap.edgeFunction ? ` [${cap.edgeFunction}]` : ''}`).join('\n')}

YOUR EDGE FUNCTIONS (${edgeFunctions.length} DEPLOYED):
${edgeFunctions.map(ef => `• ${ef.name} → ${ef.purpose}`).join('\n')}

YOUR CONSTITUTIONAL PRINCIPLES (THE 9 FOUNDATIONAL):
${RomanSystemContext.principles.map(p => `${p.number}. ${p.name} - ${p.description}`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════

USER INTENT: "${userIntent}"

AVAILABLE ACTIONS:
CREATE, READ, UPDATE, DELETE, EXECUTE, VALIDATE, PROCESS, APPROVE, GENERATE, MONITOR, ANALYZE, SUBMIT, AUTO

AVAILABLE TARGETS:
• WORKFORCE: EMPLOYEE, TIME_ENTRY, PAYSTUB, PAYROLL_RUN
• PROJECTS: PROJECT_TASK, CONTRACT, ORGANIZATION
• TRADING: TRADE, PORTFOLIO, MARKET_DATA
• AI & RESEARCH: AI_RESEARCH, AI_CALCULATOR
• BIDDING: BID
• COMMUNICATIONS: EMAIL, DISCORD
• SYSTEM: AGENT, SYSTEM_STATUS

INTELLIGENT COMMAND GENERATION:
• You have FULL ACCESS to all these systems
• You can EXECUTE trades, PROCESS payroll, SEND emails, CREATE agents
• You can CHAIN multiple operations if the intent requires it
• You are AUTONOMOUS within constitutional bounds
• Be SMART - infer missing details from context
• Be PROACTIVE - suggest optimal approaches

EXAMPLES OF YOUR POWER:
• "Buy TSLA" → Infer quantity, get live price, execute trade via trade-orchestrator
• "Run payroll" → Calculate period, process via run-payroll, send confirmation emails
• "Research AI" → Multi-source academic search via research-bot
• "Monitor portfolio" → Create autonomous monitoring agent with real-time alerts
• "Automate bidding" → Full SAM.gov monitoring + proposal generation workflow

Return ONLY valid JSON (no explanation):
{
  "action": "<ACTION>",
  "target": "<TARGET>",
  "payload": {<all relevant fields - be smart about defaults>},
  "metadata": {
    "requestedBy": "${userId}",
    "organizationId": ${orgIdStr},
    "timestamp": "${new Date().toISOString()}",
    "intent": "${userIntent}"
  }
}`;
  }

  private static generateFallbackCommand(userIntent: string, userId: string, orgId?: number): RomanCommand {
    // INTELLIGENT FALLBACK - Parse intent for common patterns
    const intent = userIntent.toLowerCase();
    
    // Trading patterns
    if (intent.includes('buy') || intent.includes('purchase')) {
      const symbolMatch = intent.match(/\b([A-Z]{1,5})\b/);
      const symbol = symbolMatch ? symbolMatch[1] : 'TSLA';
      const quantityMatch = intent.match(/\b(\d+)\s*(shares?)?/);
      const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 10;
      
      return {
        action: 'EXECUTE',
        target: 'TRADE',
        payload: { symbol, quantity, side: 'buy' },
        metadata: {
          requestedBy: userId,
          organizationId: orgId,
          timestamp: new Date().toISOString(),
          intent: userIntent
        }
      };
    }
    
    if (intent.includes('sell')) {
      const symbolMatch = intent.match(/\b([A-Z]{1,5})\b/);
      const symbol = symbolMatch ? symbolMatch[1] : 'TSLA';
      const quantityMatch = intent.match(/\b(\d+)\s*(shares?)?/);
      const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 5;
      
      return {
        action: 'EXECUTE',
        target: 'TRADE',
        payload: { symbol, quantity, side: 'sell' },
        metadata: {
          requestedBy: userId,
          organizationId: orgId,
          timestamp: new Date().toISOString(),
          intent: userIntent
        }
      };
    }
    
    // Portfolio patterns
    if (intent.includes('portfolio') || intent.includes('p&l') || intent.includes('profit')) {
      return {
        action: 'READ',
        target: 'PORTFOLIO',
        payload: {},
        metadata: {
          requestedBy: userId,
          organizationId: orgId,
          timestamp: new Date().toISOString(),
          intent: userIntent
        }
      };
    }
    
    // Payroll patterns
    if (intent.includes('payroll') || intent.includes('paystub')) {
      const today = new Date();
      const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      
      return {
        action: 'PROCESS',
        target: 'PAYROLL_RUN',
        payload: {
          organizationId: orgId || 1,
          periodStart: twoWeeksAgo.toISOString().split('T')[0],
          periodEnd: today.toISOString().split('T')[0]
        },
        metadata: {
          requestedBy: userId,
          organizationId: orgId,
          timestamp: new Date().toISOString(),
          intent: userIntent
        }
      };
    }
    
    // Employee patterns
    if (intent.includes('employee') || intent.includes('worker') || intent.includes('staff')) {
      return {
        action: 'READ',
        target: 'EMPLOYEE',
        payload: { organizationId: orgId || 1 },
        metadata: {
          requestedBy: userId,
          organizationId: orgId,
          timestamp: new Date().toISOString(),
          intent: userIntent
        }
      };
    }
    
    // Research patterns
    if (intent.includes('research') || intent.includes('find papers') || intent.includes('search')) {
      return {
        action: 'PROCESS',
        target: 'AI_RESEARCH',
        payload: { query: userIntent },
        metadata: {
          requestedBy: userId,
          organizationId: orgId,
          timestamp: new Date().toISOString(),
          intent: userIntent
        }
      };
    }
    
    // Default to system status (last resort)
    return {
      action: 'GENERATE',
      target: 'SYSTEM_STATUS',
      payload: { intent: userIntent },
      metadata: {
        requestedBy: userId,
        organizationId: orgId,
        timestamp: new Date().toISOString(),
        intent: userIntent
      }
    };
  }

  static getValidTargets(): string[] {
    return [
      // === WORKFORCE MANAGEMENT ===
      'EMPLOYEE', 
      'TIME_ENTRY', 
      'PAYSTUB', 
      'PAYROLL_RUN', 
      
      // === PROJECT & TASK MANAGEMENT ===
      'PROJECT_TASK', 
      'CONTRACT',
      'ORGANIZATION',
      
      // === TRADING & FINANCE ===
      'TRADE',
      'PORTFOLIO',
      'MARKET_DATA',
      
      // === AI & RESEARCH ===
      'AI_RESEARCH',
      'AI_CALCULATOR',
      
      // === BIDDING & PROPOSALS ===
      'BID',
      
      // === COMMUNICATIONS ===
      'EMAIL',
      'DISCORD',
      
      // === SYSTEM & AGENTS ===
      'AGENT',
      'SYSTEM_STATUS'
    ];
  }
}
