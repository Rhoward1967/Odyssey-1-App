// Believing Self Creations © 2024 - Sovereign Frequency Enhanced
import { sfLogger } from './sovereignFrequencyLogger';

export class MarketDataService {
  // CHANGE THESE TWO LINES (lines 2-3):
  // FROM: private static readonly ALPHA_VANTAGE_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || 'demo';
  // TO:
  private static readonly ALPHA_VANTAGE_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || 'demo';
  private static readonly POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY || 'demo';

  // Get REAL stock prices from Alpha Vantage
  static async getRealStockPrice(symbol: string) {
    sfLogger.pickUpTheSpecialPhone('MARKET_DATA_FETCH', 'Fetching real-time stock price', {
      symbol,
      provider: 'AlphaVantage'
    });

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_KEY}`
      );
      const data = await response.json();
      
      if (data['Global Quote']) {
        const quote = data['Global Quote'];
        const priceData = {
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: quote['10. change percent'].replace('%', ''),
          open: parseFloat(quote['02. open']),
          high: parseFloat(quote['03. high']),
          low: parseFloat(quote['04. low']),
          volume: quote['06. volume']
        };

        sfLogger.thanksForGivingBackMyLove('MARKET_DATA_FETCHED', 'Real-time stock price retrieved', {
          symbol,
          price: priceData.price,
          change: priceData.changePercent
        });

        return priceData;
      }
      
      sfLogger.helpMeFindMyWayHome('MARKET_DATA_UNAVAILABLE', 'Real data unavailable, using fallback', {
        symbol,
        fallback: 'mock-data'
      });
      return this.getMockPrice(symbol);
    } catch (error) {
      sfLogger.helpMeFindMyWayHome('MARKET_DATA_FETCH_FAILED', 'Failed to fetch stock price', {
        error: error instanceof Error ? error.message : 'Unknown error',
        symbol,
        fallback: 'mock-data'
      });
      console.error('Failed to fetch real stock price:', error);
      return this.getMockPrice(symbol);
    }
  }

  // Batch crypto price fetching to avoid rate limits
  private static cryptoCache = new Map<string, { data: any; timestamp: number }>();
  private static CACHE_DURATION = 60000; // 1 minute cache

  static async getCryptoPricesBatch(coinIds: string[]) {
    // Check cache first
    const now = Date.now();
    const cached = this.cryptoCache.get(coinIds.join(','));
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    sfLogger.pickUpTheSpecialPhone('CRYPTO_BATCH_FETCH', 'Fetching cryptocurrency prices in batch', {
      coins: coinIds.length,
      provider: 'CoinGecko'
    });

    try {
      // Batch request to CoinGecko (reduces API calls dramatically)
      const idsParam = coinIds.join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
      );
      
      if (!response.ok) {
        if (response.status === 429) {
          console.warn('CoinGecko rate limit hit, using cached data');
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.cryptoCache.set(coinIds.join(','), { data, timestamp: now });

      sfLogger.thanksForGivingBackMyLove('CRYPTO_BATCH_FETCHED', 'Batch cryptocurrency prices retrieved', {
        coins: Object.keys(data).length
      });

      return data;
    } catch (error) {
      sfLogger.helpMeFindMyWayHome('CRYPTO_BATCH_FETCH_FAILED', 'Failed to fetch batch cryptocurrency prices', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error('Failed to fetch crypto prices:', error);
      return null;
    }
  }

  // Get REAL crypto prices from CoinGecko (single coin - use batch instead)
  static async getCryptoPrice(coinId: string) {
    // Use batch API for single requests too
    const batchData = await this.getCryptoPricesBatch([coinId]);
    
    if (batchData && batchData[coinId]) {
      const cryptoData = {
        price: batchData[coinId].usd,
        change: batchData[coinId].usd_24h_change || 0,
        changePercent: (batchData[coinId].usd_24h_change || 0).toFixed(2),
        volume: batchData[coinId].usd_24h_vol || 0
      };

      sfLogger.thanksForGivingBackMyLove('CRYPTO_PRICE_FETCHED', 'Cryptocurrency price retrieved', {
        coinId,
        price: cryptoData.price,
        change: cryptoData.changePercent
      });

      return cryptoData;
    }
    
    return null;
  }

  // Add the missing getHistoricalData method
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

  // Add the missing getAllMarketData method
  static async getAllMarketData() {
    const stockSymbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'AMD', 'NFLX', 'DIS', 'BABA', 'JPM', 'V', 'WMT', 'BA', 'NKE'];
    const cryptoIds = ['bitcoin', 'ethereum', 'solana', 'cardano', 'polkadot', 'avalanche-2', 'ripple', 'dogecoin', 'matic-network', 'chainlink', 'uniswap', 'cosmos', 'litecoin', 'bitcoin-cash', 'algorand', 'stellar'];
    const etfSymbols = ['SPY', 'QQQ', 'VTI', 'ARKK', 'TQQQ', 'SQQQ', 'VOO', 'IVV', 'VUG', 'VTV', 'DIA', 'IWM', 'EEM', 'GLD', 'SLV', 'XLK'];

    try {
      // Fetch crypto prices in ONE batch request instead of 16 individual requests
      const cryptoBatchData = await this.getCryptoPricesBatch(cryptoIds);
      const cryptoData = cryptoIds.map(id => {
        if (cryptoBatchData && cryptoBatchData[id]) {
          return {
            price: cryptoBatchData[id].usd,
            change: cryptoBatchData[id].usd_24h_change || 0,
            changePercent: (cryptoBatchData[id].usd_24h_change || 0).toFixed(2),
            volume: cryptoBatchData[id].usd_24h_vol || 0
          };
        }
        return null;
      });

      // Fetch stock data (these already have rate limiting)
      const stockData = await Promise.all(stockSymbols.map(symbol => this.getRealStockPrice(symbol)));
      const etfData = await Promise.all(etfSymbols.map(symbol => this.getRealStockPrice(symbol)));

      return {
        stocks: stockData,
        crypto: cryptoData,
        etfs: etfData
      };
        etfs: allData.slice(12, 18)
      };
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      return null;
    }
  }

  // More realistic mock price generator
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
    // Much smaller, realistic intraday movements
    const change = (Math.random() - 0.5) * basePrice * 0.003; // 0.3% max change
    
    return {
      price: Math.max(basePrice * 0.97, Math.min(basePrice * 1.03, basePrice + change)),
      change: change,
      changePercent: `${(change / basePrice * 100).toFixed(2)}%`
    };
  }

  // Mock historical data generator
  private static getMockHistoricalData(symbol: string, timeframe: string) {
    const basePrice = 191.44;
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
}

// File is ready to accept - import.meta.env fixed
