import { z } from 'zod';

// Component 1: The "Single Source of Truth" - The "Book"
// This defines the system's "physics" - non-negotiable reality

export const RomanActionSchema = z.enum([
  'CREATE',
  'READ', 
  'UPDATE',
  'DELETE',
  'ANALYZE',
  'OPTIMIZE',
  'PREDICT',
  'VALIDATE'
]);

export const RomanTargetSchema = z.enum([
  'USER_PROFILE',
  'PROJECT_TASK',
  'BID_PROPOSAL',
  'DOCUMENT',
  'EMPLOYEE',
  'TIME_ENTRY',
  'ANALYTICS_REPORT',
  'AI_AGENT',
  'SYSTEM_CONFIG'
]);

export const RomanPayloadSchema = z.record(z.any()).optional();

export const RomanCommandSchema = z.object({
  action: RomanActionSchema,
  target: RomanTargetSchema,
  payload: RomanPayloadSchema,
  user_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  request_id: z.string().uuid()
});

export type RomanAction = z.infer<typeof RomanActionSchema>;
export type RomanTarget = z.infer<typeof RomanTargetSchema>;
export type RomanCommand = z.infer<typeof RomanCommandSchema>;

// The "Book" - Single Source of Truth for all R.O.M.A.N. operations
export const ROMAN_SCHEMA_BOOK = {
  version: '1.0.0-sovereign',
  description: 'R.O.M.A.N. Universal AI Command Schema - The Single Source of Truth',
  actions: RomanActionSchema.options,
  targets: RomanTargetSchema.options,
  command_structure: RomanCommandSchema,
  
  // Command Examples for AI Training
  examples: {
    delete_task: {
      action: 'DELETE' as const,
      target: 'PROJECT_TASK' as const,
      payload: { taskName: 'Deploy', projectId: 'uuid' }
    },
    create_user: {
      action: 'CREATE' as const,
      target: 'USER_PROFILE' as const,
      payload: { email: 'user@domain.com', name: 'John Doe' }
    },
    analyze_bids: {
      action: 'ANALYZE' as const,
      target: 'BID_PROPOSAL' as const,
      payload: { timeframe: '90d', includeWinLoss: true }
    }
  }
};
