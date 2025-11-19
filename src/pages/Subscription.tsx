import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { STRIPE_PRODUCTS } from '@/config/stripe';
import { supabase } from '@/lib/supabase';
import { Check, Crown, Rocket, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Subscription() {
  const navigate = useNavigate();
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

  // Log on component mount to verify mobile is loading latest code
  useState(() => {
    console.log('🔄 Subscription page loaded - Version 2.0 - Mobile Fix');
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('📐 Screen:', window.innerWidth, 'x', window.innerHeight);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">
          ODYSSEY-1 Subscription v2.0
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300">
          Choose your plan and manage your subscription
        </p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Plan</TabsTrigger>
          <TabsTrigger value="plans">All Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6" style={{ pointerEvents: 'auto' }}>
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
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleManageBilling();
                  }} 
                  disabled={loading}
                  className="relative z-10"
                >
                  {loading ? 'Redirecting...' : 'Manage Billing & Invoices'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" style={{ pointerEvents: 'auto', touchAction: 'auto' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8" style={{ pointerEvents: 'auto' }}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-lg border bg-card text-card-foreground shadow-sm ${
                  plan.popular ? 'ring-2 ring-purple-500' : ''
                }`}
                style={{ pointerEvents: 'auto', touchAction: 'auto' }}
              >
                {plan.popular && (
                  <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs sm:text-sm px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="text-center pb-3 sm:pb-4 px-4 sm:px-6 pt-6">
                  <div className="flex justify-center mb-2 sm:mb-4">{plan.icon}</div>
                  <h3 className="text-xl sm:text-2xl mb-2 font-semibold">{plan.name}</h3>
                  <div className="mb-2 sm:mb-4">
                    <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 text-base sm:text-lg">{plan.period}</span>
                  </div>
                </div>

                <div className="pt-0 px-4 sm:px-6 pb-6" style={{ pointerEvents: 'auto', touchAction: 'auto' }}>
                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 lg:min-h-[240px]">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔥 BUTTON CLICKED - Plan selected:', plan.id, plan.name, plan.price);
                      console.log('📱 Device info:', {
                        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
                        userAgent: navigator.userAgent,
                        screenWidth: window.innerWidth
                      });
                      alert(`Selected: ${plan.name}`); // Visual confirmation for mobile
                      navigate('/app/profile', {
                        state: {
                          selectedTier: plan.name,
                          selectedPrice: plan.price + plan.period,
                          fromPricing: true
                        }
                      });
                    }}
                    onTouchStart={(e) => {
                      console.log('👆 Touch started on button:', plan.name);
                    }}
                    onTouchEnd={(e) => {
                      console.log('✋ Touch ended on button:', plan.name);
                    }}
                    className={`w-full py-2.5 sm:py-3 text-base sm:text-lg font-semibold rounded-md transition-colors relative z-10 inline-flex items-center justify-center ${
                      plan.popular
                        ? 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white'
                    }`}
                    style={{ 
                      WebkitTapHighlightColor: 'transparent',
                      pointerEvents: 'auto',
                      touchAction: 'manipulation',
                      minHeight: '44px'
                    }}
                  >
                    Choose {plan.name.split(' ')[1]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}