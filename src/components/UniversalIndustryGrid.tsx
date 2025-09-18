import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Globe, Zap, TrendingUp, ArrowRight } from 'lucide-react';

const allIndustries = [
  { name: 'Healthcare', icon: '🏥', applications: ['Patient Care', 'Diagnostics', 'Drug Discovery'], roi: '340%' },
  { name: 'Manufacturing', icon: '🏭', applications: ['Predictive Maintenance', 'Quality Control', 'Supply Chain'], roi: '280%' },
  { name: 'Finance', icon: '💼', applications: ['Risk Management', 'Fraud Detection', 'Trading'], roi: '450%' },
  { name: 'Government', icon: '🏛️', applications: ['Public Services', 'Policy Analysis', 'Procurement'], roi: '220%' },
  { name: 'Retail', icon: '🛍️', applications: ['Inventory', 'Personalization', 'Demand Forecasting'], roi: '190%' },
  { name: 'Education', icon: '🎓', applications: ['Personalized Learning', 'Analytics', 'Administration'], roi: '165%' },
  { name: 'Transportation', icon: '🚛', applications: ['Route Optimization', 'Fleet Management', 'Autonomous Systems'], roi: '320%' },
  { name: 'Energy', icon: '⚡', applications: ['Smart Grids', 'Renewable Integration', 'Optimization'], roi: '380%' },
  { name: 'Agriculture', icon: '🌾', applications: ['Crop Monitoring', 'Precision Farming', 'Yield Prediction'], roi: '275%' },
  { name: 'Real Estate', icon: '🏢', applications: ['Property Valuation', 'Market Analysis', 'Management'], roi: '210%' },
  { name: 'Media', icon: '📺', applications: ['Content Creation', 'Audience Analytics', 'Distribution'], roi: '195%' },
  { name: 'Hospitality', icon: '🏨', applications: ['Guest Experience', 'Revenue Management', 'Operations'], roi: '240%' },
  { name: 'Legal', icon: '⚖️', applications: ['Document Review', 'Case Analysis', 'Compliance'], roi: '350%' },
  { name: 'Aerospace', icon: '✈️', applications: ['Flight Optimization', 'Maintenance', 'Safety Systems'], roi: '420%' },
  { name: 'Telecommunications', icon: '📡', applications: ['Network Optimization', 'Customer Service', 'Infrastructure'], roi: '290%' },
  { name: 'Pharmaceuticals', icon: '💊', applications: ['Drug Development', 'Clinical Trials', 'Regulatory'], roi: '510%' }
];

export function UniversalIndustryGrid() {
  const [showAll, setShowAll] = useState(false);
  const displayedIndustries = showAll ? allIndustries : allIndustries.slice(0, 8);

  return (
    <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-0">
            <Globe className="w-4 h-4 mr-2" />
            Universal Business Operating System
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            ODYSSEY-1 Powers {allIndustries.length}+ Industries
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From startups to Fortune 500 companies, ODYSSEY-1 adapts to any business model, 
            any industry, any scale. The possibilities are virtually limitless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {displayedIndustries.map((industry, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">{industry.icon}</div>
                  <h3 className="font-bold text-lg">{industry.name}</h3>
                </div>
                
                <div className="space-y-2 mb-4">
                  {industry.applications.map((app, i) => (
                    <div key={i} className="text-sm text-gray-600 flex items-center">
                      <Zap className="w-3 h-3 mr-2 text-blue-500" />
                      {app}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                  <span className="font-bold text-green-700">{industry.roi} ROI</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {showAll ? 'Show Less' : `See All ${allIndustries.length}+ Industries`}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          
          <p className="mt-4 text-gray-500 text-sm">
            And countless more... ODYSSEY-1 adapts to any business vertical
          </p>
        </div>
      </div>
    </div>
  );
}