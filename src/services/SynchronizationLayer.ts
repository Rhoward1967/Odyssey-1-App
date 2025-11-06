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
 * NOW USING OPENAI GPT-4 (switched from Gemini)
 */
export class SynchronizationLayer {
  static async generateCommand(
    userIntent: string,
    userId: string,
    organizationId?: number
  ): Promise<RomanCommand> {
    
    // Generate the smart prompt
    const prompt = this.generateSmartPrompt(userIntent, userId, organizationId);
    
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

  private static generateSmartPrompt(userIntent: string, userId: string, orgId?: number): string {
    const orgIdStr = orgId?.toString() || '1';
    
    return `Generate a R.O.M.A.N. command for: "${userIntent}"
    
Return ONLY valid JSON matching this structure:
{
  "action": "CREATE|READ|UPDATE|DELETE|PROCESS",
  "target": "EMPLOYEE|PAYROLL_RUN|PAYSTUB|SYSTEM_STATUS",
  "payload": {},
  "metadata": {
    "requestedBy": "${userId}",
    "organizationId": ${orgIdStr},
    "timestamp": "${new Date().toISOString()}",
    "intent": "${userIntent}"
  }
}`;
  }

  private static generateFallbackCommand(userIntent: string, userId: string, orgId?: number): RomanCommand {
    return {
      action: 'PROCESS',
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
      'EMPLOYEE', 
      'PAYROLL_RUN', 
      'PAYSTUB', 
      'TIME_ENTRY', 
      'PROJECT_TASK', 
      'BID',
      'SYSTEM_STATUS' // Added for system diagnostics
    ];
  }
}
