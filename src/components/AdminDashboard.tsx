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
  Clock,
  Flag,
} from 'lucide-react';
import AdminControlPanel from './AdminControlPanel';
import AutonomousSystemActivator from './AutonomousSystemActivator';
import AutonomousOdysseyCore from './AutonomousOdysseyCore';
import AutoFixSystem from './AutoFixSystem';
import { SelfEvolutionEngine } from './SelfEvolutionEngine';
import FeatureFlagsManager from './FeatureFlagsManager';
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('control');

  return (
    <div className='space-y-4 px-2 py-2 sm:px-4 sm:py-6 max-w-full overflow-x-hidden'>
      <div className='text-center space-y-2'>
        <h1 className='font-bold text-white mb-1 md:mb-2 break-words text-xl md:text-4xl'>
          <span className='block md:hidden'>Admin Center</span>
          <span className='hidden md:block'>
            ODYSSEY-1 Administrative Control Center
          </span>
        </h1>
        <p className='hidden md:block text-xl text-gray-300 break-words'>
          Autonomous AI System Management & Operations
        </p>
        <Badge className='mt-1 md:mt-2 bg-green-600/20 text-green-300 text-xs md:text-base'>
          FULLY OPERATIONAL
        </Badge>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-2 md:space-y-4'
      >
        <TabsList className='bg-slate-800/50 grid grid-cols-6 w-full text-xs md:text-sm'>
          <TabsTrigger
            value='control'
            className='flex flex-col items-center gap-0.5 py-1 md:py-2'
          >
            <Settings className='w-4 h-4' />
            <span className='md:hidden'>Ctrl</span>
            <span className='hidden md:inline'>Control Panel</span>
          </TabsTrigger>
          <TabsTrigger
            value='autonomous'
            className='flex flex-col items-center gap-0.5 py-1 md:py-2'
          >
            <Brain className='w-4 h-4' />
            <span className='md:hidden'>Auto</span>
            <span className='hidden md:inline'>Autonomous</span>
          </TabsTrigger>
          <TabsTrigger
            value='core'
            className='flex flex-col items-center gap-0.5 py-1 md:py-2'
          >
            <Zap className='w-4 h-4' />
            <span className='md:hidden'>Core</span>
            <span className='hidden md:inline'>ODYSSEY Core</span>
          </TabsTrigger>
          <TabsTrigger
            value='autofix'
            className='flex flex-col items-center gap-0.5 py-1 md:py-2'
          >
            <AlertTriangle className='w-4 h-4' />
            <span className='md:hidden'>Fix</span>
            <span className='hidden md:inline'>Auto-Fix</span>
          </TabsTrigger>
          <TabsTrigger
            value='evolution'
            className='flex flex-col items-center gap-0.5 py-1 md:py-2'
          >
            <CheckCircle className='w-4 h-4' />
            <span className='md:hidden'>Evo</span>
            <span className='hidden md:inline'>Evolution</span>
          </TabsTrigger>
          <TabsTrigger
            value='flags'
            className='flex flex-col items-center gap-0.5 py-1 md:py-2'
          >
            <Flag className='w-4 h-4' />
            <span className='md:hidden'>Flags</span>
            <span className='hidden md:inline'>Feature Flags</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='control'>
          <div className='w-full max-w-full overflow-x-auto'>
            <AdminControlPanel />
          </div>
        </TabsContent>

        <TabsContent value='autonomous'>
          <div className='w-full max-w-full overflow-x-auto'>
            <AutonomousSystemActivator />
          </div>
        </TabsContent>

        <TabsContent value='core'>
          <div className='w-full max-w-full overflow-x-auto'>
            <AutonomousOdysseyCore />
          </div>
        </TabsContent>

        <TabsContent value='autofix'>
          <div className='w-full max-w-full overflow-x-auto'>
            <AutoFixSystem />
          </div>
        </TabsContent>

        <TabsContent value='evolution'>
          <div className='w-full max-w-full overflow-x-auto'>
            <SelfEvolutionEngine />
          </div>
        </TabsContent>

        <TabsContent value='flags'>
          <div className='w-full max-w-full overflow-x-auto'>
            <FeatureFlagsManager />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
