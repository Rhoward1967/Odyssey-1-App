import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Check, Crown, Rocket, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PlanFeature {
  name: string;
  professional: boolean | string;
  business: boolean | string;
  enterprise: boolean | string;
}

const tiers = [
  {
    name: 'Professional',
    price: 99,
    icon: Zap,
    color: 'blue',
    persona: 'The Solopreneur / Starter',
    value: 'Get Online & Look Good',
    popular: false,
    cta: 'Get Started'
  },
  {
    name: 'Business',
    price: 299,
    icon: Crown,
    color: 'purple',
    persona: 'The Growing Business',
    value: 'Dominate Your Niche',
    popular: true,
    cta: 'Most Popular'
  },
  {
    name: 'Enterprise',
    price: 999,
    icon: Rocket,
    color: 'amber',
    persona: 'The Established Agency / Developer',
    value: 'Full Control & Scale',
    popular: false,
    cta: 'Get Started'
  }
];

export default function SubscriptionPlans() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const navigate = useNavigate();

  const handleSelectPlan = (tierName: string, price: number) => {
    console.log('Plan button clicked:', { tierName, price });
    
    navigate('/profile', {
      state: {
        selectedTier: tierName,
        selectedPrice: `$${price}`,
        fromPricing: true
      }
    });
  };

  const plans = {
    professional: {
      name: 'Professional',
      price: billingPeriod === 'monthly' ? 99 : 990,
      icon: Zap,
      color: 'blue',
      persona: 'The Solopreneur / Starter',
      value: 'Get Online & Look Good',
      popular: false
    },
    business: {
      name: 'Business',
      price: billingPeriod === 'monthly' ? 299 : 2990,
      icon: Crown,
      color: 'purple',
      persona: 'The Growing Business',
      value: 'Dominate Your Niche',
      popular: true
    },
    enterprise: {
      name: 'Enterprise',
      price: billingPeriod === 'monthly' ? 999 : 9990,
      icon: Rocket,
      color: 'amber',
      persona: 'The Established Agency / Developer',
      value: 'Full Control & Scale',
      popular: false
    }
  };

  const features: PlanFeature[] = [
    // Theme System
    { name: 'Industry Themes', professional: '5-10 General', business: 'All 17 Premium', enterprise: 'All + Custom Upload' },
    { name: 'Theme Customization', professional: 'Basic (Logo, Colors)', business: 'Advanced (Fonts, Layouts)', enterprise: 'Developer (CSS/JS Editor)' },
    { name: 'Custom Code Editor', professional: false, business: false, enterprise: true },
    { name: 'Staging Environment', professional: false, business: false, enterprise: true },
    
    // Knowledge Bases
    { name: 'Industry Knowledge Bases', professional: '3 Selected', business: 'All 17 KBs', enterprise: 'All + Create Custom' },
    { name: 'Upload Custom KBs', professional: false, business: false, enterprise: true },
    
    // Core Platform
    { name: 'AI Features', professional: 'Standard', business: 'Advanced', enterprise: 'Premium + API' },
    { name: 'User Seats', professional: '1 User', business: '5 Users', enterprise: 'Unlimited' },
    { name: 'Storage', professional: '10 GB', business: '100 GB', enterprise: 'Unlimited' },
    
    // Support
    { name: 'Support Level', professional: 'Email & Community', business: 'Priority Chat', enterprise: 'Dedicated Manager' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
          Shape-shifting websites that transform with your industry
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={billingPeriod === 'monthly' ? 'font-semibold' : 'text-slate-500'}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 dark:bg-slate-600 transition-colors"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingPeriod === 'annual' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={billingPeriod === 'annual' ? 'font-semibold' : 'text-slate-500'}>
            Annual <span className="text-green-600">(Save 17%)</span>
          </span>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 mb-12">
        {Object.entries(plans).map(([key, plan]) => {
          const Icon = plan.icon;
          return (
            <Card key={key} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader>
                <div className="text-center mb-6">
                  <Icon className={`w-12 h-12 mx-auto mb-4 text-${plan.color}-500`} />
                  <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{plan.persona}</p>
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">{plan.value}</p>
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold mb-2">
                    ${plan.price}
                    <span className="text-lg font-normal text-slate-500">
                      /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.name, plan.price)}
                  type="button"
                >
                  {plan.popular ? 'Most Popular' : 'Get Started'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="text-left p-4 font-semibold">Features</th>
                <th className="text-center p-4 font-semibold">Professional</th>
                <th className="text-center p-4 font-semibold bg-purple-50 dark:bg-purple-900/20">Business</th>
                <th className="text-center p-4 font-semibold">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {features.map((feature, index) => (
                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-4 font-medium">{feature.name}</td>
                  <td className="p-4 text-center">
                    {typeof feature.professional === 'boolean' ? (
                      feature.professional ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      )
                    ) : (
                      <span className="text-sm">{feature.professional}</span>
                    )}
                  </td>
                  <td className="p-4 text-center bg-purple-50/50 dark:bg-purple-900/10">
                    {typeof feature.business === 'boolean' ? (
                      feature.business ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      )
                    ) : (
                      <span className="text-sm font-semibold">{feature.business}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {typeof feature.enterprise === 'boolean' ? (
                      feature.enterprise ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      )
                    ) : (
                      <span className="text-sm">{feature.enterprise}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* The Shape-Shifting Explanation */}
      <div className="max-w-4xl mx-auto mt-12 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8">
        <h3 className="text-2xl font-bold mb-4 text-center">The Shape-Shifting Power</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-semibold mb-2">$99: Look Professional</h4>
            <p className="text-slate-600 dark:text-slate-300">
              Choose your industry → Get a generic but clean theme + relevant knowledge base. You'll look good, but not distinct.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-purple-600">$299: Dominate Instantly</h4>
            <p className="text-slate-600 dark:text-slate-300">
              Choose your industry → Get the PREMIUM industry-specific theme + full KB. Your site instantly looks like a top-tier business in your field.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">$999: Total Control</h4>
            <p className="text-slate-600 dark:text-slate-300">
              Everything in Business + open the code editor. Modify CSS/JS, upload custom themes, create custom KBs. Full developer power.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
