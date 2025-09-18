import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Users, TrendingUp } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
      </div>

      <div className="relative container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-medium">
                🚀 New Paradigm Technology
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Empowering the 
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Little Guy</span>
              </h1>
              
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                Advanced AI and quantum simulation technology designed for small businesses, contractors, and everyday entrepreneurs. No PhD required.
              </p>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <span>Instant Intelligence</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <span>Built for Everyone</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <span>Real Results</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-lg">
                Watch Demo
              </Button>
            </div>

            <div className="pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400 mb-4">Trusted by small businesses nationwide</p>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">36+</div>
                  <div className="text-xs text-gray-400">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">94%</div>
                  <div className="text-xs text-gray-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-xs text-gray-400">Support</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756741903235_db30d095.webp"
                alt="Revolutionary 3D Technology Interface"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-15 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </div>
  );
}