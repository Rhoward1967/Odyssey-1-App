import { supabase } from './supabase';

export interface Customer {
  id?: string;
  organization_id: number;
  customer_name: string;
  customer_type: 'commercial' | 'residential' | 'government' | 'medical' | 'educational';
  primary_contact: {
    name: string;
    title: string;
    email: string;
    phone: string;
    mobile?: string;
  };
  billing_contact?: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  service_details: {
    services: string[];
    frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'as-needed';
    contract_start: string;
    contract_end?: string;
    contract_value: number;
    payment_terms: string;
  };
  facility_info?: {
    square_footage?: number;
    floors?: number;
    building_type?: string;
    special_requirements?: string[];
    access_info?: string;
    security_requirements?: string;
  };
  status: 'active' | 'inactive' | 'pending' | 'terminated';
  relationship_manager?: string;
  notes?: string;
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

export async function getCustomers() {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('customer_name', { ascending: true });

    if (error) throw error;

    return { success: true, customers: data || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch customers',
      customers: []
    };
  }
}
