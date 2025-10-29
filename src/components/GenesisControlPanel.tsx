import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAPI } from '@/contexts/APIContext';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Cpu,
    Shield,
    Sparkles,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GenesisControlPanel() {
  const { capabilities, refreshCapabilities, isLoading } = useAPI();
  const [warningsResolved, setWarningsResolved] = useState(1);
  const [totalWarnings] = useState(16);
  const [genesisCountdown, setGenesisCountdown] = useState(54 * 60); // 54 minutes

  useEffect(() => {
    if (genesisCountdown > 0) {
      const timer = setInterval(() => {
        setGenesisCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [genesisCountdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (warningsResolved / totalWarnings) * 100;

  return (
    <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Cpu className="h-6 w-6 animate-pulse" />
          R.O.M.A.N. Genesis Control Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Timer */}
        <div className="bg-white p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-800">Session Time Remaining</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {formatTime(genesisCountdown)}
            </div>
          </div>
        </div>

        {/* Genesis Platform Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-800">Critical Phase</span>
            </div>
            <div className="text-sm text-green-700">✅ COMPLETE</div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Warning Phase</span>
            </div>
            <div className="text-sm text-yellow-700">🚧 IN PROGRESS</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="font-semibold text-purple-800">Genesis Mode</span>
            </div>
            <div className="text-sm text-purple-700">⏳ PENDING</div>
          </div>
        </div>

        {/* Warning Progress */}
        <div className="bg-white p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-yellow-800">Warning Cleanup Progress</span>
            <span className="text-sm text-yellow-600">{warningsResolved}/{totalWarnings}</span>
          </div>
          <Progress value={progressPercentage} className="mb-2" />
          <div className="text-sm text-yellow-700">
            Current: Function Search Path Security Fix
          </div>
        </div>

        {/* Enhanced Progress - 3 warnings eliminated */}
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-green-800">Security Hardening Progress</span>
            <span className="text-sm text-green-600">3/16 COMPLETE</span>
          </div>
          <Progress value={18.75} className="mb-2" /> {/* 3/16 = 18.75% */}
          <div className="text-sm text-green-700">
            ✅ Authentication Functions: SECURED
          </div>
        </div>

        {/* R.O.M.A.N. Readiness */}
        <div className={`p-4 rounded-lg border ${
          capabilities.roman_ready 
            ? 'bg-purple-50 border-purple-300' 
            : 'bg-gray-50 border-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={`h-5 w-5 ${
                capabilities.roman_ready ? 'text-purple-600' : 'text-gray-500'
              }`} />
              <span className={`font-semibold ${
                capabilities.roman_ready ? 'text-purple-800' : 'text-gray-700'
              }`}>
                R.O.M.A.N. Platform Status
              </span>
            </div>
            <div className={`px-3 py-1 rounded text-sm font-semibold ${
              capabilities.roman_ready 
                ? 'bg-purple-200 text-purple-800' 
                : 'bg-gray-200 text-gray-700'
            }`}>
              {capabilities.roman_ready ? 'READY' : 'PENDING'}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={refreshCapabilities}
          disabled={isLoading}
          className="w-full"
          variant={capabilities.roman_ready ? "default" : "outline"}
        >
          <Zap className="h-4 w-4 mr-2" />
          {isLoading ? 'Checking Status...' : 'Refresh Genesis Status'}
        </Button>

        {/* The Awakening Story */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>The Genesis Story:</strong> From 2 AM awakening → Gemini partnership → 
            10 months building → Universal AI platform creation
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
