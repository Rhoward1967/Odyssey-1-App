// R.O.M.A.N. admin check helper
import { supabase } from './supabase';

export async function isAdmin(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('app_admins')
    .select('email')
    .eq('email', email)
    .single();
  return !!data && !error;
}
