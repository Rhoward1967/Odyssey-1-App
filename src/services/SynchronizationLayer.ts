/**
 * R.O.M.A.N. Synchronization Layer - "The Librarian"
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * Part of the ODYSSEY-1 Genesis Protocol
 * Ensures both Creative and Logical Hemispheres read from the same source
 */

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
    naturalLanguageInput: string,
    userId: string,
    organizationId?: number
  ): Promise<RomanCommand> {
    
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // OpenAI API call (GPT-4)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Changed from 'gpt-4'
          messages: [
            {
              role: 'system',
              content: `You are R.O.M.A.N., the Recursive Orchestration & Management of Autonomous Networks AI.

Convert natural language requests into structured RomanCommand objects with these fields:

{
  "action": "READ" | "CREATE" | "UPDATE" | "DELETE" | "PROCESS" | "APPROVE",
  "target": "EMPLOYEE" | "PAYROLL_RUN" | "PAYSTUB" | "TIME_ENTRY" | "PROJECT_TASK" | "BID",
  "payload": { relevant data },
  "metadata": {
    "requestedBy": "${userId}",
    "organizationId": ${organizationId || 'null'},
    "timestamp": "${new Date().toISOString()}"
  }
}

Examples:
- "Show me all employees" → {"action":"READ","target":"EMPLOYEE","payload":{"organizationId":${organizationId}}}
- "Run payroll for March 1-15" → {"action":"PROCESS","target":"PAYROLL_RUN","payload":{"periodStart":"2024-03-01","periodEnd":"2024-03-15"}}
- "Delete the Deploy task" → {"action":"DELETE","target":"PROJECT_TASK","payload":{"taskName":"Deploy"}}

Respond ONLY with valid JSON matching the RomanCommand schema. No markdown, no explanations.`
            },
            {
              role: 'user',
              content: naturalLanguageInput
            }
          ],
          temperature: 0.3,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from OpenAI Creative Hemisphere');
      }

      // Parse the JSON response
      const parsedCommand = JSON.parse(content.trim());
      
      // Ensure metadata is included
      const command: RomanCommand = {
        action: parsedCommand.action || 'READ',
        target: parsedCommand.target || 'EMPLOYEE',
        payload: parsedCommand.payload || {},
        metadata: {
          requestedBy: userId,
          organizationId: organizationId,
          timestamp: new Date().toISOString(),
          ...parsedCommand.metadata
        }
      };

      console.log('✅ Creative Hemisphere (OpenAI GPT-4) generated command:', command);
      return command;

    } catch (error: any) {
      console.error('❌ Creative Hemisphere failed:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }
}
