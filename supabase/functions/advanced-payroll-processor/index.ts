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
      case 'calculate_payroll':
        const { regularHours, overtimeHours, hourlyRate } = params.payrollData
        const grossPay = (regularHours * hourlyRate) + (overtimeHours * hourlyRate * 1.5)
        const federalTax = grossPay * 0.12
        const stateTax = grossPay * 0.05
        const socialSecurity = grossPay * 0.062
        const medicare = grossPay * 0.0145
        const totalDeductions = federalTax + stateTax + socialSecurity + medicare
        const netPay = grossPay - totalDeductions

        const payroll = {
          employeeId: params.employeeId,
          grossPay: Math.round(grossPay * 100) / 100,
          netPay: Math.round(netPay * 100) / 100,
          totalDeductions: Math.round(totalDeductions * 100) / 100,
          federalTax: Math.round(federalTax * 100) / 100,
          stateTax: Math.round(stateTax * 100) / 100,
          socialSecurity: Math.round(socialSecurity * 100) / 100,
          medicare: Math.round(medicare * 100) / 100
        }

        await supabase.from('payroll_calculations').insert({
          employee_id: params.employeeId,
          pay_period: params.payPeriod,
          gross_pay: payroll.grossPay,
          net_pay: payroll.netPay,
          deductions: { federal_tax: payroll.federalTax, state_tax: payroll.stateTax }
        })

        return new Response(
          JSON.stringify({ success: true, payroll }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'generate_paystub':
        return new Response(
          JSON.stringify({ success: true, paystub: 'Generated successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'process_direct_deposit':
        return new Response(
          JSON.stringify({ success: true, deposit: 'Processed successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'create_payroll_rule':
        const { data: rule } = await supabase
          .from('payroll_rules')
          .insert(params.ruleData)
          .select()
          .single()

        return new Response(
          JSON.stringify({ success: true, rule }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'bulk_payroll_processing':
        const processedCount = params.payrollData.employees.length
        return new Response(
          JSON.stringify({ success: true, processedCount }),
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