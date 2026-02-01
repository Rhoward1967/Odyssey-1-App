// HARDENED EDGE FUNCTION - PROTOCOL SOVEREIGN-LOCK 2.0
// Invoice Generation with Idempotency & RLS Compliance
// Version: 2.0 (Production Ready)
// Last Updated: January 31, 2026

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', ''); // Format: YYYYMM

    // Find all recurring invoices due today or overdue
    const { data: dueSchedules, error: scheduleError } = await supabase
      .from('recurring_invoices')
      .select(`
        *,
        customers (
          id,
          company_name,
          email
        )
      `)
      .eq('is_active', true)
      .lte('next_invoice_date', today);

    if (scheduleError) {
      throw scheduleError;
    }

    const results = [];
    const skipped = [];

    for (const schedule of dueSchedules || []) {
      try {
        // IDEMPOTENCY CHECK: Verify no invoice exists for this schedule this month
        const { data: existingInvoice } = await supabase
          .from('invoices')
          .select('id, invoice_number')
          .eq('customer_id', schedule.customer_id)
          .like('invoice_number', `INV-${yearMonth}-%`)
          .gte('issue_date', `${yearMonth.slice(0, 4)}-${yearMonth.slice(4)}-01`)
          .single();

        if (existingInvoice) {
          skipped.push({
            customer: schedule.customers?.company_name,
            reason: 'Invoice already exists for this month',
            existing_invoice: existingInvoice.invoice_number,
            schedule_id: schedule.id,
          });
          continue; // Skip to next schedule
        }

        // Generate invoice number (format: INV-YYYYMM-XXXX)
        const { data: recentInvoices } = await supabase
          .from('invoices')
          .select('invoice_number')
          .like('invoice_number', `INV-${yearMonth}-%`)
          .order('created_at', { ascending: false })
          .limit(1);

        let invoiceNumber: string;
        if (recentInvoices && recentInvoices.length > 0) {
          const lastNumber = parseInt(recentInvoices[0].invoice_number.split('-')[2]);
          invoiceNumber = `INV-${yearMonth}-${String(lastNumber + 1).padStart(4, '0')}`;
        } else {
          invoiceNumber = `INV-${yearMonth}-0001`;
        }

        // Calculate due date (15 days from now by default)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 15);

        // Create invoice with RLS-compliant user_id
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            customer_id: schedule.customer_id,
            user_id: schedule.user_id, // RLS: Must match auth.uid() for access
            invoice_number: invoiceNumber,
            issue_date: today,
            due_date: dueDate.toISOString().split('T')[0],
            subtotal: schedule.amount_cents / 100,
            total_amount: schedule.amount_cents / 100,
            shipping_amount: 0,
            deposit_amount: 0,
            tax_rate: 0,
            tax_amount: 0,
            status: 'pending',
            notes: `${schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} service - ${schedule.location_label}`,
          })
          .select()
          .single();

        if (invoiceError) {
          throw invoiceError;
        }

        // Add line item (NO user_id - field doesn't exist in schema)
        const { error: lineItemError } = await supabase
          .from('invoice_line_items')
          .insert({
            invoice_id: invoice.id,
            description: `${schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} Cleaning Service - ${schedule.location_label}`,
            quantity: 1,
            unit_price: schedule.amount_cents / 100,
            total: schedule.amount_cents / 100,
          });

        if (lineItemError) {
          throw lineItemError;
        }

        // Update next invoice date based on frequency
        const nextDate = new Date(schedule.next_invoice_date);
        switch (schedule.frequency) {
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'bi-weekly':
            nextDate.setDate(nextDate.getDate() + 14);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case 'quarterly':
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
          case 'annual':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
          default:
            // Unknown frequency - default to monthly
            nextDate.setMonth(nextDate.getMonth() + 1);
        }

        const { error: updateError } = await supabase
          .from('recurring_invoices')
          .update({ next_invoice_date: nextDate.toISOString().split('T')[0] })
          .eq('id', schedule.id);

        if (updateError) {
          throw updateError;
        }

        results.push({
          success: true,
          invoice_id: invoice.id,
          invoice_number: invoiceNumber,
          customer: schedule.customers?.company_name,
          amount: schedule.amount_cents / 100,
          location: schedule.location_label,
          next_invoice_date: nextDate.toISOString().split('T')[0],
        });

      } catch (error) {
        results.push({
          success: false,
          customer: schedule.customers?.company_name,
          schedule_id: schedule.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        protocol: 'SOVEREIGN-LOCK 2.0',
        timestamp: new Date().toISOString(),
        processed: results.length,
        skipped: skipped.length,
        results: results,
        skipped_invoices: skipped,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        protocol: 'SOVEREIGN-LOCK 2.0',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
