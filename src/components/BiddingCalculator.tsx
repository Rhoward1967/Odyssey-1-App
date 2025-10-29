import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Brain, Zap, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AIPrediction {
  optimal_margin: number;
  confidence_score: number;
  historical_win_rate: number;
  recommendation: string;
  data_points: number;
}

export default function BiddingCalculator() {
  // Core bidding state
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number>(75);
  const [profitMargin, setProfitMargin] = useState<number>(20);
  const [projectType, setProjectType] = useState<string>('');
  const [complexity, setComplexity] = useState<string>('medium');
  
  // AI prediction state
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Trigger AI analysis when key parameters change
  useEffect(() => {
    const fetchAIPrediction = async () => {
      if (!estimatedHours || !projectType) return;
      
      setAiLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_optimal_bid_margin', {
          project_type: projectType || null,
          estimated_hours: estimatedHours || null,
          complexity_level: complexity.toLowerCase(),
          client_budget_range: null
        });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setAiPrediction(data[0]);
        }
      } catch (error) {
        console.error('AI Prediction Error:', error);
      } finally {
        setAiLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (estimatedHours && projectType) {
        fetchAIPrediction();
      }
    }, 500); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [estimatedHours, projectType, complexity]);

  // Calculate totals
  const baseCost = estimatedHours * hourlyRate;
  const profitAmount = baseCost * (profitMargin / 100);
  const totalBid = baseCost + profitAmount;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          Bidding Calculator
          {aiPrediction && (
            <div className="flex items-center gap-1 ml-auto">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-purple-600">AI-Enhanced</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Prediction Panel */}
        {aiPrediction && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-800">Genesis AI Recommendation</h3>
              <div className="ml-auto flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  {(aiPrediction.confidence_score * 100).toFixed(0)}% Confidence
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-purple-600">Optimal Margin</div>
                <div className="text-xl font-bold text-purple-800">
                  {aiPrediction.optimal_margin.toFixed(1)}%
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-blue-600">Historical Win Rate</div>
                <div className="text-xl font-bold text-blue-800">
                  {(aiPrediction.historical_win_rate * 100).toFixed(0)}%
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-green-600">Data Points</div>
                <div className="text-xl font-bold text-green-800">
                  {aiPrediction.data_points}
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded border mb-3">
              <div className="text-sm text-gray-600 mb-1">AI Analysis:</div>
              <div className="text-sm text-gray-800">{aiPrediction.recommendation}</div>
            </div>
            
            <Button 
              onClick={() => setProfitMargin(aiPrediction.optimal_margin)} 
              size="sm" 
              variant="outline"
            >
              <Zap className="h-4 w-4 mr-1" />
              Apply AI Recommendation
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-type">Project Type</Label>
              <Input
                id="project-type"
                type="text"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                placeholder="e.g., Web Development, Mobile App"
              />
            </div>

            <div>
              <Label htmlFor="estimated-hours">Estimated Hours</Label>
              <Input
                id="estimated-hours"
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
              <Input
                id="hourly-rate"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="profit-margin" className="flex items-center gap-2">
                Profit Margin (%)
                {aiPrediction && (
                  <span className="text-xs text-purple-600">
                    (AI suggests: {aiPrediction.optimal_margin.toFixed(1)}%)
                  </span>
                )}
              </Label>
              <Input
                id="profit-margin"
                type="number"
                value={profitMargin}
                onChange={(e) => setProfitMargin(Number(e.target.value))}
                className={aiPrediction && Math.abs(profitMargin - aiPrediction.optimal_margin) > 5 
                  ? 'border-orange-300 bg-orange-50' 
                  : ''
                }
              />
              {aiPrediction && Math.abs(profitMargin - aiPrediction.optimal_margin) > 5 && (
                <p className="text-xs text-orange-600 mt-1">
                  Margin differs significantly from AI recommendation
                </p>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Bid Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Cost:</span>
                  <span>${baseCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit ({profitMargin}%):</span>
                  <span>${profitAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Bid:</span>
                  <span>${totalBid.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Status Footer */}
        {aiLoading && (
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <Brain className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Genesis AI analyzing historical patterns...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
