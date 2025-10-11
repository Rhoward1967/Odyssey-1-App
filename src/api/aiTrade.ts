// Notification utility: SendGrid email integration
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

async function notifyTradeStatus(trade, status) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !process.env.SENDGRID_API_KEY) {
    console.log(`Notification: Trade ${status} for`, trade.symbol, trade.amount, trade.side);
    return;
  }
  const subject = `AI Trade ${status.toUpperCase()}: ${trade.symbol} ${trade.side}`;
  const text = `Trade status: ${status}\n\nSymbol: ${trade.symbol}\nSide: ${trade.side}\nAmount: ${trade.amount}\nPrice: ${trade.price}\nOrder Type: ${trade.orderType}\nSimulation: ${trade.simulation}\nTimestamp: ${trade.timestamp}\nMeta: ${JSON.stringify(trade.meta)}\n`;
  try {
    await sgMail.send({
      to: adminEmail,
      from: adminEmail, // or a verified sender
      subject,
      text
    });
    console.log('Email notification sent:', subject);
  } catch (err) {
    console.error('Failed to send email notification:', err);
  }
}
// Experimental AI Trading API endpoint (Node.js/Express style pseudo-code)
// Place in: /src/api/aiTrade.ts (or your backend functions directory)

// No express import: use standard request/response signature for edge/serverless
import { ethers } from 'ethers';
import { supabase } from '@/lib/supabase';

// Example: Use env for private key, risk controls, and simulation toggle
const AI_PRIVATE_KEY = process.env.AI_TRADER_PRIVATE_KEY;
const SIMULATION_MODE = process.env.AI_TRADER_SIMULATION === 'true';
const MAX_TRADE_SIZE = parseFloat(process.env.AI_TRADER_MAX_SIZE || '1000'); // USD
const ALLOWED_PAIRS = (process.env.AI_TRADER_PAIRS || 'BTC-USD,ETH-USD').split(',');

// Log trades to Supabase (persistent storage)
async function logTradeToDB(trade: any) {
  const { error } = await supabase.from('ai_trade_logs').insert([trade]);
  if (error) {
    console.error('Failed to log AI trade:', error);
  }
}

// Compatible with Vercel/Next.js/Supabase Edge Functions
export default async function aiTradeHandler(req, res) {
  const { symbol, side, amount, price, orderType, meta } = req.body;
  // Risk controls
  if (!ALLOWED_PAIRS.includes(symbol)) {
    return res.status(400).json({ success: false, error: 'Pair not allowed' });
  }
  if (parseFloat(amount) > MAX_TRADE_SIZE) {
    return res.status(400).json({ success: false, error: 'Trade size exceeds limit' });
  }

  // Determine if trade should be auto-approved
  let autoApprove = false;
  if (SIMULATION_MODE) {
    autoApprove = true;
  } else if (parseFloat(amount) <= MAX_TRADE_SIZE * 0.1) { // Example: auto-approve small trades
    autoApprove = true;
  }

  const logEntry: any = {
    timestamp: new Date().toISOString(),
    symbol, side, amount, price, orderType, meta,
    simulation: SIMULATION_MODE,
    status: autoApprove ? 'approved' : 'pending'
  };

  await logTradeToDB(logEntry);
  // Notify on trade creation (pending or auto-approved)
  await notifyTradeStatus(logEntry, logEntry.status);

  if (SIMULATION_MODE) {
    // Simulate trade (no real execution)
    return res.json({ success: true, simulated: true, log: logEntry });
  }

  // Check for admin approval before executing real trade
  // Find the latest log for this trade (by timestamp, symbol, side, amount, etc.)
  const { data: logs, error } = await supabase
    .from('ai_trade_logs')
    .select('*')
    .eq('timestamp', logEntry.timestamp)
    .eq('symbol', symbol)
    .eq('side', side)
    .eq('amount', amount)
    .order('timestamp', { ascending: false })
    .limit(1);
  const dbLog = logs && logs[0];
  if (!dbLog || dbLog.status !== 'approved') {
    // Not approved yet, return as pending
    if (dbLog) await notifyTradeStatus(dbLog, dbLog.status);
    return res.json({ success: true, pending: true, log: logEntry, message: 'Trade pending admin approval.' });
  }

  // Real trade logic (example for EVM chains)
  try {
    const provider = new ethers.JsonRpcProvider(process.env.AI_TRADER_RPC_URL);
    const wallet = new ethers.Wallet(AI_PRIVATE_KEY, provider);
    // ...construct and send trade (e.g., via contract or exchange API)
    // For demo, just log and return
    logEntry.tx = '0xSIMULATED_TX_HASH';
    await notifyTradeStatus(logEntry, 'executed');
    return res.json({ success: true, executed: true, log: logEntry });
  } catch (err: any) {
    logEntry.error = err.message || err;
    await notifyTradeStatus(logEntry, 'error');
    return res.status(500).json({ success: false, error: err.message || err, log: logEntry });
  }
}
