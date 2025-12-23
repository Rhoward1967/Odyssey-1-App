import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabaseClient';
import { BarChart3, TrendingDown, Lightbulb, Target } from 'lucide-react';

interface ServiceAnalysis {
  service: string;
  currentCost: number;
  projectedCost: number;
  optimizationPotential: number;
  recommendations: string[];
  usagePattern: string;
  efficiency: number;
}

export default function ServiceCostAnalyzer() {
  const [selectedService, setSelectedService] = useState('openai');
  const [analysis, setAnalysis] = useState<ServiceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const services = [
    { id: 'openai', name: 'OpenAI API', icon: '🤖' },
    { id: 'anthropic', name: 'Anthropic Claude', icon: '🧠' },
    { id: 'stripe', name: 'Stripe Payments', icon: '💳' },
    { id: 'twilio', name: 'Twilio SMS/Voice', icon: '📱' },
    { id: 'supabase', name: 'Supabase Database', icon: '🗄️' },
    { id: 'vercel', name: 'Vercel Hosting', icon: '▲' }
  ];

  const analyzeService = async (serviceId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('comprehensive-cost-tracker', {
        body: { service: serviceId, action: 'analyze' }
      });

      if (error) throw error;

      // Generate analysis based on service type
      const mockAnalysis: ServiceAnalysis = {
        service: serviceId,
        currentCost: Math.random() * 100 + 20,
        projectedCost: Math.random() * 150 + 30,
        optimizationPotential: Math.random() * 30 + 10,
        recommendations: getRecommendations(serviceId),
        usagePattern: getUsagePattern(serviceId),
        efficiency: Math.random() * 40 + 60
      };

      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Error analyzing service:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = (service: string): string[] => {
    const recommendations = {
      openai: [
        'Use GPT-3.5 for simple tasks instead of GPT-4',
        'Implement response caching for repeated queries',
        'Optimize prompt length to reduce token usage',
        'Set up usage alerts at $50 threshold'
      ],
      anthropic: [
        'Batch similar requests to reduce API calls',
        'Use Claude Instant for faster, cheaper responses',
        'Implement conversation memory to avoid context repetition'
      ],
      stripe: [
        'Negotiate volume discounts for high transaction counts',
        'Consider ACH payments for large transactions',
        'Implement subscription billing to reduce per-transaction fees'
      ],
      twilio: [
        'Use SMS instead of voice calls where possible',
        'Implement message templates to reduce costs',
        'Set up geographic routing for international messages'
      ],
      supabase: [
        'Optimize database queries to reduce compute usage',
        'Implement proper indexing for faster queries',
        'Use edge functions instead of client-side processing'
      ],
      vercel: [
        'Optimize build times to reduce compute costs',
        'Use static generation where possible',
        'Implement proper caching strategies'
      ]
    };

    return recommendations[service as keyof typeof recommendations] || [];
  };

  const getUsagePattern = (service: string): string => {
    const patterns = {
      openai: 'Peak usage during business hours (9AM-5PM EST)',
      anthropic: 'Steady usage throughout the day',
      stripe: 'Higher activity on weekends and evenings',
      twilio: 'Burst usage during campaign periods',
      supabase: 'Consistent load with spikes during user onboarding',
      vercel: 'Traffic peaks align with marketing campaigns'
    };

    return patterns[service as keyof typeof patterns] || 'Usage pattern analysis pending';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Service Cost Analyzer</h2>
        <p className="text-muted-foreground">Deep dive into individual service costs and optimization opportunities</p>
      </div>

      <Tabs value={selectedService} onValueChange={setSelectedService}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-6">
          {services.map(service => (
            <TabsTrigger key={service.id} value={service.id} className="text-xs">
              <span className="mr-1">{service.icon}</span>
              {service.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {services.map(service => (
          <TabsContent key={service.id} value={service.id}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-2xl">{service.icon}</span>
                  {service.name}
                </h3>
                <Button onClick={() => analyzeService(service.id)} disabled={loading}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {loading ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>

              {analysis && analysis.service === service.id && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Current Monthly Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(analysis.currentCost)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Projected Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(analysis.projectedCost)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Savings Potential</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(analysis.optimizationPotential)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Efficiency Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Math.round(analysis.efficiency)}%
                      </div>
                      <Badge variant={analysis.efficiency > 80 ? 'default' : 'destructive'}>
                        {analysis.efficiency > 80 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              )}

              {analysis && analysis.service === service.id && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Optimization Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Target className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5" />
                        Usage Pattern
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{analysis.usagePattern}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Peak Hours</span>
                          <span className="font-medium">9AM - 5PM EST</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Average Daily Requests</span>
                          <span className="font-medium">1,247</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Cost per Request</span>
                          <span className="font-medium">$0.0023</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}