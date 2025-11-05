export class MarketDataService {
  private static readonly ALPHA_VANTAGE_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || 'demo';
  private static readonly POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'demo';

  // Get real stock price from Alpha Vantage
  static async getRealStockPrice(symbol: string) {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_KEY}`
      );
      const data = await response.json();
      
      if (data['Global Quote']) {
        const quote = data['Global Quote'];
        return {
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: quote['10. change percent']
        };
      }
      
      // Fallback to mock data if API fails
      return this.getMockPrice(symbol);
    } catch (error) {
      console.error('Failed to fetch real stock price:', error);
      return this.getMockPrice(symbol);
    }
  }

  // Get historical data
  static async getHistoricalData(symbol: string, timeframe: string) {
    try {
      const function_name = timeframe === '1D' ? 'TIME_SERIES_INTRADAY' : 'TIME_SERIES_DAILY';
      const interval = timeframe === '1D' ? '&interval=60min' : '';
      
      const response = await fetch(
        `https://www.alphavantage.co/query?function=${function_name}&symbol=${symbol}${interval}&apikey=${this.ALPHA_VANTAGE_KEY}`
      );
      const data = await response.json();
      
      // Parse the response based on timeframe
      const timeSeriesKey = timeframe === '1D' ? 'Time Series (60min)' : 'Time Series (Daily)';
      const timeSeries = data[timeSeriesKey];
      
      if (timeSeries) {
        return Object.entries(timeSeries).slice(0, 30).map(([time, values]: [string, any]) => ({
          time,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'])
        }));
      }
      
      return this.getMockHistoricalData(symbol, timeframe);
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      return this.getMockHistoricalData(symbol, timeframe);
    }
  }

  // Fallback mock data
  private static getMockPrice(symbol: string) {
    const prices: { [key: string]: number } = {
      'AAPL': 191.44,
      'MSFT': 384.52,
      'NVDA': 722.48,
      'TSLA': 248.42,
      'GOOGL': 139.69,
      'AMZN': 153.32
    };
    
    const basePrice = prices[symbol] || 100;
    const change = (Math.random() - 0.5) * basePrice * 0.02;
    
    return {
      price: basePrice + change,
      change: change,
      changePercent: `${(change / basePrice * 100).toFixed(2)}%`
    };
  }

  // Mock historical data generator
  private static getMockHistoricalData(symbol: string, timeframe: string) {
    const basePrice = this.getMockPrice(symbol).price;
    const points = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : 30;
    
    return Array.from({ length: points }, (_, i) => {
      const variation = (Math.random() - 0.5) * basePrice * 0.03;
      const price = basePrice + variation;
      
      return {
        time: new Date(Date.now() - (points - i) * 60000).toISOString(),
        open: price,
        high: price + Math.random() * basePrice * 0.01,
        low: price - Math.random() * basePrice * 0.01,
        close: price,
        volume: Math.floor(Math.random() * 1000000)
      };
    });
  }

  // Get crypto prices from CoinGecko (free API)
  static async getCryptoPrice(coinId: string) {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
      );
      const data = await response.json();
      
      if (data[coinId]) {
        return {
          price: data[coinId].usd,
          change: data[coinId].usd_24h_change || 0,
          changePercent: `${(data[coinId].usd_24h_change || 0).toFixed(2)}%`
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch crypto price:', error);
      return null;
    }
  }
}
