import React, { useState } from 'react';
import StripeCheckout from '../components/StripeCheckout';
import SubscriptionDashboard from '../components/SubscriptionDashboard';
import BillingHistory from '../components/BillingHistory';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Crown, Zap, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

const Subscription: React.FC = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'ODYSSEY Basic',
      price: '$99',
      period: '/month',
      icon: <Zap className='w-8 h-8 text-blue-500' />,
      features: [
        'Basic AI Processing',
        'Standard Government Tools',
        'Email Support',
        '10 Active Contracts',
        'Basic Analytics',
        'Standard Security',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'ODYSSEY Professional',
      price: '$299',
      period: '/month',
      icon: <Crown className='w-8 h-8 text-purple-500' />,
      features: [
        'Advanced AI Processing',
        'Full Government Suite',
        'Priority Support',
        'Unlimited Contracts',
        'Advanced Analytics',
        'Enhanced Security',
        'Custom Integrations',
        'Team Collaboration',
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'ODYSSEY Enterprise',
      price: '$999',
      period: '/month',
      icon: <Rocket className='w-8 h-8 text-gold-500' />,
      features: [
        'Quantum AI Processing',
        'Complete Government Arsenal',
        'Dedicated Support',
        'Unlimited Everything',
        'Real-time Analytics',
        'Military-grade Security',
        'White-label Solutions',
        'API Access',
        'Custom Development',
      ],
      popular: false,
    },
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    alert('Payment successful! Welcome to ODYSSEY-1!');
  };

  const handlePaymentCancel = () => {
    setShowCheckout(false);
    setSelectedPlan('');
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  if (showCheckout && selectedPlanData) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
        <div className='container mx-auto px-4 py-16'>
          <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold text-white mb-4'>
              Complete Your Purchase
            </h1>
          </div>
          <StripeCheckout
            planId={selectedPlanData.id}
            planName={selectedPlanData.name}
            amount={selectedPlanData.price}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center mb-8'>
          <h1 className='text-5xl font-bold text-white mb-4'>
            ODYSSEY-1 Subscription
          </h1>
          <p className='text-xl text-gray-300'>
            Manage your subscription and billing
          </p>
        </div>

        <Tabs defaultValue='dashboard' className='max-w-6xl mx-auto'>
          <TabsList className='grid w-full grid-cols-3 bg-slate-800/50 border-slate-700'>
            <TabsTrigger
              value='dashboard'
              className='data-[state=active]:bg-purple-600'
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value='plans'
              className='data-[state=active]:bg-purple-600'
            >
              Plans
            </TabsTrigger>
            <TabsTrigger
              value='billing'
              className='data-[state=active]:bg-purple-600'
            >
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value='dashboard' className='space-y-6 mt-8'>
            <SubscriptionDashboard />
          </TabsContent>

          <TabsContent value='plans' className='mt-8'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto'>
              {plans.map(plan => (
                <Card
                  key={plan.id}
                  className={`relative bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all duration-300 ${
                    plan.popular ? 'ring-2 ring-purple-500 lg:scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <Badge className='absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white'>
                      Most Popular
                    </Badge>
                  )}

                  <CardHeader className='text-center pb-4'>
                    <div className='flex justify-center mb-4'>{plan.icon}</div>
                    <CardTitle className='text-2xl text-white mb-2'>
                      {plan.name}
                    </CardTitle>
                    <CardDescription className='mb-4'>
                      <span className='text-4xl font-bold text-white'>
                        {plan.price}
                      </span>
                      <span className='text-gray-400 text-lg'>
                        {plan.period}
                      </span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className='pt-0'>
                    <ul className='space-y-3 mb-8 min-h-[240px]'>
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className='flex items-start text-gray-300'
                        >
                          <Check className='w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0' />
                          <span className='text-sm'>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full py-3 text-lg font-semibold ${
                        plan.popular
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {user
                        ? 'Upgrade to ' + plan.name.split(' ')[1]
                        : 'Get Started'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value='billing' className='space-y-6 mt-8'>
            <BillingHistory />
          </TabsContent>
        </Tabs>

        <div className='flex flex-col sm:flex-row justify-center items-center gap-4 mt-16'>
          <Link to='/control-panel' className='w-full sm:w-auto'>
            <Button variant='outline' className='w-full sm:w-auto'>
              View Control Panel
            </Button>
          </Link>
          <Link to='/admin' className='w-full sm:w-auto'>
            <Button variant='outline' className='w-full sm:w-auto'>Admin Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
