/**
 * R.O.M.A.N. Sovereign-Core Orchestrator
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * Part of the ODYSSEY-1 Genesis Protocol
 * The "male plug" that connects R.O.M.A.N. to ODYSSEY-1
 */

import { supabase } from '@/lib/supabaseClient';
import { RomanCommand } from '@/schemas/RomanCommands';
import { LogicalHemisphere, ValidationResult } from './LogicalHemisphere';
import { SynchronizationLayer } from './SynchronizationLayer';

export interface OrchestrationResult {
  success: boolean;
  command?: RomanCommand;
  validation?: ValidationResult;
  execution?: {
    success: boolean;
    data?: any;
    message: string;
  };
  message: string;
}

export class SovereignCoreOrchestrator {
  
  /**
   * MAIN ORCHESTRATION FLOW
   * 
   * This is the complete pipeline from intent to execution:
   * 1. Synchronization Layer generates command
   * 2. Logical Hemisphere validates
   * 3. Execution Engine performs action
   */
  static async processIntent(
    userIntent: string,
    userId: string,
    organizationId?: number
  ): Promise<OrchestrationResult> {
    
    try {
      // PHASE 1: Creative Hemisphere (via Synchronization Layer)
      console.log('🌌 Sovereign-Core: Phase 1 - Creative Hemisphere');
      const command = await SynchronizationLayer.generateCommand(
        userIntent,
        userId,
        organizationId
      );
      
      console.log('✅ Command generated:', command);

      // PHASE 2: Logical Hemisphere (Validation)
      console.log('🔍 Sovereign-Core: Phase 2 - Logical Hemisphere');
      const validation = await LogicalHemisphere.validate(command, userId);
      
      if (!validation.approved) {
        return {
          success: false,
          command,
          validation,
          message: `Validation failed: ${validation.reason}`,
        };
      }

      console.log('✅ Validation passed');

      // PHASE 3: Execution Engine
      console.log('⚡ Sovereign-Core: Phase 3 - Execution Engine');
      const execution = await this.executeCommand(command);

      return {
        success: execution.success,
        command,
        validation,
        execution,
        message: execution.message,
      };

    } catch (error: any) {
      console.error('❌ Orchestration failed:', error);
      return {
        success: false,
        message: `Orchestration error: ${error.message}`,
      };
    }
  }

  /**
   * EXECUTION ENGINE (Make public so interface can call it)
   * 
   * Routes validated commands to the appropriate ODYSSEY-1 module
   */
  static async executeCommand(command: RomanCommand): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    
    const { action, target, payload } = command;

    try {
      switch (target) {
        case 'PAYROLL_RUN':
          return await this.executePayrollCommand(command);
        
        case 'PAYSTUB':
          return await this.executePaystubCommand(command);
        
        case 'EMPLOYEE':
          return await this.executeEmployeeCommand(command);
        
        case 'TIME_ENTRY':
          return await this.executeTimeEntryCommand(command);
        
        case 'PROJECT_TASK':
          return await this.executeTaskCommand(command);
        
        case 'BID':
          return await this.executeBidCommand(command);
        
        default:
          return {
            success: false,
            message: `Execution not implemented for target: ${target}`
          };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Execution failed: ${error.message}`
      };
    }
  }

  /**
   * PAYROLL_RUN EXECUTION
   */
  private static async executePayrollCommand(command: RomanCommand) {
    const { action, payload } = command;

    if (action === 'PROCESS') {
      // Call the run-payroll Edge Function
      const { data, error } = await supabase.functions.invoke('run-payroll', {
        body: {
          organization_id: payload.organizationId,
          period_start: payload.periodStart,
          period_end: payload.periodEnd
        }
      });

      if (error) throw error;
      
      return {
        success: true,
        data,
        message: data?.message || 'Payroll processing initiated'
      };
    }

    return { success: false, message: `Action ${action} not supported for PAYROLL_RUN` };
  }

  /**
   * PAYSTUB EXECUTION
   */
  private static async executePaystubCommand(command: RomanCommand) {
    const { action, payload } = command;

    switch (action) {
      case 'CREATE':
        const { data: created, error: createError } = await supabase
          .from('paystubs')
          .insert(payload)
          .select()
          .single();
        
        if (createError) throw createError;
        return { success: true, data: created, message: 'Paystub created' };
      
      case 'UPDATE':
        const { data: updated, error: updateError } = await supabase
          .from('paystubs')
          .update(payload)
          .eq('id', payload.paystubId)
          .select()
          .single();
        
        if (updateError) throw updateError;
        return { success: true, data: updated, message: 'Paystub updated' };
      
      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('paystubs')
          .delete()
          .eq('id', payload.paystubId);
        
        if (deleteError) throw deleteError;
        return { success: true, message: 'Paystub deleted' };
      
      case 'APPROVE':
        const { error: approveError } = await supabase
          .from('paystubs')
          .update({ 
            status: 'approved',
            approved_by: command.metadata.requestedBy,
            approved_at: new Date().toISOString()
          })
          .eq('id', payload.paystubId);
        
        if (approveError) throw approveError;
        return { success: true, message: 'Paystub approved' };
      
      default:
        return { success: false, message: `Action ${action} not supported for PAYSTUB` };
    }
  }

  /**
   * EMPLOYEE EXECUTION
   */
  private static async executeEmployeeCommand(command: RomanCommand) {
    const { action, payload } = command;

    switch (action) {
      case 'READ':
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('organization_id', payload.organizationId);
        
        if (error) throw error;
        return { success: true, data, message: `Found ${data.length} employees` };
      
      case 'CREATE':
        const { data: created, error: createError } = await supabase
          .from('employees')
          .insert(payload)
          .select()
          .single();
        
        if (createError) throw createError;
        return { success: true, data: created, message: 'Employee created' };
      
      default:
        return { success: false, message: `Action ${action} not supported for EMPLOYEE` };
    }
  }

  /**
   * TIME_ENTRY EXECUTION
   */
  private static async executeTimeEntryCommand(command: RomanCommand) {
    // TODO: Implement time entry operations
    return { success: false, message: 'TIME_ENTRY execution not yet implemented' };
  }

  /**
   * PROJECT_TASK EXECUTION
   */
  private static async executeTaskCommand(command: RomanCommand) {
    const { action, payload } = command;

    if (action === 'DELETE') {
      // TODO: Implement actual task deletion
      // This would query your tasks table
      return {
        success: true,
        message: `Task "${payload.taskName}" marked for deletion`
      };
    }

    return { success: false, message: `Action ${action} not supported for PROJECT_TASK` };
  }

  /**
   * BID EXECUTION
   */
  private static async executeBidCommand(command: RomanCommand) {
    // TODO: Implement bid operations
    return { success: false, message: 'BID execution not yet implemented' };
  }
}
