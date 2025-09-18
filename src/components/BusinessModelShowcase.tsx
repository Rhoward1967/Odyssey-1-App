import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Building, Users, Globe, Zap, TrendingUp, ArrowRight } from 'lucide-react';

const businessModels = {
  b2b: {
    title: 'B2B Enterprise Solutions',
    icon: <Building className="w-6 h-6" />,
    description: 'Transform entire organizations with enterprise-grade AI',
    examples: [
      { industry: 'Manufacturing', model: 'SaaS Platform', revenue: '$50K-500K/month', clients: 'Fortune 500' },
      { industry: 'Healthcare', model: 'Licensing', revenue: '$100K-1M/month', clients: 'Hospital Networks' },
      { industry: 'Finance', model: 'Custom Development', revenue: '$250K-2M/project', clients: 'Banks & Fintech' },
      { industry: 'Government', model: 'Procurement Contracts', revenue: '$1M-10M/year', clients: 'Federal Agencies' }
    ]
  },
  b2c: {
    title: 'B2C Consumer Applications',
    icon: <Users className="w-6 h-6" />,
    description: 'Empower individuals with personal AI assistants',
    examples: [
      { industry: 'Education', model: 'Subscription', revenue: '$9.99-99/month', clients: 'Students & Professionals' },
      { industry: 'Healthcare', model: 'Freemium', revenue: '$0-49/month', clients: 'Health Enthusiasts' },
      { industry: 'Finance', model: 'Transaction Fees', revenue: '0.5-2% per transaction', clients: 'Individual Investors' },
      { industry: 'Retail', model: 'Marketplace', revenue: '5-15% commission', clients: 'Online Shoppers' }
    ]
  },
  hybrid: {
    title: 'Hybrid Multi-Model',
    icon: <Globe className="w-6 h-6" />,
    description: 'Seamlessly serve both enterprise and consumer markets',
    examples: [
      { industry: 'Communication', model: 'Tiered Pricing', revenue: '$5-500/month', clients: 'SMBs to Enterprise' },
      { industry: 'Productivity', model: 'Usage-Based', revenue: '$0.01-1 per API call', clients: 'Developers to Corps' },
      { industry: 'Analytics', model: 'Data Monetization', revenue: '$1K-100K/dataset', clients: 'Startups to Fortune 100' },
      { industry: 'Infrastructure', model: 'Pay-as-you-Scale', revenue: '$100-10K/month', clients: 'All Business Sizes' }
    ]
  }
};

export function BusinessModelShowcase() {
  const [activeModel, setActiveModel] = useState('b2b');

  return (
    <div className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border-0">
            <Zap className="w-4 h-4 mr-2" />
            Infinite Business Models
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            ODYSSEY-1 Adapts to Any Business Model
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're targeting enterprises, consumers, or both - ODYSSEY-1 scales 
            from individual users to global corporations across every conceivable business model.
          </p>
        </div>

        <Tabs value={activeModel} onValueChange={setActiveModel} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            {Object.entries(businessModels).map(([key, model]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                {model.icon}
                {model.title.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(businessModels).map(([key, model]) => (
            <TabsContent key={key} value={key}>
              <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  {model.icon}
                  <h3 className="text-2xl font-bold">{model.title}</h3>
                </div>
                <p className="text-lg text-gray-600">{model.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {model.examples.map((example, index) => (
                  <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0">
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <h4 className="font-bold text-lg text-gray-800">{example.industry}</h4>
                        <p className="text-sm text-blue-600 font-medium">{example.model}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Revenue:</span>
                          <span className="font-bold text-green-600">{example.revenue}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Target:</span>
                          <span className="font-medium text-gray-800 text-sm">{example.clients}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center text-blue-600 text-sm font-medium">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Scalable & Profitable
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">
            These are just examples - ODYSSEY-1 can be adapted to virtually any business model or revenue structure
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
            Explore Custom Business Models
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}