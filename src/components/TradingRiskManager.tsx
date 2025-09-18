import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Shield, Target, DollarSign } from 'lucide-react';

interface RiskSettings {
  maxPositionSize: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  dailyLossLimit: number;
  autoStopLoss: boolean;
  riskPerTrade: number;
}

export const TradingRiskManager = () => {
  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    maxPositionSize: 1000,
    stopLossPercentage: 5,
    takeProfitPercentage: 10,
    dailyLossLimit: 500,
    autoStopLoss: true,
    riskPerTrade: 2
  });

  const [currentRisk, setCurrentRisk] = useState({
    dailyPnL: -150,
    openPositions: 3,
    totalExposure: 2500,
    riskScore: 'Medium'
  });

  const updateRiskSetting = (key: keyof RiskSettings, value: number | boolean) => {
    setRiskSettings(prev => ({ ...prev, [key]: value }));
  };

  const getRiskColor = (score: string) => {
    switch (score) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6" />
        <h3 className="text-2xl font-bold">Risk Management</h3>
      </div>

      {/* Current Risk Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily P&L</p>
                <p className={`text-2xl font-bold ${currentRisk.dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${currentRisk.dailyPnL}
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Positions</p>
                <p className="text-2xl font-bold">{currentRisk.openPositions}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Exposure</p>
                <p className="text-2xl font-bold">${currentRisk.totalExposure}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <Badge className={getRiskColor(currentRisk.riskScore)}>
                  {currentRisk.riskScore}
                </Badge>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Max Position Size ($)</label>
              <Input
                type="number"
                value={riskSettings.maxPositionSize}
                onChange={(e) => updateRiskSetting('maxPositionSize', parseFloat(e.target.value))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Stop Loss (%)</label>
              <Input
                type="number"
                value={riskSettings.stopLossPercentage}
                onChange={(e) => updateRiskSetting('stopLossPercentage', parseFloat(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Take Profit (%)</label>
              <Input
                type="number"
                value={riskSettings.takeProfitPercentage}
                onChange={(e) => updateRiskSetting('takeProfitPercentage', parseFloat(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Daily Loss Limit ($)</label>
              <Input
                type="number"
                value={riskSettings.dailyLossLimit}
                onChange={(e) => updateRiskSetting('dailyLossLimit', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Stop Loss</p>
              <p className="text-sm text-muted-foreground">Automatically set stop losses on new positions</p>
            </div>
            <Switch
              checked={riskSettings.autoStopLoss}
              onCheckedChange={(checked) => updateRiskSetting('autoStopLoss', checked)}
            />
          </div>

          <Button className="w-full">Save Risk Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
};