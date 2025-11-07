import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      throw new Error('userId and email are required');
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Approved emails for HJS Services LLC
    const APPROVED_HJS_EMAILS = [
      'rhoward@hjsservices.us',
      'a.r.barnett11@gmail.com'
    ];

    const normalized = email.trim().toLowerCase();

    // Check if email is approved
    if (!APPROVED_HJS_EMAILS.includes(normalized)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email not approved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Get HJS Services LLC organization ID
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('slug', 'hjs-services-llc')  // Changed from .ilike('name', '%HJS Services%')
      .single();

    if (orgError || !org) {
      throw new Error('Organization not found');
    }

    // Determine role (Ahmad gets admin/VP role)
    const role = normalized === 'a.r.barnett11@gmail.com' ? 'admin' : 'member';

    // Insert into user_organizations
    const { error: assignError } = await supabaseAdmin
      .from('user_organizations')
      .insert({
        user_id: userId,
        organization_id: org.id,
        role: role
      });

    if (assignError) {
      throw assignError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        organizationId: org.id,
        role: role
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
