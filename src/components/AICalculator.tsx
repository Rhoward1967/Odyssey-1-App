import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import BiddingCalculatorForm from './BiddingCalculatorForm';

interface CalculationResult {
  result: number;
  breakdown: string[];
  recommendations: string[];
}

export const AICalculator: React.FC = () => {
  const [calculationType, setCalculationType] = useState('');
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [bidResult, setBidResult] = useState<any>(null);

  const calculationTypes = {
    'roi': 'ROI Analysis',
    'breakeven': 'Break-Even Analysis',
    'valuation': 'Business Valuation',
    'cashflow': 'Cash Flow Projection',
    'pricing': 'Optimal Pricing',
    'staffing': 'Staffing Requirements',
    'bidding': 'Government Bidding Calculator'
  };

  const handleInputChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const calculateROI = () => {
    const { investment, revenue, costs } = inputs;
    if (!investment || !revenue || !costs) return {
      result: 0,
      breakdown: ['Please enter all required values'],
      recommendations: ['Complete all input fields']
    };
    
    const profit = revenue - costs;
    const roi = ((profit - investment) / investment) * 100;
    
    return {
      result: roi,
      breakdown: [
        `Initial Investment: $${investment?.toLocaleString()}`,
        `Revenue: $${revenue?.toLocaleString()}`,
        `Costs: $${costs?.toLocaleString()}`,
        `Net Profit: $${profit?.toLocaleString()}`,
        `ROI: ${(roi || 0).toFixed(2)}%`
      ],
      recommendations: [
        roi > 20 ? 'Excellent ROI - Proceed with investment' : 'Consider optimizing costs',
        'Monitor monthly performance metrics',
        'Reinvest 30% of profits for growth'
      ]
    };
  };

  const calculateBreakeven = () => {
    const { fixedCosts, variableCost, sellingPrice } = inputs;
    if (!fixedCosts || !variableCost || !sellingPrice) return {
      result: 0,
      breakdown: ['Please enter all required values'],
      recommendations: ['Complete all input fields']
    };
    
    const breakeven = fixedCosts / (sellingPrice - variableCost);
    
    return {
      result: breakeven,
      breakdown: [
        `Fixed Costs: $${fixedCosts?.toLocaleString()}`,
        `Variable Cost per Unit: $${variableCost}`,
        `Selling Price per Unit: $${sellingPrice}`,
        `Contribution Margin: $${((sellingPrice - variableCost) || 0).toFixed(2)}`,
        `Break-even Units: ${Math.ceil(breakeven || 0)}`
      ],
      recommendations: [
        `Need to sell ${Math.ceil(breakeven || 0)} units to break even`,
        'Focus on reducing variable costs',
        'Consider premium pricing strategy'
      ]
    };
  };

  const performCalculation = async () => {
    setIsCalculating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let calculationResult: CalculationResult;
    
    switch (calculationType) {
      case 'roi':
        calculationResult = calculateROI();
        break;
      case 'breakeven':
        calculationResult = calculateBreakeven();
        break;
      default:
        calculationResult = {
          result: 0,
          breakdown: ['Select a calculation type'],
          recommendations: ['Choose from available options']
        };
    }
    
    setResult(calculationResult);
    setIsCalculating(false);
  };

  const handleBidCalculation = (calculation: any) => {
    setBidResult(calculation);
    setResult(null); // Clear other results
  };

  const renderInputFields = () => {
    switch (calculationType) {
      case 'roi':
        return (
          <>
            <Input
              placeholder="Initial Investment ($)"
              onChange={(e) => handleInputChange('investment', e.target.value)}
            />
            <Input
              placeholder="Expected Revenue ($)"
              onChange={(e) => handleInputChange('revenue', e.target.value)}
            />
            <Input
              placeholder="Operating Costs ($)"
              onChange={(e) => handleInputChange('costs', e.target.value)}
            />
          </>
        );
      case 'breakeven':
        return (
          <>
            <Input
              placeholder="Fixed Costs ($)"
              onChange={(e) => handleInputChange('fixedCosts', e.target.value)}
            />
            <Input
              placeholder="Variable Cost per Unit ($)"
              onChange={(e) => handleInputChange('variableCost', e.target.value)}
            />
            <Input
              placeholder="Selling Price per Unit ($)"
              onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
            />
          </>
        );
      case 'bidding':
        return <BiddingCalculatorForm onCalculate={handleBidCalculation} />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          AI-Powered Business Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Select value={calculationType} onValueChange={setCalculationType}>
              <SelectTrigger>
                <SelectValue placeholder="Select calculation type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(calculationTypes).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {calculationType !== 'bidding' && renderInputFields()}
            
            {calculationType !== 'bidding' && (
              <Button 
                onClick={performCalculation} 
                disabled={!calculationType || isCalculating}
                className="w-full"
              >
                {isCalculating ? 'AI Processing...' : 'Calculate'}
              </Button>
            )}
            
            {calculationType === 'bidding' && renderInputFields()}
          </div>
          
          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Results</h3>
                <div className="space-y-2">
                  {result.breakdown.map((item, index) => (
                    <p key={index} className="text-sm">{item}</p>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">AI Recommendations</h3>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {bidResult && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Bid Calculation Results</h3>
                <div className="space-y-2">
                  {bidResult.breakdown.map((item: string, index: number) => (
                    <p key={index} className="text-sm">{item}</p>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Total Bid Amount</h3>
                <p className="text-2xl font-bold text-purple-600">
                  ${bidResult.totalBid?.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};