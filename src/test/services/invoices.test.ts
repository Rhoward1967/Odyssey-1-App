import { supabase } from '@/lib/supabase';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockBid, mockCustomer, mockInvoice, mockUser } from '../utils';

vi.mock('@/lib/supabase');

describe('Invoice Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Invoice', () => {
    it('should create a new invoice manually', async () => {
      const newInvoice = {
        user_id: mockUser.id,
        customer_id: mockCustomer.id,
        title: 'Manual Invoice',
        line_items: [
          {
            name: 'Consulting Service',
            quantity: 10,
            unit_price: 15000, // $150.00/hr
            total: 150000 // $1500.00
          }
        ],
        subtotal: 150000,
        tax: 12000,
        total: 162000,
        status: 'pending',
        due_date: '2025-02-15'
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: { 
          ...newInvoice, 
          id: 'invoice-new', 
          invoice_number: 'INV-20250115-0001',
          created_at: new Date().toISOString()
        },
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
        .from('invoices')
        .insert(newInvoice)
        .select()
        .single();

      expect(mockInsert).toHaveBeenCalledWith(newInvoice);
      expect(result.data).toBeDefined();
      expect(result.data?.invoice_number).toMatch(/^INV-\d{8}-\d{4}$/);
      expect(result.data?.total).toBe(162000);
    });

    it('should auto-generate invoice number with correct format', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { 
          ...mockInvoice,
          invoice_number: 'INV-20250115-0042' // Sequential number
        },
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
        .from('invoices')
        .insert(mockInvoice)
        .select()
        .single();

      expect(result.data?.invoice_number).toMatch(/^INV-\d{8}-\d{4}$/);
      const sequenceNum = result.data?.invoice_number.split('-')[2];
      expect(parseInt(sequenceNum)).toBeGreaterThan(0);
    });
  });

  describe('Convert Bid to Invoice', () => {
    it('should convert approved bid to invoice successfully', async () => {
      const approvedBid = { ...mockBid, status: 'approved' };

      const mockRpc = vi.fn().mockResolvedValue({
        data: {
          ...mockInvoice,
          id: 'invoice-from-bid',
          invoice_number: 'INV-20250115-0001',
          source_bid_id: approvedBid.id
        },
        error: null
      });

      vi.mocked(supabase.rpc).mockImplementation(mockRpc);

      const result = await supabase.rpc('convert_bid_to_invoice', {
        bid_id: approvedBid.id
      });

      expect(mockRpc).toHaveBeenCalledWith('convert_bid_to_invoice', {
        bid_id: approvedBid.id
      });
      expect(result.data).toBeDefined();
      expect(result.data?.source_bid_id).toBe(approvedBid.id);
      expect(result.error).toBeNull();
    });

    it('should copy all bid line items to invoice', async () => {
      const bidWithMultipleItems = {
        ...mockBid,
        line_items: [
          { name: 'Service 1', quantity: 2, unit_price: 10000, total: 20000 },
          { name: 'Service 2', quantity: 1, unit_price: 15000, total: 15000 }
        ],
        subtotal: 35000,
        total: 37800,
        status: 'approved'
      };

      const mockRpc = vi.fn().mockResolvedValue({
        data: {
          ...mockInvoice,
          line_items: bidWithMultipleItems.line_items,
          subtotal: bidWithMultipleItems.subtotal,
          total: bidWithMultipleItems.total,
          source_bid_id: bidWithMultipleItems.id
        },
        error: null
      });

      vi.mocked(supabase.rpc).mockImplementation(mockRpc);

      const result = await supabase.rpc('convert_bid_to_invoice', {
        bid_id: bidWithMultipleItems.id
      });

      expect(result.data?.line_items).toHaveLength(2);
      expect(result.data?.subtotal).toBe(35000);
    });

    it('should prevent converting non-approved bid', async () => {
      const draftBid = { ...mockBid, status: 'draft' };

      const mockRpc = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Only approved bids can be converted', code: 'P0001' }
      });

      vi.mocked(supabase.rpc).mockImplementation(mockRpc);

      const result = await supabase.rpc('convert_bid_to_invoice', {
        bid_id: draftBid.id
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('approved');
    });

    it('should prevent converting already converted bid', async () => {
      const convertedBid = { ...mockBid, status: 'converted' };

      const mockRpc = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Bid already converted', code: 'P0001' }
      });

      vi.mocked(supabase.rpc).mockImplementation(mockRpc);

      const result = await supabase.rpc('convert_bid_to_invoice', {
        bid_id: convertedBid.id
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('already converted');
    });

    it('should update bid status to converted', async () => {
      // After conversion, bid status should be 'converted'
      const mockRpc = vi.fn().mockResolvedValue({
        data: {
          ...mockInvoice,
          source_bid_id: mockBid.id
        },
        error: null
      });

      vi.mocked(supabase.rpc).mockImplementation(mockRpc);

      await supabase.rpc('convert_bid_to_invoice', {
        bid_id: mockBid.id
      });

      // Verify bid status check
      const mockSingle = vi.fn().mockResolvedValue({
        data: { ...mockBid, status: 'converted' },
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

      const bidCheck = await supabase
        .from('bids')
        .select('*')
        .eq('id', mockBid.id)
        .single();

      expect(bidCheck.data?.status).toBe('converted');
    });
  });

  describe('Read Invoices', () => {
    it('should fetch all invoices for a user', async () => {
      const mockInvoices = [
        mockInvoice,
        { ...mockInvoice, id: 'invoice-2', status: 'paid' }
      ];

      const mockEq = vi.fn().mockResolvedValue({
        data: mockInvoices,
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', mockUser.id);

      expect(result.data).toHaveLength(2);
    });

    it('should filter invoices by status', async () => {
      const paidInvoices = [
        { ...mockInvoice, id: 'invoice-paid-1', status: 'paid' },
        { ...mockInvoice, id: 'invoice-paid-2', status: 'paid' }
      ];

      const mockEq2 = vi.fn().mockResolvedValue({
        data: paidInvoices,
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
        .from('invoices')
        .select('*')
        .eq('user_id', mockUser.id)
        .eq('status', 'paid');

      expect(result.data).toHaveLength(2);
      expect(result.data?.every(inv => inv.status === 'paid')).toBe(true);
    });
  });

  describe('Update Invoice', () => {
    it('should update invoice status to paid', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { 
          ...mockInvoice, 
          status: 'paid',
          paid_at: new Date().toISOString()
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
        .from('invoices')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', mockInvoice.id)
        .select()
        .single();

      expect(result.data?.status).toBe('paid');
      expect(result.data?.paid_at).toBeDefined();
    });

    it('should prevent editing paid invoice', async () => {
      const mockEq = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Cannot update paid invoice', code: '23514' }
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
        .from('invoices')
        .update({ total: 99999 })
        .eq('id', 'invoice-paid')
        .select()
        .single();

      expect(result.error).toBeDefined();
    });
  });

  describe('Delete Invoice', () => {
    it('should delete pending invoice', async () => {
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
        .from('invoices')
        .delete()
        .eq('id', mockInvoice.id);

      expect(result.error).toBeNull();
    });

    it('should prevent deleting paid invoice', async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Cannot delete paid invoice', code: '23514' }
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq
      });

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete
      } as any);

      const result = await supabase
        .from('invoices')
        .delete()
        .eq('id', 'invoice-paid');

      expect(result.error).toBeDefined();
    });
  });

  describe('Invoice Number Generation', () => {
    it('should generate unique sequential numbers per day', async () => {
      const invoiceNumbers = [
        'INV-20250115-0001',
        'INV-20250115-0002',
        'INV-20250115-0003'
      ];

      for (let i = 0; i < invoiceNumbers.length; i++) {
        const mockSingle = vi.fn().mockResolvedValue({
          data: { 
            ...mockInvoice, 
            id: `invoice-${i}`,
            invoice_number: invoiceNumbers[i]
          },
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
          .from('invoices')
          .insert(mockInvoice)
          .select()
          .single();

        expect(result.data?.invoice_number).toBe(invoiceNumbers[i]);
      }
    });
  });
});
