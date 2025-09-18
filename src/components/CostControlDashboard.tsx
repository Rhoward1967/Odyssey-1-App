import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { openAIService } from '../services/openai';

export default function CostControlDashboard() {
  const [usage, setUsage] = useState(openAIService.getUsage());
  const [emergencyStop, setEmergencyStop] = useState(false);
  const [autoStop, setAutoStop] = useState(localStorage.getItem('auto_stop') === 'true');
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentUsage = openAIService.getUsage();
      setUsage(currentUsage);
      checkAlerts(currentUsage);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const checkAlerts = (currentUsage: any) => {
    const newAlerts: string[] = [];
    const config = openAIService.getConfig();

    if (currentUsage.dailySpent >= config.dailyLimit * 0.9) {
      newAlerts.push('⚠️ 90% of daily budget reached!');
    }

    if (currentUsage.requestsToday >= config.requestLimit * 0.9) {
      newAlerts.push('⚠️ 90% of daily requests reached!');
    }

    if (currentUsage.dailySpent >= config.dailyLimit) {
      newAlerts.push('🚨 Daily budget limit exceeded!');
      if (autoStop) {
        setEmergencyStop(true);
      }
    }

    setAlerts(newAlerts);
  };

  const handleEmergencyStop = () => {
    setEmergencyStop(!emergencyStop);
    localStorage.setItem('emergency_stop', emergencyStop ? 'false' : 'true');
  };

  const handleAutoStop = (enabled: boolean) => {
    setAutoStop(enabled);
    localStorage.setItem('auto_stop', enabled ? 'true' : 'false');
  };

  const resetUsage = () => {
    if (confirm('Are you sure you want to reset today\'s usage statistics?')) {
      localStorage.removeItem('openai_usage');
      setUsage(openAIService.getUsage());
    }
  };

  const getStatusColor = () => {
    if (emergencyStop) return 'bg-red-500';
    if (usage.dailySpent >= openAIService.getConfig().dailyLimit * 0.9) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            Cost Control Dashboard
            {emergencyStop && <Badge variant="destructive">STOPPED</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${usage.dailySpent.toFixed(4)}
              </div>
              <div className="text-sm text-gray-500">Spent Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${usage.remainingBudget.toFixed(4)}
              </div>
              <div className="text-sm text-gray-500">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {usage.requestsToday}
              </div>
              <div className="text-sm text-gray-500">Requests</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="emergency-stop"
                checked={emergencyStop}
                onCheckedChange={handleEmergencyStop}
              />
              <Label htmlFor="emergency-stop">Emergency Stop</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-stop"
                checked={autoStop}
                onCheckedChange={handleAutoStop}
              />
              <Label htmlFor="auto-stop">Auto-Stop at Limit</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={resetUsage} variant="outline" size="sm">
              Reset Usage
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.map((alert, index) => (
              <Alert key={index} className="mb-2">
                <AlertDescription>{alert}</AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cost Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Use GPT-3.5-turbo for basic tasks (20x cheaper than GPT-4)</p>
          <p>• Keep conversations short to reduce token usage</p>
          <p>• Set lower daily limits during testing</p>
          <p>• Enable auto-stop to prevent budget overruns</p>
          <p>• Monitor usage regularly throughout the day</p>
        </CardContent>
      </Card>
    </div>
  );
}