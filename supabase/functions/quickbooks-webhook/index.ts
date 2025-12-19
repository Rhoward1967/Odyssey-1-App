import { createHmac } from "node:crypto";
import { createClient } from "npm:@supabase/supabase-js@2.47.10";

// --- Configuration ---
const WEBHOOK_VERIFIER_TOKEN = Deno.env.get("QB_WEBHOOK_VERIFIER_TOKEN");
const QB_ACCESS_TOKEN = Deno.env.get("QB_ACCESS_TOKEN");
const QB_COMPANY_ID = Deno.env.get("QB_COMPANY_ID");
const QB_API_URL = Deno.env.get("QB_API_URL") ?? "https://sandbox-quickbooks.api.intuit.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!WEBHOOK_VERIFIER_TOKEN || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Critical: Missing required environment variables.");
}

const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, intuit-signature",
};

// Helper for JSON responses
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Verify webhook signature (QuickBooks sends this for security)
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature || !WEBHOOK_VERIFIER_TOKEN) return false;
  
  const hmac = createHmac('sha256', WEBHOOK_VERIFIER_TOKEN);
  hmac.update(payload);
  const expectedSignature = hmac.digest('base64');
  
  return signature === expectedSignature;
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  console.log(`\n========== [${requestId}] NEW REQUEST ==========`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Headers:`, Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log(`[${requestId}] CORS preflight - returning 200`);
    return json({}, 200);
  }

  // Handle GET for health/verification checks
  if (req.method === "GET") {
    console.log(`[${requestId}] Health check - returning OK`);
    return json({ 
      status: "ok", 
      service: "quickbooks-webhook",
      timestamp: new Date().toISOString() 
    }, 200);
  }

  // Only accept POST for webhooks
  if (req.method !== "POST") {
    console.log(`[${requestId}] Invalid method ${req.method} - returning 405`);
    return json({ error: "Method not allowed" }, 405);
  }

  console.log(`[${requestId}] POST request - processing webhook...`);

  // Variables we'll populate as we process
  let rawPayload: string;
  let deliveryId: string | undefined;
  let webhookData: any;
  let logRowId: number | null = null;

  try {
    // 1. CAPTURE HEADERS AND RAW BODY FIRST
    const signature = req.headers.get("intuit-signature");
    const intuitEventId = req.headers.get("intuit-webhook-event-id");
    const intuitRequestId = req.headers.get("request-id");
    rawPayload = await req.text();
    
    console.log(`[${requestId}] 🔔 Webhook received`);
    console.log(`  - Intuit-Webhook-Event-Id: ${intuitEventId || '(none)'}`);
    console.log(`  - Request-Id: ${intuitRequestId || '(none)'}`);
    console.log(`  - Signature present: ${!!signature}`);
    console.log(`  - Body length: ${rawPayload.length} bytes`);

    // 2. PARSE JSON (to get deliveryId for logging)
    try {
      webhookData = JSON.parse(rawPayload);
      deliveryId = webhookData.deliveryId || intuitEventId || requestId;
    } catch (parseErr) {
      console.error(`[${requestId}] ❌ JSON parse failed`);
      deliveryId = intuitEventId || requestId;
      
      // Log the parse failure immediately
      console.log(`[${requestId}] 🔴 Attempting to log parse failure...`);
      const { data, error: insertError } = await supabase.from('webhook_log').insert({
        delivery_id: deliveryId,
        source: 'quickbooks',
        event_type: 'webhook_received',
        topic: 'unknown',
        entity: 'unknown',
        action: 'unknown',
        raw_payload: rawPayload.substring(0, 10000), // TEXT column
        status: 'failed',
        errors: ['JSON parse failed'],
        request_id: requestId,
        processing_time_ms: Date.now() - startTime,
        received_at: new Date().toISOString(),
      }).select('id').single();
      
      if (insertError) console.error(`[${requestId}] ⚠️ Failed to log parse error:`, insertError);
      else console.log(`[${requestId}] ✅ Logged parse failure (id: ${data?.id})`);
      
      return json({ success: false, message: "Invalid JSON", request_id: requestId }, 200);
    }

    console.log(`[${requestId}] 📋 Delivery ID: ${deliveryId}`);
    console.log(`[${requestId}] 📦 Event notifications: ${webhookData.eventNotifications?.length || 0}`);

    // 3. LOG IMMEDIATELY (before signature verification)
    const firstEntity = webhookData.eventNotifications?.[0]?.dataChangeEvent?.entities?.[0];
    console.log(`[${requestId}] 💾 Attempting initial insert to webhook_log...`);
    console.log(`[${requestId}]    delivery_id: ${deliveryId}`);
    console.log(`[${requestId}]    topic: ${firstEntity?.name || 'unknown'}`);
    console.log(`[${requestId}]    action: ${firstEntity?.operation || 'unknown'}`);
    console.log(`[${requestId}]    payload size: ${rawPayload.length} bytes`);
    
    const { data: logData, error: insertError } = await supabase.from('webhook_log').insert({
      delivery_id: deliveryId,
      source: 'quickbooks',
      event_type: 'webhook_received',
      topic: firstEntity?.name || 'unknown',
      entity: firstEntity?.name || 'unknown',
      action: firstEntity?.operation || 'unknown',
      raw_payload: rawPayload, // Already a string
      status: 'received',
      request_id: requestId,
      received_at: new Date().toISOString(),
    }).select('id').single();
    
    if (insertError) {
      console.error(`[${requestId}] ⚠️ Failed to insert initial log:`, insertError);
      console.error(`  - Code: ${insertError.code}`);
      console.error(`  - Message: ${insertError.message}`);
      console.error(`  - Details: ${JSON.stringify(insertError.details)}`);
    } else {
      logRowId = logData.id;
      console.log(`[${requestId}] ✅ Logged to webhook_log (id: ${logRowId})`);
    }

    // 4. VERIFY SIGNATURE (against raw body)
    const signatureValid = verifyWebhookSignature(rawPayload, signature);
    
    if (!signatureValid) {
      console.error(`[${requestId}] ⚠️ Signature verification FAILED (proceeding anyway for debugging)`);
      console.error(`  - Received signature: ${signature?.substring(0, 30)}...`);
      console.error(`  - Verifier token configured: ${!!WEBHOOK_VERIFIER_TOKEN}`);
      console.error(`  - Token length: ${WEBHOOK_VERIFIER_TOKEN?.length || 0}`);
      console.error(`  - Raw payload preview: ${rawPayload.substring(0, 100)}`);
      
      // Update log with warning (but continue processing for debugging)
      if (logRowId) {
        await supabase.from('webhook_log').update({
          errors: ['Signature verification failed - processing anyway for debugging'],
        }).eq('id', logRowId);
      }
      
      // TEMPORARILY: Don't return early, continue processing to debug
      // TODO: Re-enable strict signature checking after debugging
      // return json({ success: false, message: "Signature verification failed", request_id: requestId }, 200);
    } else {
      console.log(`[${requestId}] ✅ Signature verified`);
    }

    // QuickBooks webhook format:
    // {
    //   "eventNotifications": [
    //     {
    //       "realmId": "123456789",
    //       "dataChangeEvent": {
    //         "entities": [
    //           {
    //             "name": "Customer",
    //             "id": "123",
    //             "operation": "Create" | "Update" | "Delete" | "Merge"
    //           }
    //         ]
    //       }
    //     }
    //   ]
    // }

    const notifications = webhookData.eventNotifications || [];
    const processedEntities: string[] = [];
    const errors: string[] = [];

    // Return 200 FAST - QuickBooks expects response within 2-3 seconds
    // Process in background using waitUntil if available
    const processingPromise = (async () => {
      for (const notification of notifications) {
        const entities = notification.dataChangeEvent?.entities || [];
        const realmId = notification.realmId;
        
        for (const entity of entities) {
          try {
            console.log(`[${requestId}] Processing ${entity.operation} on ${entity.name} (ID: ${entity.id})`);
            
            // Handle different entity types
            switch (entity.name) {
              case "Customer":
                await handleCustomerChange(entity, realmId, requestId);
                processedEntities.push(`${entity.name}:${entity.id}`);
                break;
              
              case "Invoice":
                await handleInvoiceChange(entity, realmId, requestId);
                processedEntities.push(`${entity.name}:${entity.id}`);
                break;
              
              case "Payment":
                await handlePaymentChange(entity, realmId, requestId);
                processedEntities.push(`${entity.name}:${entity.id}`);
                break;
              
              // Add more entity types as needed
              default:
                console.log(`[${requestId}] Unhandled entity type: ${entity.name}`);
            }
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error(`[${requestId}] Error processing ${entity.name}:${entity.id}:`, errorMsg);
            errors.push(`${entity.name}:${entity.id} - ${errorMsg}`);
          }
        }
      }

      // Update webhook log with processing results
      if (logRowId) {
        try {
          const { error: updateError } = await supabase
            .from('webhook_log')
            .update({
              status: errors.length > 0 ? 'failed' : 'completed',
              processed_entities: processedEntities,
              errors: errors.length > 0 ? errors : null,
              processing_time_ms: Date.now() - startTime,
              processed_at: new Date().toISOString(),
            })
            .eq('id', logRowId);
          
          if (updateError) {
            console.error(`[${requestId}] ⚠️ Failed to update webhook log:`, updateError);
          } else {
            console.log(`[${requestId}] ✅ Updated webhook log (id: ${logRowId})`);
          }
        } catch (logErr) {
          console.error(`[${requestId}] ⚠️ Exception updating webhook log:`, logErr);
        }
      }

      console.log(`[${requestId}] 🎉 Processing complete: ${processedEntities.length} entities, ${errors.length} errors`);
    })();

    // If Deno supports waitUntil, use it; otherwise await
    if (typeof (globalThis as any).waitUntil === 'function') {
      (globalThis as any).waitUntil(processingPromise);
    } else {
      // For local testing, await the processing
      await processingPromise;
    }

    // Return 200 immediately to QuickBooks (under 2 seconds)
    return json({
      success: true,
      message: "Webhook received and queued for processing",
      delivery_id: deliveryId,
      request_id: requestId,
    }, 200);

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    console.error(`[${requestId}] 💥 Webhook processing exception:`, errorMsg);
    if (errorStack) console.error(`  Stack: ${errorStack}`);
    
    // Try to log the error if we haven't already
    try {
      if (logRowId) {
        await supabase.from('webhook_log').update({
          status: 'failed',
          errors: [`Exception: ${errorMsg}`],
          processing_time_ms: Date.now() - startTime,
        }).eq('id', logRowId);
      } else if (deliveryId) {
        console.log(`[${requestId}] 🔴 Logging exception without prior log row...`);
        await supabase.from('webhook_log').insert({
          delivery_id: deliveryId,
          source: 'quickbooks',
          event_type: 'webhook_received',
          topic: 'unknown',
          entity: 'unknown',
          action: 'unknown',
          raw_payload: webhookData ? JSON.stringify(webhookData) : 'Exception before parsing',
          status: 'failed',
          errors: [`Exception: ${errorMsg}`],
          request_id: requestId,
          processing_time_ms: Date.now() - startTime,
          received_at: new Date().toISOString(),
        });
      }
    } catch (logErr) {
      console.error(`[${requestId}] ⚠️ Failed to log exception:`, logErr);
    }
    
    // Still return 200 to prevent QuickBooks retries on transient errors
    return json({
      success: false,
      error: "Internal processing error",
      request_id: requestId,
    }, 200);
  }
});

// Handler functions for different entity types
async function handleCustomerChange(entity: any, realmId: string, requestId: string) {
  if (!QB_ACCESS_TOKEN || !QB_COMPANY_ID) {
    console.warn(`[${requestId}] QuickBooks API credentials missing, skipping customer sync`);
    return;
  }

  try {
    // Fetch full customer data from QuickBooks API
    const qbUrl = `${QB_API_URL}/v3/company/${QB_COMPANY_ID}/customer/${entity.id}`;
    const response = await fetch(qbUrl, {
      headers: {
        'Authorization': `Bearer ${QB_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`[${requestId}] Failed to fetch customer ${entity.id}: ${response.status}`);
      return;
    }

    const data = await response.json();
    const customer = data.Customer;

    if (!customer) {
      console.warn(`[${requestId}] No customer data returned for ${entity.id}`);
      return;
    }

    // Map QuickBooks customer to Odyssey-1 format
    const mappedCustomer = {
      external_id: String(customer.Id),
      first_name: customer.GivenName || null,
      last_name: customer.FamilyName || null,
      company_name: customer.CompanyName || customer.DisplayName || null,
      email: customer.PrimaryEmailAddr?.Address || null,
      phone: customer.PrimaryPhone?.FreeFormNumber || null,
      billing_address_line1: customer.BillAddr?.Line1 || null,
      billing_city: customer.BillAddr?.City || null,
      billing_state: customer.BillAddr?.CountrySubDivisionCode || null,
      billing_zip: customer.BillAddr?.PostalCode || null,
      source: 'quickbooks_webhook',
      updated_at: new Date().toISOString(),
    };

    // Idempotent upsert
    const { error } = await supabase
      .from('customers')
      .upsert(mappedCustomer, {
        onConflict: 'external_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`[${requestId}] Failed to upsert customer ${entity.id}:`, error.message);
    } else {
      console.log(`[${requestId}] ✅ Customer ${entity.id} synced successfully`);
    }
  } catch (err) {
    console.error(`[${requestId}] Exception syncing customer ${entity.id}:`, err);
    throw err;
  }
}

