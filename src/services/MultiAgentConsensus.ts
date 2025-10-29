import { RomanCommand } from '@/schemas/RomanCommands';
import { SynchronizationLayer } from './SynchronizationLayer';

/**
 * COMPONENT 3: THE CREATIVE HEMISPHERE
 * The "Right Brain" that generates commands from constrained prompts
 */
export class MultiAgentConsensus {
  
  /**
   * UPDATED: Now receives schema-injected prompts from Synchronization Layer
   */
  static async processWithConsensus(userIntent: string, userId: string): Promise<RomanCommand> {
    // STEP 1: Get the Smart Prompt with schema injection
    const command = await SynchronizationLayer.generateCommand(userIntent, userId);
    
    // STEP 2: Multi-agent consensus (optional enhancement)
    // Multiple AI agents could vote on the best interpretation
    // For now, single agent output is returned
    
    return command;
  }
}
