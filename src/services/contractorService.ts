import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export interface ContractorProfile {
  id: string;
  organization_id: number;
  user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  tax_id?: string;
  address?: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ContractorEngagement {
  id: string;
  organization_id: number;
  contractor_id: string;
  project_name?: string;
  job_description?: string;
  rate?: number;
  rate_unit: string;
  start_date?: string;
  end_date?: string;
  terms?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useContractors(organizationId: number) {
  const [contractors, setContractors] = useState<ContractorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContractors() {
      setLoading(true);
      const { data, error } = await supabase
        .from('contractor_profiles')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) setError(error.message);
      else setContractors(data || []);
      setLoading(false);
    }
    fetchContractors();
  }, [organizationId]);

  return { contractors, loading, error };
}

export function useEngagements(contractorId: string) {
  const [engagements, setEngagements] = useState<ContractorEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEngagements() {
      setLoading(true);
      const { data, error } = await supabase
        .from('contractor_engagements')
        .select('*')
        .eq('contractor_id', contractorId);
      if (error) setError(error.message);
      else setEngagements(data || []);
      setLoading(false);
    }
    fetchEngagements();
  }, [contractorId]);

  return { engagements, loading, error };
}
