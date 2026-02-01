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

    for (const schedule of dueSchedules || []) {
      try {
        // Generate invoice number (format: INV-YYYYMM-XXXX)
        const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
        const { data: recentInvoices } = await supabase
          .from('invoices')
          .select('invoice_number')
          .like('invoice_number', `INV-${yearMonth}-%`)
          .order('created_at', { ascending: false })
          .limit(1);

        let invoiceNumber;
        if (recentInvoices && recentInvoices.length > 0) {
          const lastNumber = parseInt(recentInvoices[0].invoice_number.split('-')[2]);
          invoiceNumber = `INV-${yearMonth}-${String(lastNumber + 1).padStart(4, '0')}`;
        } else {
          invoiceNumber = `INV-${yearMonth}-0001`;
        }

        // Calculate due date (15 days from now by default)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (schedule.due_date_offset_days || 15));

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            customer_id: schedule.customer_id,
            user_id: schedule.user_id,
            invoice_number: invoiceNumber,
            issue_date: new Date().toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            subtotal: schedule.amount_cents / 100,
            total_amount: schedule.amount_cents / 100,
            shipping_amount: 0,
            deposit_amount: 0,
            tax_rate: 0,
            tax_amount: 0,
            status: 'pending',
            notes: `${schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} service - ${schedule.location_label}`
          })
          .select()
          .single();

        if (invoiceError) {
          throw invoiceError;
        }

        // Add line item
        await supabase.from('invoice_line_items').insert({
          invoice_id: invoice.id,
          description: `${schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} Cleaning Service - ${schedule.location_label}`,
          quantity: 1,
          unit_price: schedule.amount_cents / 100,
          total: schedule.amount_cents / 100,
        });

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
        }

        await supabase
          .from('recurring_invoices')
          .update({ next_invoice_date: nextDate.toISOString().split('T')[0] })
          .eq('id', schedule.id);

        results.push({
          success: true,
          invoice_number: invoiceNumber,
          customer: schedule.customers?.company_name,
          amount: schedule.amount_cents / 100,
          location: schedule.location_label,
        });

      } catch (error) {
        results.push({
          success: false,
          customer: schedule.customers?.company_name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results: results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
