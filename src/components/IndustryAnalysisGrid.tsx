import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Target, Users } from 'lucide-react';
import { IndustryDemo } from './IndustryDemo';
import { SuccessStories } from './SuccessStories';

const industries = [
  { name: 'Healthcare', icon: '🏥', revenue: '$2.5M', roi: '340%', clients: '1.2K', growth: '+45%' },
  { name: 'Manufacturing', icon: '🏭', revenue: '$4.2M', roi: '425%', clients: '890', growth: '+62%' },
  { name: 'Finance', icon: '💼', revenue: '$8.1M', roi: '520%', clients: '2.1K', growth: '+78%' },
  { name: 'Retail', icon: '🛍️', revenue: '$3.7M', roi: '380%', clients: '1.5K', growth: '+55%' },
  { name: 'Government', icon: '🏛️', revenue: '$12.5M', roi: '290%', clients: '450', growth: '+35%' },
  { name: 'Logistics', icon: '🚚', revenue: '$5.8M', roi: '445%', clients: '780', growth: '+68%' },
  { name: 'Education', icon: '🎓', revenue: '$1.8M', roi: '310%', clients: '2.8K', growth: '+42%' },
  { name: 'Real Estate', icon: '🏠', revenue: '$6.2M', roi: '385%', clients: '650', growth: '+58%' },
  { name: 'Hospitality', icon: '🏨', revenue: '$3.4M', roi: '360%', clients: '920', growth: '+48%' },
  { name: 'Agriculture', icon: '🌾', revenue: '$2.9M', roi: '325%', clients: '540', growth: '+38%' },
  { name: 'Energy', icon: '⚡', revenue: '$15.7M', roi: '480%', clients: '320', growth: '+85%' },
  { name: 'Automotive', icon: '🚗', revenue: '$9.3M', roi: '410%', clients: '430', growth: '+72%' },
  { name: 'Telecom', icon: '📡', revenue: '$11.2M', roi: '395%', clients: '280', growth: '+65%' },
  { name: 'Media', icon: '🎬', revenue: '$4.6M', roi: '355%', clients: '1.1K', growth: '+52%' },
  { name: 'Construction', icon: '🏗️', revenue: '$7.4M', roi: '370%', clients: '680', growth: '+48%' },
  { name: 'Startups', icon: '🚀', revenue: '$850K', roi: '280%', clients: '3.2K', growth: '+95%' }
];

export const IndustryAnalysisGrid: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState(industries[0]);
  const [showDemo, setShowDemo] = useState(false);
  const [showStories, setShowStories] = useState(false);

  return (
    <div className="py-16 bg-gradient-to-br from-slate-900 to-purple-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">How We Help Different Businesses</h2>
          <p className="text-xl text-gray-300">Click any business type below to see real results from companies just like yours</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
          {industries.map((industry) => (
            <Card 
              key={industry.name}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedIndustry.name === industry.name 
                  ? 'bg-purple-600/30 border-purple-400' 
                  : 'bg-slate-800/50 border-slate-600 hover:bg-slate-700/50'
              }`}
              onClick={() => setSelectedIndustry(industry)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{industry.icon}</div>
                <div className="text-sm font-medium text-white">{industry.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-slate-800/80 to-purple-800/80 border-purple-500/30">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{selectedIndustry.icon}</div>
              <h3 className="text-3xl font-bold text-white mb-2">How We Help {selectedIndustry.name} Companies</h3>
              <Badge className="bg-purple-600/80 text-white">Real Results from Real Businesses</Badge>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-6 h-6 text-green-400 mr-2" />
                  <span className="text-2xl font-bold text-green-400">{selectedIndustry.revenue}</span>
                </div>
                <p className="text-gray-300">Average Money Made</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-400 mr-2" />
                  <span className="text-2xl font-bold text-blue-400">{selectedIndustry.roi}</span>
                </div>
                <p className="text-gray-300">Return on Investment</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-purple-400 mr-2" />
                  <span className="text-2xl font-bold text-purple-400">{selectedIndustry.clients}</span>
                </div>
                <p className="text-gray-300">Happy Customers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-6 h-6 text-orange-400 mr-2" />
                  <span className="text-2xl font-bold text-orange-400">{selectedIndustry.growth}</span>
                </div>
                <p className="text-gray-300">Business Growth</p>
              </div>
            </div>

            <div className="mt-8 text-center">
               <Button 
                 className="bg-purple-600 hover:bg-purple-700 mr-4"
                 onClick={() => setShowDemo(true)}
               >
                 See How It Works for You
               </Button>
               <Button 
                 variant="outline" 
                 className="border-purple-500/50 text-purple-300"
                 onClick={() => setShowStories(true)}
               >
                 Read Success Stories
               </Button>
            </div>
          </CardContent>
        </Card>

        <IndustryDemo 
          isOpen={showDemo}
          onClose={() => setShowDemo(false)}
          industry={selectedIndustry}
        />
        
        <SuccessStories 
          isOpen={showStories}
          onClose={() => setShowStories(false)}
          industry={selectedIndustry}
        />
      </div>
    </div>
  );
};