async function handleInvoiceChange(entity: any, realmId: string, requestId: string) {
  if (!QB_ACCESS_TOKEN || !QB_COMPANY_ID) {
    console.warn(`[${requestId}] QuickBooks API credentials missing, skipping invoice sync`);
    return;
  }

  try {
    // Fetch full invoice data from QuickBooks API
    const qbUrl = `${QB_API_URL}/v3/company/${QB_COMPANY_ID}/invoice/${entity.id}`;
    const response = await fetch(qbUrl, {
      headers: {
        'Authorization': `Bearer ${QB_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`[${requestId}] Failed to fetch invoice ${entity.id}: ${response.status}`);
      return;
    }

    const data = await response.json();
    const invoice = data.Invoice;

    if (!invoice) {
      console.warn(`[${requestId}] No invoice data returned for ${entity.id}`);
      return;
    }

    // Map QuickBooks invoice to Odyssey-1 format
    const mappedInvoice = {
      external_id: String(invoice.Id),
      invoice_number: invoice.DocNumber,
      customer_external_id: String(invoice.CustomerRef?.value),
      total_amount: invoice.TotalAmt,
      issue_date: invoice.TxnDate,
      due_date: invoice.DueDate || null,
      status: mapInvoiceStatus(invoice.Balance, invoice.TotalAmt),
      line_items: invoice.Line?.map((line: any) => ({
        description: line.Description || line.DetailType,
        quantity: line.SalesItemLineDetail?.Qty || 1,
        rate: line.SalesItemLineDetail?.UnitPrice || 0,
        amount: line.Amount || 0,
      })) || [],
      notes: invoice.CustomerMemo?.value || null,
      source: 'quickbooks_webhook',
      updated_at: new Date().toISOString(),
    };

    // Idempotent upsert
    const { error } = await supabase
      .from('invoices')
      .upsert(mappedInvoice, {
        onConflict: 'external_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`[${requestId}] Failed to upsert invoice ${entity.id}:`, error.message);
    } else {
      console.log(`[${requestId}] ✅ Invoice ${entity.id} synced successfully`);
    }
  } catch (err) {
    console.error(`[${requestId}] Exception syncing invoice ${entity.id}:`, err);
    throw err;
  }
}

async function handlePaymentChange(entity: any, realmId: string, requestId: string) {
  if (!QB_ACCESS_TOKEN || !QB_COMPANY_ID) {
    console.warn(`[${requestId}] QuickBooks API credentials missing, skipping payment sync`);
    return;
  }

  try {
    // Fetch full payment data from QuickBooks API
    const qbUrl = `${QB_API_URL}/v3/company/${QB_COMPANY_ID}/payment/${entity.id}`;
    const response = await fetch(qbUrl, {
      headers: {
        'Authorization': `Bearer ${QB_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`[${requestId}] Failed to fetch payment ${entity.id}: ${response.status}`);
      return;
    }

    const data = await response.json();
    const payment = data.Payment;

    if (!payment) {
      console.warn(`[${requestId}] No payment data returned for ${entity.id}`);
      return;
    }

    // Map QuickBooks payment to Odyssey-1 format
    const mappedPayment = {
      external_id: String(payment.Id),
      customer_external_id: String(payment.CustomerRef?.value),
      amount: payment.TotalAmt,
      payment_date: payment.TxnDate,
      payment_method: payment.PaymentMethodRef?.name || 'Unknown',
      reference_number: payment.PaymentRefNum || null,
      notes: payment.PrivateNote || null,
      source: 'quickbooks_webhook',
      status: 'completed',
      updated_at: new Date().toISOString(),
    };

    // Idempotent upsert
    const { error } = await supabase
      .from('payments_v2')
      .upsert(mappedPayment, {
        onConflict: 'external_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`[${requestId}] Failed to upsert payment ${entity.id}:`, error.message);
    } else {
      console.log(`[${requestId}] ✅ Payment ${entity.id} synced successfully`);
    }
  } catch (err) {
    console.error(`[${requestId}] Exception syncing payment ${entity.id}:`, err);
    throw err;
  }
}

// Helper to map QuickBooks invoice status
function mapInvoiceStatus(balance: number, total: number): string {
  if (balance === 0) return 'paid';
  if (balance === total) return 'sent';
  if (balance < total && balance > 0) return 'partial';
  return 'draft';
}
