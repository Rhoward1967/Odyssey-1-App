import { RomanCommand } from '../../schemas/RomanCommands';
import { SynchronizationLayer } from '../../services/SynchronizationLayer';
import { CreativeHemisphere } from '../../services/MultiAgentConsensus';
import { RomanInterpreter } from '../../services/LogicalHemisphere';
import { SecureExecutionEngine } from '../../services/ExecutionEngine';

// Initialize core services
const synchronization = new SynchronizationLayer();
const creativeHemisphere = new CreativeHemisphere();
const logicalHemisphere = new RomanInterpreter();
const executionEngine = new SecureExecutionEngine();

export type CoreProcessingResult = {
    success: boolean;
    message: string;
    error?: string;
    flow?: {
        user_intent: string;
        phases: {
            phase: string;
            success: boolean;
            output: any;
            error?: string;
        }[];
    }
}

/**
 * The SovereignCoreOrchestrator is the single entry point for all natural 
 * language commands, managing the entire R.O.M.A.N. command lifecycle.
 */
export class SovereignCoreOrchestrator {
    
    /**
     * Processes a user's natural language command through the entire Sovereign-Core flow.
     */
    public static async processUserIntent(userIntent: string, userId: string, orgId: string): Promise<CoreProcessingResult> {
        const flow: CoreProcessingResult['flow'] = { user_intent: userIntent, phases: [] };
        
        let romanCommand: RomanCommand | null = null;

        try {
            // --- Phase 1 & 2: Synchronization & Creative Prompt Generation ---
            const enhancedPrompt = await synchronization.generateConstrainedPrompt(userIntent, userId, orgId);
            flow.phases.push({ 
                phase: 'synchronization_layer', 
                success: true, 
                output: { prompt: enhancedPrompt.promptText, user_id: userId } 
            });

            // --- Phase 3: Creative Hemisphere (LLM Generation) ---
            const generatedCommand = await creativeHemisphere.processWithConsensus(enhancedPrompt);
            romanCommand = generatedCommand;
            flow.phases.push({ 
                phase: 'creative_hemisphere', 
                success: true, 
                output: { command: romanCommand } 
            });

            // --- Phase 4: Logical Hemisphere (Validation) ---
            const validationResult = logicalHemisphere.validateCommand(romanCommand, { userId, orgId });
            if (!validationResult.isValid) {
                flow.phases.push({ 
                    phase: 'logical_hemisphere', 
                    success: false, 
                    output: validationResult.details, 
                    error: validationResult.message 
                });
                return { success: false, message: 'Command blocked by Logical Hemisphere validation.', error: validationResult.message, flow };
            }
            flow.phases.push({ 
                phase: 'logical_hemisphere', 
                success: true, 
                output: { message: validationResult.message } 
            });

            // --- Phase 5: Execution Engine ---
            const executionResult = await executionEngine.executeApprovedCommand(romanCommand);
            if (!executionResult.success) {
                flow.phases.push({ 
                    phase: 'execution_engine', 
                    success: false, 
                    output: executionResult.output, 
                    error: executionResult.message 
                });
                return { success: false, message: 'Command failed during execution.', error: executionResult.message, flow };
            }
            flow.phases.push({ 
                phase: 'execution_engine', 
                success: true, 
                output: executionResult.output
            });

            return { success: true, message: 'Sovereign command executed successfully.', flow };

        } catch (error: any) {
            flow.phases.push({ phase: 'orchestration_error', success: false, output: { details: error.message }, error: 'Orchestration failed at critical step.' });
            return { success: false, message: 'Critical error during command orchestration.', error: error.message, flow };
        }
    }
}
