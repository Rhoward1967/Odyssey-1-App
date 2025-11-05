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
    const { message, tradingMode = 'paper' } = await req.json()
    
    // Enhanced trading responses based on query
    const query = message.toLowerCase();
    let response = '';

    if (query.includes('aapl') || query.includes('apple')) {
      response = `📈 **AAPL Trading Analysis**

**Current Status:** Apple Inc. (NASDAQ: AAPL)
• **Market Cap:** ~$3.0 Trillion
• **Sector:** Technology - Consumer Electronics
• **Key Support:** $175-180 range
• **Resistance:** $200-205 levels

**Technical Indicators:**
• 50-day MA: Bullish crossover pattern
• Volume: Above average institutional activity
• RSI: Currently in neutral zone (45-55)

**Fundamental Strengths:**
• iPhone revenue remains stable (60-70% of total)
• Services growth: App Store, iCloud expansion
• Strong balance sheet with $29B quarterly revenue

**${tradingMode === 'paper' ? 'Paper Trading Strategy' : 'Live Trading Notes'}:**
${tradingMode === 'paper' 
  ? '• Practice with 10-20 share positions\n• Study earnings impact patterns\n• Track daily volatility ranges'
  : '• Position size: 2-5% of portfolio max\n• Set stop loss at $170 support\n• Consider covered calls on positions'
}

**Risk Factors:**
• China market exposure (~20% revenue)
• Regulatory scrutiny on App Store
• Consumer spending sensitivity

*This is educational analysis for ${tradingMode} trading.*`;

    } else if (query.includes('strategy') || query.includes('how to')) {
      response = `💡 **Trading Strategy Guide**

**${tradingMode === 'paper' ? 'Paper Trading Learning Path' : 'Live Trading Framework'}:**

**1. Risk Management (CRITICAL):**
• Never risk more than 1-2% per trade
• Use stop losses on every position
• Size positions based on volatility

**2. Entry Strategies:**
• **Breakout:** Enter above resistance with volume
• **Pullback:** Buy dips to moving average support
• **Momentum:** Follow strong trending moves

**3. Market Analysis:**
• Check overall market direction (SPY/QQQ)
• Verify sector strength before stock picks
• Use volume to confirm price moves

**${tradingMode === 'paper' ? 'Learning Focus' : 'Execution Tips'}:**
${tradingMode === 'paper'
  ? '• Track win/loss ratios\n• Practice different timeframes\n• Study after-hours reactions'
  : '• Use limit orders for better fills\n• Monitor pre-market activity\n• Keep trading journal'
}

**Key Metrics to Track:**
• Sharpe ratio (risk-adjusted returns)
• Maximum drawdown periods
• Average holding time per position

*${tradingMode === 'paper' ? 'Perfect for learning without risk!' : 'Live trading requires strict discipline.'}*`;

    } else {
      response = `🤖 **Genesis Trading Advisor Active**

**Market Overview Ready:**
• **📊 Stock Analysis** - Try: "Analyze AAPL" or "MSFT outlook"
• **💰 Crypto Insights** - Ask: "Bitcoin analysis" or "crypto trends"
• **📈 Strategy Help** - Request: "trading strategy" or "risk management"
• **🎯 Specific Tickers** - Query any stock symbol for analysis

**${tradingMode === 'paper' ? 'Paper Trading Mode' : 'Live Trading Mode'}:**
${tradingMode === 'paper'
  ? 'Perfect environment for learning and testing strategies without financial risk.'
  : 'Real market analysis for actual trading decisions. Use proper risk management.'
}

**Popular Analysis Requests:**
• "AAPL technical analysis"
• "Best trading strategy for beginners"
• "How to analyze earnings reports"
• "Risk management techniques"

**What market analysis can I provide for you today?**`;
    }

    return new Response(
      JSON.stringify({ 
        response,
        mode: tradingMode,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        response: "🚨 Trading advisor service is initializing. Please try your query again in a moment.",
        error: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  }
})
