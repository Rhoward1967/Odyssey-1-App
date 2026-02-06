// CourtListener Webhook Handler
// Receives real-time notifications from Free Law Project when new cases are filed
// matching your saved search queries

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse webhook payload from CourtListener
    const payload = await req.json()
    
    console.log('CourtListener webhook received:', payload)

    // CourtListener webhook structure:
    // {
    //   "event": "search.Alert",
    //   "payload": {
    //     "results": [
    //       {
    //         "id": 123456,
    //         "caseName": "Example v. Example",
    //         "court": "gactapp",
    //         "dateFiled": "2026-02-04",
    //         "docketNumber": "A26A0123",
    //         "snippet": "..."
    //       }
    //     ]
    //   }
    // }

    // Store webhook event
    const { data: webhookLog, error: logError } = await supabase
      .from('legal_webhook_log')
      .insert({
        event_type: payload.event,
        payload: payload,
        received_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (logError) {
      console.error('Failed to log webhook:', logError)
    }

    // Process new cases
    if (payload.event === 'search.Alert' && payload.payload?.results) {
      const cases = payload.payload.results

      // Store each case
      for (const caseData of cases) {
        const { error: caseError } = await supabase
          .from('legal_precedents')
          .upsert({
            courtlistener_id: caseData.id,
            case_name: caseData.caseName,
            court: caseData.court,
            date_filed: caseData.dateFiled,
            docket_number: caseData.docketNumber,
            snippet: caseData.snippet,
            courtlistener_url: `https://www.courtlistener.com/opinion/${caseData.id}/`,
            tags: ['webhook-alert'],
            added_at: new Date().toISOString(),
          }, {
            onConflict: 'courtlistener_id',
          })

        if (caseError) {
          console.error(`Failed to store case ${caseData.id}:`, caseError)
        }
      }

      // Send email notification if critical cases found
      const criticalKeywords = [
        'Howard Jones',
        'HJS Services',
        'Odyssey-1',
        'UCC-1',
      ]

      const hasCriticalCase = cases.some((c: any) => 
        criticalKeywords.some(keyword => 
          c.caseName?.includes(keyword) || c.snippet?.includes(keyword)
        )
      )

      if (hasCriticalCase) {
        // Send urgent notification
        await supabase.functions.invoke('send-email', {
          body: {
            to: 'howardjonesai@gmail.com', // Update with actual email
            subject: '🚨 URGENT: New Legal Filing Detected',
            html: `
              <h2>Critical Legal Alert</h2>
              <p><strong>${cases.length} new case(s)</strong> have been filed that may affect your Trust or business entities.</p>
              
              <h3>Cases Found:</h3>
              <ul>
                ${cases.map((c: any) => `
                  <li>
                    <strong>${c.caseName}</strong><br>
                    Court: ${c.court}<br>
                    Filed: ${c.dateFiled}<br>
                    <a href="https://www.courtlistener.com/opinion/${c.id}/">View Case</a>
                  </li>
                `).join('')}
              </ul>
              
              <p><strong>ACTION REQUIRED:</strong> Review these cases immediately to determine if they affect:</p>
              <ul>
                <li>Howard Jones Family Ancestral Trust</li>
                <li>UCC-1 Filing #14472596 (HJS Services LLC)</li>
                <li>UCC-1 Filing #14629748 (Odyssey-1 AI LLC)</li>
                <li>Personal protection filings</li>
              </ul>
            `,
          },
        })

        // Also log to Discord if webhook configured
        const discordWebhook = Deno.env.get('DISCORD_LEGAL_ALERTS_WEBHOOK')
        if (discordWebhook) {
          await fetch(discordWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              embeds: [{
                title: '🚨 Critical Legal Alert',
                description: `${cases.length} new case(s) found matching Trust/business entities`,
                color: 0xFF0000, // Red
                fields: cases.map((c: any) => ({
                  name: c.caseName,
                  value: `${c.court} - ${c.dateFiled}\n[View Case](https://www.courtlistener.com/opinion/${c.id}/)`,
                })),
                timestamp: new Date().toISOString(),
              }],
            }),
          })
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed',
        casesStored: payload.payload?.results?.length || 0,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message,
        success: false,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
