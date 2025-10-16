import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Brain, CheckCircle, Eye, Network, Zap } from 'lucide-react';
import React from 'react';

import OdysseyGalaxyDemo from './OdysseyGalaxyDemo';

export default function PublicHomePage() {
  const vrDemoRef = React.useRef<HTMLDivElement>(null);
  const handleWatchDemo = () => {
    if (vrDemoRef.current) {
      vrDemoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
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
              <Button className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4">
                Get Started Today
              </Button>
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
            <a href="/odyssey">
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
    </div>
  );
}