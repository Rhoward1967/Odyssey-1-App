/**
 * O-1 Sovereignty Credit (OSC) Wallet Dashboard
 * The user's sovereign access key to the Odyssey-1 AI system
 *
 * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  OSC_CONSTANTS,
  SERVICE_TIERS,
  ServiceTierId,
  getBalance,
  getSupplyState,
  getTransactionHistory,
  usdToOsc,
  oscToUsd,
  OscTransaction,
} from '@/services/oscCreditSystem';
import {
  generatePriceQuote,
  getCurrentPrices,
  PriceQuote,
  SupportedCurrency,
} from '@/services/oscOracle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ============================================================
// TYPES
// ============================================================

interface DashboardProps {
  userId: string;
}

// ============================================================
// HELPERS
// ============================================================

function formatOsc(amount: number): string {
  return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function formatUsd(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function tierUnlocked(balance: number, tierId: ServiceTierId): boolean {
  return balance >= SERVICE_TIERS[tierId].oscCost;
}

const TIER_COLORS: Record<ServiceTierId, string> = {
  LOGIC:     'border-blue-500 text-blue-400',
  BLUEPRINT: 'border-yellow-500 text-yellow-400',
  GUARDIAN:  'border-purple-500 text-purple-400',
  SOVEREIGN: 'border-emerald-500 text-emerald-400',
};

const TIER_ICONS: Record<ServiceTierId, string> = {
  LOGIC:     '⚡',
  BLUEPRINT: '📐',
  GUARDIAN:  '🛡',
  SOVEREIGN: '👑',
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

function BalanceCard({ balance }: { balance: number }) {
  const usdValue = oscToUsd(balance);
  const ipRepresentation = (balance / OSC_CONSTANTS.TOTAL_SUPPLY * 7_600_000_000).toFixed(2);

  return (
    <Card className="bg-gray-900 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs text-gray-400 uppercase tracking-widest">
          OSC Balance — Odyssey-1 AI LLC
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-3">
          <span className="text-5xl font-bold text-emerald-400">
            {formatOsc(balance)}
          </span>
          <span className="text-xl text-gray-400 mb-1">OSC</span>
        </div>
        <div className="mt-2 text-sm text-gray-400">
          USD Equivalent: <span className="text-white">{formatUsd(usdValue)}</span>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Represents {(balance / OSC_CONSTANTS.TOTAL_SUPPLY * 100).toFixed(6)}% of total supply
        </div>
      </CardContent>
    </Card>
  );
}

function BurnTracker({ totalBurned }: { totalBurned: number }) {
  const burnPercent = (totalBurned / OSC_CONSTANTS.TOTAL_SUPPLY * 100).toFixed(4);
  const remaining = OSC_CONSTANTS.TOTAL_SUPPLY - totalBurned;
  const scarcityMultiplier = (OSC_CONSTANTS.TOTAL_SUPPLY / remaining).toFixed(6);

  return (
    <Card className="bg-gray-900 border border-red-500/30 shadow-lg shadow-red-500/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs text-gray-400 uppercase tracking-widest">
          Global Burn Tracker — Deflationary Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-red-400">
            {formatOsc(totalBurned)}
          </span>
          <span className="text-gray-400 mb-1">OSC destroyed</span>
        </div>
        <div className="mt-3 w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-red-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(parseFloat(burnPercent) * 100, 100)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>{burnPercent}% burned</span>
          <span>Scarcity ×{scarcityMultiplier}</span>
        </div>
        <div className="mt-1 text-xs text-gray-600">
          Remaining supply: {formatOsc(remaining)} OSC
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceTierGrid({ balance }: { balance: number }) {
  return (
    <Card className="bg-gray-900 border border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs text-gray-400 uppercase tracking-widest">
          Service Access — Current Balance Unlocks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(SERVICE_TIERS) as ServiceTierId[]).map((tierId) => {
            const tier = SERVICE_TIERS[tierId];
            const unlocked = tierUnlocked(balance, tierId);
            return (
              <div
                key={tierId}
                className={`rounded-lg border p-3 transition-all ${
                  unlocked
                    ? `${TIER_COLORS[tierId]} bg-gray-800`
                    : 'border-gray-700 text-gray-600 bg-gray-900 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{TIER_ICONS[tierId]}</span>
                  <span className="font-semibold text-sm">{tier.name}</span>
                </div>
                <div className="text-xs">{formatOsc(tier.oscCost)} OSC</div>
                <div className="text-xs mt-1 opacity-75">{tier.description}</div>
                {!unlocked && (
                  <div className="text-xs mt-1 text-gray-500">
                    Need {formatOsc(tier.oscCost - balance)} more OSC
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ExchangeHub({ userId, onAcquired }: { userId: string; onAcquired: () => void }) {
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [amount, setAmount] = useState<string>('');
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const { data: prices } = useQuery({
    queryKey: ['osc-prices'],
    queryFn: getCurrentPrices,
    refetchInterval: 30_000,
  });

  // Countdown timer for price lock
  useEffect(() => {
    if (!quote || quote.expired) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((quote.expiresAt - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) {
        setQuote(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [quote]);

  const handleGetQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      const q = await generatePriceQuote(currency, parseFloat(amount));
      setQuote(q);
      setCountdown(OSC_CONSTANTS.ORACLE_LOCK_SECONDS);
    } catch (err) {
      console.error('Quote error:', err);
    } finally {
      setLoading(false);
    }
  };

  const estimatedOsc = amount && prices
    ? currency === 'USD'
      ? usdToOsc(parseFloat(amount))
      : Math.floor((parseFloat(amount) * (prices[currency] || 0)) / OSC_CONSTANTS.GENESIS_PRICE_USD)
    : 0;

  return (
    <Card className="bg-gray-900 border border-yellow-500/30 shadow-lg shadow-yellow-500/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs text-gray-400 uppercase tracking-widest">
          Exchange Hub — Acquire OSC
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Currency selector */}
        <div className="flex gap-2">
          {(['USD', 'BTC', 'ETH'] as SupportedCurrency[]).map((c) => (
            <button
              key={c}
              onClick={() => { setCurrency(c); setQuote(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                currency === c
                  ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Live price display */}
        {prices && currency !== 'USD' && (
          <div className="text-xs text-gray-500 flex justify-between">
            <span>Live {currency} price:</span>
            <span className="text-gray-300">{formatUsd(prices[currency])}</span>
          </div>
        )}

        {/* Amount input */}
        <div className="space-y-1">
          <Input
            type="number"
            placeholder={`Enter ${currency} amount`}
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setQuote(null); }}
            className="bg-gray-800 border-gray-700 text-white"
          />
          {estimatedOsc > 0 && (
            <div className="text-xs text-gray-400 text-right">
              ≈ <span className="text-emerald-400">{formatOsc(estimatedOsc)} OSC</span>
            </div>
          )}
        </div>

        {/* Price lock quote */}
        {quote && !quote.expired && countdown > 0 ? (
          <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-emerald-400 font-semibold">Price Locked</span>
              <span className={`text-sm font-mono font-bold ${countdown <= 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                {countdown}s
              </span>
            </div>
            <div className="text-lg font-bold text-white">
              {formatOsc(quote.oscAmount)} OSC
            </div>
            <div className="text-xs text-gray-400">
              Rate: 1 {currency} = {formatOsc(quote.oscAmount / quote.currencyAmount)} OSC
            </div>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              onClick={() => {
                // Payment processing would connect to Stripe/crypto bridge here
                alert(`Payment bridge integration pending.\nQuote ID: ${quote.quoteId}\nAmount: ${quote.oscAmount} OSC`);
              }}
            >
              Confirm — Acquire {formatOsc(quote.oscAmount)} OSC
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleGetQuote}
            disabled={!amount || parseFloat(amount) <= 0 || loading}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
          >
            {loading ? 'Fetching Price...' : `Get 60-Second Price Lock`}
          </Button>
        )}

        <div className="text-xs text-gray-600 text-center">
          OSC is a closed-loop utility credit. No cash redemption.
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionLog({ transactions }: { transactions: OscTransaction[] }) {
  const typeColors: Record<string, string> = {
    ACQUIRE: 'text-emerald-400',
    SPEND:   'text-yellow-400',
    BURN:    'text-red-400',
    TRANSFER: 'text-blue-400',
  };

  return (
    <Card className="bg-gray-900 border border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs text-gray-400 uppercase tracking-widest">
          Transaction Log — Immutable Record
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-gray-600 text-sm text-center py-4">
            No transactions yet.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center py-2 border-b border-gray-800">
                <div>
                  <span className={`text-xs font-semibold ${typeColors[tx.type] || 'text-gray-400'}`}>
                    {tx.type}
                  </span>
                  {tx.service_tier && (
                    <span className="ml-2 text-xs text-gray-500">{tx.service_tier}</span>
                  )}
                  <div className="text-xs text-gray-600">
                    {new Date(tx.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${typeColors[tx.type] || 'text-gray-400'}`}>
                    {tx.type === 'ACQUIRE' ? '+' : '-'}{formatOsc(tx.amount)} OSC
                  </div>
                  {tx.burn_amount > 0 && (
                    <div className="text-xs text-red-500">
                      🔥 {formatOsc(tx.burn_amount)} burned
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// MAIN DASHBOARD
// ============================================================

export function OSCWalletDashboard({ userId }: DashboardProps) {
  const { data: balance = 0, refetch: refetchBalance } = useQuery({
    queryKey: ['osc-balance', userId],
    queryFn: () => getBalance(userId),
    refetchInterval: 10_000,
  });

  const { data: supplyState } = useQuery({
    queryKey: ['osc-supply'],
    queryFn: getSupplyState,
    refetchInterval: 30_000,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['osc-transactions', userId],
    queryFn: () => getTransactionHistory(userId, 20),
    refetchInterval: 15_000,
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-gray-400 uppercase tracking-widest">
            Odyssey-1 Sovereign Economy — Live
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white">
          O-1 Sovereignty Credit
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Backed by ${(7.6).toFixed(1)}B IP portfolio — {OSC_CONSTANTS.CREDIT_SYMBOL} utility access key
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Row 1 */}
        <div className="lg:col-span-2">
          <BalanceCard balance={balance} />
        </div>
        <div>
          <BurnTracker totalBurned={supplyState?.total_burned ?? 0} />
        </div>

        {/* Row 2 */}
        <div className="lg:col-span-2">
          <ServiceTierGrid balance={balance} />
        </div>
        <div>
          <ExchangeHub userId={userId} onAcquired={refetchBalance} />
        </div>

        {/* Row 3 */}
        <div className="lg:col-span-3">
          <TransactionLog transactions={transactions} />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-700">
        Howard Jones Bloodline Ancestral Trust — Athens, Georgia — 2026<br />
        OSC is a closed-loop Digital Tool. Not a security. Not currency. Not redeemable for cash.
      </div>
    </div>
  );
}

export default OSCWalletDashboard;
