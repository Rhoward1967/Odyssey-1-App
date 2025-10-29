import { RomanCommand } from '@/schemas/RomanCommands';
import { supabase } from '@/lib/supabaseClient';

/**
 * COMPONENT 5: THE EXECUTION ENGINE
 * The "Hands" that perform approved actions
 */
export class ExecutionEngine {
  
  static async execute(command: RomanCommand): Promise<{ success: boolean; message: string }> {
    try {
      switch (command.target) {
        case 'PAYSTUB':
          return await this.executePaystubCommand(command);
        
        case 'PAYROLL_RUN':
          return await this.executePayrollRunCommand(command);
        
        case 'PROJECT_TASK':
          return await this.executeTaskCommand(command);
        
        default:
          return { success: false, message: `Unknown target: ${command.target}` };
      }
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private static async executePaystubCommand(command: RomanCommand) {
    switch (command.action) {
      case 'CREATE':
        const { data, error } = await supabase.from('paystubs').insert(command.payload);
        if (error) throw error;
        return { success: true, message: 'Paystub created' };
      
      case 'UPDATE':
        // Implementation
        break;
      
      case 'DELETE':
        // Implementation
        break;
      
      default:
        return { success: false, message: `Invalid action for PAYSTUB: ${command.action}` };
    }
  }

  private static async executePayrollRunCommand(command: RomanCommand) {
    // Call the run-payroll Edge Function
    const { data, error } = await supabase.functions.invoke('run-payroll', { body: command.payload });
    if (error) throw error;
    return { success: true, message: data.message };
  }

  private static async executeTaskCommand(command: RomanCommand) {
    // Implementation for PROJECT_TASK operations
    return { success: true, message: 'Task command executed' };
  }
}
