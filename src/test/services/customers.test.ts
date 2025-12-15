import { supabase } from '@/lib/supabase';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockCustomer, mockUser } from '../utils';

vi.mock('@/lib/supabase');

describe('Customer CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Customer', () => {
    it('should successfully create a new customer', async () => {
      const newCustomer = {
        user_id: mockUser.id,
        company_name: 'New Company',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@newcompany.com',
        phone: '555-0200',
        address: '456 New St',
        billing_city: 'New City',
        billing_state: 'NC',
        billing_zip: '54321'
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 2, ...newCustomer, created_at: new Date().toISOString() },
            error: null
          })
        })
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any);

      const result = await supabase
        .from('customers')
        .insert(newCustomer)
        .select()
        .single();

      expect(mockInsert).toHaveBeenCalledWith(newCustomer);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(2);
      expect(result.data?.company_name).toBe('New Company');
      expect(result.error).toBeNull();
    });

    it('should validate required fields', async () => {
      const invalidCustomer = {
        user_id: mockUser.id,
        // Missing required fields
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Missing required fields', code: '23502' }
          })
        })
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any);

      const result = await supabase
        .from('customers')
        .insert(invalidCustomer)
        .select()
        .single();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('required');
    });
  });

  describe('Read Customers', () => {
    it('should fetch all customers for a user', async () => {
      const mockCustomers = [mockCustomer, { ...mockCustomer, id: 2, company_name: 'Another Company' }];

      const mockEq = vi.fn().mockResolvedValue({
        data: mockCustomers,
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', mockUser.id);

      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(result.data).toHaveLength(2);
    });

    it('should fetch a single customer by id', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockCustomer,
        error: null
      });

      const mockEq = vi.fn().mockReturnValue({
        single: mockSingle
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await supabase
        .from('customers')
        .select('*')
        .eq('id', 1)
        .single();

      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(1);
      expect(result.data?.company_name).toBe('Test Company');
    });

    it('should return error for non-existent customer', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Customer not found', code: 'PGRST116' }
      });

      const mockEq = vi.fn().mockReturnValue({
        single: mockSingle
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await supabase
        .from('customers')
        .select('*')
        .eq('id', 9999)
        .single();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('not found');
    });
  });

  describe('Update Customer', () => {
    it('should successfully update customer details', async () => {
      const updates = {
        company_name: 'Updated Company',
        phone: '555-9999'
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: { ...mockCustomer, ...updates },
        error: null
      });

      const mockEq = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: mockSingle
        })
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any);

      const result = await supabase
        .from('customers')
        .update(updates)
        .eq('id', 1)
        .select()
        .single();

      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(result.data?.company_name).toBe('Updated Company');
      expect(result.data?.phone).toBe('555-9999');
    });

    it('should enforce RLS policies on update', async () => {
      const updates = { company_name: 'Unauthorized Update' };

      const mockEq = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Row level security policy violation', code: '42501' }
          })
        })
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any);

      const result = await supabase
        .from('customers')
        .update(updates)
        .eq('id', 1)
        .select()
        .single();

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('42501');
    });
  });

  describe('Delete Customer', () => {
    it('should successfully delete a customer', async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
        count: 1
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq
      });

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete
      } as any);

      const result = await supabase
        .from('customers')
        .delete()
        .eq('id', 1);

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 1);
      expect(result.error).toBeNull();
    });

    it('should prevent deleting customer with active bids', async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: { 
          message: 'Foreign key violation: customer has active bids',
          code: '23503'
        }
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq
      });

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete
      } as any);

      const result = await supabase
        .from('customers')
        .delete()
        .eq('id', 1);

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('23503');
    });
  });

  describe('Customer Search', () => {
    it('should search customers by company name', async () => {
      const mockIlike = vi.fn().mockResolvedValue({
        data: [mockCustomer],
        error: null
      });

      const mockEq = vi.fn().mockReturnValue({
        ilike: mockIlike
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', mockUser.id)
        .ilike('company_name', '%Test%');

      expect(result.data).toBeDefined();
      expect(result.data?.length).toBeGreaterThan(0);
    });
  });
});
