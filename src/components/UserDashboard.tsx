import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { User, CreditCard, Calendar, Settings } from 'lucide-react';
import StripeCheckout from './StripeCheckout';

interface Subscription {
  id: string;
  plan_name: string;
  amount: number;
  status: string;
  current_period_end: string;
}

const UserDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const plans = [
    { id: 'basic', name: 'Basic Plan', amount: '$29.99', features: ['AI Assistant', 'Basic Analytics', 'Email Support'] },
    { id: 'pro', name: 'Pro Plan', amount: '$79.99', features: ['Everything in Basic', 'Advanced AI', 'Priority Support', 'Custom Integrations'] },
    { id: 'enterprise', name: 'Enterprise', amount: '$199.99', features: ['Everything in Pro', 'Dedicated Support', 'Custom Solutions', 'SLA'] }
  ];

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleUpgrade = (plan: any) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    fetchSubscription();
  };

  if (showCheckout && selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-2xl mx-auto pt-20">
          <StripeCheckout
            planId={selectedPlan.id}
            planName={selectedPlan.name}
            amount={selectedPlan.amount}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowCheckout(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto pt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name || user?.email}</h1>
          <p className="text-gray-300">Manage your account and subscription</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="mr-2 h-5 w-5" />
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Status:</strong> <Badge variant="outline" className="text-green-400">Active</Badge></p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              {subscription ? (
                <>
                  <p><strong>Plan:</strong> {subscription.plan_name}</p>
                  <p><strong>Amount:</strong> ${subscription.amount}/month</p>
                  <p><strong>Status:</strong> <Badge variant="outline" className="text-green-400">{subscription.status}</Badge></p>
                </>
              ) : (
                <p>No active subscription</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                Update Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={signOut}
                className="w-full text-red-400 border-red-400 hover:bg-red-400/10"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Available Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-3xl font-bold text-purple-400 mb-4">{plan.amount}</p>
                  <ul className="text-gray-300 space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => handleUpgrade(plan)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {subscription?.plan_name === plan.name ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;