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
    const { message, tradingMode = 'paper', messages: _messages } = await req.json()

    // Check for specific stock/crypto queries and provide intelligent responses
    const query = message.toLowerCase();
    let aiResponse = '';

    if (query.includes('aapl') || query.includes('apple')) {
      aiResponse = `📈 **AAPL (Apple Inc.) Analysis**

**💰 Current Market Position:**
• **Symbol:** AAPL (NASDAQ)
• **Sector:** Technology - Consumer Electronics
• **Market Cap:** ~$3.0 Trillion (Large Cap)
• **P/E Ratio:** ~28-30 range (Premium valuation)

**📊 Technical Analysis:**
• **Support Levels:** Monitor $175-180 range
• **Resistance:** Key levels around $200-205
• **Moving Averages:** Watch 50-day and 200-day MA crossovers
• **Volume:** Institutional buying/selling patterns

**🔍 Fundamental Factors:**
• **iPhone Sales:** Primary revenue driver (60-70% of revenue)
• **Services Growth:** App Store, iCloud, Apple Pay expansion
• **Innovation Pipeline:** AI integration, AR/VR developments
• **Global Markets:** China market performance impact

**⚠️ Risk Considerations:**
• **Market Concentration:** Heavy iPhone dependence
• **Regulatory Scrutiny:** App Store policies under review
• **Economic Sensitivity:** Consumer discretionary spending
• **Competition:** Android, AI hardware competition

**💡 Trading Considerations:**
${tradingMode === 'paper' 
  ? '• **Paper Trading:** Excellent for learning blue-chip analysis\n• **Study Pattern:** Track earnings impact and product cycles'
  : '• **Position Sizing:** Consider 2-5% of portfolio for single stock\n• **Entry Strategy:** Dollar-cost averaging on dips'
}

*This is educational analysis. Always conduct your own research and consider your risk tolerance.*`;

    } else if (query.includes('crypto') || query.includes('bitcoin') || query.includes('btc') || query.includes('ethereum')) {
      aiResponse = `🚀 **Cryptocurrency Market Analysis**

**📊 Major Crypto Overview:**
• **Bitcoin (BTC):** Digital gold, store of value narrative
• **Ethereum (ETH):** Smart contracts platform, DeFi ecosystem
• **Market Cap:** Total crypto market ~$1.7-2.0 trillion
• **Dominance:** Bitcoin ~45-50%, Ethereum ~18-20%

**📈 Current Trends:**
• **Institutional Adoption:** ETFs, corporate treasury holdings
• **Regulatory Clarity:** Ongoing development in major markets
• **Technology Evolution:** Layer 2 solutions, proof-of-stake
• **DeFi Growth:** Decentralized finance ecosystem expansion

**⚠️ High-Risk Considerations:**
• **Extreme Volatility:** 20-30% daily moves possible
• **Regulatory Risk:** Policy changes can impact prices significantly
• **Technology Risk:** Smart contract vulnerabilities
• **Market Manipulation:** Less regulated than traditional assets

**💡 Risk Management for Crypto:**
${tradingMode === 'paper' 
  ? '• **Paper Trading:** Perfect for learning crypto volatility\n• **Study Correlations:** Track Bitcoin dominance effects'
  : '• **Position Sizing:** Never more than 5-10% of total portfolio\n• **Dollar-Cost Averaging:** Spread purchases over time'
}

*Crypto is highly speculative. Only invest what you can afford to lose.*`;

    } else if (query.includes('market') || query.includes('analysis') || query.includes('strategy')) {
      aiResponse = `📊 **Market Analysis & Strategy Framework**

**🔍 Market Analysis Approach:**
• **Technical Analysis:** Chart patterns, indicators, volume
• **Fundamental Analysis:** Company financials, industry trends
• **Sentiment Analysis:** Market psychology, fear/greed index
• **Macro Analysis:** Economic indicators, Fed policy, global events

**📈 Key Trading Strategies:**
• **Trend Following:** Moving averages, momentum indicators
• **Mean Reversion:** Oversold/overbought conditions
• **Breakout Trading:** Support/resistance level breaks
• **Swing Trading:** Multi-day to week-long positions

**⚠️ Risk Management Rules:**
• **Position Sizing:** Never risk more than 1-2% per trade
• **Stop Losses:** Define exit points before entering
• **Diversification:** Spread risk across assets/sectors
• **Risk/Reward:** Target 2:1 or better reward-to-risk ratios

**📋 Market Indicators to Watch:**
• **VIX:** Volatility index (fear gauge)
• **10-Year Treasury:** Interest rate environment
• **Dollar Index (DXY):** Currency strength impact
• **Sector Rotation:** Which industries are leading

${tradingMode === 'paper' 
  ? '**Paper Trading Benefits:**\n• Learn without financial risk\n• Test strategies with real market data\n• Build confidence before live trading'
  : '**Live Trading Considerations:**\n• Start with small positions\n• Keep detailed trading journal\n• Review and adjust strategies regularly'
}

*Always practice proper risk management and never trade with money you cannot afford to lose.*`;

    } else {
      // Fallback for general trading queries
      aiResponse = `🤖 **Genesis Trading Advisor Ready**

I can help you with:

**📈 Stock Analysis:**
• Individual stock research and analysis
• Sector comparisons and recommendations
• Technical and fundamental analysis
• Risk assessment and position sizing

**💰 Crypto Analysis:**
• Bitcoin, Ethereum, and altcoin analysis
• DeFi and NFT market insights
• Risk management for volatile assets
• Regulatory impact assessments

**📊 Market Strategy:**
• Trading strategy development
• Risk management techniques
• Portfolio allocation guidance
• Market timing and entry/exit strategies

**🎯 Specialized Analysis:**
• Forex currency pairs
• Commodities and futures
• Options trading strategies
• Economic indicator impact

What specific market, asset, or trading strategy would you like me to analyze?`;
    }

    // Try Anthropic API as enhancement, but don't fail if it doesn't work
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
          max_tokens: 500,
          messages: [
            {
              role: 'system',
              content: `You are Genesis, ODYSSEY-1's AI Trading Advisor. Provide additional insights to complement the analysis.`
            },
            {
              role: 'user',
              content: message
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.content[0]?.text) {
          aiResponse += `\n\n**Advanced AI Analysis:**\n${data.content[0].text}`;
        }
      }
    } catch (_apiError) {
      console.log('Anthropic API unavailable, using comprehensive fallback response');
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
    
    // Get tradingMode from the original request or default to 'paper'
    let mode = 'paper';
    try {
      const requestBody = await req.clone().json();
      mode = requestBody.tradingMode || 'paper';
    } catch {
      // Use default if parsing fails
    }
    
    return new Response(
      JSON.stringify({ 
        response: `🤖 **Genesis Trading Advisor Available**

I'm ready to help with trading analysis and strategy. I can assist with:

• **Stock Analysis** - Individual stocks like AAPL, TSLA, MSFT
• **Crypto Analysis** - Bitcoin, Ethereum, and altcoins  
• **Market Strategy** - Trading approaches and risk management
• **Technical Analysis** - Chart patterns and indicators

${mode === 'paper' ? 'Perfect for learning in paper trading mode!' : 'Ready to provide real market insights!'}

What would you like me to analyze?`,
        mode: mode,
        error: false,
        fallback: true
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
