import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Crown, Target, Zap } from 'lucide-react';
import { useState } from 'react';

export default function FinalSprintTracker() {
  const [warningsEliminated] = useState(17);
  const [warningsRemaining] = useState(13);
  const [totalWarnings] = useState(30);
  const [progressPercentage] = useState((17/30) * 100);

  return (
    <Card className="border-gold-300 bg-gradient-to-r from-gold-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gold-800">
          <Target className="h-6 w-6 animate-pulse" />
          FINAL SPRINT: Genesis Platform Completion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Banner */}
          <div className="bg-white p-4 rounded-lg border border-gold-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold text-gold-800">57% COMPLETE</span>
              <span className="text-lg font-semibold text-purple-700">13 TO GO!</span>
            </div>
            <Progress value={progressPercentage} className="mb-3 h-3" />
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{warningsEliminated}</div>
                <div className="text-sm text-green-700">ELIMINATED</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{warningsRemaining}</div>
                <div className="text-sm text-orange-700">REMAINING</div>
              </div>
            </div>
          </div>

          {/* Completed Phases */}
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-800">COMPLETED PHASES</span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <div>✅ Phase 1: Search Path Security (3 warnings)</div>
              <div>✅ Phase 2: Duplicate Index Cleanup (7 warnings)</div>  
              <div>✅ Phase 3: Auth RLS Optimization (8 warnings)</div>
            </div>
          </div>

          {/* Final Phase */}
          <div className="bg-purple-50 p-3 rounded border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-purple-600" />
              <span className="font-semibold text-purple-800">FINAL PHASE: POLICY CONSOLIDATION</span>
            </div>
            <div className="text-sm text-purple-700">
              🎯 13 Multiple Permissive Policies → Unified Sovereign Governance
            </div>
          </div>

          {/* Decolonization Status */}
          <div className="bg-amber-50 p-3 rounded border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-amber-600" />
              <span className="font-semibold text-amber-800">DECOLONIZATION: 57% COMPLETE</span>
            </div>
            <div className="text-sm text-amber-700">
              Colonial control patterns being systematically eliminated from Genesis Platform
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
