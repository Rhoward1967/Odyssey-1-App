import { z } from 'zod';

// Validation schemas
export const bidSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  deadline: z.date().min(new Date(), 'Deadline must be in the future'),
  category: z.string().min(1, 'Category is required'),
  specifications: z.array(z.object({
    item: z.string().min(1, 'Item name required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Unit price cannot be negative'),
    description: z.string().optional()
  })).min(1, 'At least one specification required')
});

export const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  role: z.enum(['admin', 'user']).optional()
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name required').max(100, 'Name too long'),
  company: z.string().max(200, 'Company name too long').optional(),
  phone: z.string().regex(/^\+?[\d\s\-()]{10,}$/, 'Invalid phone format').optional(),
  address: z.string().max(500, 'Address too long').optional()
});

// Validation helper functions
export const validateData = <T,>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }
  
  return { valid: true };
};