import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Zap, Crown, Star, Rocket } from 'lucide-react';

interface UsageData {
  free_queries_remaining: number;
  monthly_query_limit: number;
  subscription_tier: string;
  reset_date: string;
}

const TIER_CONFIG = {
  free: { name: 'Free', icon: Zap, color: 'bg-gray-500', limit: 5 },
  basic: { name: 'Basic', icon: Star, color: 'bg-blue-500', limit: 100 },
  pro: { name: 'Pro', icon: Crown, color: 'bg-purple-500', limit: 500 },
  ultimate: { name: 'Ultimate', icon: Rocket, color: 'bg-gold-500', limit: 10000 }
};

export default function AIResearchUsageTracker() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First check if user has subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const tier = subscription?.tier || 'free';

      // Get or create usage limits
      let { data: limits } = await supabase
        .from('usage_limits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!limits) {
        const { data: newLimits } = await supabase
          .from('usage_limits')
          .insert({
            user_id: user.id,
            subscription_tier: tier,
            monthly_query_limit: TIER_CONFIG[tier as keyof typeof TIER_CONFIG]?.limit || 5,
            free_queries_remaining: TIER_CONFIG[tier as keyof typeof TIER_CONFIG]?.limit || 5
          })
          .select()
          .single();
        limits = newLimits;
      } else if (limits.subscription_tier !== tier) {
        // Update tier if changed
        const { data: updatedLimits } = await supabase
          .from('usage_limits')
          .update({
            subscription_tier: tier,
            monthly_query_limit: TIER_CONFIG[tier as keyof typeof TIER_CONFIG]?.limit || 5,
            free_queries_remaining: TIER_CONFIG[tier as keyof typeof TIER_CONFIG]?.limit || 5
          })
          .eq('user_id', user.id)
          .select()
          .single();
        limits = updatedLimits;
      }

      setUsage(limits);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>;
  }

  if (!usage) return null;

  const tierConfig = TIER_CONFIG[usage.subscription_tier as keyof typeof TIER_CONFIG];
  const Icon = tierConfig?.icon || Zap;
  const usedQueries = usage.monthly_query_limit - usage.free_queries_remaining;
  const usagePercentage = (usedQueries / usage.monthly_query_limit) * 100;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          AI Research Usage
          <Badge className={`${tierConfig?.color} text-white`}>
            {tierConfig?.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Queries Used</span>
              <span>{usedQueries} / {usage.monthly_query_limit}</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>
          
          <div className="text-sm text-gray-600">
            <p>{usage.free_queries_remaining} queries remaining</p>
            <p>Resets on: {new Date(usage.reset_date).toLocaleDateString()}</p>
          </div>

          {usage.subscription_tier === 'free' && usage.free_queries_remaining <= 2 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800 mb-2">
                You're running low on free queries!
              </p>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                Upgrade Plan
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
