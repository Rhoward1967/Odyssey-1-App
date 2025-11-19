import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Check, Crown, Star, TrendingUp, Zap } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Tier {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  icon: any;
  color: string;
  popular: boolean;
  trialDays: number;
  features: string[];
  limits: {
    employees: string;
    aiQueries: string;
    storage: string;
    support: string;
  };
}

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    period: '7 days',
    description: 'Perfect for testing ODYSSEY-1',
    icon: Zap,
    color: 'from-gray-600 to-gray-800',
    popular: false,
    trialDays: 7,
    features: [
      '7-day full access',
      'All core features',
      'Basic AI queries',
      'Email support',
      'Community access',
    ],
    limits: {
      employees: 'Up to 5',
      aiQueries: '10/day',
      storage: '1 GB',
      support: 'Email',
    },
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 99,
    period: 'month',
    description: 'Essential features for small businesses',
    icon: Star,
    color: 'from-blue-600 to-blue-800',
    popular: false,
    trialDays: 7,
    features: [
      'Up to 25 employees',
      'Basic AI features',
      'Time tracking',
      'Payroll processing',
      'Email support',
      'Monthly reports',
      'Data export',
    ],
    limits: {
      employees: 'Up to 25',
      aiQueries: '100/day',
      storage: '10 GB',
      support: 'Email (24h)',
    },
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 299,
    period: 'month',
    description: 'Advanced features for growing businesses',
    icon: TrendingUp,
    color: 'from-purple-600 to-purple-800',
    popular: true,
    trialDays: 7,
    features: [
      'Unlimited employees',
      'Full AI suite',
      'Advanced analytics',
      'Custom reports',
      'Priority support',
      'API access',
      'Trading platform',
      'Document management',
      'Team collaboration',
    ],
    limits: {
      employees: 'Unlimited',
      aiQueries: '1,000/day',
      storage: '100 GB',
      support: 'Priority (4h)',
    },
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: 999,
    period: 'month',
    description: 'Enterprise-grade power and customization',
    icon: Crown,
    color: 'from-yellow-600 to-yellow-800',
    popular: false,
    trialDays: 7,
    features: [
      'Everything in Pro',
      'Unlimited AI queries',
      'Custom integrations',
      'Dedicated support',
      'White-label options',
      'SLA guarantees',
      'Custom training',
      'Unlimited storage',
      'Advanced security',
      'Multi-region hosting',
    ],
    limits: {
      employees: 'Unlimited',
      aiQueries: 'Unlimited',
      storage: 'Unlimited',
      support: 'Dedicated (1h)',
    },
  },
];

export default function Subscribe() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [selectedPlan, setSelectedPlan] = React.useState(TIERS[0]);
  const [clickedTier, setClickedTier] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSelectTier = (tierId: string) => {
    console.log('🎯 Tier button clicked:', tierId);
    setClickedTier(tierId);
    const tier = TIERS.find((t) => t.id === tierId);
    if (tier) {
      console.log('✅ Setting selected plan:', tier.name);
      setSelectedPlan(tier);
      // Flash the button to show it was clicked
      setTimeout(() => setClickedTier(null), 300);
    }
  };

  const handleCompleteSubscription = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // For free trial, just insert the subscription
    if (selectedPlan.price === 0) {
      try {
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan: selectedPlan.id,
            tier: selectedPlan.id,
            status: 'trialing',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + (selectedPlan.trialDays * 24 * 60 * 60 * 1000)).toISOString(),
            trial_start: new Date().toISOString(),
            trial_end: new Date(Date.now() + (selectedPlan.trialDays * 24 * 60 * 60 * 1000)).toISOString(),
          });

        if (error) throw error;
        navigate('/app');
      } catch (error) {
        console.error('Error starting trial:', error);
      }
    } else {
      // For paid plans, go to profile/checkout
      navigate('/app/profile', {
        state: {
          selectedTier: selectedPlan.name,
          selectedPrice: `$${selectedPlan.price}`,
          fromPricing: true
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 py-16 px-4">
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto mb-8">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="border-gray-400 text-gray-300 hover:bg-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Find the plan that's right for you
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Start with a 7-day free trial. No credit card required.
        </p>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
        {TIERS.map((tier, index) => {
          const IconComponent = tier.icon;
          return (
            <Card 
              key={index} 
              className={`relative border-2 ${
                tier.popular ? 'border-purple-500' : 'border-gray-700'
              } bg-gradient-to-br ${tier.color} shadow-lg flex flex-col`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <IconComponent className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">{tier.name}</CardTitle>
                <CardDescription className="text-gray-300">
                  {tier.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-white">${tier.price}</span>
                  <span className="text-gray-300 text-lg">/{tier.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 flex-grow flex flex-col justify-between">
                {/* Features List */}
                <div className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limits & CTA */}
                <div>
                  {/* Limits */}
                  <div className="border-t border-gray-600 pt-4 space-y-2 mt-6">
                    <div className="text-xs text-gray-400">
                      <strong className="text-white">Employees:</strong> {tier.limits.employees}
                    </div>
                    <div className="text-xs text-gray-400">
                      <strong className="text-white">AI Queries:</strong> {tier.limits.aiQueries}
                    </div>
                    <div className="text-xs text-gray-400">
                      <strong className="text-white">Storage:</strong> {tier.limits.storage}
                    </div>
                    <div className="text-xs text-gray-400">
                      <strong className="text-white">Support:</strong> {tier.limits.support}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      alert(`BUTTON CLICKED: ${tier.name}`);
                      console.log('🔥 BUTTON CLICK FIRED for:', tier.id);
                      handleSelectTier(tier.id);
                    }}
                    onMouseEnter={() => console.log('👆 Mouse entered button:', tier.id)}
                    className={`w-full mt-6 px-8 py-3 rounded-md text-sm font-medium transition-colors ${
                      clickedTier === tier.id ? 'ring-4 ring-yellow-400' : ''
                    } ${
                      tier.popular
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-white hover:bg-gray-200 text-gray-900'
                    }`}
                    style={{ 
                      cursor: 'pointer', 
                      pointerEvents: 'auto', 
                      zIndex: 9999, 
                      position: 'relative',
                      border: '2px solid yellow'
                    }}
                  >
                    {tier.id === 'free' ? 'Start Free Trial' : 'Get Started'}
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/50">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Selected Plan: {selectedPlan.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={handleCompleteSubscription}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4"
              >
                {selectedPlan.price === 0 ? 'Start Free Trial' : `Subscribe for $${selectedPlan.price}/${selectedPlan.period}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trust Section */}
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-white mb-4">
            Trusted by businesses of all sizes
          </h3>
          <p className="text-gray-300">
            Join thousands of companies using ODYSSEY-1 to manage their operations,
            payroll, and growth.
          </p>
        </div>
      </div>
      
    </div>
  );
}