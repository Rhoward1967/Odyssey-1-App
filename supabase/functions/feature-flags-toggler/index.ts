import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Parse request body
    const { flag_id, is_enabled } = await req.json()

    if (!flag_id) {
      throw new Error('flag_id is required')
    }

    if (typeof is_enabled !== 'boolean') {
      throw new Error('is_enabled must be a boolean')
    }

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user has admin privileges
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_super_admin) {
      throw new Error('Admin privileges required')
    }

    // Update the feature flag
    const { data, error } = await supabaseClient
      .from('feature_flags')
      .update({ 
        is_enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', flag_id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Broadcast the change to all connected clients
    await supabaseClient
      .channel('feature-flags-changes')
      .send({
        type: 'broadcast',
        event: 'flag_updated',
        payload: {
          flag_id,
          is_enabled,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        message: `Feature flag ${is_enabled ? 'enabled' : 'disabled'} successfully`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Feature flags toggler error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})