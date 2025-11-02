import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    CreditCard,
    Crown,
    Star,
    TrendingUp,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Subscription {
  id: string;
  tier: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id?: string;
  cancel_at_period_end: boolean;
}

const TIER_CONFIG = {
  free: { name: 'Free', icon: Zap, color: 'bg-gray-500', price: '$0' },
  basic: { name: 'Basic', icon: Star, color: 'bg-blue-500', price: '$99' }, // Changed from $29
  pro: { name: 'Pro', icon: TrendingUp, color: 'bg-purple-500', price: '$299' }, // Changed from $99
  ultimate: {
    name: 'Ultimate',
    icon: Crown,
    color: 'bg-gold-500',
    price: '$999', // Changed from $299
  },
};

export default function SubscriptionManagementPortal() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: string) => {
    try {
      const { data } = await supabase.functions.invoke(
        'ai-research-payment-processor',
        {
          body: { type: 'subscription', tier, action: 'upgrade' },
        }
      );

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return;

    try {
      await supabase.functions.invoke('ai-research-payment-processor', {
        body: {
          type: 'subscription',
          action: 'cancel',
          subscription_id: subscription.stripe_subscription_id,
        },
      });

      await loadSubscription();
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  if (loading) return <div className='animate-pulse'>Loading...</div>;

  const currentTier = subscription?.tier || 'free';
  const tierConfig = TIER_CONFIG[currentTier as keyof typeof TIER_CONFIG];
  const Icon = tierConfig?.icon || Zap;

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h2 className='text-3xl font-bold mb-2'>Subscription Management</h2>
        <p className='text-gray-600'>
          Manage your AI research subscription and billing
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Icon className='h-5 w-5' />
            Current Plan: {tierConfig?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <Badge className={`${tierConfig?.color} text-white`}>
                {subscription?.status || 'Active'}
              </Badge>
              <p className='text-2xl font-bold mt-2'>
                {tierConfig?.price}/month
              </p>
            </div>
            {subscription?.status === 'active' && (
              <div className='text-right'>
                <p className='text-sm text-gray-600'>Next billing</p>
                <p className='font-semibold'>
                  {subscription?.current_period_end
                    ? new Date(
                        subscription.current_period_end
                      ).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            )}
          </div>

          {subscription?.cancel_at_period_end && (
            <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
              <div className='flex items-center gap-2'>
                <AlertCircle className='h-4 w-4 text-orange-600' />
                <p className='text-orange-800'>
                  Your subscription will cancel at the end of the current period
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {Object.entries(TIER_CONFIG).map(([tier, config]) => {
          const TierIcon = config.icon;
          const isCurrent = tier === currentTier;

          return (
            <Card
              key={tier}
              className={isCurrent ? 'ring-2 ring-purple-500' : ''}
            >
              <CardContent className='p-6 text-center'>
                <TierIcon className='h-8 w-8 mx-auto mb-2 text-gray-600' />
                <h3 className='font-semibold'>{config.name}</h3>
                <p className='text-2xl font-bold text-purple-600'>
                  {config.price}
                </p>
                <p className='text-sm text-gray-600 mb-4'>per month</p>

                {isCurrent ? (
                  <Badge className='bg-green-500 text-white'>
                    <CheckCircle className='h-3 w-3 mr-1' />
                    Current Plan
                  </Badge>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(tier)}
                    className='w-full'
                    variant={tier === 'ultimate' ? 'default' : 'outline'}
                  >
                    {tier === 'free' ? 'Downgrade' : 'Upgrade'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Billing Actions */}
      {subscription?.status === 'active' && currentTier !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              Billing Actions
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex gap-4'>
              <Button variant='outline'>
                <Calendar className='mr-2 h-4 w-4' />
                View Billing History
              </Button>
              <Button variant='outline'>
                <CreditCard className='mr-2 h-4 w-4' />
                Update Payment Method
              </Button>
              <Button
                variant='destructive'
                onClick={handleCancelSubscription}
                disabled={subscription?.cancel_at_period_end}
              >
                <span className='md:hidden'>Cancel</span>
                <span className='hidden md:inline'>Cancel Subscription</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
