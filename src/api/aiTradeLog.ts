// Simple persistent trade log using Supabase (or any DB)
// Place in: /src/api/aiTradeLog.ts

import { supabase } from '@/lib/supabaseClient';

// POST: log a trade, GET: fetch all logs
export default async function aiTradeLogHandler(req, res) {
  if (req.method === 'POST') {
    const trade = req.body;
    const { error } = await supabase.from('ai_trade_logs').insert([trade]);
    if (error) {
      return res.status(500).json({ error: error.message || error });
    }
    return res.json({ success: true });
  } else if (req.method === 'GET') {
    const { data, error } = await supabase.from('ai_trade_logs').select('*').order('timestamp', { ascending: false });
    if (error) {
      return res.status(500).json({ error: error.message || error });
    }
    return res.json({ logs: data });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
