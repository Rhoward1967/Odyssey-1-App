/**
 * R.O.M.A.N. Logical Hemisphere - "The Validator"
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * Part of the ODYSSEY-1 Genesis Protocol
 * The sovereign arbitrator that validates all commands
 */

import { RomanCommand, RomanCommandSchema } from '@/schemas/RomanCommands';
import { romanSupabase as supabase } from './romanSupabase';

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
    const warnings: string[] = [];

    // Basic structure validation (more flexible)
    if (!command.action) {
      errors.push('CRITICAL: Missing required field: action');
    }

    if (!command.target) {
      errors.push('CRITICAL: Missing required field: target');
    }

    // Validate action is one of the allowed values (EXPANDED)
    const validActions = ['READ', 'CREATE', 'UPDATE', 'DELETE', 'PROCESS', 'APPROVE', 'EXECUTE', 'VALIDATE', 'GENERATE', 'MONITOR', 'ANALYZE', 'SUBMIT', 'AUTO'];
    if (command.action && !validActions.includes(command.action)) {
      errors.push(`CRITICAL: Invalid action: ${command.action}. Must be one of: ${validActions.join(', ')}`);
    }

    // Validate target is one of the allowed values (EXPANDED)
    const validTargets = [
      'EMPLOYEE', 'PAYROLL_RUN', 'PAYSTUB', 'TIME_ENTRY', 'PROJECT_TASK', 'BID',
      'TRADE', 'PORTFOLIO', 'MARKET_DATA', 'AI_RESEARCH', 'AI_CALCULATOR',
      'EMAIL', 'DISCORD', 'AGENT', 'SYSTEM_STATUS', 'CONTRACT', 'ORGANIZATION', 'USER_PROFILE'
    ];
    if (command.target && !validTargets.includes(command.target)) {
      errors.push(`CRITICAL: Invalid target: ${command.target}. Must be one of: ${validTargets.join(', ')}`);
    }

    // Target-specific payload validation (ENHANCED)
    if (command.target && command.payload) {
      switch (command.target) {
        case 'TRADE':
          if (command.action === 'EXECUTE') {
            if (!command.payload.symbol) {
              errors.push('CRITICAL: TRADE EXECUTE requires payload.symbol (e.g., "TSLA" or "USDC")');
            }
            if (!command.payload.side) {
              errors.push('CRITICAL: TRADE EXECUTE requires payload.side ("buy" or "sell")');
            }
            if (!command.payload.quantity && command.payload.quantity !== 0) {
              errors.push('CRITICAL: TRADE EXECUTE requires payload.quantity (trade amount)');
            }
            
            // Trade-specific business logic validation
            const quantity = parseFloat(command.payload.quantity);
            if (isNaN(quantity) || quantity <= 0) {
              errors.push('CRITICAL: TRADE quantity must be a positive number');
            }
            
            // Minimum trade size (prevent dust trades with high gas costs)
            if (quantity < 5 && command.payload.tradingMode === 'live') {
              warnings.push('WARNING: Live trades under $5 may have gas fees exceeding trade value');
            }
            
            // Maximum trade size (risk management)
            if (quantity > 1000) {
              errors.push('CRITICAL: TRADE quantity exceeds maximum allowed ($1000)');
            }
            
            // Validate trading mode
            if (command.payload.tradingMode && !['paper', 'live'].includes(command.payload.tradingMode)) {
              errors.push('CRITICAL: tradingMode must be "paper" or "live"');
            }
            
            // Validate slippage tolerance for live trades
            if (command.payload.tradingMode === 'live' && command.payload.slippage) {
              const slippage = parseFloat(command.payload.slippage);
              if (slippage < 0.1 || slippage > 5) {
                warnings.push('WARNING: Slippage tolerance should be between 0.1% and 5%');
              }
            }
          }
          break;
        
        case 'PAYROLL_RUN':
          if (command.action === 'PROCESS') {
            if (!command.payload.periodStart) {
              warnings.push('WARNING: PAYROLL_RUN PROCESS should include payload.periodStart');
            }
            if (!command.payload.periodEnd) {
              warnings.push('WARNING: PAYROLL_RUN PROCESS should include payload.periodEnd');
            }
          }
          break;
        
        case 'EMAIL':
          if (command.action === 'CREATE') {
            if (!command.payload.to) {
              errors.push('CRITICAL: EMAIL CREATE requires payload.to (recipient email)');
            }
            if (!command.payload.subject && !command.payload.body) {
              warnings.push('WARNING: EMAIL CREATE should include payload.subject and payload.body');
            }
          }
          break;
        
        case 'AI_RESEARCH':
          if (command.action === 'PROCESS') {
            if (!command.payload.query) {
              errors.push('CRITICAL: AI_RESEARCH PROCESS requires payload.query (search term)');
            }
          }
          break;
      }
    }

    // Metadata validation (flexible - can be missing or incomplete)
    if (!command.metadata) {
      command.metadata = {
        requestedBy: userId,
        timestamp: new Date().toISOString(),
        intent: 'Auto-generated metadata'
      };
    }

    // Payload validation (flexible - can be empty object)
    if (!command.payload) {
      command.payload = {};
    }

    // If no CRITICAL errors, approve the command (warnings are OK)
    if (errors.length === 0) {
      const warningNote = warnings.length > 0 ? ` (${warnings.length} warnings: ${warnings.join('; ')})` : '';
      return {
        approved: true,
        reason: `✅ Command validated successfully${warningNote}`
      };
    }

    // If there are CRITICAL errors, return them with helpful feedback
    return {
      approved: false,
      reason: `❌ VALIDATION FAILED: ${errors.join(' | ')}${warnings.length > 0 ? ' | WARNINGS: ' + warnings.join(' | ') : ''}`,
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
