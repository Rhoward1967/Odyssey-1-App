/**
 * R.O.M.A.N. Command Schema - Single Source of Truth
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * Part of the ODYSSEY-1 Genesis Protocol
 * Sovereign-Core Architecture - "The Book"
 */

import { z } from 'zod';

// ============================================================================
// ENUMERATED ACTIONS - The ONLY Valid Operations
// ============================================================================

export const ROMAN_ACTIONS = [
  "CREATE",
  "READ",
  "UPDATE",
  "DELETE",
  "EXECUTE",
  "VALIDATE",
  "PROCESS",
  "APPROVE"
] as const;

export type RomanAction = typeof ROMAN_ACTIONS[number];

// ============================================================================
// ENUMERATED TARGETS - The ONLY Valid System Entities
// ============================================================================

export const ROMAN_TARGETS = [
  "USER_PROFILE",
  "PROJECT_TASK",
  "PAYSTUB",
  "EMPLOYEE",
  "TIME_ENTRY",
  "PAYROLL_RUN",
  "BID",
  "CONTRACT",
  "ORGANIZATION",
  "AGENT"
] as const;

export type RomanTarget = typeof ROMAN_TARGETS[number];

// ============================================================================
// CORE COMMAND STRUCTURE - Universal Schema
// ============================================================================

export interface RomanCommand {
  action: RomanAction;
  target: RomanTarget;
  payload: Record<string, any>;
  metadata: {
    requestedBy: string;
    timestamp: string;
    intent: string;
    organizationId?: number;
  };
}

// ============================================================================
// DOMAIN-SPECIFIC COMMAND EXTENSIONS
// ============================================================================

// Payroll-Specific Commands
export interface PayrollCommand extends RomanCommand {
  target: "PAYSTUB" | "PAYROLL_RUN";
  payload: {
    organizationId: number;
    periodStart?: string;
    periodEnd?: string;
    employeeId?: string;
    amount?: number;
    deductions?: {
      federalTax?: number;
      stateTax?: number;
      childSupport?: number;
      garnishments?: number;
      benefitsCost?: number;
    };
    bonus?: number;
  };
}

// Employee Management Commands
export interface EmployeeCommand extends RomanCommand {
  target: "EMPLOYEE" | "TIME_ENTRY";
  payload: {
    employeeId?: string;
    organizationId: number;
    email?: string;
    name?: string;
    hourlyRate?: number;
    clockIn?: string;
    clockOut?: string;
  };
}

// Project Management Commands
export interface ProjectCommand extends RomanCommand {
  target: "PROJECT_TASK";
  payload: {
    taskId?: string;
    taskName?: string;
    projectId?: string;
    status?: string;
    assignedTo?: string;
  };
}

// ============================================================================
// ZOD VALIDATION SCHEMAS - Runtime Type Safety
// ============================================================================

// Core Command Schema
export const RomanCommandSchema = z.object({
  action: z.enum(ROMAN_ACTIONS),
  target: z.enum(ROMAN_TARGETS),
  payload: z.record(z.any()),
  metadata: z.object({
    requestedBy: z.string(),
    timestamp: z.string(),
    intent: z.string(),
    organizationId: z.number().optional()
  })
});

// Payroll Command Schema
export const PayrollCommandSchema = z.object({
  action: z.enum(ROMAN_ACTIONS),
  target: z.enum(["PAYSTUB", "PAYROLL_RUN"]),
  payload: z.object({
    organizationId: z.number(),
    periodStart: z.string().optional(),
    periodEnd: z.string().optional(),
    employeeId: z.string().optional(),
    amount: z.number().optional(),
    deductions: z.object({
      federalTax: z.number().optional(),
      stateTax: z.number().optional(),
      childSupport: z.number().optional(),
      garnishments: z.number().optional(),
      benefitsCost: z.number().optional()
    }).optional(),
    bonus: z.number().optional()
  }),
  metadata: z.object({
    requestedBy: z.string(),
    timestamp: z.string(),
    intent: z.string(),
    organizationId: z.number().optional()
  })
});

// ============================================================================
// HELPER FUNCTIONS - Schema Utilities
// ============================================================================

/**
 * Validate if a command conforms to the Single Source of Truth
 */
export function isValidCommand(command: unknown): command is RomanCommand {
  try {
    RomanCommandSchema.parse(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all valid actions for documentation/UI purposes
 */
export function getValidActions(): readonly RomanAction[] {
  return ROMAN_ACTIONS;
}

/**
 * Get all valid targets for documentation/UI purposes
 */
export function getValidTargets(): readonly RomanTarget[] {
  return ROMAN_TARGETS;
}

/**
 * Generate the schema definition as a string (for AI prompt injection)
 */
export function getSchemaDefinition(): string {
  return `
VALID ACTIONS: ${ROMAN_ACTIONS.join(', ')}
VALID TARGETS: ${ROMAN_TARGETS.join(', ')}

COMMAND STRUCTURE:
{
  "action": "<one of the valid actions>",
  "target": "<one of the valid targets>",
  "payload": { <relevant data for the operation> },
  "metadata": {
    "requestedBy": "<user_id>",
    "timestamp": "<ISO timestamp>",
    "intent": "<original user request>",
    "organizationId": <number>
  }
}
`;
}
