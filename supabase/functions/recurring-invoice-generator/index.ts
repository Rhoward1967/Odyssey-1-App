import { createClient } from "npm:@supabase/supabase-js@2.47.10";

// Environment configuration
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Critical: Missing SUPABASE_URL or SERVICE_ROLE_KEY");
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper for JSON responses
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  console.log(`\n========== [${requestId}] RECURRING INVOICE GENERATOR ==========`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return json({}, 200);
  }

  // Health check / self-repair ping — respond without running invoice logic
  try {
    const bodyText = await req.clone().text();
    if (bodyText) {
      const bodyJson = JSON.parse(bodyText);
      if (bodyJson.action === 'health_check' || bodyJson.action === 'cold_boot' || bodyJson.healthcheck || bodyJson.ping) {
        return json({ status: 'ok', service: 'recurring-invoice-generator' });
      }
    }
  } catch { /* not JSON or empty body — proceed normally */ }

  try {
    // 1. Get all active recurring invoices that are due today or overdue
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log(`[${requestId}] Checking for recurring invoices due on or before: ${today}`);
    
    const { data: dueRecurring, error: fetchError } = await supabase
      .from('recurring_invoices')
      .select(`
        id,
        customer_id,
        frequency,
        next_invoice_date,
        amount_cents,
        is_active,
        customers (
          id,
          company_name,
          first_name,
          last_name,
          email
        )
      `)
      .eq('is_active', true)
      .lte('next_invoice_date', today);

    if (fetchError) {
      console.error(`[${requestId}] Error fetching recurring invoices:`, fetchError);
      return json({
        success: false,
        error: fetchError.message,
        request_id: requestId
      }, 500);
    }

    if (!dueRecurring || dueRecurring.length === 0) {
      console.log(`[${requestId}] ✅ No recurring invoices due today.`);
      return json({
        success: true,
        message: "No recurring invoices due today",
        processed: 0,
        generated: 0,
        failed: 0,
        request_id: requestId,
        execution_time_ms: Date.now() - startTime
      }, 200);
    }

    console.log(`[${requestId}] Found ${dueRecurring.length} recurring invoice(s) to process`);

    // 2. Generate invoices for each due recurring schedule
    const results = {
      processed: dueRecurring.length,
      generated: 0,
      failed: 0,
      details: [] as any[]
    };

    for (const recurring of dueRecurring) {
      const recurringStartTime = Date.now();
      const customerName = recurring.customers?.company_name || 
                          `${recurring.customers?.first_name || ''} ${recurring.customers?.last_name || ''}`.trim() ||
                          'Unknown';
      
      console.log(`[${requestId}] Processing recurring invoice ${recurring.id} for customer: ${customerName}`);
      console.log(`  - Frequency: ${recurring.frequency}`);
      console.log(`  - Next invoice date: ${recurring.next_invoice_date}`);
      console.log(`  - Amount: $${((recurring.amount_cents || 0) / 100).toFixed(2)}`);

      try {
        // Call the generate_invoice_from_recurring function
        const { data: invoiceId, error: generateError } = await supabase
          .rpc('generate_invoice_from_recurring', { recurring_id: recurring.id });

        if (generateError) {
          console.error(`[${requestId}] ❌ Failed to generate invoice for ${customerName}:`, generateError);
          results.failed++;
          results.details.push({
            recurring_id: recurring.id,
            customer: customerName,
            status: 'failed',
            error: generateError.message,
            execution_time_ms: Date.now() - recurringStartTime
          });
          continue;
        }

        console.log(`[${requestId}] ✅ Generated invoice ${invoiceId} for ${customerName}`);
        results.generated++;
        results.details.push({
          recurring_id: recurring.id,
          customer: customerName,
          invoice_id: invoiceId,
          amount: (recurring.amount_cents || 0) / 100,
          status: 'success',
          execution_time_ms: Date.now() - recurringStartTime
        });

        // Optional: Send email notification (if you have email service configured)
        // await sendInvoiceEmail(invoiceId, recurring.customers?.email);

      } catch (err: any) {
        console.error(`[${requestId}] ❌ Exception generating invoice for ${customerName}:`, err);
        results.failed++;
        results.details.push({
          recurring_id: recurring.id,
          customer: customerName,
          status: 'failed',
          error: err.message,
          execution_time_ms: Date.now() - recurringStartTime
        });
      }
    }

    // 3. Log summary
    console.log(`\n[${requestId}] ========== SUMMARY ==========`);
    console.log(`  Processed: ${results.processed}`);
    console.log(`  Generated: ${results.generated}`);
    console.log(`  Failed: ${results.failed}`);
    console.log(`  Total execution time: ${Date.now() - startTime}ms`);

    // 4. Store execution log in database (for audit trail)
    await supabase.from('system_logs').insert({
      service: 'recurring-invoice-generator',
      event_type: 'cron_execution',
      severity: results.failed > 0 ? 'warning' : 'info',
      message: `Generated ${results.generated} invoices, ${results.failed} failed`,
      metadata: {
        request_id: requestId,
        processed: results.processed,
        generated: results.generated,
        failed: results.failed,
        execution_time_ms: Date.now() - startTime,
        details: results.details
      }
    });

    return json({
      success: true,
      message: `Generated ${results.generated} invoices from ${results.processed} recurring schedules`,
      processed: results.processed,
      generated: results.generated,
      failed: results.failed,
      details: results.details,
      request_id: requestId,
      execution_time_ms: Date.now() - startTime
    }, 200);

  } catch (err: any) {
    console.error(`[${requestId}] ❌ Fatal error:`, err);
    
    // Log critical error
    await supabase.from('system_logs').insert({
      service: 'recurring-invoice-generator',
      event_type: 'cron_error',
      severity: 'error',
      message: `Fatal error in recurring invoice generator: ${err.message}`,
      metadata: {
        request_id: requestId,
        error: err.message,
        stack: err.stack
      }
    });

    return json({
      success: false,
      error: err.message,
      request_id: requestId,
      execution_time_ms: Date.now() - startTime
    }, 500);
  }
});
