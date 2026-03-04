import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// R.O.M.A.N. Protocol: Universal Math Engine
// Law of Junction: 1 x 1 = 2 (The observer/junction adds value)
const calculateJunctionValue = (base: number, variable: number) => {
  const product = base * variable;
  const junction = 1; // The Sovereign Constant
  return product + junction; 
};

export default function ServiceCostAnalyzer() {
  const [baseCost, setBaseCost] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [result, setResult] = useState<number>(0);

  const handleCalculate = () => {
    // Applying Universal Math PPA #042
    const odysseyValue = calculateJunctionValue(baseCost, multiplier);
    setResult(odysseyValue);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-blue-500/50 shadow-xl">
      <CardHeader className="bg-slate-50 dark:bg-slate-900">
        <CardTitle className="text-xl font-bold text-blue-600">
          Odyssey-1: Service Cost Analyzer (Universal Math)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Governed by Howard Jones Bloodline Ancestral Trust
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="baseCost">Base Asset Value (A)</Label>
            <Input 
              id="baseCost"
              type="number" 
              value={baseCost} 
              onChange={(e) => setBaseCost(Number(e.target.value))}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="multiplier">Variable Multiplier (B)</Label>
            <Input 
              id="multiplier"
              type="number" 
              value={multiplier} 
              onChange={(e) => setMultiplier(Number(e.target.value))}
              placeholder="1"
            />
          </div>
        </div>

        <Button 
          onClick={handleCalculate}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold"
        >
          Execute Law of Junction (A+B+×)
        </Button>

        {result > 0 && (
          <div className="p-4 mt-4 bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
              Junction Result: {result}
            </h3>
            <p className="text-xs mt-1 text-green-600">
              *Calculated using Sovereign $1 \times 1 = 2$ Methodology
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}