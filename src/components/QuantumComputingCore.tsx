import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Cpu, Zap, AlertTriangle, Clock } from 'lucide-react';

export default function QuantumComputingCore() {
  const [researchProgress, setResearchProgress] = useState(15);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate slow research progress
      setResearchProgress(prev => Math.min(prev + 0.1, 25));
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-slate-800/50 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Cpu className="h-6 w-6 text-purple-400" />
            Quantum Computing Research
          </div>
          <Badge className="bg-blue-600/20 text-blue-300">
            <Clock className="w-4 h-4 mr-1" />
            R&D PHASE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-300 font-medium">Research & Development Phase</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Development Progress</span>
            <span className="text-purple-300">{researchProgress.toFixed(1)}%</span>
          </div>
          <Progress value={researchProgress} className="h-2" />
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Target Applications:</span>
            <span className="text-white">Cryptographic Security</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Research Focus:</span>
            <span className="text-white">Error Correction</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Timeline:</span>
            <span className="text-white">5-Year Development</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
