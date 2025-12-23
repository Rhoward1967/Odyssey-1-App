import { createHmac } from "node:crypto";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

console.info("Coinbase Trading Engine v1.0 Starting...");

/**
 * Coinbase Advanced Trade API Integration
 * Docs: https://docs.cloud.coinbase.com/advanced-trade-api/docs/welcome
 */

interface CoinbaseCredentials {
  apiKey: string;
  apiSecret: string;
}

// Generate Coinbase API signature
function generateSignature(
  timestamp: string,
  method: string,
  path: string,
  body: string,
  secret: string
): string {
  const message = timestamp + method + path + body;
  return createHmac('sha256', secret).update(message).digest('hex');
}

// Make authenticated Coinbase API request
async function coinbaseRequest(
  method: string,
  path: string,
  body: any,
  credentials: CoinbaseCredentials
): Promise<any> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyString = body ? JSON.stringify(body) : '';
  
  const signature = generateSignature(
    timestamp,
    method,
    path,
    bodyString,
    credentials.apiSecret
  );

  const url = `https://api.coinbase.com${path}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'CB-ACCESS-KEY': credentials.apiKey,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'Content-Type': 'application/json',
    },
    body: bodyString || undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Coinbase API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();

    // Authenticate user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get Coinbase credentials from environment
    const credentials: CoinbaseCredentials = {
      apiKey: Deno.env.get('COINBASE_API_KEY') ?? '',
      apiSecret: Deno.env.get('COINBASE_API_SECRET') ?? '',
    };

    if (!credentials.apiKey || !credentials.apiSecret) {
      throw new Error('Coinbase API credentials not configured');
    }

    // Route actions
    switch (action) {
      case 'getAccounts': {
        // Get all Coinbase accounts (balances)
        const data = await coinbaseRequest('GET', '/api/v3/brokerage/accounts', null, credentials);
        
        // Update user_portfolio table with real prices
        if (data.accounts) {
          for (const account of data.accounts) {
            const balance = parseFloat(account.available_balance?.value || '0');
            let value = 0;
            
            // Get current price for non-USD currencies
            if (account.currency !== 'USD' && balance > 0) {
              try {
                const productId = `${account.currency}-USD`;
                const priceData = await coinbaseRequest('GET', `/api/v3/brokerage/products/${productId}`, null, credentials);
                const currentPrice = parseFloat(priceData.price || '0');
                value = balance * currentPrice;
              } catch (error) {
                console.error(`Failed to get price for ${account.currency}:`, error);
                value = 0;
              }
            } else if (account.currency === 'USD') {
              value = balance; // USD value is the balance itself
            }
            
            await supabase
              .from('user_portfolio')
              .upsert({
                user_id: user.id,
                symbol: account.currency,
                balance,
                value,
                platform: 'coinbase',
                last_updated: new Date().toISOString(),
              }, {
                onConflict: 'user_id,symbol,platform'
              });
          }
        }

        return new Response(JSON.stringify({ 
          success: true,
          accounts: data.accounts || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }

      case 'getProducts': {
        // Get tradable products (e.g., BTC-USD, ETH-USD)
        const data = await coinbaseRequest('GET', '/api/v3/brokerage/products', null, credentials);
        
        return new Response(JSON.stringify({
          success: true,
          products: data.products || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }

      case 'getPrice': {
        const { symbol } = payload;
        if (!symbol) throw new Error('Symbol required');

        const data = await coinbaseRequest('GET', `/api/v3/brokerage/products/${symbol}`, null, credentials);
        
        return new Response(JSON.stringify({
          success: true,
          price: data.price || '0',
          symbol: data.product_id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }

      case 'placeOrder': {
        const { symbol, side, orderType, amount, price } = payload;
        
        if (!symbol || !side || !amount) {
          throw new Error('Symbol, side, and amount are required');
        }

        // Build order request
        const orderRequest: any = {
          client_order_id: crypto.randomUUID(),
          product_id: symbol,
          side: side.toUpperCase(), // 'BUY' or 'SELL'
          order_configuration: orderType === 'limit' ? {
            limit_limit_gtc: {
              base_size: amount.toString(),
              limit_price: price.toString()
            }
          } : {
            market_market_ioc: {
              quote_size: amount.toString() // For market orders, use quote size
            }
          }
        };

        const data = await coinbaseRequest('POST', '/api/v3/brokerage/orders', orderRequest, credentials);

        // Log to trades table
        const { data: newTrade, error: tradeError } = await supabase.from('trades').insert({
          user_id: user.id,
          symbol,
          type: side,
          quantity: parseFloat(amount),
          price: parseFloat(price || '0'),
          value: parseFloat(amount) * parseFloat(price || '0'),
          status: data.success ? 'executed' : 'pending',
          is_paper_trade: false,
          trading_platform: 'coinbase'
        }).select().single();

        if (tradeError) {
          console.error('Failed to log trade:', tradeError);
        }

        // Log to trade_history
        await supabase.from('trade_history').insert({
          user_id: user.id,
          symbol,
          amount: parseFloat(amount),
          price: parseFloat(price || '0'),
          type: side,
          status: data.success ? 'completed' : 'pending',
          platform: 'coinbase',
          trade_id: newTrade?.id,
          external_order_id: data.order_id,
          metadata: { order_configuration: orderRequest.order_configuration }
        });

        return new Response(JSON.stringify({
          success: data.success || false,
          orderId: data.order_id,
          message: data.success ? `Order placed: ${side} ${amount} ${symbol}` : 'Order failed',
          data
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }

      case 'getOrders': {
        // Get order history
        const data = await coinbaseRequest('GET', '/api/v3/brokerage/orders/historical/batch', null, credentials);
        
        return new Response(JSON.stringify({
          success: true,
          orders: data.orders || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }

      case 'cancelOrder': {
        const { orderId } = payload;
        if (!orderId) throw new Error('Order ID required');

        const data = await coinbaseRequest('POST', '/api/v3/brokerage/orders/batch_cancel', {
          order_ids: [orderId]
        }, credentials);

        return new Response(JSON.stringify({
          success: true,
          data
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Coinbase Trading Engine Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
