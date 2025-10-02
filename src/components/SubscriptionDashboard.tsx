import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Crown, Calendar, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_end: string;
  created_at: string;
}

const SubscriptionDashboard: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);


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


  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    const confirmed = confirm('Are you sure you want to cancel your subscription?');
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
      enterprise: 'ODYSSEY Enterprise'
    };
    return plans[planId as keyof typeof plans] || planId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'canceled': return 'bg-red-500';
      case 'past_due': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };


  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse text-gray-400">Loading subscription...</div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
            No Active Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">You don't have an active subscription.</p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Choose a Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Crown className="w-5 h-5 mr-2 text-purple-500" />
          Current Subscription
        </CardTitle>
        <CardDescription>Manage your ODYSSEY-1 subscription</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">
              {getPlanName(subscription.plan_id)}
            </h3>
            <p className="text-gray-400">Active since {new Date(subscription.created_at).toLocaleDateString()}</p>
          </div>
          <Badge className={getStatusColor(subscription.status)}>
            {subscription.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Next billing</p>
              <p className="text-white">{new Date(subscription.current_period_end).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className="text-white capitalize">{subscription.status}</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" className="flex-1">
            <CreditCard className="w-4 h-4 mr-2" />
            Update Payment
          </Button>
          {subscription.status === 'active' && (
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={handleCancelSubscription}
            >
              <span className="md:hidden">Cancel</span><span className="hidden md:inline">Cancel Subscription</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionDashboard;