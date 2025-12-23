import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

interface BidData {
  id?: string;
  title: string;
  description: string;
  specifications: any[];
  total_amount: number;
  status: string;
  due_date?: string;
}

export const useBidStorage = () => {
  const [bids, setBids] = useState<BidData[]>([]);
  const [loading, setLoading] = useState(false);

  const saveBid = async (bidData: BidData) => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Save bid
      const { data: bid, error: bidError } = await supabase
        .from('bids')
        .insert({
          user_id: user.user.id,
          title: bidData.title,
          description: bidData.description,
          total_amount: bidData.total_amount,
          status: bidData.status,
          due_date: bidData.due_date
        })
        .select()
        .single();

      if (bidError) throw bidError;

      // Save specifications
      if (bidData.specifications.length > 0) {
        const specs = bidData.specifications.map(spec => ({
          bid_id: bid.id,
          specification_type: spec.type,
          frequency: spec.frequency,
          square_footage: spec.squareFootage,
          price_per_sqft: spec.pricePerSqft,
          total_price: spec.total,
          notes: spec.notes
        }));

        const { error: specsError } = await supabase
          .from('bid_specifications')
          .insert(specs);

        if (specsError) throw specsError;
      }

      await loadBids();
      return bid;
    } catch (error) {
      console.error('Error saving bid:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadBids = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          bid_specifications (*)
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBids(data || []);
    } catch (error) {
      console.error('Error loading bids:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBids();
  }, []);

  return {
    bids,
    saveBid,
    loadBids,
    loading
  };
};