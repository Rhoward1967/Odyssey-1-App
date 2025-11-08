import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import {
  Check
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_end: string;
  created_at: string;
}

const tiers = [
  {
    name: 'Professional',
    displayName: 'ODYSSEY Professional',
    price: 99,
    priceDisplay: '$99/month',
    features: [
      'Full access to 7-book framework',
      'AI Legal Assistant',
      '5-10 General Themes',
      '3 Industry Knowledge Bases',
      '1 User Seat',
      '10 GB Storage',
      'Email Support',
    ],
    cta: 'Choose Professional',
  },
  {
    name: 'Business',
    displayName: 'ODYSSEY Business',
    price: 299,
    priceDisplay: '$299/month',
    badge: 'Most Popular',
    features: [
      'Everything in Professional, PLUS:',
      'ALL 17+ Premium Industry Themes',
      'INSTANT shape-shifting transformation',
      'ALL 17 Industry Knowledge Bases',
      'Full Calculator suite',
      'Up to 5 User Seats',
      '100 GB Storage',
      'Priority Support',
    ],
    cta: 'Choose Business',
    highlight: true,
  },
  {
    name: 'Enterprise',
    displayName: 'ODYSSEY Enterprise',
    price: 999,
    priceDisplay: '$999/month',
    features: [
      'Everything in Business, PLUS:',
      'UNLIMITED Custom Themes',
      'Developer Code Editor',
      'Create Custom Knowledge Bases',
      'Full White-label Platform',
      'Dedicated Account Manager',
      'Unlimited Everything',
      'Phone Support',
    ],
    cta: 'Choose Enterprise',
  },
];

const SubscriptionDashboard: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'plans'>('current');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (!error && data) {
          setSubscription(data);
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [user]);

  const handleSelectPlan = async (tierName: string, price: number) => {
    console.log('Subscription button clicked:', { tierName, price });

    // Check if user is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to login first
      navigate('/login', {
        state: {
          returnTo: '/profile',
          selectedTier: tierName,
          selectedPrice: `$${price}`,
        },
      });
      return;
    }

    // Navigate to profile setup
    navigate('/profile', {
      state: {
        selectedTier: tierName,
        selectedPrice: `$${price}`,
        fromPricing: true,
      },
    });
  };

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      // Make sure this is calling the right Edge Function
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: { userId: user?.id }
      });
      
      if (error) {
        console.error('Portal error:', error);
        throw error;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      alert('Unable to open billing portal. This feature requires Stripe configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    const confirmed = confirm(
      'Are you sure you want to cancel your subscription?'
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('id', subscription.id);

      if (!error) {
        setSubscription({ ...subscription, status: 'canceled' });
      }
    } catch (err) {
      console.error('Error canceling subscription:', err);
    }
  };

  const getPlanName = (planId: string) => {
    const plans = {
      basic: 'ODYSSEY Basic',
      pro: 'ODYSSEY Professional',
      enterprise: 'ODYSSEY Enterprise',
    };
    return plans[planId as keyof typeof plans] || planId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'canceled':
        return 'bg-red-500';
      case 'past_due':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card className='bg-slate-800/50 border-slate-700'>
        <CardContent className='p-8 text-center'>
          <div className='animate-pulse text-gray-400'>
            Loading subscription...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      <h1 className='text-3xl font-bold mb-6'>
        Choose your plan and manage your subscription
      </h1>

      {/* Tabs */}
      <div className='flex gap-4 mb-8 border-b'>
        <button
          className={`px-4 py-2 ${
            activeTab === 'current'
              ? 'border-b-2 border-primary font-semibold'
              : ''
          }`}
          onClick={() => setActiveTab('current')}
          type='button'
        >
          Current Plan
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'plans'
              ? 'border-b-2 border-primary font-semibold'
              : ''
          }`}
          onClick={() => setActiveTab('plans')}
          type='button'
        >
          All Plans
        </button>
      </div>

      {/* Current Plan Tab */}
      {activeTab === 'current' && (
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>
                View and manage your active subscription plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <h3 className='text-xl font-semibold'>
                    {getPlanName(subscription.plan_id)}
                  </h3>
                  <span className='inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold mt-2'>
                    {subscription.status.toUpperCase()}
                  </span>
                </div>
                <p className='text-muted-foreground'>
                  Your plan will automatically renew{' '}
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Management</CardTitle>
              <CardDescription>
                Manage your payment methods and view your billing history in the
                Stripe Customer Portal.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                variant='outline'
                onClick={handleManageBilling}
                disabled={loading}
                type='button'
              >
                {loading ? 'Loading...' : 'Manage Billing & Invoices'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* All Plans Tab */}
      {activeTab === 'plans' && (
        <div className='grid md:grid-cols-3 gap-6'>
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={tier.highlight ? 'border-primary shadow-lg' : ''}
            >
              {tier.badge && (
                <div className='bg-primary text-primary-foreground text-center py-2 rounded-t-lg font-semibold'>
                  {tier.badge}
                </div>
              )}

              <CardHeader>
                <CardTitle>{tier.displayName}</CardTitle>
                <CardDescription className='text-2xl font-bold mt-2'>
                  {tier.priceDisplay}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className='space-y-2'>
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className='flex items-start gap-2'>
                      <Check className='h-4 w-4 text-primary shrink-0 mt-0.5' />
                      <span className='text-sm'>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className='w-full'
                  variant={tier.highlight ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(tier.name, tier.price)}
                  type='button'
                >
                  {tier.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionDashboard;
