import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { loadStripe } from '@stripe/stripe-js';
import { Building, Check, CreditCard, Loader2, Palette, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface OnboardingData {
  // Step 1: Account
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;

  // Step 2: Business
  companyName: string;
  businessType: string;
  employeeCount: string;
  industry: string;

  // Step 3: Theme
  theme: string;

  // Step 4: Selected Tier
  selectedTier: string;
}

const BUSINESS_TYPES = [
  { value: 'construction', label: '🏗️ Construction', theme: 'construction' },
  { value: 'technology', label: '💻 Technology', theme: 'tech' },
  { value: 'consulting', label: '📊 Consulting', theme: 'default' },
  { value: 'retail', label: '🛒 Retail', theme: 'retail' },
  { value: 'healthcare', label: '🏥 Healthcare', theme: 'healthcare' },
  { value: 'finance', label: '💰 Finance', theme: 'finance' },
  { value: 'manufacturing', label: '🏭 Manufacturing', theme: 'manufacturing' },
  { value: 'education', label: '🎓 Education', theme: 'education' },
  { value: 'other', label: '🏢 Other', theme: 'default' },
];

const THEMES = {
  default: { name: 'Default Blue', primary: 'from-blue-600 to-purple-600', description: 'Professional & Modern' },
  construction: { name: 'Construction', primary: 'from-orange-600 to-yellow-600', description: 'Bold & Energetic' },
  finance: { name: 'Finance', primary: 'from-green-600 to-emerald-600', description: 'Trustworthy & Clean' },
  tech: { name: 'Technology', primary: 'from-purple-600 to-pink-600', description: 'Innovative & Sleek' },
  healthcare: { name: 'Healthcare', primary: 'from-blue-500 to-teal-500', description: 'Calm & Professional' },
  retail: { name: 'Retail', primary: 'from-pink-500 to-rose-600', description: 'Vibrant & Inviting' },
  manufacturing: { name: 'Manufacturing', primary: 'from-gray-600 to-slate-700', description: 'Industrial & Strong' },
  education: { name: 'Education', primary: 'from-indigo-600 to-blue-600', description: 'Inspiring & Clear' },
};

const TIER_PRICES = {
  free: 0,
  basic: 99,
  pro: 299,
  ultimate: 999,
};

export default function Onboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState<OnboardingData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    businessType: '',
    employeeCount: '',
    industry: '',
    theme: 'default',
    selectedTier: searchParams.get('tier') || 'basic',
  });

  // Auto-set theme when business type changes
  useEffect(() => {
    if (data.businessType) {
      const businessConfig = BUSINESS_TYPES.find(b => b.value === data.businessType);
      if (businessConfig) {
        setData(prev => ({ ...prev, theme: businessConfig.theme }));
      }
    }
  }, [data.businessType]);

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      // Step 1: Create Supabase user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            company_name: data.companyName,
            business_type: data.businessType,
            employee_count: data.employeeCount,
            industry: data.industry,
            theme: data.theme,
            selected_tier: data.selectedTier,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Step 2: Create Stripe checkout session (if not free tier)
      if (data.selectedTier !== 'free') {
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
          'create-checkout-session',
          {
            body: {
              tier: data.selectedTier,
              userId: authData.user.id,
              email: data.email,
              successUrl: `${window.location.origin}/welcome`,
              cancelUrl: `${window.location.origin}/onboard?tier=${data.selectedTier}`,
            },
          }
        );

        if (checkoutError) throw checkoutError;

        // Redirect to Stripe Checkout URL directly
        if (checkoutData?.sessionUrl) {
          window.location.href = checkoutData.sessionUrl;
        } else {
          throw new Error('No checkout session URL returned');
        }
      } else {
        // Free tier: Create subscription record directly
        const { error: subError } = await supabase.from('subscriptions').insert({
          user_id: authData.user.id,
          tier: 'free',
          status: 'trial',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

        if (subError) throw subError;

        // Navigate to welcome page
        navigate('/welcome');
      }
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return data.email && data.password && data.firstName && data.lastName;
      case 2:
        return data.companyName && data.businessType && data.employeeCount;
      case 3:
        return data.theme;
      case 4:
        return true; // Payment step is always valid (handled by Stripe)
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="bg-slate-800/60 border-blue-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-6 w-6 text-blue-400" />
                Step 1: Create Your Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={data.firstName}
                    onChange={(e) => setData({ ...data, firstName: e.target.value })}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={data.lastName}
                    onChange={(e) => setData({ ...data, lastName: e.target.value })}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                  required
                  minLength={8}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-xs text-gray-400">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="bg-slate-800/60 border-green-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Building className="h-6 w-6 text-green-400" />
                Step 2: Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) => setData({ ...data, companyName: e.target.value })}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type *</Label>
                <Select value={data.businessType} onValueChange={(value) => setData({ ...data, businessType: value })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white border-slate-600">
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="focus:bg-slate-700">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCount">Number of Employees *</Label>
                <Select value={data.employeeCount} onValueChange={(value) => setData({ ...data, employeeCount: value })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select employee count" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white border-slate-600">
                    <SelectItem value="1-5" className="focus:bg-slate-700">1-5 employees</SelectItem>
                    <SelectItem value="6-25" className="focus:bg-slate-700">6-25 employees</SelectItem>
                    <SelectItem value="26-100" className="focus:bg-slate-700">26-100 employees</SelectItem>
                    <SelectItem value="100+" className="focus:bg-slate-700">100+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry (Optional)</Label>
                <Input
                  id="industry"
                  value={data.industry}
                  onChange={(e) => setData({ ...data, industry: e.target.value })}
                  placeholder="e.g., Commercial Construction"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="bg-slate-800/60 border-purple-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Palette className="h-6 w-6 text-purple-400" />
                Step 3: Choose Your Theme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400 text-sm">
                Your theme is automatically selected based on your business type, but you can change it.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(THEMES).map(([key, theme]) => (
                  <div
                    key={key}
                    onClick={() => setData({ ...data, theme: key })}
                    className={`p-4 rounded-lg cursor-pointer border-2 transition ${
                      data.theme === key ? 'border-purple-500 bg-purple-900/30' : 'border-slate-600 bg-slate-700/30'
                    }`}
                  >
                    <div className={`h-20 bg-gradient-to-br ${theme.primary} rounded mb-2`}></div>
                    <p className="text-white font-semibold">{theme.name}</p>
                    <p className="text-gray-400 text-xs">{theme.description}</p>
                    {data.theme === key && (
                      <Badge className="mt-2 bg-purple-500">
                        <Check className="w-3 h-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="bg-slate-800/60 border-green-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CreditCard className="h-6 w-6 text-green-400" />
                Step 4: Review & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-900/30 p-4 rounded border border-blue-500">
                <h3 className="text-lg font-semibold text-white mb-2">Selected Plan</h3>
                <p className="text-3xl font-bold text-blue-300">
                  {data.selectedTier.charAt(0).toUpperCase() + data.selectedTier.slice(1)}
                </p>
                <p className="text-xl text-white mt-2">
                  ${TIER_PRICES[data.selectedTier as keyof typeof TIER_PRICES]}
                  {data.selectedTier === 'free' ? ' / 7 days' : ' / month'}
                </p>
              </div>

              <div className="bg-slate-700/50 p-4 rounded space-y-2">
                <h4 className="font-semibold text-white mb-2">Account Summary:</h4>
                <p className="text-gray-300 text-sm">
                  <strong>Name:</strong> {data.firstName} {data.lastName}
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Email:</strong> {data.email}
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Company:</strong> {data.companyName}
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Business Type:</strong> {BUSINESS_TYPES.find(b => b.value === data.businessType)?.label}
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Theme:</strong> {THEMES[data.theme as keyof typeof THEMES]?.name}
                </p>
              </div>

              {data.selectedTier === 'free' ? (
                <div className="bg-green-900/30 p-4 rounded border border-green-500">
                  <p className="text-green-300 text-sm">
                    ✅ No payment required for free trial. Click "Complete" to start your 7-day trial!
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-900/30 p-4 rounded border border-yellow-500">
                  <p className="text-yellow-300 text-sm">
                    🔒 You'll be redirected to Stripe's secure checkout to complete your payment.
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-900/30 p-4 rounded border border-red-500">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to ODYSSEY-1!</h1>
          <p className="text-gray-400">Complete your profile to start your journey</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded ${
                  s <= step ? 'bg-blue-500' : 'bg-slate-700'
                } ${s < 4 ? 'mr-2' : ''}`}
              ></div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400">Step {step} of 4</p>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || loading}
            variant="outline"
            className="bg-slate-700 border-slate-600 hover:bg-slate-600"
          >
            ← Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isStepValid() || loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : step === 4 ? (
              '✅ Complete'
            ) : (
              'Next →'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
