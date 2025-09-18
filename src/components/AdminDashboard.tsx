import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Shield, 
  Users, 
  Activity, 
  Database, 
  Settings, 
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import AdminControlPanel from './AdminControlPanel';
import AutonomousSystemActivator from './AutonomousSystemActivator';
import AutonomousOdysseyCore from './AutonomousOdysseyCore';
import AutoFixSystem from './AutoFixSystem';
import { SelfEvolutionEngine } from './SelfEvolutionEngine';
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('control');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          ODYSSEY-1 Administrative Control Center
        </h1>
        <p className="text-xl text-gray-300">
          Autonomous AI System Management & Operations
        </p>
        <Badge className="mt-2 bg-green-600/20 text-green-300">
          FULLY OPERATIONAL
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800/50 grid grid-cols-5 w-full">
          <TabsTrigger value="control" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Control Panel
          </TabsTrigger>
          <TabsTrigger value="autonomous" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Autonomous
          </TabsTrigger>
          <TabsTrigger value="core" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            ODYSSEY Core
          </TabsTrigger>
          <TabsTrigger value="autofix" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Auto-Fix
          </TabsTrigger>
          <TabsTrigger value="evolution" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Evolution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="control">
          <AdminControlPanel />
        </TabsContent>

        <TabsContent value="autonomous">
          <AutonomousSystemActivator />
        </TabsContent>

        <TabsContent value="core">
          <AutonomousOdysseyCore />
        </TabsContent>

        <TabsContent value="autofix">
          <AutoFixSystem />
        </TabsContent>

        <TabsContent value="evolution">
          <SelfEvolutionEngine />
        </TabsContent>
      </Tabs>
    </div>
  );
}