// Simple persistent trade log using Supabase (or any DB)
// Place in: /src/api/aiTradeLog.ts

import { supabase } from '@/lib/supabase';

export async function logAITrade(trade) {
  // trade: { timestamp, symbol, side, amount, price, orderType, meta, simulation, tx?, error? }
  const { data, error } = await supabase.from('ai_trade_logs').insert([trade]);
  if (error) {
    console.error('Failed to log AI trade:', error);
  }
  return { data, error };
}
