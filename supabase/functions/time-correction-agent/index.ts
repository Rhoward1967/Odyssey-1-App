import { serve } from "std/http/server.ts"
import { createClient } from "@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { data: userOrgs, error: orgError } = await supabaseClient
      .from('user_organizations')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (orgError || !userOrgs) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin privileges required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const requestBody = await req.json()
    const { original_entry_id, new_clock_in, new_clock_out, correction_reason } = requestBody

    // Update the time entry
    const { data: _updatedEntry, error: updateError } = await supabaseClient
      .from('time_entries')
      .update({
        clock_in: new_clock_in,
        clock_out: new_clock_out,
        status: 'corrected'
      })
      .eq('id', original_entry_id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Log the correction in audit trail
    const { error: auditError } = await supabaseClient
      .from('time_audit_log')
      .insert([{
        time_entry_id: original_entry_id,
        admin_id: user.id,
        admin_name: user.email,
        action: 'time_correction',
        old_values: JSON.stringify({ clock_in: 'original', clock_out: 'original' }),
        new_values: JSON.stringify({ clock_in: new_clock_in, clock_out: new_clock_out }),
        reason: correction_reason
      }])

    if (auditError) {
      console.error('Audit log error:', auditError)
      // Don't fail the request for audit errors
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        correction_id: original_entry_id, // Use original_entry_id instead of updatedEntry.id
        message: 'Time correction applied successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Time correction error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
