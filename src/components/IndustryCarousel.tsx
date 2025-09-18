import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Brain, Zap, Activity, TrendingUp, Globe } from 'lucide-react';

const industries = [
  { name: 'Healthcare', icon: '🏥', title: 'AI-Powered Patient Care', description: 'Optimize patient flow, predict health outcomes, automate diagnostics', metrics: ['34% faster diagnosis', '89% accuracy improvement', '$2M cost savings'], color: 'from-blue-500 to-cyan-500' },
  { name: 'Manufacturing', icon: '🏭', title: 'Smart Factory Operations', description: 'Predictive maintenance, quality control, supply chain optimization', metrics: ['99.7% uptime', '67% defect reduction', '$450K savings/year'], color: 'from-orange-500 to-red-500' },
  { name: 'Finance', icon: '💼', title: 'Intelligent Risk Management', description: 'Fraud detection, algorithmic trading, compliance automation', metrics: ['89% fraud reduction', 'AAA compliance', '15% ROI increase'], color: 'from-green-500 to-emerald-500' },
  { name: 'Government', icon: '🏛️', title: 'Public Service Excellence', description: 'Procurement optimization, citizen services, policy analysis', metrics: ['40% time reduction', '15% cost savings', '95% satisfaction'], color: 'from-purple-500 to-indigo-500' },
  { name: 'Retail', icon: '🛍️', title: 'Customer Experience AI', description: 'Inventory optimization, personalization, demand forecasting', metrics: ['23% sales increase', '45% inventory efficiency', '92% satisfaction'], color: 'from-pink-500 to-rose-500' },
  { name: 'Education', icon: '🎓', title: 'Personalized Learning', description: 'Adaptive curricula, performance analytics, resource optimization', metrics: ['78% engagement boost', '34% grade improvement', '60% efficiency'], color: 'from-teal-500 to-cyan-500' },
  { name: 'Transportation', icon: '🚛', title: 'Autonomous Logistics', description: 'Route optimization, fleet management, predictive maintenance', metrics: ['45% fuel savings', '78% on-time delivery', '92% safety score'], color: 'from-yellow-500 to-orange-500' },
  { name: 'Energy', icon: '⚡', title: 'Smart Grid Management', description: 'Load balancing, renewable integration, consumption optimization', metrics: ['67% efficiency gain', '34% cost reduction', '99.9% uptime'], color: 'from-emerald-500 to-green-500' }
];

export function IndustryCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % industries.length);
        setIsAnimating(false);
      }, 300);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const current = industries[currentIndex];

  return (
    <div className="relative overflow-hidden">
      <div className="text-center mb-8">
        <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-0">
          <Globe className="w-4 h-4 mr-2" />
          Universal AI Operating System
        </Badge>
        <h2 className="text-3xl font-bold mb-2">
          ODYSSEY-1 Across {industries.length}+ Industries
        </h2>
        <p className="text-gray-600">
          Revolutionary AI technology transforming every sector of the global economy
        </p>
      </div>

      <Card className={`transition-all duration-500 ${isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'} bg-gradient-to-br ${current.color} text-white border-0 shadow-2xl`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{current.icon}</div>
              <div>
                <h3 className="text-2xl font-bold">{current.title}</h3>
                <p className="text-white/80">{current.name} Industry</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Live AI</span>
            </div>
          </div>

          <p className="text-lg mb-6 text-white/90">
            {current.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {current.metrics.map((metric, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <TrendingUp className="w-5 h-5 mx-auto mb-2" />
                <div className="font-semibold text-sm">{metric}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-6 gap-2">
        <div className="text-sm text-gray-500 mr-4">
          {currentIndex + 1} of {industries.length}+ industries
        </div>
        {industries.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-blue-600 scale-125' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}