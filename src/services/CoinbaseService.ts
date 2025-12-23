import { supabase } from '@/lib/supabase';

/**
 * Coinbase Advanced Trade API Service
 * Frontend integration for Coinbase trading
 */

export interface CoinbaseAccount {
  uuid: string;
  name: string;
  currency: string;
  balance: number;
  available: number;
  hold: number;
}

export interface CoinbaseProduct {
  id: string;
  base_currency: string;
  quote_currency: string;
  base_min_size: string;
  base_max_size: string;
  quote_increment: string;
  price: string;
}

export interface CoinbaseOrder {
  id: string;
  product_id: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  size: string;
  price?: string;
  status: string;
  created_at: string;
}

export interface TradeRequest {
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  amount: number;
  price?: number;
}

export class CoinbaseService {
  /**
   * Get all Coinbase account balances
   */
  static async getAccounts(): Promise<CoinbaseAccount[]> {
    try {
      const { data, error } = await supabase.functions.invoke('coinbase-trading-engine', {
        body: { action: 'getAccounts', payload: {} }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to fetch accounts');

      return data.accounts || [];
    } catch (error) {
      console.error('Failed to fetch Coinbase accounts:', error);
      throw error;
    }
  }

  /**
   * Get available trading products (e.g., BTC-USD, ETH-USD)
   */
  static async getProducts(): Promise<CoinbaseProduct[]> {
    try {
      const { data, error } = await supabase.functions.invoke('coinbase-trading-engine', {
        body: { action: 'getProducts', payload: {} }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to fetch products');

      return data.products || [];
    } catch (error) {
      console.error('Failed to fetch Coinbase products:', error);
      throw error;
    }
  }

  /**
   * Get current price for a symbol
   */
  static async getPrice(symbol: string): Promise<{ price: string; symbol: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('coinbase-trading-engine', {
        body: { action: 'getPrice', payload: { symbol } }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to fetch price');

      return { price: data.price, symbol: data.symbol };
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Place a buy or sell order
   */
  static async placeOrder(request: TradeRequest): Promise<{
    success: boolean;
    orderId?: string;
    message: string;
  }> {
    try {
      console.log('🔄 Placing Coinbase order:', request);

      const { data, error } = await supabase.functions.invoke('coinbase-trading-engine', {
        body: {
          action: 'placeOrder',
          payload: {
            symbol: request.symbol,
            side: request.side,
            orderType: request.orderType,
            amount: request.amount,
            price: request.price
          }
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Order failed');
      }

      console.log('✅ Coinbase order placed:', data);

      return {
        success: true,
        orderId: data.orderId,
        message: data.message || `Order placed: ${request.side} ${request.amount} ${request.symbol}`
      };
    } catch (error) {
      console.error('Failed to place Coinbase order:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Order failed'
      };
    }
  }

  /**
   * Get order history
   */
  static async getOrders(): Promise<CoinbaseOrder[]> {
    try {
      const { data, error } = await supabase.functions.invoke('coinbase-trading-engine', {
        body: { action: 'getOrders', payload: {} }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to fetch orders');

      return data.orders || [];
    } catch (error) {
      console.error('Failed to fetch Coinbase orders:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(orderId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('coinbase-trading-engine', {
        body: { action: 'cancelOrder', payload: { orderId } }
      });

      if (error) throw error;
      return data.success || false;
    } catch (error) {
      console.error('Failed to cancel Coinbase order:', error);
      return false;
    }
  }

  /**
   * Get portfolio summary from Supabase (cached balances)
   */
  static async getPortfolioSummary(): Promise<{
    totalValue: number;
    holdings: Array<{ symbol: string; balance: number; value: number }>;
  }> {
    try {
      const { data, error } = await supabase
        .from('user_portfolio')
        .select('*')
        .eq('platform', 'coinbase');

      if (error) throw error;

      const holdings = (data || []).map((item: any) => ({
        symbol: item.symbol,
        balance: parseFloat(item.balance),
        value: parseFloat(item.value)
      }));

      const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

      return { totalValue, holdings };
    } catch (error) {
      console.error('Failed to fetch portfolio summary:', error);
      return { totalValue: 0, holdings: [] };
    }
  }

  /**
   * Get trade history from Supabase
   */
  static async getTradeHistory(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('trade_history')
        .select('*')
        .eq('platform', 'coinbase')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch trade history:', error);
      return [];
    }
  }
}
