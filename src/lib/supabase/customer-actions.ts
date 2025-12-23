import { supabase } from '@/lib/supabaseClient';

// UNIFIED FLAT SCHEMA - Matches actual database table structure
export interface Customer {
  id?: string;
  user_id?: string;
  
  // Basic Info
  first_name?: string | null;
  last_name?: string | null;
  customer_name?: string | null;
  company_name?: string | null;
  
  // Contact Info (FLAT - not nested)
  email?: string | null;
  phone?: string | null;
  
  // Address Info (FLAT - not nested)
  address?: string | null;
  billing_address_line1?: string | null;
  billing_address_line2?: string | null;
  billing_city?: string | null;
  billing_state?: string | null;
  billing_zip?: string | null;
  billing_country?: string | null;
  
  // Metadata
  source?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  status?: string | null;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        ...customer,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, customer: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create customer'
    };
  }
}

export async function getCustomers(userId?: string) {
  try {
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact', head: false })
      .order('customer_name', { ascending: true })
      .limit(10000);
    
    // Filter by user_id if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return { success: true, customers: data || [], count: count || 0 };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch customers',
      customers: [],
      count: 0
    };
  }
}
