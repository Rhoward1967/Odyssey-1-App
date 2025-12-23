import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billing_period: string;
  features: string[];
  is_active: boolean;
  user_type: string;
  display_order: number;
}

export interface FeatureToggle {
  id: string;
  feature_name: string;
  is_enabled: boolean;
  user_types: string[];
  description: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  is_active: boolean;
  target_users: string[];
  start_date?: string;
  end_date?: string;
}

export const useRealtimeAdmin = () => {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [featureToggles, setFeatureToggles] = useState<FeatureToggle[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    setupRealtimeSubscriptions();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, featuresRes, announcementsRes] = await Promise.all([
        supabase.from('pricing_plans').select('*').order('display_order'),
        supabase.from('feature_toggles').select('*').order('feature_name'),
        supabase.from('announcements').select('*').order('created_at', { ascending: false })
      ]);

      if (plansRes.data) setPricingPlans(plansRes.data);
      if (featuresRes.data) setFeatureToggles(featuresRes.data);
      if (announcementsRes.data) setAnnouncements(announcementsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const channels = [
      supabase.channel('pricing_plans').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pricing_plans' }, 
        () => fetchData()
      ),
      supabase.channel('feature_toggles').on('postgres_changes',
        { event: '*', schema: 'public', table: 'feature_toggles' },
        () => fetchData()
      ),
      supabase.channel('announcements').on('postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => fetchData()
      )
    ];

    channels.forEach(channel => channel.subscribe());
    return () => channels.forEach(channel => supabase.removeChannel(channel));
  };

  return { pricingPlans, featureToggles, announcements, loading, refetch: fetchData };
};