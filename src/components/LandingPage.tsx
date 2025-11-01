import { supabase } from '@/lib/supabaseClient';
import { Rocket, Shield, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import Visualization3D from './Visualization3D';

export const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Send magic link for signup
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}`, // Changed from /dashboard
        },
      });

      if (error) throw error;

      setMessage('✅ Check your email for the magic link to start your 7-day FREE trial!');
      setEmail('');
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            ODYSSEY-1
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            AI-Powered Business Management Platform
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
            Complete workforce management, AI assistants, and business intelligence
            in one unified platform. Start your <strong>7-day FREE trial</strong> today!
          </p>

          {/* Signup Form */}
          <Card className="max-w-md mx-auto bg-slate-800/60 border-blue-500/50">
            <CardHeader>
              <CardTitle className="text-center text-white">Start Your Free 7-Day Trial</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? 'Sending...' : '🚀 Start Free Trial'}
                </Button>
                {message && (
                  <p className={`text-sm text-center ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                    {message}
                  </p>
                )}
              </form>
              <p className="text-xs text-gray-400 text-center mt-4">
                No credit card required • Cancel anytime • Full access for 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <Card className="bg-slate-800/60 border-blue-500/30">
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-blue-400" />
              <h3 className="font-bold text-white mb-2">Workforce Management</h3>
              <p className="text-sm text-gray-400">Complete HR, payroll, and time tracking system</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-purple-500/30">
            <CardContent className="pt-6 text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-purple-400" />
              <h3 className="font-bold text-white mb-2">AI Assistants</h3>
              <p className="text-sm text-gray-400">R.O.M.A.N. constitutional AI with dual hemispheres</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-green-500/30">
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-400" />
              <h3 className="font-bold text-white mb-2">Enterprise Security</h3>
              <p className="text-sm text-gray-400">Bank-level encryption and compliance</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-orange-500/30">
            <CardContent className="pt-6 text-center">
              <Rocket className="h-12 w-12 mx-auto mb-4 text-orange-400" />
              <h3 className="font-bold text-white mb-2">Real-Time Analytics</h3>
              <p className="text-sm text-gray-400">Business intelligence and predictive insights</p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Tiers */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Trial Tier */}
            <Card className="bg-slate-800/60 border-blue-500/50">
              <CardHeader>
                <CardTitle className="text-blue-400">Free Trial</CardTitle>
                <p className="text-4xl font-bold text-white">$0<span className="text-sm text-gray-400">/7 days</span></p>
              </CardHeader>
              <CardContent className="text-left space-y-2 text-sm">
                <p className="text-gray-300">✅ Full access for 7 days</p>
                <p className="text-gray-300">✅ Up to 5 employees</p>
                <p className="text-gray-300">✅ 10 AI queries/day</p>
                <p className="text-gray-300">✅ Basic analytics</p>
                <p className="text-gray-400">❌ No payroll processing</p>
              </CardContent>
            </Card>

            {/* Basic Tier */}
            <Card className="bg-slate-800/60 border-green-500/50 relative">
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl">
                Popular
              </div>
              <CardHeader>
                <CardTitle className="text-green-400">Basic</CardTitle>
                <p className="text-4xl font-bold text-white">$29<span className="text-sm text-gray-400">/month</span></p>
              </CardHeader>
              <CardContent className="text-left space-y-2 text-sm">
                <p className="text-gray-300">✅ Up to 25 employees</p>
                <p className="text-gray-300">✅ 100 AI queries/day</p>
                <p className="text-gray-300">✅ Full payroll processing</p>
                <p className="text-gray-300">✅ Advanced analytics</p>
                <p className="text-gray-300">✅ Email support</p>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="bg-slate-800/60 border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-purple-400">Pro</CardTitle>
                <p className="text-4xl font-bold text-white">$99<span className="text-sm text-gray-400">/month</span></p>
              </CardHeader>
              <CardContent className="text-left space-y-2 text-sm">
                <p className="text-gray-300">✅ Unlimited employees</p>
                <p className="text-gray-300">✅ Unlimited AI queries</p>
                <p className="text-gray-300">✅ Trading platform</p>
                <p className="text-gray-300">✅ Priority support</p>
                <p className="text-gray-300">✅ Custom integrations</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 3D Visualization Demo Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Experience ODYSSEY-1's AI Core</h2>
          <Card className="max-w-3xl mx-auto bg-slate-800/60 border-purple-500/50">
            <CardContent className="p-8">
              <Visualization3D />
              <div className="mt-4">
                <p className="text-white font-bold mb-2">Live Neural Network Visualization</p>
                <p className="text-gray-400 text-sm">
                  See ODYSSEY-1's AI agents communicating in real-time. Each node represents
                  an AI decision point, connected through our constitutional framework.
                </p>
              </div>
              <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                🚀 Start Your Free Trial
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>© 2025 ODYSSEY-1 by Rickey A. Howard. All rights reserved.</p>
          <p className="mt-2">Patent Pending • Enterprise-Grade Security • GDPR Compliant</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
