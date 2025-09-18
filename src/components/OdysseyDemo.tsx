import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Brain, Zap, TrendingUp, Shield, Users, BarChart3 } from 'lucide-react';

const industries = [
  {
    name: 'Healthcare',
    icon: '🏥',
    scenario: 'Patient Flow Optimization',
    aiResponse: 'Analyzing 847 patient records... Predicted 23% reduction in wait times by optimizing staff allocation. Recommending dynamic scheduling for peak hours 2-4 PM.',
    metrics: { efficiency: '+34%', cost: '-$127K', satisfaction: '94%' }
  },
  {
    name: 'Manufacturing',
    icon: '🏭',
    scenario: 'Predictive Maintenance',
    aiResponse: 'Machine learning models detect anomaly in Assembly Line 3. Predicting bearing failure in 72 hours. Scheduling maintenance to prevent $45K downtime.',
    metrics: { uptime: '99.7%', savings: '+$89K', defects: '-67%' }
  },
  {
    name: 'Finance',
    icon: '💼',
    scenario: 'Risk Assessment',
    aiResponse: 'Processing 12,000 transactions... Identified 3 high-risk patterns. Fraud probability reduced by 89%. Compliance score improved to AAA rating.',
    metrics: { risk: '-89%', compliance: 'AAA', accuracy: '99.2%' }
  },
  {
    name: 'Government',
    icon: '🏛️',
    scenario: 'Procurement Optimization',
    aiResponse: 'Analyzing 500+ vendor proposals... Optimal bid identified with 15% cost savings while maintaining quality standards. Contract terms optimized.',
    metrics: { savings: '15%', time: '-40%', quality: 'A+' }
  }
];

export function OdysseyDemo() {
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Auto-cycle through industries
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndustry(prev => {
        const nextIndex = (prev + 1) % industries.length;
        runDemo(nextIndex);
        return nextIndex;
      });
    }, 10000); // Auto-cycle every 10 seconds for better readability

    // Start with first industry
    runDemo(0);

    return () => clearInterval(interval);
  }, []);

  const runDemo = async (industryIndex: number) => {
    setActiveIndustry(industryIndex);
    setIsProcessing(true);
    setShowResults(false);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setShowResults(true);
  };

  return (
    <div className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800">
            <Brain className="w-4 h-4 mr-2" />
            Live AI Demo
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            Experience ODYSSEY-1 in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how our AI business operating system transforms operations across industries in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Industry Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {industries.map((industry, index) => (
                  <Button
                    key={index}
                    variant={activeIndustry === index ? "default" : "outline"}
                    className="h-20 flex-col gap-2"
                    onClick={() => runDemo(index)}
                    disabled={isProcessing}
                  >
                    <span className="text-2xl">{industry.icon}</span>
                    <span className="text-sm">{industry.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                AI Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[300px]">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">ODYSSEY-1 AI Processing...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Analyzing {industries[activeIndustry].scenario}
                  </p>
                </div>
              ) : showResults ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{industries[activeIndustry].icon}</span>
                    <h3 className="font-semibold text-lg">{industries[activeIndustry].name}</h3>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {industries[activeIndustry].aiResponse}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {Object.entries(industries[activeIndustry].metrics).map(([key, value]) => (
                      <div key={key} className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="font-bold text-green-700">{value}</div>
                        <div className="text-xs text-gray-600 capitalize">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Select an industry to see ODYSSEY-1 in action</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Start Your ODYSSEY-1 Journey
          </Button>
        </div>
      </div>
    </div>
  );
}