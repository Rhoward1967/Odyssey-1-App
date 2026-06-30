/**
 * QuickBooks data access — reads the QB mirror tables (qb_customers / qb_items /
 * qb_estimates) populated by the `quickbooks-read` edge function. READ-ONLY.
 * The estimate builder uses this to pull your real QB customers, item pricing,
 * and prior estimates. Final entry back into QuickBooks stays manual by design.
 */
import { supabase } from '@/lib/supabaseClient';

export interface QBCustomer {
  qb_id: string;
  display_name: string | null;
  company_name: string | null;
  email: string | null;
  balance: number | null;
}

export interface QBItem {
  qb_id: string;
  name: string | null;
  type: string | null;
  unit_price: number | null;
}

export interface QBEstimate {
  qb_id: string;
  doc_number: string | null;
  customer_name: string | null;
  total: number | null;
  txn_date: string | null;
  status: string | null;
}

/** All active QuickBooks customers (1,200+ real records). */
export async function getQBCustomers(): Promise<QBCustomer[]> {
  const { data, error } = await supabase
    .from('qb_customers')
    .select('qb_id, display_name, company_name, email, balance')
    .eq('active', true)
    .order('display_name', { ascending: true });
  if (error) { console.warn('[QB] customers fetch failed:', error.message); return []; }
  return (data as QBCustomer[]) || [];
}

/** Active QuickBooks items with their standard unit pricing. */
export async function getQBItems(): Promise<QBItem[]> {
  const { data, error } = await supabase
    .from('qb_items')
    .select('qb_id, name, type, unit_price')
    .eq('active', true)
    .order('name', { ascending: true });
  if (error) { console.warn('[QB] items fetch failed:', error.message); return []; }
  return (data as QBItem[]) || [];
}

/** Prior estimates for a customer (by name) — the template material for new quotes. */
export async function getRecentEstimatesFor(customerName: string, limit = 10): Promise<QBEstimate[]> {
  if (!customerName?.trim()) return [];
  const { data, error } = await supabase
    .from('qb_estimates')
    .select('qb_id, doc_number, customer_name, total, txn_date, status')
    .ilike('customer_name', `%${customerName}%`)
    .order('txn_date', { ascending: false })
    .limit(limit);
  if (error) { console.warn('[QB] estimates fetch failed:', error.message); return []; }
  return (data as QBEstimate[]) || [];
}
