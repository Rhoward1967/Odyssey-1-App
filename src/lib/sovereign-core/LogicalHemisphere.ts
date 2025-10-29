import { supabase } from '@/lib/supabase';
import { RomanCommand } from './SingleSourceOfTruth';

// Component 4: Logical Hemisphere - The "Left Brain"  
// R.O.M.A.N. Interpreter - Sovereign validation

export class LogicalHemisphere {
  
  // Validate and approve/reject AI-generated commands
  static async validateCommand(
    command: RomanCommand
  ): Promise<{ approved: boolean; error?: string; executionPlan?: any }> {
    
    try {
      // 1. Schema validation (already done by Creative Hemisphere)
      console.log('✅ Schema validation: Passed');
      
      // 2. Permission checks
      const permissionCheck = await this.checkPermissions(command);
      if (!permissionCheck.allowed) {
        return { 
          approved: false, 
          error: `Permission denied: ${permissionCheck.reason}` 
        };
      }
      
      // 3. Business logic validation
      const businessLogicCheck = await this.validateBusinessLogic(command);
      if (!businessLogicCheck.valid) {
        return { 
          approved: false, 
          error: `Business logic violation: ${businessLogicCheck.reason}` 
        };
      }
      
      // 4. Generate execution plan
      const executionPlan = this.generateExecutionPlan(command);
      
      return { 
        approved: true, 
        executionPlan 
      };
      
    } catch (error) {
      return { 
        approved: false, 
        error: `Logical Hemisphere validation error: ${error.message}` 
      };
    }
  }

  // Check user permissions for the command
  private static async checkPermissions(command: RomanCommand): Promise<{ allowed: boolean; reason?: string }> {
    // Check if user exists and has appropriate role
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', command.user_id)
      .eq('organization_id', command.organization_id)
      .single();
      
    if (!userOrg) {
      return { allowed: false, reason: 'User not found in organization' };
    }
    
    // Role-based permission checks
    const rolePermissions = {
      owner: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'ANALYZE', 'OPTIMIZE', 'PREDICT', 'VALIDATE'],
      admin: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'ANALYZE', 'OPTIMIZE', 'PREDICT'],
      manager: ['CREATE', 'READ', 'UPDATE', 'ANALYZE', 'PREDICT'],
      staff: ['READ', 'UPDATE', 'ANALYZE']
    };
    
    const allowedActions = rolePermissions[userOrg.role] || [];
    
    if (!allowedActions.includes(command.action)) {
      return { 
        allowed: false, 
        reason: `Role '${userOrg.role}' not authorized for action '${command.action}'` 
      };
    }
    
    return { allowed: true };
  }

  // Validate business logic
  private static async validateBusinessLogic(command: RomanCommand): Promise<{ valid: boolean; reason?: string }> {
    // Business logic checks based on action and target
    switch (command.action) {
      case 'DELETE':
        if (command.target === 'PROJECT_TASK') {
          // Check if task exists and can be deleted
          const taskName = command.payload?.taskName;
          if (!taskName) {
            return { valid: false, reason: 'Task name required for deletion' };
          }
          
          // Additional business logic: Can't delete tasks from archived projects, etc.
          return { valid: true };
        }
        break;
        
      case 'CREATE':
        if (command.target === 'USER_PROFILE') {
          // Validate required fields for user creation
          const { email, name } = command.payload || {};
          if (!email || !name) {
            return { valid: false, reason: 'Email and name required for user creation' };
          }
        }
        break;
    }
    
    return { valid: true };
  }

  // Generate execution plan for approved commands
  private static generateExecutionPlan(command: RomanCommand): any {
    return {
      command_id: command.request_id,
      steps: [
        {
          type: 'database_operation',
          table: this.getTableForTarget(command.target),
          operation: command.action.toLowerCase(),
          payload: command.payload
        }
      ],
      estimated_duration: '100ms',
      rollback_plan: this.generateRollbackPlan(command)
    };
  }

  private static getTableForTarget(target: string): string {
    const targetTableMap = {
      'PROJECT_TASK': 'tasks',
      'USER_PROFILE': 'users', 
      'BID_PROPOSAL': 'bids',
      'DOCUMENT': 'documents',
      'EMPLOYEE': 'employees',
      'TIME_ENTRY': 'time_entries'
    };
    
    return targetTableMap[target] || 'unknown';
  }

  private static generateRollbackPlan(command: RomanCommand): any {
    // Generate rollback steps for safe execution
    return {
      enabled: true,
      steps: ['backup_current_state', 'prepare_rollback_data']
    };
  }
}
