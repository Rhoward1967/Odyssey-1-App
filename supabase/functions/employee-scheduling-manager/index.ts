import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { action, ...params } = await req.json()

    switch (action) {
      case 'get_schedule':
        const { data: schedules } = await supabase
          .from('employee_schedules')
          .select(`
            *,
            job_sites (name, address)
          `)
          .gte('shift_start', params.startDate)
          .lte('shift_start', params.endDate + 'T23:59:59')
        
        return new Response(
          JSON.stringify({ success: true, schedules }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'create_schedule':
        const { data: newSchedule } = await supabase
          .from('employee_schedules')
          .insert(params.scheduleData)
          .select()
          .single()

        return new Response(
          JSON.stringify({ success: true, schedule: newSchedule }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'create_job_site':
        const { data: newJobSite } = await supabase
          .from('job_sites')
          .insert(params.jobSiteData)
          .select()
          .single()

        return new Response(
          JSON.stringify({ success: true, jobSite: newJobSite }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})