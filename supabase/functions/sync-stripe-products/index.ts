import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.12.0'
import { corsHeaders } from '../_shared/cors.ts'

console.log("🎯 Stripe Product Sync Function - Creating ODYSSEY-1 Subscription Tiers")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("🚀 Syncing ODYSSEY-1 subscription products to Stripe...")
    
    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2022-11-15',
    })

    const results = []

    // Define the three ODYSSEY-1 subscription tiers
    const products = [
      {
        name: 'ODYSSEY Basic',
        description: 'Essential AI-powered government contracting tools for individual professionals.',
        price: 9900, // $99.00 in cents
        interval: 'month',
        features: [
          'Basic AI Processing',
          'Standard Government Tools', 
          'Email Support',
          '10 Active Contracts',
          'Basic Analytics',
          'Standard Security'
        ]
      },
      {
        name: 'ODYSSEY Professional',
        description: 'Advanced AI suite with full government contracting capabilities for growing businesses.',
        price: 29900, // $299.00 in cents
        interval: 'month',
        features: [
          'Advanced AI Processing',
          'Full Government Suite',
          'Priority Support', 
          'Unlimited Contracts',
          'Advanced Analytics',
          'Enhanced Security',
          'Custom Integrations',
          'Team Collaboration'
        ]
      },
      {
        name: 'ODYSSEY Enterprise',
        description: 'Quantum-level AI processing with complete government arsenal for large organizations.',
        price: 99900, // $999.00 in cents
        interval: 'month',
        features: [
          'Quantum AI Processing',
          'Complete Government Arsenal',
          'Dedicated Support',
          'Unlimited Everything', 
          'Real-time Analytics',
          'Military-grade Security',
          'White-label Solutions',
          'API Access',
          'Custom Development'
        ]
      }
    ]

    for (const productData of products) {
      try {
        // Create or update product
        const product = await stripe.products.create({
          name: productData.name,
          description: productData.description,
          metadata: {
            features: JSON.stringify(productData.features),
            tier: productData.name.split(' ')[1].toLowerCase(), // basic, professional, enterprise
            platform: 'odyssey-1'
          }
        })

        console.log(`✅ Created product: ${product.name} (${product.id})`)

        // Create recurring price for this product
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: productData.price,
          currency: 'usd',
          recurring: {
            interval: productData.interval as 'month'
          },
          metadata: {
            tier: productData.name.split(' ')[1].toLowerCase()
          }
        })

        console.log(`✅ Created price: $${productData.price / 100}/${productData.interval} (${price.id})`)

        results.push({
          tier: productData.name.split(' ')[1].toLowerCase(),
          product_id: product.id,
          price_id: price.id,
          name: product.name,
          amount: productData.price / 100,
          currency: 'usd',
          interval: productData.interval
        })

      } catch (error) {
        console.error(`❌ Error creating ${productData.name}:`, error)
        results.push({
          tier: productData.name.split(' ')[1].toLowerCase(),
          error: (error as Error).message
        })
      }
    }

    console.log("✅ Stripe product sync completed!")

    return new Response(JSON.stringify({ 
      success: true,
      message: 'ODYSSEY-1 subscription tiers synced to Stripe',
      products: results,
      instructions: 'Update your src/config/stripe.ts with the new product and price IDs'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Error syncing products to Stripe:', error)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: (error as Error).message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})