import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, Rocket, Heart } from 'lucide-react';

export default function ParadigmShowcase() {
  return (
    <div className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-gold-500 to-yellow-500 text-black mb-4">
            ✨ A New Era of Accessibility
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Beyond the Goggles
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            This isn't VR or AR. This is something entirely new - advanced intelligence that works for everyone, 
            from the corner store owner to the federal contractor.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Crystal Sphere Visual */}
          <div className="lg:col-span-1">
            <div className="relative">
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756741907329_2e4dfbc7.webp"
                alt="3D Crystal Intelligence Sphere"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-2xl"></div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="lg:col-span-2 grid gap-6">
            <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-600/20 rounded-lg">
                    <Brain className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Intuitive Intelligence</h3>
                    <p className="text-gray-300">
                      No complex interfaces or learning curves. Our AI understands plain English and responds like a trusted advisor.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-900/50 to-teal-900/50 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-600/20 rounded-lg">
                    <Heart className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Built for the Little Guy</h3>
                    <p className="text-gray-300">
                      Enterprise-level technology at small business prices. Level the playing field with Fortune 500 capabilities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-600/20 rounded-lg">
                    <Rocket className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Paradigm Shift</h3>
                    <p className="text-gray-300">
                      This isn't an upgrade - it's a complete reimagining of how technology should serve humanity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Visual */}
        <div className="text-center">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756741917277_f4d29acb.webp"
            alt="Small Business Owner Using Advanced Technology"
            className="mx-auto rounded-2xl shadow-2xl max-w-2xl w-full"
          />
          <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
            Real people, real businesses, real results. See how Odyssey-1 transforms the way small businesses compete and thrive.
          </p>
        </div>
      </div>
    </div>
  );
}