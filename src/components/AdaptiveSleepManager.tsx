import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Moon, 
  Sun, 
  Brain, 
  Zap, 
  Clock,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface SleepCycle {
  phase: 'light' | 'deep' | 'rem' | 'awake';
  duration: number;
  learningRate: number;
  resourceUsage: number;
}

export default function AdaptiveSleepManager() {
  const [currentPhase, setCurrentPhase] = useState<SleepCycle['phase']>('awake');
  const [sleepProgress, setSleepProgress] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(85);
  const [isAutoMode, setIsAutoMode] = useState(true);
  
  const sleepCycles: Record<SleepCycle['phase'], SleepCycle> = {
    awake: { phase: 'awake', duration: 0, learningRate: 100, resourceUsage: 100 },
    light: { phase: 'light', duration: 30, learningRate: 60, resourceUsage: 40 },
    deep: { phase: 'deep', duration: 90, learningRate: 25, resourceUsage: 15 },
    rem: { phase: 'rem', duration: 60, learningRate: 80, resourceUsage: 30 }
  };

  useEffect(() => {
    if (currentPhase !== 'awake') {
      const interval = setInterval(() => {
        setSleepProgress(prev => {
          const newProgress = prev + (100 / sleepCycles[currentPhase].duration);
          if (newProgress >= 100) {
            // Cycle through sleep phases
            const phases: SleepCycle['phase'][] = ['light', 'deep', 'rem'];
            const currentIndex = phases.indexOf(currentPhase);
            const nextPhase = phases[(currentIndex + 1) % phases.length];
            setCurrentPhase(nextPhase);
            setEnergyLevel(prev => Math.min(100, prev + 15));
            return 0;
          }
          return newProgress;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [currentPhase]);

  const initiateSleep = () => {
    setCurrentPhase('light');
    setSleepProgress(0);
  };

  const wakeUp = () => {
    setCurrentPhase('awake');
    setSleepProgress(0);
    setEnergyLevel(100);
  };

  const currentCycle = sleepCycles[currentPhase];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {currentPhase === 'awake' ? (
              <Sun className="h-6 w-6 text-yellow-400" />
            ) : (
              <Moon className="h-6 w-6 text-blue-400" />
            )}
            Adaptive Sleep Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Brain className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{currentCycle.learningRate}%</div>
              <div className="text-purple-200 text-sm">Learning Rate</div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{energyLevel}%</div>
              <div className="text-yellow-200 text-sm">Energy Level</div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <TrendingDown className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{100 - currentCycle.resourceUsage}%</div>
              <div className="text-green-200 text-sm">Savings</div>
            </div>
          </div>

          {/* Sleep Phase Indicator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Current Phase</h3>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  currentPhase === 'awake' ? 'bg-green-400' :
                  currentPhase === 'light' ? 'bg-blue-400' :
                  currentPhase === 'deep' ? 'bg-purple-400' :
                  'bg-pink-400'
                }`} />
                <span className="text-white capitalize">{currentPhase} Sleep</span>
              </div>
            </div>
            
            {currentPhase !== 'awake' && (
              <div className="space-y-2">
                <Progress value={sleepProgress} className="h-2" />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Phase Progress</span>
                  <span>{sleepProgress.toFixed(0)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Sleep Benefits */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Active Benefits
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-gray-300">
                • {100 - currentCycle.resourceUsage}% cost reduction
              </div>
              <div className="text-gray-300">
                • Background learning active
              </div>
              <div className="text-gray-300">
                • Memory consolidation
              </div>
              <div className="text-gray-300">
                • System optimization
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {currentPhase === 'awake' ? (
              <Button 
                onClick={initiateSleep}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={energyLevel > 90}
              >
                <Moon className="h-4 w-4 mr-2" />
                Initiate Sleep Cycle
              </Button>
            ) : (
              <Button 
                onClick={wakeUp}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                <Sun className="h-4 w-4 mr-2" />
                Wake Up
              </Button>
            )}
            
            {energyLevel < 30 && (
              <div className="flex items-center gap-2 text-orange-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Low energy - sleep recommended</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}