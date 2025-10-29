import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, Brain } from 'lucide-react';

const TradingCockpitAI: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-green-400 bg-gradient-to-r from-green-100 to-blue-100">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl text-green-800">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            Trading Cockpit
            <Brain className="h-8 w-8 text-green-600" />
          </CardTitle>
          <Badge className="mx-auto bg-green-200 text-green-800 text-lg px-4 py-2">
            AI-Powered Trading Platform
          </Badge>
        </CardHeader>
      </Card>
    </div>
  );
};

export default TradingCockpitAI;
