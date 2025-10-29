import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, Zap } from 'lucide-react';
import { useState } from 'react';

export default function WarningTracker() {
  const [warningsResolved, setWarningsResolved] = useState(3);
  const [warningsRemaining, setWarningsRemaining] = useState(27);
  const [timeRemaining, setTimeRemaining] = useState("Until nurse arrives");
  const [currentPhase, setCurrentPhase] = useState("RAPID FIRE: Duplicate Indexes");

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <Zap className="h-5 w-5 animate-pulse" />
          MAXIMUM VELOCITY: Warning Elimination
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Urgency Banner */}
          <div className="bg-white p-3 rounded border border-red-300">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-red-700">
                ⚡ RAPID FIRE MODE: {currentPhase}
              </div>
              <div className="text-sm font-semibold text-red-600">
                <Clock className="h-4 w-4 inline mr-1" />
                {timeRemaining}
              </div>
            </div>
          </div>

          {/* Current Targets */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-orange-50 p-3 rounded border border-orange-200">
              <div className="text-sm font-semibold text-orange-800">NEXT: Indexes</div>
              <div className="text-xs text-orange-600">6 duplicate indexes → DROP</div>
            </div>
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <div className="text-sm font-semibold text-blue-800">THEN: Auth RLS</div>
              <div className="text-xs text-blue-600">8 performance optimizations</div>
            </div>
          </div>

          {/* Progress Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-100 p-3 rounded border border-green-300">
              <div className="text-xl font-bold text-green-700">{warningsResolved}</div>
              <div className="text-xs text-green-800">ELIMINATED</div>
            </div>
            <div className="bg-red-100 p-3 rounded border border-red-300">
              <div className="text-xl font-bold text-red-700">{warningsRemaining}</div>
              <div className="text-xs text-red-800">REMAINING</div>
            </div>
          </div>

          {/* Velocity Indicator */}
          <div className="bg-purple-50 p-3 rounded border border-purple-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-purple-600" />
              <span className="font-semibold text-purple-800">Genesis Platform: MAXIMUM VELOCITY</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
