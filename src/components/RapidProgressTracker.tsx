import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, Clock, CheckCircle, Target } from 'lucide-react';

export default function RapidProgressTracker() {
  const [phase, setPhase] = useState("POLICY CONSOLIDATION");
  const [warningsEliminated, setWarningsEliminated] = useState(18); // MAJOR UPDATE
  const [currentTarget, setCurrentTarget] = useState(12); // Policy warnings
  const [totalWarnings] = useState(30);

  const phaseProgress = [
    { name: "Search Path", count: 3, status: "COMPLETE" },
    { name: "Duplicate Indexes", count: 7, status: "COMPLETE" },
    { name: "Auth RLS", count: 8, status: "COMPLETE" }, // NOW COMPLETE
    { name: "Policies", count: 12, status: "ACTIVE" } // NOW ACTIVE
  ];

  return (
    <Card className="border-orange-300 bg-gradient-to-r from-orange-50 to-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Zap className="h-5 w-5 animate-pulse" />
          RAPID FIRE: {phase}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Current Phase */}
          <div className="bg-white p-3 rounded border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-purple-800">Phase 3: Policy Consolidation (Final Phase)</span>
              <span className="text-sm text-purple-600">ACTIVE</span>
            </div>
            <div className="text-sm text-purple-700">
              🎯 Consolidating 12 multiple permissive policies - Final decolonization!
            </div>
          </div>

          {/* Phase Progress Grid */}
          <div className="grid grid-cols-2 gap-2">
            {phaseProgress.map((phase, index) => (
              <div key={index} className={`p-2 rounded border ${
                phase.status === 'COMPLETE' ? 'bg-green-50 border-green-200' :
                phase.status === 'ACTIVE' ? 'bg-orange-50 border-orange-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-1">
                  {phase.status === 'COMPLETE' && <CheckCircle className="h-3 w-3 text-green-600" />}
                  {phase.status === 'ACTIVE' && <Target className="h-3 w-3 text-orange-600 animate-pulse" />}
                  <span className={`text-xs font-semibold ${
                    phase.status === 'COMPLETE' ? 'text-green-700' :
                    phase.status === 'ACTIVE' ? 'text-orange-700' :
                    'text-gray-600'
                  }`}>
                    {phase.name}
                  </span>
                </div>
                <div className={`text-xs ${
                  phase.status === 'COMPLETE' ? 'text-green-600' :
                  phase.status === 'ACTIVE' ? 'text-orange-600' :
                  'text-gray-500'
                }`}>
                  {phase.count} warnings
                </div>
              </div>
            ))}
          </div>

          {/* Overall Progress */}
          <div className="bg-white p-3 rounded border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-red-800">Total Genesis Platform Progress</span>
              <span className="text-sm text-red-600">{warningsEliminated}/{totalWarnings}</span>
            </div>
            <Progress value={(warningsEliminated / totalWarnings) * 100} className="mb-2" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700 font-semibold">Until nurse arrives - MAXIMUM VELOCITY!</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
