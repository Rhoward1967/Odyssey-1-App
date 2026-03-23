/**
 * OSC Oracle — Real-Time Price Feed & 60-Second Lock
 * Converts BTC/ETH market prices to OSC acquisition rates
 *
 * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 */

import { OSC_CONSTANTS } from './oscCreditSystem';

export type SupportedCurrency = 'BTC' | 'ETH' | 'USD';

export interface PriceQuote {
  currency: SupportedCurrency;
  currencyAmount: number;
  oscAmount: number;
  rateUsdPerUnit: number;
  lockedAt: number;        // Unix timestamp
  expiresAt: number;       // Unix timestamp (lockedAt + 60s)
  quoteId: string;
  expired: boolean;
}

interface PriceCache {
  BTC: { priceUsd: number; fetchedAt: number };
  ETH: { priceUsd: number; fetchedAt: number };
}

const priceCache: PriceCache = {
  BTC: { priceUsd: 0, fetchedAt: 0 },
  ETH: { priceUsd: 0, fetchedAt: 0 },
};

const CACHE_TTL_MS = 30_000; // Refresh prices every 30 seconds
const activeQuotes = new Map<string, PriceQuote>();

/**
 * Fetch current market price for BTC or ETH in USD
 * Uses CoinGecko public API (no API key required)
 */
async function fetchLivePrice(currency: 'BTC' | 'ETH'): Promise<number> {
  const now = Date.now();
  const cached = priceCache[currency];

  // Return cached price if fresh
  if (cached.priceUsd > 0 && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.priceUsd;
  }

  try {
    const coinId = currency === 'BTC' ? 'bitcoin' : 'ethereum';
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );

    if (!response.ok) throw new Error(`Price fetch failed: ${response.status}`);

    const data = await response.json();
    const priceUsd = data[coinId]?.usd;

    if (!priceUsd || priceUsd <= 0) throw new Error('Invalid price data received');

    priceCache[currency] = { priceUsd, fetchedAt: now };
    return priceUsd;

  } catch (error) {
    // Fallback to cached price if available
    if (cached.priceUsd > 0) {
      console.warn(`Oracle fallback to cached ${currency} price: $${cached.priceUsd}`);
      return cached.priceUsd;
    }
    throw new Error(`Cannot fetch ${currency} price: ${error}`);
  }
}

/**
 * Generate a 60-second price-locked quote for OSC acquisition
 */
export async function generatePriceQuote(
  currency: SupportedCurrency,
  currencyAmount: number
): Promise<PriceQuote> {

  const now = Date.now();
  const quoteId = `OSC-${currency}-${now}-${Math.random().toString(36).substr(2, 9)}`;

  let rateUsdPerUnit: number;
  let oscAmount: number;

  if (currency === 'USD') {
    rateUsdPerUnit = 1;
    oscAmount = Math.floor(currencyAmount / OSC_CONSTANTS.GENESIS_PRICE_USD);
  } else {
    rateUsdPerUnit = await fetchLivePrice(currency);
    const usdEquivalent = currencyAmount * rateUsdPerUnit;
    oscAmount = Math.floor(usdEquivalent / OSC_CONSTANTS.GENESIS_PRICE_USD);
  }

  const quote: PriceQuote = {
    currency,
    currencyAmount,
    oscAmount,
    rateUsdPerUnit,
    lockedAt: now,
    expiresAt: now + (OSC_CONSTANTS.ORACLE_LOCK_SECONDS * 1000),
    quoteId,
    expired: false,
  };

  // Store quote for validation
  activeQuotes.set(quoteId, quote);

  // Auto-expire after lock window
  setTimeout(() => {
    const q = activeQuotes.get(quoteId);
    if (q) {
      activeQuotes.set(quoteId, { ...q, expired: true });
    }
  }, OSC_CONSTANTS.ORACLE_LOCK_SECONDS * 1000);

  return quote;
}

/**
 * Validate a quote — check it exists and hasn't expired
 */
export function validateQuote(quoteId: string): {
  valid: boolean;
  quote?: PriceQuote;
  reason?: string;
} {
  const quote = activeQuotes.get(quoteId);

  if (!quote) {
    return { valid: false, reason: 'Quote not found' };
  }

  if (quote.expired || Date.now() > quote.expiresAt) {
    return { valid: false, reason: 'Quote expired — request a new price lock' };
  }

  return { valid: true, quote };
}

/**
 * Consume a quote (mark as used — prevents double-spend)
 */
export function consumeQuote(quoteId: string): boolean {
  const result = validateQuote(quoteId);
  if (!result.valid) return false;
  activeQuotes.delete(quoteId);
  return true;
}

/**
 * Get current prices without generating a quote
 */
export async function getCurrentPrices(): Promise<{
  BTC: number;
  ETH: number;
  USD: number;
  oscGenesisPrice: number;
}> {
  const [btcPrice, ethPrice] = await Promise.all([
    fetchLivePrice('BTC'),
    fetchLivePrice('ETH'),
  ]);

  return {
    BTC: btcPrice,
    ETH: ethPrice,
    USD: 1,
    oscGenesisPrice: OSC_CONSTANTS.GENESIS_PRICE_USD,
  };
}

/**
 * Calculate how much of a currency is needed to acquire X OSC
 */
export async function currencyNeededForOsc(
  oscAmount: number,
  currency: SupportedCurrency
): Promise<number> {
  const usdNeeded = oscAmount * OSC_CONSTANTS.GENESIS_PRICE_USD;

  if (currency === 'USD') return usdNeeded;

  const priceUsd = await fetchLivePrice(currency);
  return usdNeeded / priceUsd;
}
