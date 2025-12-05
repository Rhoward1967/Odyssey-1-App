import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export interface PayrollOutgoingLink {
  payroll_run_id: string;
  organization_id: number;
  period_start: string;
  period_end: string;
  payroll_run_status: string;
  link_id: string;
  link_type: string;
  amount_cents: number;
  outgoing_payment_id: string;
  company_id: string;
  payee_id: string;
  method_id: string;
  payment_status: string;
  payment_amount_cents: number;
  payment_currency: string;
  scheduled_for: string;
  payment_created_at: string;
}

export function usePayrollOutgoingLinks(organizationId: number) {
  const [links, setLinks] = useState<PayrollOutgoingLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLinks() {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_payroll_outgoing_links_by_run')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) setError(error.message);
      else setLinks(data || []);
      setLoading(false);
    }
    fetchLinks();
  }, [organizationId]);

  return { links, loading, error };
}
