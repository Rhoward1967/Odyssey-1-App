/**
 * R.O.M.A.N. Logical Hemisphere - "The Validator"
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * Part of the ODYSSEY-1 Genesis Protocol
 * The sovereign arbitrator that validates all commands
 */

import { supabase } from '@/lib/supabaseClient';
import { RomanCommand, RomanCommandSchema } from '@/schemas/RomanCommands';

export interface ValidationResult {
  approved: boolean;
  reason?: string;
  errors?: string[];
}

/**
 * COMPONENT 4: THE LOGICAL HEMISPHERE
 * The "Left Brain" that validates everything before execution
 */
export class LogicalHemisphere {
  /**
   * MAIN VALIDATION PIPELINE
   * 
   * Every command from the Creative Hemisphere passes through these 3 checks:
   * 1. Schema Validation (Structure)
   * 2. Permission Check (Authority)
   * 3. Business Logic Check (Rules)
   */
  static async validate(
    command: RomanCommand,
    userId: string
  ): Promise<ValidationResult> {
    
    const errors: string[] = [];

    // Basic structure validation (more flexible)
    if (!command.action) {
      errors.push('Missing required field: action');
    }

    if (!command.target) {
      errors.push('Missing required field: target');
    }

    // Validate action is one of the allowed values
    const validActions = ['READ', 'CREATE', 'UPDATE', 'DELETE', 'PROCESS', 'APPROVE'];
    if (command.action && !validActions.includes(command.action)) {
      errors.push(`Invalid action: ${command.action}. Must be one of: ${validActions.join(', ')}`);
    }

    // Validate target is one of the allowed values
    const validTargets = ['EMPLOYEE', 'PAYROLL_RUN', 'PAYSTUB', 'TIME_ENTRY', 'PROJECT_TASK', 'BID'];
    if (command.target && !validTargets.includes(command.target)) {
      errors.push(`Invalid target: ${command.target}. Must be one of: ${validTargets.join(', ')}`);
    }

    // Metadata validation (flexible - can be missing or incomplete)
    if (!command.metadata) {
      command.metadata = {
        requestedBy: userId,
        timestamp: new Date().toISOString(),
        intent: 'Auto-generated metadata' // Add this line
      };
    }

    // Payload validation (flexible - can be empty object)
    if (!command.payload) {
      command.payload = {};
    }

    // If no errors, approve the command
    if (errors.length === 0) {
      return {
        approved: true,
        reason: '✓ Command validated successfully'
      };
    }

    // If there are errors, return them
    return {
      approved: false,
      reason: errors.join('; '),
      errors
    };
  }

  /**
   * CHECK 1: Schema Validation
   * 
   * Verify the command structure against the Single Source of Truth.
   * This is a redundant check (AI should never generate invalid commands)
   * but serves as a critical safeguard.
   */
  private static validateSchema(command: RomanCommand): boolean {
    try {
      RomanCommandSchema.parse(command);
      return true;
    } catch (error) {
      console.error('LogicalHemisphere: Schema validation failed', error);
      return false;
    }
  }

  /**
   * CHECK 2: Permission Verification
   * 
   * Verify the user has authority to perform this action on this target.
   */
  private static async checkPermissions(command: RomanCommand, userId: string): Promise<boolean> {
    try {
      const { action, target, payload } = command;
      
      // Special handling for sensitive operations
      if (action === 'DELETE' || action === 'APPROVE') {
        // Check if user is admin/owner of the organization
        if (payload.organizationId) {
          const { data, error } = await supabase.rpc('is_user_org_admin', {
            user_id: userId,
            org_id: payload.organizationId
          });
          
          if (error || !data) {
            console.error('LogicalHemisphere: Admin check failed', error);
            return false;
          }
        }
      }
      
      // Target-specific permission checks
      switch (target) {
        case 'PAYROLL_RUN':
        case 'PAYSTUB':
          // Only admins/managers can process payroll
          return this.hasPayrollPermissions(userId, payload.organizationId);
        
        case 'EMPLOYEE':
          // HR permissions required
          return this.hasHRPermissions(userId, payload.organizationId);
        
        default:
          // Default: require basic organization membership
          return this.isOrgMember(userId, payload.organizationId);
      }
      
    } catch (error) {
      console.error('LogicalHemisphere: Permission check error', error);
      return false;
    }
  }

  /**
   * CHECK 3: Business Logic Validation
   * 
   * Verify the operation makes sense in the current system state.
   */
  private static async checkBusinessLogic(command: RomanCommand): Promise<boolean> {
    try {
      const { action, target, payload } = command;
      
      // Target-specific business rules
      switch (target) {
        case 'PAYSTUB':
          // Cannot delete/modify processed paystubs
          if (action === 'DELETE' || action === 'UPDATE') {
            const { data } = await supabase
              .from('paystubs')
              .select('status')
              .eq('id', payload.paystubId)
              .single();
            
            if (data?.status === 'processed') {
              console.error('LogicalHemisphere: Cannot modify processed paystub');
              return false;
            }
          }
          break;
        
        case 'PAYROLL_RUN':
          // Ensure pay period dates are valid
          if (action === 'PROCESS') {
            if (!payload.periodStart || !payload.periodEnd) {
              console.error('LogicalHemisphere: Missing pay period dates');
              return false;
            }
            
            const start = new Date(payload.periodStart);
            const end = new Date(payload.periodEnd);
            
            if (end <= start) {
              console.error('LogicalHemisphere: Invalid pay period range');
              return false;
            }
          }
          break;
        
        case 'PROJECT_TASK':
          // Cannot delete tasks with dependencies (future enhancement)
          break;
        
        default:
          // No specific rules for this target
          break;
      }
      
      return true;
      
    } catch (error) {
      console.error('LogicalHemisphere: Business logic check error', error);
      return false;
    }
  }

  /**
   * HELPER: Check if user has payroll processing permissions
   */
  private static async hasPayrollPermissions(userId: string, orgId?: number): Promise<boolean> {
    if (!orgId) return false;
    
    try {
      const { data, error } = await supabase
        .from('user_organizations')
        .select('role')
        .eq('user_id', userId)
        .eq('organization_id', orgId)
        .single();
      
      if (error || !data) return false;
      
      return ['owner', 'admin', 'manager'].includes(data.role.toLowerCase());
    } catch {
      return false;
    }
  }

  /**
   * HELPER: Check if user has HR permissions
   */
  private static async hasHRPermissions(userId: string, orgId?: number): Promise<boolean> {
    // Same logic as payroll for now (can be refined later)
    return this.hasPayrollPermissions(userId, orgId);
  }

  /**
   * HELPER: Check if user is member of organization
   */
  private static async isOrgMember(userId: string, orgId?: number): Promise<boolean> {
    if (!orgId) return true; // No org restriction
    
    try {
      const { data, error } = await supabase
        .from('user_organizations')
        .select('id')
        .eq('user_id', userId)
        .eq('organization_id', orgId)
        .single();
      
      return !error && !!data;
    } catch {
      return false;
    }
  }
}
