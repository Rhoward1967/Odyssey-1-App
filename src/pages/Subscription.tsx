import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Crown, Zap, Rocket } from 'lucide-react';
import { useState } from 'react';
import { STRIPE_PRODUCTS } from '@/config/stripe';

export default function Subscription() {
  const [loading, setLoading] = useState(false);

  const subscription = {
    plan: 'Pro Plan',
    status: 'active',
    renewalDate: 'November 17, 2025',
  };

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-portal-session');
      if (error) throw error;
      window.location.href = data.url;
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'ODYSSEY Basic',
      price: '$99',
      period: '/month',
      icon: <Zap className="w-8 h-8 text-blue-500" />,
      features: [
        'Basic AI Processing',
        'Standard Government Tools', 
        'Email Support',
        '10 Active Contracts',
        'Basic Analytics',
        'Standard Security'
      ],
      popular: false,
      config: STRIPE_PRODUCTS.basic
    },
    {
      id: 'pro',
      name: 'ODYSSEY Professional', 
      price: '$299',
      period: '/month',
      icon: <Crown className="w-8 h-8 text-purple-500" />,
      features: [
        'Advanced AI Processing',
        'Full Government Suite',
        'Priority Support', 
        'Unlimited Contracts',
        'Advanced Analytics',
        'Enhanced Security',
        'Custom Integrations',
        'Team Collaboration'
      ],
      popular: true,
      config: STRIPE_PRODUCTS.pro
    },
    {
      id: 'enterprise',
      name: 'ODYSSEY Enterprise',
      price: '$999', 
      period: '/month',
      icon: <Rocket className="w-8 h-8 text-yellow-500" />,
      features: [
        'Quantum AI Processing',
        'Complete Government Arsenal',
        'Dedicated Support',
        'Unlimited Everything', 
        'Real-time Analytics',
        'Military-grade Security',
        'White-label Solutions',
        'API Access',
        'Custom Development'
      ],
      popular: false,
      config: STRIPE_PRODUCTS.enterprise
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">ODYSSEY-1 Subscription</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Choose your plan and manage your subscription
        </p>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Plan</TabsTrigger>
          <TabsTrigger value="plans">All Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>
                View and manage your active subscription plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Current Plan</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {subscription.plan}
                    </p>
                  </div>
                  <Badge
                    className={
                      subscription.status === 'active'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }
                  >
                    {subscription.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Your plan will automatically renew on {subscription.renewalDate}.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Billing Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Manage your payment methods and view your billing history in the Stripe Customer Portal.
                </p>
                <Button onClick={handleManageBilling} disabled={loading}>
                  {loading ? 'Redirecting...' : 'Manage Billing & Invoices'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular ? 'ring-2 ring-purple-500 lg:scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">{plan.icon}</div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 text-lg">{plan.period}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8 min-h-[240px]">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full py-3 text-lg font-semibold ${
                      plan.popular
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    Choose {plan.name.split(' ')[1]}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}