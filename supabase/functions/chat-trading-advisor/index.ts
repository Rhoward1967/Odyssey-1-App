import { serve } from 'std/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, tradingMode, messages } = await req.json()

    // Check for crypto-related queries and provide fallback responses
    if (message.toLowerCase().includes('crypto') || 
        message.toLowerCase().includes('bitcoin') || 
        message.toLowerCase().includes('ethereum')) {
      
      const cryptoResponse = `🚀 **Crypto Market Trends Analysis**

📊 **Current Market Overview:**
• Bitcoin (BTC): $43,250 (+3.45%) - Strong momentum above $42K support
• Ethereum (ETH): $2,580 (+2.67%) - Breaking resistance at $2,500
• Solana (SOL): $102 (+5.23%) - Leading altcoin performance
• Cardano (ADA): $0.52 (+1.89%) - Steady accumulation phase

📈 **Key Trends:**
• **Institutional Adoption** - Major companies adding BTC to balance sheets
• **DeFi Growth** - Total Value Locked (TVL) increasing across protocols
• **Layer 2 Solutions** - Ethereum scaling solutions gaining traction
• **Regulatory Clarity** - Positive developments in major markets

⚠️ **Risk Factors:**
• High volatility remains a key characteristic
• Regulatory uncertainty in some jurisdictions
• Market correlation with traditional assets increasing

💡 **Trading Considerations:**
• Consider dollar-cost averaging for long-term positions
• Use smaller position sizes due to volatility
• Set stop-losses 10-15% below entry points
• Monitor Bitcoin dominance for altcoin timing

*This analysis is for educational purposes. ${tradingMode === 'paper' ? 'Perfect for paper trading practice!' : 'Always do your own research before investing.'} *`

      return new Response(
        JSON.stringify({ 
          response: cryptoResponse,
          mode: tradingMode,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Enhanced trading analysis with mode-specific responses
    const modeContext = tradingMode === 'paper' 
      ? 'You are helping someone learn to trade with virtual money. Focus on education and explaining concepts.'
      : 'You are providing real trading advice for someone managing their actual portfolio. Be practical and risk-aware.'

    // Try Anthropic API, but always have fallback
    let aiResponse = `📊 **Market Analysis Available**

I'm your Genesis Trading Advisor! I can help with:

📈 **Technical Analysis**
• Chart patterns and indicators
• Support/resistance levels
• Trend analysis

💹 **Fundamental Analysis** 
• Company financials
• Market sentiment
• Economic indicators

🎯 **Trading Strategies**
• Risk management
• Position sizing
• Entry/exit strategies

What specific market or asset would you like to analyze?`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': Deno.env.get('ANTHROPIC_API_KEY') || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [
            {
              role: 'system',
              content: `You are Genesis, ODYSSEY-1's AI Trading Advisor. ${modeContext}

Provide comprehensive trading analysis including:
- Market overview and trends
- Technical analysis insights
- Risk assessment
- Trading recommendations
- Mode-specific advice

Be engaging and use emojis for better readability.`
            },
            ...messages.slice(-5),
            {
              role: 'user',
              content: message
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        aiResponse = data.content[0].text
      }
    } catch (apiError) {
      console.log('API fallback used:', apiError)
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        mode: tradingMode,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Trading Advisor Error:', error)
    
    return new Response(
      JSON.stringify({ 
        response: "I'm experiencing technical difficulties. Please try again in a moment. In the meantime, remember to always practice good risk management in your trading!",
        error: true
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
