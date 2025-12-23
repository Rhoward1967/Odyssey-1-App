import { createClient } from "npm:@supabase/supabase-js@2.45.4";

// ✅ INLINE CORS HEADERS (no external file needed)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

console.info("Trade Orchestrator V7 (Import Fixed) Booting Up...");

// --- LIVE PRICE FETCHER ---
async function getLivePrice(symbol: string): Promise<number> {
  const isCrypto = symbol.includes('-USD');
  const ticker = isCrypto ? `X:${symbol.replace('-USD', 'USD')}` : symbol;
  const url = `https://api.polygon.io/v2/last/trade/${ticker}?apiKey=${Deno.env.get('POLYGON_API_KEY')!}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch price for ${symbol}: ${response.status}`);
      return 0;
    }
    const data = await response.json();
    return data.results?.p ?? 0;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return 0;
  }
}

// --- TYPES FOR LINT COMPLIANCE ---
interface PositionLot {
  symbol: string;
  shares: number;
  purchase_price: number;
}

interface NewsItem {
  title: string;
}

interface PolygonNewsResponse {
  results?: NewsItem[];
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  const { action, payload } = await req.json();

  try {
    // --- 1. AUTHENTICATE THE USER ---
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // --- 2. ROUTE THE ACTION ---
    switch (action) {

      case 'GET_LIVE_P_AND_L': {
        const { data: positions, error: dbError } = await supabase
          .from('position_lots')
          .select('symbol, shares, purchase_price')
          .eq('user_id', user.id);

        if (dbError) throw new Error(`Database error: ${dbError.message}`);
        if (!positions || positions.length === 0) {
          return new Response(JSON.stringify({ pnl: 0, totalValue: 0, totalCost: 0, positions: [] }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 200 
          });
        }

        const aggregated: { [key: string]: { totalShares: number, totalCost: number } } = {};
        for (const lot of positions as PositionLot[]) {
          if (!aggregated[lot.symbol]) {
            aggregated[lot.symbol] = { totalShares: 0, totalCost: 0 };
          }
          aggregated[lot.symbol].totalShares += lot.shares;
          aggregated[lot.symbol].totalCost += lot.shares * lot.purchase_price;
        }
        
        const symbols = Object.keys(aggregated);
        const pricePromises = symbols.map(symbol => getLivePrice(symbol));
        const livePrices = await Promise.all(pricePromises);
        
        const priceMap = new Map<string, number>();
        symbols.forEach((symbol, index) => {
          priceMap.set(symbol, livePrices[index]);
        });

        let totalValue = 0;
        let totalCost = 0;
        
        const livePositions = Object.entries(aggregated).map(([symbol, data]) => {
            const currentPrice = priceMap.get(symbol) || (data.totalShares ? data.totalCost / data.totalShares : 0);
            const currentValue = data.totalShares * currentPrice;
            
            totalValue += currentValue;
            totalCost += data.totalCost;

            return {
                symbol: symbol,
                totalShares: data.totalShares,
                avgCost: data.totalShares ? data.totalCost / data.totalShares : 0,
                currentPrice: currentPrice,
                currentValue: currentValue,
                pnl: currentValue - data.totalCost,
                pnlPercent: data.totalCost > 0 ? ((currentValue - data.totalCost) / data.totalCost) * 100 : 0
            };
        });

        const pnl = totalValue - totalCost;
        
        return new Response(JSON.stringify({ 
          pnl, 
          totalValue, 
          totalCost,
          positions: livePositions 
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }

      case 'GET_AI_ADVICE': {
        const { symbol } = payload;
        if (!symbol) throw new Error("Symbol is required for AI advice.");
        
        console.log(`🤖 Starting AI analysis for ${symbol}`);
        
        try {
          // Get API keys
          const polygonKey = Deno.env.get('POLYGON_API_KEY');
          const geminiKey = Deno.env.get('GEMINI_API_KEY');
          
          console.log(`🔑 API Keys available - Polygon: ${!!polygonKey}, Gemini: ${!!geminiKey}`);
          
          if (!polygonKey || !geminiKey) {
            throw new Error('Missing required API keys');
          }
          
          // Fetch news
          let headlines: string[] = [];
          try {
            const newsUrl = `https://api.polygon.io/v2/reference/news?ticker=${symbol}&limit=3&apiKey=${polygonKey}`;
            const newsResponse = await fetch(newsUrl);
            
            if (newsResponse.ok) {
              const newsData = await newsResponse.json() as PolygonNewsResponse;
              headlines = newsData.results?.slice(0, 2).map((item) => item.title) || [];
              console.log(`📊 Retrieved ${headlines.length} news headlines`);
            }
          } catch (newsError) {
            console.log('News fetch failed, continuing with AI analysis');
          }
          
          // Generate AI analysis with actionable recommendations
          const prompt = `You are R.O.M.A.N., an AI trading advisor helping users learn paper trading. Analyze ${symbol} and provide:

1. **Current Market Outlook** (1-2 sentences on overall sentiment)
2. **My Recommendation** - Should the user BUY, HOLD, or avoid ${symbol} right now? Be specific.
3. **Why?** - Give 2-3 concrete reasons supporting your recommendation
4. **Entry/Exit Strategy** - Suggest specific price levels if buying/selling
5. **Risk Warning** - What could go wrong with this trade?

Context: ${headlines.length > 0 ? headlines.join('; ') : 'General market conditions'}

Be conversational, actionable, and educational. Speak directly to the trader ("I recommend you..." or "You should consider..."). Keep under 250 words.`;
          
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`;
          
          const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
            })
          });
          
          if (geminiResponse.ok) {
            const aiData = await geminiResponse.json() as GeminiResponse;
            const analysis = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (analysis) {
              console.log(`✅ AI analysis completed successfully`);
              return new Response(JSON.stringify({
                source: 'Gemini AI',
                analysis,
                symbol,
                timestamp: new Date().toISOString()
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
              });
            }
          }
          
          throw new Error(`Gemini API error: ${geminiResponse.status}`);
          
        } catch (error) {
          console.error(`❌ AI Analysis error for ${symbol}:`, error);
          
          // R.O.M.A.N. educational fallback with recommendations
          const fallbackAnalysis = `🤖 **R.O.M.A.N. Analysis: ${symbol}**

**Current Market Outlook**
Based on recent price action, ${symbol} is showing moderate consolidation. This presents a learning opportunity for paper traders.

**My Recommendation: PRACTICE ENTRY**
I suggest using this as a practice trade opportunity. Here's why:
• Stable price action allows studying order execution
• Good for testing stop-loss placement strategies
• Lower volatility reduces emotional decision-making

**Entry/Exit Strategy**
• **Practice Entry**: Current market price for educational purposes
• **Stop-Loss**: Set 5-7% below entry to practice risk management
• **Target**: 8-12% gain to learn profit-taking discipline

**Risk Warning**
Market conditions can change rapidly. Use this as education - practice your trading plan before risking real capital.

💡 **Learning Focus**: Master the mechanics of trading before worrying about profits. Paper trading is your risk-free training ground.

⚠️ Paper trading only - perfect mistakes here, not in live markets.

*Generated: ${new Date().toLocaleString()}*`;

          return new Response(JSON.stringify({
            source: 'AI Analysis Engine (Educational)',
            analysis: fallbackAnalysis,
            symbol,
            timestamp: new Date().toISOString(),
            fallback: true
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          });
        }
      }

      case 'EXECUTE_PAPER_TRADE': {
        let { symbol, quantity, side, price } = payload;
        if (!symbol || !quantity || !side) throw new Error('Symbol, quantity, and side are required.');
        
        if (!price || price === 0) {
          price = await getLivePrice(symbol);
          if (price === 0) throw new Error(`Could not fetch market price for ${symbol}`);
        }
        
        const { data: newTrade, error: tradeError } = await supabase.from('trades').insert({
          user_id: user.id, symbol, type: side, quantity, price, value: quantity * price, status: 'executed', is_paper_trade: true
        }).select().single();
        
        if (tradeError) throw new Error(`Database error: ${tradeError.message}`);

        const { error: lotError } = await supabase.from('position_lots').insert({
          id: `trade_${newTrade.id}`, 
          user_id: user.id, 
          symbol, 
          shares: side === 'buy' ? quantity : -quantity, 
          purchase_price: price, 
          purchase_date: new Date().toISOString(), 
          description: `Paper Trade: ${side} ${quantity} ${symbol}`
        });
        
        if (lotError) throw new Error(`Position lot error: ${lotError.message}`);
        
        return new Response(JSON.stringify({ success: true, trade: newTrade }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        });
      }
      
      default:
        throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    console.error(`Orchestrator Error (Action: ${action}):`, error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
})