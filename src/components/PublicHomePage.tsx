import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { ArrowRight, Brain, CheckCircle, Eye, Network, Zap } from 'lucide-react';
import React, { useState } from 'react';

import OdysseyGalaxyDemo from './OdysseyGalaxyDemo';

export default function PublicHomePage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const vrDemoRef = React.useRef<HTMLDivElement>(null);
  const handleWatchDemo = () => {
    if (vrDemoRef.current) {
      vrDemoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
        },
      });

      if (error) throw error;

      setMessage('✅ Magic link sent! Check your email to access ODYSSEY-1.');
      setEmail('');
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756951101382_a0bfad28.webp')`
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              ODYSSEY-1 AI
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
              The World's Most Advanced AI Platform - Revolutionizing Business Intelligence, 
              Automation, and Decision Making
            </p>
            
            {/* Admin Magic Link - Only for you! */}
            <div className="max-w-md mx-auto bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30">
              <h3 className="text-xl font-semibold text-white mb-4">🔗 Admin Quick Access</h3>
              <form onSubmit={handleMagicLink} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Admin email for magic link access"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/50 border-purple-500/50 text-white placeholder-gray-400"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isLoading ? 'Sending...' : 'Send Magic Link 🪄'}
                </Button>
                {message && (
                  <p className={`text-sm ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                    {message}
                  </p>
                )}
              </form>
              <p className="text-xs text-gray-400 mt-3 text-center">
                For customers: Use "Start Free Trial" button below
              </p>
            </div>

            {/* Primary CTAs - Subscribe First */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <a href="/subscribe">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <Button
                size="lg"
                variant="outline"
                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 text-lg"
                onClick={handleWatchDemo}
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* VR Demo Section */}
      <section className="max-w-7xl mx-auto px-4" ref={vrDemoRef}>
        <h2 className="text-3xl font-bold text-white text-center mb-6 mt-8">Odyssey-1: The AI Core & Hive</h2>
        <p className="text-center text-gray-300 mb-4 max-w-2xl mx-auto">A glowing AI orb, surrounded by the Hive, with a smaller orb in perpetual orbit. Click any element to learn more.</p>
        <OdysseyGalaxyDemo />
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Powered by Real AI Technology
          </h2>
          <p className="text-xl text-gray-300">
            Experience genuine neural networks and advanced machine learning
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30">
            <CardContent className="p-6 text-center">
              <Brain className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Neural Processing</h3>
              <p className="text-gray-300 text-sm">
                Real backpropagation algorithms with adaptive learning
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Eye className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Computer Vision</h3>
              <p className="text-gray-300 text-sm">
                Advanced image analysis and object detection
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Network className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Deep Learning</h3>
              <p className="text-gray-300 text-sm">
                Multi-layer neural networks for complex reasoning
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/30">
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Quantum AI</h3>
              <p className="text-gray-300 text-sm">
                Quantum-inspired processing for exponential power
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Transform Your Business with AI
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-gray-300">Automate complex business processes</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-gray-300">Make data-driven decisions instantly</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-gray-300">Predict market trends and opportunities</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-gray-300">Scale operations with intelligent automation</span>
                </div>
              </div>
              <a href="/subscribe">
                <Button className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4">
                  Get Started Today
                </Button>
              </a>
            </div>
            <div className="relative">
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756951104664_450bc18d.webp"
                alt="Professional using AI technology"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="relative">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756951108016_12601c54.webp"
              alt="AI Neural Network"
              className="w-32 h-32 mx-auto mb-8 rounded-full"
            />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience the Future of AI?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of businesses already using ODYSSEY-1 AI to transform their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/subscribe">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <a href="/help">
              <Button size="lg" variant="outline" className="border-gray-400 text-gray-300 hover:bg-gray-700 px-8 py-4 text-lg">
                View Documentation
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Why ODYSSEY-1 is Different
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            The world's most advanced AI-powered business platform with constitutional intelligence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-8 rounded-xl border border-blue-500/30">
            <div className="text-3xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold text-white mb-4">Constitutional AI Core</h3>
            <p className="text-gray-300">
              R.O.M.A.N. - our sovereign AI system with dual hemisphere processing. 
              Natural language commands become structured actions through constitutional validation.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-8 rounded-xl border border-purple-500/30">
            <div className="text-3xl mb-4">👑</div>
            <h3 className="text-xl font-semibold text-white mb-4">User Sovereignty</h3>
            <p className="text-gray-300">
              Built on The 9 Principles framework. Your data remains yours. 
              Complete transparency with enterprise-grade security and homeostatic monitoring.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-blue-900/40 p-8 rounded-xl border border-green-500/30">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-4">Intelligent Operations</h3>
            <p className="text-gray-300">
              Advanced workforce management, predictive analytics, and real-time market intelligence. 
              Experience what happens when AI truly understands your business.
            </p>
          </div>
        </div>

        {/* Free Trial Limitations Teaser */}
        <div className="mt-16 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 p-8 rounded-xl border border-yellow-500/30">
          <h3 className="text-2xl font-semibold text-white mb-4 text-center">
            Experience the Future - 7 Days Free
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-yellow-300 mb-3">✨ Free Trial Includes:</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• R.O.M.A.N. AI Assistant (limited queries)</li>
                <li>• Basic workforce management</li>
                <li>• Standard reporting</li>
                <li>• Community support</li>
                <li>• Up to 5 employees</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-300 mb-3">🚀 Unlock with Premium:</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• Full constitutional AI capabilities</li>
                <li>• Unlimited natural language commands</li>
                <li>• Advanced predictive analytics</li>
                <li>• Real-time market intelligence</li>
                <li>• Enterprise security & compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Professional public homepage ready for production */}
    </div>
  );
}