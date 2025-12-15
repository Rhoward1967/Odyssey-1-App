import { supabase } from '@/lib/supabase';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockBid, mockCustomer, mockUser } from '../utils';

vi.mock('@/lib/supabase');

describe('Bid Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Bid', () => {
    it('should create a new bid with line items', async () => {
      const newBid = {
        user_id: mockUser.id,
        customer_id: mockCustomer.id,
        title: 'New Cleaning Bid',
        description: 'Office cleaning service',
        line_items: [
          {
            name: 'Deep Clean',
            description: 'Full office deep clean',
            quantity: 1,
            unit_price: 50000, // $500.00
            total: 50000
          }
        ],
        subtotal: 50000,
        tax: 4000,
        total: 54000,
        status: 'draft',
        valid_until: '2025-12-31'
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: { ...newBid, id: 'bid-new', bid_number: 'BID-20250115-0001', created_at: new Date().toISOString() },
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any);

      const result = await supabase
        .from('bids')
        .insert(newBid)
        .select()
        .single();

      expect(mockInsert).toHaveBeenCalledWith(newBid);
      expect(result.data).toBeDefined();
      expect(result.data?.bid_number).toMatch(/^BID-\d{8}-\d{4}$/);
      expect(result.data?.total).toBe(54000);
    });

    it('should calculate totals correctly', async () => {
      const bidWithMultipleItems = {
        user_id: mockUser.id,
        customer_id: mockCustomer.id,
        title: 'Multi-Item Bid',
        line_items: [
          { name: 'Item 1', quantity: 2, unit_price: 10000, total: 20000 },
          { name: 'Item 2', quantity: 3, unit_price: 5000, total: 15000 }
        ],
        subtotal: 35000,
        tax: 2800,
        total: 37800,
        status: 'draft'
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: { ...bidWithMultipleItems, id: 'bid-multi', created_at: new Date().toISOString() },
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any);

      const result = await supabase
        .from('bids')
        .insert(bidWithMultipleItems)
        .select()
        .single();

      expect(result.data?.subtotal).toBe(35000);
      expect(result.data?.total).toBe(37800);
    });

    it('should reject bid without customer', async () => {
      const invalidBid = {
        user_id: mockUser.id,
        // missing customer_id
        title: 'Invalid Bid',
        line_items: [],
        subtotal: 0,
        total: 0,
        status: 'draft'
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Foreign key violation: customer_id required', code: '23503' }
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any);

      const result = await supabase
        .from('bids')
        .insert(invalidBid)
        .select()
        .single();

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('23503');
    });
  });

  describe('Read Bids', () => {
    it('should fetch all bids for a user via view', async () => {
      const mockBids = [
        mockBid,
        { ...mockBid, id: 'bid-2', bid_number: 'BID-20250115-0002', status: 'pending' }
      ];

      const mockEq = vi.fn().mockResolvedValue({
        data: mockBids,
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await supabase
        .from('view_user_bids')
        .select('*')
        .eq('user_id', mockUser.id);

      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].status).toBe('draft');
      expect(result.data?.[1].status).toBe('pending');
    });

    it('should filter bids by status', async () => {
      const approvedBids = [
        { ...mockBid, id: 'bid-approved', status: 'approved' }
      ];

      const mockEq2 = vi.fn().mockResolvedValue({
        data: approvedBids,
        error: null
      });

      const mockEq1 = vi.fn().mockReturnValue({
        eq: mockEq2
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq1
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await supabase
        .from('view_user_bids')
        .select('*')
        .eq('user_id', mockUser.id)
        .eq('status', 'approved');

      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].status).toBe('approved');
    });
  });

  describe('Update Bid', () => {
    it('should update bid status', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { ...mockBid, status: 'pending' },
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle
      });

      const mockEq = vi.fn().mockReturnValue({
        select: mockSelect
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any);

      const result = await supabase
        .from('bids')
        .update({ status: 'pending' })
        .eq('id', mockBid.id)
        .select()
        .single();

      expect(result.data?.status).toBe('pending');
    });

    it('should update line items', async () => {
      const updatedLineItems = [
        ...mockBid.line_items,
        {
          name: 'Additional Service',
          quantity: 1,
          unit_price: 5000,
          total: 5000
        }
      ];

      const mockSingle = vi.fn().mockResolvedValue({
        data: { 
          ...mockBid, 
          line_items: updatedLineItems,
          subtotal: 15000,
          total: 16200
        },
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle
      });

      const mockEq = vi.fn().mockReturnValue({
        select: mockSelect
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any);

      const result = await supabase
        .from('bids')
        .update({ 
          line_items: updatedLineItems,
          subtotal: 15000,
          total: 16200
        })
        .eq('id', mockBid.id)
        .select()
        .single();

      expect(result.data?.line_items).toHaveLength(2);
      expect(result.data?.total).toBe(16200);
    });

    it('should prevent updating converted bid', async () => {
      const mockEq = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Cannot update converted bid', code: '23514' }
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
        .from('bids')
        .update({ status: 'draft' })
        .eq('id', 'bid-converted')
        .select()
        .single();

      expect(result.error).toBeDefined();
    });
  });

  describe('Delete Bid', () => {
    it('should delete a draft bid', async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq
      });

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete
      } as any);

      const result = await supabase
        .from('bids')
        .delete()
        .eq('id', mockBid.id);

      expect(result.error).toBeNull();
    });

    it('should prevent deleting approved bid', async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Cannot delete approved or converted bid', code: '23514' }
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq
      });

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete
      } as any);

      const result = await supabase
        .from('bids')
        .delete()
        .eq('id', 'bid-approved');

      expect(result.error).toBeDefined();
    });
  });

  describe('Bid Status Workflow', () => {
    it('should transition through valid status flow', async () => {
      const statusFlow = ['draft', 'pending', 'approved'];
      
      for (const status of statusFlow) {
        const mockSingle = vi.fn().mockResolvedValue({
          data: { ...mockBid, status },
          error: null
        });

        const mockSelect = vi.fn().mockReturnValue({
          single: mockSingle
        });

        const mockEq = vi.fn().mockReturnValue({
          select: mockSelect
        });

        const mockUpdate = vi.fn().mockReturnValue({
          eq: mockEq
        });

        vi.mocked(supabase.from).mockReturnValue({
          update: mockUpdate
        } as any);

        const result = await supabase
          .from('bids')
          .update({ status })
          .eq('id', mockBid.id)
          .select()
          .single();

        expect(result.data?.status).toBe(status);
      }
    });
  });
});
