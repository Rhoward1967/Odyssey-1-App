import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Moon, 
  Zap, 
  Brain, 
  Activity, 
  Clock,
  Battery,
  TrendingDown,
  Eye,
  Settings
} from 'lucide-react';

export default function IntelligentSleepMode() {
  const [sleepMode, setSleepMode] = useState(false);
  const [learningMode, setLearningMode] = useState(true);
  const [usageReduction, setUsageReduction] = useState(75);
  const [currentActivity, setCurrentActivity] = useState(12);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate activity monitoring
      const hour = new Date().getHours();
      const baseActivity = hour >= 9 && hour <= 17 ? 85 : 15;
      setCurrentActivity(baseActivity + Math.random() * 20);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const sleepSettings = [
    {
      name: 'Auto Sleep Trigger',
      description: 'Activity < 20% for 30 minutes',
      enabled: true
    },
    {
      name: 'Learning During Sleep',
      description: 'Process data at 25% capacity',
      enabled: learningMode
    },
    {
      name: 'Emergency Wake',
      description: 'Auto-wake for critical alerts',
      enabled: true
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Moon className="h-6 w-6 text-blue-400" />
            Intelligent Sleep Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm">System Status</span>
                <Badge className={sleepMode ? "bg-blue-500/20 text-blue-300" : "bg-green-500/20 text-green-300"}>
                  {sleepMode ? "SLEEPING" : "ACTIVE"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {sleepMode ? (
                  <Moon className="h-5 w-5 text-blue-400" />
                ) : (
                  <Activity className="h-5 w-5 text-green-400" />
                )}
                <span className="text-white font-medium">
                  {sleepMode ? "Deep Sleep Mode" : "Full Operation"}
                </span>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm">Current Activity</span>
                <TrendingDown className="h-4 w-4 text-orange-400" />
              </div>
              <div className="flex items-center gap-2">
                <Battery className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-medium">{currentActivity.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Sleep Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Manual Sleep Mode</h3>
                <p className="text-gray-400 text-sm">Override automatic sleep detection</p>
              </div>
              <Switch 
                checked={sleepMode} 
                onCheckedChange={setSleepMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Learning During Sleep</h3>
                <p className="text-gray-400 text-sm">Continue processing at reduced capacity</p>
              </div>
              <Switch 
                checked={learningMode} 
                onCheckedChange={setLearningMode}
              />
            </div>
          </div>

          {/* Sleep Settings */}
          <div className="space-y-3">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Sleep Configuration
            </h3>
            {sleepSettings.map((setting, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <span className="text-white text-sm font-medium">{setting.name}</span>
                  <p className="text-gray-400 text-xs">{setting.description}</p>
                </div>
                <Badge variant={setting.enabled ? "default" : "secondary"}>
                  {setting.enabled ? "ON" : "OFF"}
                </Badge>
              </div>
            ))}
          </div>

          {/* Usage Reduction Display */}
          {sleepMode && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-blue-400" />
                <span className="text-white font-medium">Sleep Mode Active</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Usage Reduction:</span>
                  <span className="text-blue-300 ml-2 font-medium">{usageReduction}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Learning Rate:</span>
                  <span className="text-blue-300 ml-2 font-medium">25%</span>
                </div>
              </div>
              <p className="text-blue-200 text-xs mt-2">
                {learningMode ? 
                  "Continuing background learning with minimal resource usage" :
                  "All learning suspended - pure sleep mode active"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}