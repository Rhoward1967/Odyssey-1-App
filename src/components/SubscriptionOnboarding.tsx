import { supabase } from '@/lib/supabaseClient';
import { Building, CreditCard, Palette, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SubscriptionOnboardingProps {
  onComplete: () => void;
}

export const SubscriptionOnboarding: React.FC<SubscriptionOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Business
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [employees, setEmployees] = useState('');

  // Step 3: Theme
  const [theme, setTheme] = useState('default');

  // Step 4: Payment (Stripe)
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Final step - process subscription
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error('Not authenticated');

        // Update user metadata
        await supabase.auth.updateUser({
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
            business_name: businessName,
            business_type: businessType,
            employee_count: employees,
            theme,
            subscription_status: 'active',
            subscription_tier: 'basic',
            subscription_start: new Date().toISOString()
          }
        });

        // TODO: Process Stripe payment here
        // const paymentResult = await processStripePayment({ cardNumber, expiry, cvc });

        alert('✅ Subscription successful! Welcome to ODYSSEY-1!');
        onComplete();
      } catch (error: any) {
        alert(`❌ Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
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
                Step 1: Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type *</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white border-slate-600">
                    <SelectItem value="construction">🏗️ Construction</SelectItem>
                    <SelectItem value="technology">💻 Technology</SelectItem>
                    <SelectItem value="consulting">📊 Consulting</SelectItem>
                    <SelectItem value="retail">🛒 Retail</SelectItem>
                    <SelectItem value="healthcare">🏥 Healthcare</SelectItem>
                    <SelectItem value="finance">💰 Finance</SelectItem>
                    <SelectItem value="other">🏢 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employees">Number of Employees *</Label>
                <Select value={employees} onValueChange={setEmployees}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select employee count" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white border-slate-600">
                    <SelectItem value="1-5">1-5 employees</SelectItem>
                    <SelectItem value="6-25">6-25 employees</SelectItem>
                    <SelectItem value="26-100">26-100 employees</SelectItem>
                    <SelectItem value="100+">100+ employees</SelectItem>
                  </SelectContent>
                </Select>
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
              <p className="text-gray-400 text-sm">Select a theme that matches your business style</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setTheme('default')}
                  className={`p-4 rounded-lg cursor-pointer border-2 transition ${
                    theme === 'default' ? 'border-blue-500 bg-blue-900/30' : 'border-slate-600 bg-slate-700/30'
                  }`}
                >
                  <div className="h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded mb-2"></div>
                  <p className="text-white font-semibold">Default Blue</p>
                  <p className="text-gray-400 text-xs">Professional & Modern</p>
                </div>

                <div
                  onClick={() => setTheme('construction')}
                  className={`p-4 rounded-lg cursor-pointer border-2 transition ${
                    theme === 'construction' ? 'border-orange-500 bg-orange-900/30' : 'border-slate-600 bg-slate-700/30'
                  }`}
                >
                  <div className="h-20 bg-gradient-to-br from-orange-600 to-yellow-600 rounded mb-2"></div>
                  <p className="text-white font-semibold">Construction</p>
                  <p className="text-gray-400 text-xs">Bold & Energetic</p>
                </div>

                <div
                  onClick={() => setTheme('finance')}
                  className={`p-4 rounded-lg cursor-pointer border-2 transition ${
                    theme === 'finance' ? 'border-green-500 bg-green-900/30' : 'border-slate-600 bg-slate-700/30'
                  }`}
                >
                  <div className="h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded mb-2"></div>
                  <p className="text-white font-semibold">Finance</p>
                  <p className="text-gray-400 text-xs">Trustworthy & Clean</p>
                </div>

                <div
                  onClick={() => setTheme('tech')}
                  className={`p-4 rounded-lg cursor-pointer border-2 transition ${
                    theme === 'tech' ? 'border-purple-500 bg-purple-900/30' : 'border-slate-600 bg-slate-700/30'
                  }`}
                >
                  <div className="h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded mb-2"></div>
                  <p className="text-white font-semibold">Tech</p>
                  <p className="text-gray-400 text-xs">Innovative & Sleek</p>
                </div>
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
                Step 4: Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-900/30 p-4 rounded border border-blue-500 mb-4">
                <p className="text-blue-300 font-semibold">Selected Plan: Basic - $29/month</p>
                <p className="text-gray-400 text-sm">7-day free trial • Cancel anytime</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date *</Label>
                  <Input
                    id="expiry"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC *</Label>
                  <Input
                    id="cvc"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                🔒 Secure payment processed by Stripe. Your card will not be charged during the 7-day trial.
              </p>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to ODYSSEY-1!</h1>
          <p className="text-gray-400">Complete your profile to start your 7-day free trial</p>
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
          <p className="text-center text-sm text-gray-400">
            Step {step} of 4
          </p>
        </div>

        {renderStep()}

        <div className="flex justify-between mt-6">
          <Button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            variant="outline"
            className="bg-slate-700 border-slate-600"
          >
            ← Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={loading || (step === 1 && (!firstName || !lastName)) || (step === 2 && (!businessName || !businessType || !employees)) || (step === 4 && (!cardNumber || !expiry || !cvc))}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? 'Processing...' : step === 4 ? '✅ Start Trial' : 'Next →'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionOnboarding;
