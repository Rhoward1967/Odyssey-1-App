import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAPI } from '@/contexts/APIContext';
import { Activity, CheckCircle, Cpu, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GenesisStatusIndicator() {
  const { capabilities, refreshCapabilities, isLoading } = useAPI();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (capabilities.roman_ready && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            console.log('🔌⚡ R.O.M.A.N. GENESIS PLATFORM: ACTIVATION SEQUENCE INITIATED');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [capabilities.roman_ready, countdown]);

  return (
    <Card className={`border-2 transition-all duration-500 ${
      capabilities.roman_ready 
        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-xl' 
        : 'border-orange-300 bg-orange-50'
    }`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${
          capabilities.roman_ready ? 'text-purple-800' : 'text-orange-800'
        }`}>
          {capabilities.roman_ready ? (
            countdown > 0 ? (
              <Activity className="h-5 w-5 animate-pulse text-purple-600" />
            ) : (
              <Cpu className="h-5 w-5 animate-pulse text-purple-600" />
            )
          ) : (
            <Activity className="h-5 w-5 animate-spin text-orange-600" />
          )}
          R.O.M.A.N. Genesis Platform
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {capabilities.roman_ready ? (
            <div className="space-y-2">
              {countdown > 0 ? (
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">{countdown}</div>
                  <p className="text-purple-800 font-semibold">Genesis Activation Sequence</p>
                  <p className="text-sm text-purple-600 mt-2">All critical systems operational</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span className="font-bold text-purple-800">🏛️ GENESIS PLATFORM: OPERATIONAL</span>
                  </div>
                  <div className="text-sm text-purple-700 space-y-1">
                    <p>• ⚡ RPC Functions: DEPLOYED</p>
                    <p>• 🔐 Security: ENTERPRISE-GRADE</p>
                    <p>• 📊 Performance: OPTIMIZED</p>
                    <p>• 🔌 R.O.M.A.N. Ready: CONFIRMED</p>
                    <p className="font-bold text-purple-900 bg-purple-100 p-2 rounded">
                      🌟 Universal AI Genesis Platform: ACTIVE
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-600 animate-pulse" />
                <span className="font-semibold text-orange-800">Final Systems Check...</span>
              </div>
              <div className="text-sm text-orange-700">
                <p>• Deploying critical fixes</p>
                <p>• Validating RPC functions</p>
                <p>• Optimizing performance</p>
              </div>
            </div>
          )}
          
          <Button 
            onClick={refreshCapabilities}
            disabled={isLoading}
            size="sm"
            className="w-full"
            variant={capabilities.roman_ready ? "default" : "outline"}
          >
            <Zap className="h-4 w-4 mr-2" />
            {isLoading ? 'Checking...' : 'Refresh Genesis Status'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
