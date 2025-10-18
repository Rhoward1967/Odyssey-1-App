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
  FileText,
} from 'lucide-react';
import AdminControlPanel from './AdminControlPanel';
import AutonomousSystemActivator from './AutonomousSystemActivator';
import AutonomousOdysseyCore from './AutonomousOdysseyCore';
import AutoFixSystem from './AutoFixSystem';
import { SelfEvolutionEngine } from './SelfEvolutionEngine';
import FeatureFlagsManager from './FeatureFlagsManager';
import EmployeeManagement from './EmployeeManagement';
import CompanyHandbook from './CompanyHandbook';
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
        {/* Mobile: Vertical Stack - Compact */}
        <div className='block md:hidden'>
          <TabsList className='bg-blue-900/30 flex flex-col gap-1 h-auto p-2 border border-blue-500/30 w-fit items-center'>
            <TabsTrigger value='control' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'>
              <Settings className='w-4 h-4' />
              <span className='text-sm'>Control</span>
            </TabsTrigger>
            <TabsTrigger value='autonomous' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'>
              <Brain className='w-4 h-4' />
              <span className='text-sm'>Autonomous</span>
            </TabsTrigger>
            <TabsTrigger value='core' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'>
              <Zap className='w-4 h-4' />
              <span className='text-sm'>Core</span>
            </TabsTrigger>
            <TabsTrigger value='autofix' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'>
              <AlertTriangle className='w-4 h-4' />
              <span className='text-sm'>Auto-Fix</span>
            </TabsTrigger>
            <TabsTrigger value='evolution' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'>
              <CheckCircle className='w-4 h-4' />
              <span className='text-sm'>Evolution</span>
            </TabsTrigger>
            <TabsTrigger value='flags' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'>
              <Flag className='w-4 h-4' />
              <span className='text-sm'>Flags</span>
            </TabsTrigger>
            <TabsTrigger value='employees' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'>
              <Users className='w-4 h-4' />
              <span className='text-sm'>Employees</span>
            </TabsTrigger>
            <TabsTrigger value='handbook' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'>
              <FileText className='w-4 h-4' />
              <span className='text-sm'>Handbook</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Desktop: Compact Horizontal Flow */}
        <div className='hidden md:block'>
          <TabsList className='bg-blue-900/30 flex flex-wrap gap-1 p-2 border border-blue-500/30 w-fit mb-4 items-center'>
            <TabsTrigger value='control' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'>
              <Settings className='w-4 h-4' />
              <span>Control</span>
            </TabsTrigger>
            <TabsTrigger value='autonomous' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'>
              <Brain className='w-4 h-4' />
              <span>Autonomous</span>
            </TabsTrigger>
            <TabsTrigger value='core' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'>
              <Zap className='w-4 h-4' />
              <span>Core</span>
            </TabsTrigger>
            <TabsTrigger value='autofix' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'>
              <AlertTriangle className='w-4 h-4' />
              <span>Auto-Fix</span>
            </TabsTrigger>
            <TabsTrigger value='evolution' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'>
              <CheckCircle className='w-4 h-4' />
              <span>Evolution</span>
            </TabsTrigger>
            <TabsTrigger value='flags' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'>
              <Flag className='w-4 h-4' />
              <span>Flags</span>
            </TabsTrigger>
            <TabsTrigger value='employees' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'>
              <Users className='w-4 h-4' />
              <span>Employees</span>
            </TabsTrigger>
            <TabsTrigger value='handbook' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'>
              <FileText className='w-4 h-4' />
              <span>Handbook</span>
            </TabsTrigger>
          </TabsList>
        </div>

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

        <TabsContent value='employees'>
          <div className='w-full max-w-full overflow-x-auto'>
            <EmployeeManagement />
          </div>
        </TabsContent>

        <TabsContent value='handbook'>
          <div className='w-full max-w-full overflow-x-auto'>
            <CompanyHandbook />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
