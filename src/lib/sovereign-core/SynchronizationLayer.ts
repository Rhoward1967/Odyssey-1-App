import { ROMAN_SCHEMA_BOOK, RomanCommand } from './SingleSourceOfTruth';

// Component 2: The Synchronization Layer - The "Librarian"
// Ensures both hemispheres read from the same book

export class SynchronizationLayer {
  
  // Generate Smart Prompt with injected "Book"
  static generateSmartPrompt(userIntent: string, userId: string, orgId: string): string {
    const timestamp = new Date().toISOString();
    const requestId = crypto.randomUUID();
    
    return `
# R.O.M.A.N. UNIVERSAL AI COMMAND GENERATOR
## SYNCHRONIZATION PRINCIPLE: You must read from "The Book"

### THE BOOK (Single Source of Truth):
${JSON.stringify(ROMAN_SCHEMA_BOOK, null, 2)}

### YOUR CONSTRAINTS:
1. You MUST use only the actions from the book: ${ROMAN_SCHEMA_BOOK.actions.join(', ')}
2. You MUST use only the targets from the book: ${ROMAN_SCHEMA_BOOK.targets.join(', ')}
3. You MUST follow the exact command structure defined in the book
4. You CANNOT invent new actions, targets, or structures

### USER CONTEXT:
- User ID: ${userId}
- Organization ID: ${orgId}
- Timestamp: ${timestamp}
- Request ID: ${requestId}

### USER INTENT:
"${userIntent}"

### YOUR TASK:
Generate a valid R.O.M.A.N. command in JSON format that satisfies the user's intent.
Use the examples in the book as reference.
Fill in the command structure from the book - this is paint-by-numbers, not creative writing.

### OUTPUT FORMAT:
Return ONLY valid JSON matching the RomanCommandSchema from the book.
`;
  }

  // Validate that AI output matches the book
  static validateAIOutput(aiOutput: string): { valid: boolean; command?: RomanCommand; error?: string } {
    try {
      const parsed = JSON.parse(aiOutput);
      const validated = ROMAN_SCHEMA_BOOK.command_structure.parse(parsed);
      return { valid: true, command: validated };
    } catch (error) {
      return { 
        valid: false, 
        error: `AI output failed validation: ${error.message}` 
      };
    }
  }
}
