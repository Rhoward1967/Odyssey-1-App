import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Check, Crown, Star, TrendingUp, Zap } from 'lucide-react';
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

  const handleSelectTier = (tierId: string) => {
    navigate(`/onboard?tier=${tierId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 py-16 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Choose Your ODYSSEY-1 Plan
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Select the perfect tier for your business. Start with a free trial, upgrade anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          return (
            <Card
              key={tier.id}
              className={`relative bg-gradient-to-br ${tier.color} border-2 ${
                tier.popular ? 'border-purple-400 scale-105' : 'border-gray-700'
              } transition-transform hover:scale-105`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-4 py-1 text-sm font-bold">
                    MOST POPULAR
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <Icon className="w-12 h-12 mx-auto mb-4 text-white" />
                <CardTitle className="text-2xl font-bold text-white mb-2">
                  {tier.name}
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  {tier.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-white">${tier.price}</span>
                  <span className="text-gray-300 text-lg">/{tier.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <div className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limits */}
                <div className="border-t border-gray-600 pt-4 space-y-2">
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
                <Button
                  onClick={() => handleSelectTier(tier.id)}
                  className={`w-full ${
                    tier.popular
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-white hover:bg-gray-200 text-gray-900'
                  }`}
                  size="lg"
                >
                  {tier.id === 'free' ? 'Start Free Trial' : 'Get Started'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ / Trust Section */}
      <div className="max-w-4xl mx-auto mt-16 text-center">
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-8 border border-purple-500/30">
          <h3 className="text-2xl font-bold text-white mb-4">All plans include:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
            <div>
              <Check className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="font-semibold">14-Day Money Back</p>
              <p className="text-sm">Risk-free guarantee</p>
            </div>
            <div>
              <Check className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="font-semibold">No Long-Term Contract</p>
              <p className="text-sm">Cancel anytime</p>
            </div>
            <div>
              <Check className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="font-semibold">24/7 Security</p>
              <p className="text-sm">Bank-grade encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
