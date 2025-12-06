import {
  AlertTriangle,
  Brain,
  CheckCircle,
  DollarSign,
  FileText,
  Flag,
  Settings,
  Users,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import AdminControlPanel from './AdminControlPanel';
import AutoFixSystem from './AutoFixSystem';
import AutonomousOdysseyCore from './AutonomousOdysseyCore';
import AutonomousSystemActivator from './AutonomousSystemActivator';
import BudgetDashboard from './BudgetDashboard';
import CompanyHandbook from './CompanyHandbook';
import { ContractorManager } from './ContractorManager';
import EmployeeManagement from './EmployeeManagement';
import FeatureFlagsManager from './FeatureFlagsManager';
import WorkforceManagementSystem from './PayrollDashboard';
import { PayrollReconciliation } from './PayrollReconciliation';
import { SelfEvolutionEngine } from './SelfEvolutionEngine';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('autonomous');
  const organizationId = 1;
  const userId = 'user-uuid';
  const [activationKey, setActivationKey] = useState('');
  const [activationStatus, setActivationStatus] = useState<string | null>(null);
  const handleActivate = async () => {
    if (!activationKey) {
      setActivationStatus('Please enter your activation key.');
      return;
    }
    setActivationStatus('Activating...');
    // Call Edge Function for activation and fetch audit log
    const correlation_id = `admin-activate-${userId}-${Date.now()}`;
    try {
      const { data, error } = await supabase.functions.invoke('roman-processor', {
        body: {
          userIntent: 'ACTIVATE_PROTOCOL',
          userId,
          organizationId,
          correlation_id
        }
      });
      const { data: auditEntries, error: auditError } = await supabase
        .from('roman_audit_log')
        .select('*')
        .eq('correlation_id', correlation_id)
        .order('timestamp', { ascending: false });
      setActivationStatus(`Activation request sent. Audit entries: ${auditEntries?.length ?? 0}`);
    } catch (err) {
      setActivationStatus(`Activation failed: ${err?.message || String(err)}`);
    }
  };
  return (
    <div className='space-y-4 px-2 py-2 sm:px-4 sm:py-6 max-w-full overflow-x-hidden'>
      <div className='text-center space-y-2'>
        <h1 className='font-bold text-white mb-1 md:mb-2 break-words text-xl md:text-4xl'>
          <span className='block md:hidden'>Admin Center</span>
          <span className='hidden md:block'>ODYSSEY-1 Administrative Control Center</span>
        </h1>
        <p className='hidden md:block text-xl text-gray-300 break-words'>Autonomous AI System Management & Operations</p>
        <Badge className='mt-1 md:mt-2 bg-green-600/20 text-green-300 text-xs md:text-base'>FULLY OPERATIONAL</Badge>
      </div>
      {/* R.O.M.A.N. Protocol Activation Prompt */}
      <div className='flex flex-col items-center gap-2 my-4 bg-blue-900/30 p-4 rounded-lg border border-blue-700 max-w-md mx-auto'>
        <div className='font-semibold text-blue-200 mb-1'>R.O.M.A.N. Protocol Activation</div>
        <input
          type='password'
          value={activationKey}
          onChange={e => setActivationKey(e.target.value)}
          placeholder='Enter activation key'
          className='px-3 py-2 rounded border border-blue-500 bg-blue-950 text-blue-100 w-full'
        />
        <button
          onClick={handleActivate}
          className='bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded mt-1 w-full font-semibold'
        >Activate Protocol</button>
        {activationStatus && (<div className='text-xs text-blue-300 mt-2'>{activationStatus}</div>)}
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-2 md:space-y-4'>
        {/* Mobile: Vertical Stack - Compact */}
        <div className='block md:hidden'>
          <TabsList className='bg-blue-900/30 flex flex-col gap-1 h-auto p-2 border border-blue-500/30 w-fit items-center'>
            <TabsTrigger value='control' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'><Settings className='w-4 h-4' /><span className='text-sm'>Control</span></TabsTrigger>
            <TabsTrigger value='autonomous' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'><Brain className='w-4 h-4' /><span className='text-sm'>Autonomous</span></TabsTrigger>
            <TabsTrigger value='core' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'><Zap className='w-4 h-4' /><span className='text-sm'>Core</span></TabsTrigger>
            <TabsTrigger value='autofix' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'><AlertTriangle className='w-4 h-4' /><span className='text-sm'>Auto-Fix</span></TabsTrigger>
            <TabsTrigger value='evolution' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'><CheckCircle className='w-4 h-4' /><span className='text-sm'>Evolution</span></TabsTrigger>
            <TabsTrigger value='flags' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'><Flag className='w-4 h-4' /><span className='text-sm'>Flags</span></TabsTrigger>
            <TabsTrigger value='employees' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'><Users className='w-4 h-4' /><span className='text-sm'>Employees</span></TabsTrigger>
            <TabsTrigger value='handbook' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'><FileText className='w-4 h-4' /><span className='text-sm'>Handbook</span></TabsTrigger>
            <TabsTrigger value='budget' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'><DollarSign className='w-4 h-4' /><span className='text-sm'>Budget</span></TabsTrigger>
            <TabsTrigger value='payroll' className='justify-start gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 w-fit'><DollarSign className='w-4 h-4' /><span className='text-sm'>Payroll</span></TabsTrigger>
          </TabsList>
        </div>
        {/* Desktop: Compact Horizontal Flow */}
        <div className='hidden md:block'>
          <TabsList className='bg-blue-900/30 flex flex-wrap gap-1 p-2 border border-blue-500/30 w-fit mb-4 items-center'>
            <TabsTrigger value='control' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'><Settings className='w-4 h-4' /><span>Control</span></TabsTrigger>
            <TabsTrigger value='autonomous' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'><Brain className='w-4 h-4' /><span>Autonomous</span></TabsTrigger>
            <TabsTrigger value='core' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'><Zap className='w-4 h-4' /><span>Core</span></TabsTrigger>
            <TabsTrigger value='autofix' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'><AlertTriangle className='w-4 h-4' /><span>Auto-Fix</span></TabsTrigger>
            <TabsTrigger value='evolution' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'><CheckCircle className='w-4 h-4' /><span>Evolution</span></TabsTrigger>
            <TabsTrigger value='flags' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'><Flag className='w-4 h-4' /><span>Flags</span></TabsTrigger>
            <TabsTrigger value='employees' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'><Users className='w-4 h-4' /><span>Employees</span></TabsTrigger>
            <TabsTrigger value='handbook' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'><FileText className='w-4 h-4' /><span>Handbook</span></TabsTrigger>
            <TabsTrigger value='budget' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'><DollarSign className='w-4 h-4' /><span>Budget</span></TabsTrigger>
            <TabsTrigger value='payroll' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'><DollarSign className='w-4 h-4' /><span>Payroll</span></TabsTrigger>
            <TabsTrigger value='contractors' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'><Users className='w-4 h-4' /><span>Contractors</span></TabsTrigger>
            <TabsTrigger value='reconciliation' className='flex items-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-500/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-100 border border-blue-500/20 text-sm'><FileText className='w-4 h-4' /><span>Reconciliation</span></TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value='control'><div className='w-full max-w-full overflow-x-auto'><AdminControlPanel /></div></TabsContent>
        <TabsContent value='autonomous'><div className='w-full max-w-full overflow-x-auto'><AutonomousSystemActivator /></div></TabsContent>
        <TabsContent value='core'><div className='w-full max-w-full overflow-x-auto'><AutonomousOdysseyCore /></div></TabsContent>
        <TabsContent value='autofix'><div className='w-full max-w-full overflow-x-auto'><AutoFixSystem /></div></TabsContent>
        <TabsContent value='evolution'><div className='w-full max-w-full overflow-x-auto'><SelfEvolutionEngine /></div></TabsContent>
        <TabsContent value='flags'><div className='w-full max-w-full overflow-x-auto'><FeatureFlagsManager /></div></TabsContent>
        <TabsContent value='employees'><div className='w-full max-w-full overflow-x-auto'><EmployeeManagement /></div></TabsContent>
        <TabsContent value='handbook'><div className='w-full max-w-full overflow-x-auto'><CompanyHandbook /></div></TabsContent>
        <TabsContent value='budget'><div className='w-full max-w-full overflow-x-auto'>{/* System-level Budget Dashboard for admins only */}<BudgetDashboard /></div></TabsContent>
        <TabsContent value='payroll'><div className='w-full max-w-full overflow-x-auto'><WorkforceManagementSystem organizationId={organizationId} userId={userId} /></div></TabsContent>
        <TabsContent value='contractors'><div className='w-full max-w-full overflow-x-auto'><ContractorManager organizationId={organizationId} /></div></TabsContent>
        <TabsContent value='reconciliation'><div className='w-full max-w-full overflow-x-auto'><PayrollReconciliation organizationId={organizationId} /></div></TabsContent>
      </Tabs>
    </div>
  );
}
