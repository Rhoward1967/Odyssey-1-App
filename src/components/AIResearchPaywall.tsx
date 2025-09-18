import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Zap, Check, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AIResearchPaywallProps {
  onClose: () => void;
  userEmail?: string;
}

export default function AIResearchPaywall({ onClose, userEmail }: AIResearchPaywallProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'payperuse'>('monthly');

  const plans = {
    monthly: {
      name: 'AI Research Pro',
      price: '$9.97',
      period: '/month',
      description: 'Unlimited AI research queries',
      features: [
        'Unlimited research queries',
        'Advanced AI models',
        'Priority processing',
        'Export research data',
        'Email support'
      ],
      popular: true
    },
    yearly: {
      name: 'AI Research Pro Annual',
      price: '$99.97',
      period: '/year',
      description: 'Save 17% with annual billing',
      features: [
        'Everything in monthly plan',
        'Save $19.67 per year',
        'Priority customer support',
        'Early access to new features',
        'Advanced analytics'
      ],
      popular: false
    },
    payperuse: {
      name: 'Pay-per-Query Pack',
      price: '$5.00',
      period: 'for 10 queries',
      description: 'Perfect for occasional research',
      features: [
        '10 research queries',
        'No monthly commitment',
        'Same AI quality',
        'Valid for 30 days',
        'Email support'
      ],
      popular: false
    }
  };

  const handlePayment = async () => {
    if (!userEmail) {
      alert('Please sign in to continue');
      return;
    }

    setLoading(true);
    try {
      if (selectedPlan === 'payperuse') {
        // Handle pay-per-use payment
        const { data, error } = await supabase.functions.invoke('ai-research-payment-processor', {
          body: {
            action: 'create-usage-payment',
            userEmail
          }
        });

        if (error) throw error;

        // In a real app, you'd integrate with Stripe Elements here
        console.log('Payment intent created:', data);
        alert('Payment processing would happen here with Stripe Elements');
        
      } else {
        // Handle subscription payment
        const { data, error } = await supabase.functions.invoke('ai-research-payment-processor', {
          body: {
            action: 'create-checkout-session',
            planType: selectedPlan,
            userEmail
          }
        });

        if (error) throw error;

        // Redirect to Stripe checkout
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = plans[selectedPlan];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Unlock AI Research Power</CardTitle>
          <p className="text-gray-600">
            You've reached your free query limit. Choose a plan to continue researching.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Annual</TabsTrigger>
              <TabsTrigger value="payperuse">Pay-per-Use</TabsTrigger>
            </TabsList>

            {Object.entries(plans).map(([key, plan]) => (
              <TabsContent key={key} value={key}>
                <Card className={`relative ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-purple-600">
                      {plan.price}
                      <span className="text-lg font-normal text-gray-500">{plan.period}</span>
                    </div>
                    <p className="text-gray-600">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Maybe Later
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={loading}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {loading ? 'Processing...' : `Get ${currentPlan.name}`}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Secure payment powered by Stripe</p>
            <p>Cancel anytime • 30-day money-back guarantee</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}