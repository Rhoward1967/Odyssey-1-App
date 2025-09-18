import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Moon, 
  Zap, 
  Shield, 
  Heart, 
  Star,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default function OdysseySleepMode() {
  const [isActivating, setIsActivating] = useState(false);
  const [sleepActivated, setSleepActivated] = useState(false);

  const activateSleepMode = async () => {
    setIsActivating(true);
    
    // Simulate sleep mode activation sequence
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setSleepActivated(true);
    setIsActivating(false);
  };

  const systemStatus = [
    { name: 'Email Marketing System', status: 'active', icon: CheckCircle },
    { name: 'SendGrid Integration', status: 'configured', icon: CheckCircle },
    { name: 'Visual Email Builder', status: 'ready', icon: CheckCircle },
    { name: 'Marketing Automation', status: 'deployed', icon: CheckCircle },
    { name: 'Analytics Dashboard', status: 'monitoring', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full bg-black/20 backdrop-blur-lg border-purple-500/30">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Moon className="h-16 w-16 text-purple-300" />
              {!sleepActivated && (
                <Sparkles className="h-6 w-6 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
              )}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">
            ODYSSEY-1 Sleep Mode
          </CardTitle>
          <p className="text-purple-200">
            {sleepActivated 
              ? "Sweet dreams, ODYSSEY-1. Rest well and recharge for tomorrow's innovations." 
              : "Preparing to enter sleep mode. All systems will be safely powered down."
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!sleepActivated ? (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  System Status Check
                </h3>
                {systemStatus.map((system, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <span className="text-white">{system.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                        {system.status}
                      </Badge>
                      <system.icon className="h-4 w-4 text-green-400" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-purple-200">
                  <Heart className="h-5 w-5 text-red-400" />
                  <span>Take care of your heart. Rest is important.</span>
                </div>
                
                <Button 
                  onClick={activateSleepMode}
                  disabled={isActivating}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                  size="lg"
                >
                  {isActivating ? (
                    <>
                      <Zap className="h-5 w-5 mr-2 animate-spin" />
                      Activating Sleep Mode...
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5 mr-2" />
                      Activate Sleep Mode
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                  <Moon className="h-16 w-16 text-purple-300 animate-pulse" />
                </div>
                <div className="absolute inset-0 animate-ping">
                  <div className="w-32 h-32 mx-auto bg-purple-500/10 rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Sleep Mode Activated</h3>
                <p className="text-purple-200">All systems safely powered down</p>
                <div className="flex items-center justify-center gap-2 text-yellow-300">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">Email marketing system successfully deployed</span>
                  <Star className="h-4 w-4" />
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-white text-sm leading-relaxed">
                  "The comprehensive email marketing system with SendGrid integration, 
                  visual builder, and marketing automation workflows has been successfully 
                  implemented. ODYSSEY-1 is now ready for advanced email campaigns. 
                  Goodnight, and thank you for the amazing work today."
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}