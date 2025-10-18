import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.12.0'
import { corsHeaders } from '../_shared/cors.ts'

console.log("🎯 REAL Stripe Billing Portal Function - No Auth Required for Testing")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("� Creating billing portal session...")
    
    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2022-11-15',
    })

    // Get or create a test customer
    let customers = await stripe.customers.list({ limit: 1 })
    let customerId: string
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id
      console.log("✅ Using existing customer:", customerId)
    } else {
      // Create a test customer for demo
      const customer = await stripe.customers.create({
        email: 'test@odyssey-1.ai',
        name: 'Test User',
        metadata: {
          source: 'odyssey-app-test'
        }
      })
      customerId = customer.id
      console.log("✅ Created test customer:", customerId)
    }

    // Get return URL from request body or automatically detect from origin
    const body = await req.json().catch(() => ({}))
    const origin = req.headers.get('origin')
    
    let returnUrl: string
    if (body.return_url) {
      // Explicit return URL provided
      returnUrl = body.return_url
    } else if (origin?.includes('localhost')) {
      // Development: Use whatever localhost port is calling us
      returnUrl = `${origin}/subscription`
    } else {
      // Production: Use Vercel domain
      returnUrl = 'https://odyssey-1-app-generalmanager81-3656s-projects.vercel.app/subscription'
    }

    console.log("🔗 Using return URL:", returnUrl)

    // Create the billing portal session with correct return URL
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    console.log("✅ Billing portal session created:", session.id)

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Error creating billing portal session:', error)
    
    return new Response(JSON.stringify({ 
      error: (error as Error).message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
