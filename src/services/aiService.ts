import { supabase } from '@/lib/supabaseClient';

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AIService {
  private static conversationHistory: Map<string, ConversationMessage[]> = new Map();

  /**
   * Send a message to the AI and get a response
   * Stores conversation history per session
   */
  static async chat(
    message: string,
    sessionId: string,
    systemPrompt: string,
    provider: 'anthropic' | 'openai' | 'gemini' = 'anthropic' // Claude is default!
  ): Promise<string> {
    try {
      // Get or initialize conversation history
      if (!this.conversationHistory.has(sessionId)) {
        this.conversationHistory.set(sessionId, [
          { role: 'system', content: systemPrompt }
        ]);
      }

      const history = this.conversationHistory.get(sessionId)!;
      
      // Add user message to history
      history.push({ role: 'user', content: message });

      // Call Supabase Edge Function to handle AI API calls
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: history,
          provider,
          sessionId
        }
      });

      if (error) throw error;

      const assistantResponse = data.response;
      
      // Add assistant response to history
      history.push({ role: 'assistant', content: assistantResponse });

      // Keep only last 20 messages to avoid context overflow
      if (history.length > 20) {
        history.splice(1, history.length - 20); // Keep system prompt
      }

      return assistantResponse;
    } catch (error) {
      console.error('AI Service Error:', error);
      return 'I apologize, but I encountered an error. Please try again.';
    }
  }

  /**
   * Clear conversation history for a session
   */
  static clearHistory(sessionId: string) {
    this.conversationHistory.delete(sessionId);
  }
}
