/**
 * ODYSSEY-1 Professional Payroll System
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * Part of the ODYSSEY-1 Genesis Protocol - "The Female Plug"
 * Workforce Management System with 4-step payroll workflow
 */

import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  Edit,
  FileText,
  RefreshCw,
  Save,
  UserPlus,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// import BankAccountManager from './BankAccountManager';

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  organization_id: number;
  hourly_rate?: number;
  salary?: number;
  employment_type?: string;
  status: string;
}

interface Paystub {
  id: string;
  employee: string;
  employee_name?: string;
  payperiodstart: string;
  payperiodend: string;
  grosspay: number;
  netpay: number;
  regular_pay: number;
  overtime_pay: number;
  federal_tax: number;
  state_tax: number;
  fica_ss: number;
  fica_medicare: number;
  child_support: number;
  garnishments: number;
  benefits_cost: number;
  bonus: number;
  status: 'prepared' | 'approved' | 'processed' | 'voided';
  notes?: string;
}

interface WorkforceManagementProps {
  organizationId: number;
  userId: string;
}

export const WorkforceManagementSystem: React.FC<WorkforceManagementProps> = ({ organizationId, userId }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('prepare');
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [paystubs, setPaystubs] = useState<Paystub[]>([]);
  const [editingPaystubId, setEditingPaystubId] = useState<string | null>(null);
  const [editedPaystub, setEditedPaystub] = useState<Partial<Paystub>>({});
  const [payrollStartDate, setPayrollStartDate] = useState('');
  const [payrollEndDate, setPayrollEndDate] = useState('');
  const [currentPayrollRunId, setCurrentPayrollRunId] = useState<string | null>(null);
  const [contractorId, setContractorId] = useState('');
  const [contractorAmount, setContractorAmount] = useState('');

  const fetchEmployees = useCallback(async () => {
    const { data, error } = await supabase.from('employees').select('*').eq('organization_id', organizationId);
    if (!error && data) setEmployees(data);
  }, [organizationId]);

  const fetchPreparedPaystubs = useCallback(async () => {
    if (!payrollStartDate || !payrollEndDate) return;
    const { data, error } = await supabase.from('paystubs').select('*, employees!inner(first_name, last_name)').eq('organization_id', organizationId).eq('payperiodstart', payrollStartDate).eq('payperiodend', payrollEndDate).eq('status', 'prepared');
    if (!error && data) {
      const enriched = data.map(stub => ({ ...stub, employee_name: `${stub.employees.first_name} ${stub.employees.last_name}` }));
      setPaystubs(enriched);
    }
  }, [organizationId, payrollStartDate, payrollEndDate]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { if (activeTab === 'review') fetchPreparedPaystubs(); }, [activeTab, fetchPreparedPaystubs]);

  const handlePreparePayroll = async () => {
    if (!payrollStartDate || !payrollEndDate) { 
      toast({ title: 'Missing Dates', description: 'Select pay period.', variant: 'destructive' }); 
      return; 
    }
    
    setIsLoading(true);
    try {
      // Use Edge Function with correlation_id for audit trace
      const correlation_id = `payroll-${organizationId}-${payrollStartDate}-${payrollEndDate}`;
      const { data, error } = await supabase.functions.invoke('run-payroll', {
        body: {
          organization_id: organizationId,
          period_start: payrollStartDate,
          period_end: payrollEndDate,
          correlation_id
        }
      });

      // Fetch audit log for this payroll run
      const { data: auditEntries, error: auditError } = await supabase
        .from('roman_audit_log')
        .select('*')
        .eq('correlation_id', correlation_id)
        .order('timestamp', { ascending: false });

      if (error) {
        toast({ title: 'Payroll Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Payroll Run Complete', description: `Audit entries: ${auditEntries?.length ?? 0}`, variant: 'default' });
      }
      //   userId,
      //   organizationId
      // );
      // if (!result.success) throw new Error(result.message);
      // const data = result.execution?.data;

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      toast({ title: 'Payroll Prepared', description: data.message });
      setCurrentPayrollRunId(data.payroll_run_id);
      setActiveTab('review');
    } catch (err: any) { 
      toast({ title: 'Error', description: err.message, variant: 'destructive' }); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const startEditingPaystub = (paystub: Paystub) => { setEditingPaystubId(paystub.id); setEditedPaystub(paystub); };
  const saveEditedPaystub = async () => {
    if (!editingPaystubId) return;
    const { error } = await supabase.from('paystubs').update(editedPaystub).eq('id', editingPaystubId);
    if (error) toast({ title: 'Save Failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Saved', description: 'Paystub updated' }); setEditingPaystubId(null); fetchPreparedPaystubs(); }
  };

  const handleApprovePayroll = async () => {
    const { error } = await supabase.from('paystubs').update({ status: 'approved', approved_by: userId, approved_at: new Date().toISOString() }).eq('payperiodstart', payrollStartDate).eq('payperiodend', payrollEndDate).eq('status', 'prepared');
    if (error) toast({ title: 'Approval Failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Approved', description: 'All paystubs approved for processing' }); setActiveTab('process'); }
  };

  const handleProcessPayments = async () => {
    const { error } = await supabase.from('paystubs').update({ status: 'processed', processed_by: userId, processed_at: new Date().toISOString() }).eq('payperiodstart', payrollStartDate).eq('payperiodend', payrollEndDate).eq('status', 'approved');
    if (error) toast({ title: 'Processing Failed', description: error.message, variant: 'destructive' });
    else toast({ title: 'Processed', description: 'Payments processed successfully' });
  };

  const handleAddContractor = async () => {
    const amount = parseFloat(contractorAmount) || 0;
    const { error } = await supabase.from('paystubs').insert({ employee: contractorId, payperiodstart: payrollStartDate, payperiodend: payrollEndDate, grosspay: amount, netpay: amount, regular_pay: amount, overtime_pay: 0, federal_tax: 0, state_tax: 0, fica_ss: 0, fica_medicare: 0, child_support: 0, garnishments: 0, benefits_cost: 0, bonus: 0, organization_id: organizationId, status: 'prepared', notes: 'Contractor - Manual Entry' });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Added', description: 'Contractor payment added' }); setContractorId(''); setContractorAmount(''); fetchPreparedPaystubs(); }
  };

  if (isLoading) return <div className="text-white p-4 flex items-center"><RefreshCw className="w-5 h-5 mr-2 animate-spin"/>Processing...</div>;

  return (
    <div className="space-y-6 text-white p-4">
      <Card className="border-blue-500/50 bg-slate-800/60">
        <CardHeader><CardTitle className="flex items-center gap-2 text-blue-300"><DollarSign className="h-6 w-6"/>Professional Payroll System</CardTitle><CardDescription className="text-gray-400">Prepare, Review, Approve & Process Payroll</CardDescription></CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-slate-900/70">
              <TabsTrigger value="prepare">1. Prepare</TabsTrigger>
              <TabsTrigger value="review">2. Review & Edit</TabsTrigger>
              <TabsTrigger value="approve">3. Approve</TabsTrigger>
              <TabsTrigger value="process">4. Process</TabsTrigger>
              {/* <TabsTrigger value="bankaccounts">Bank Accounts</TabsTrigger> */}
            </TabsList>
            <TabsContent value="prepare" className="space-y-4">
              <Card className="bg-slate-700/50">
                <CardHeader><CardTitle>Select Pay Period</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Start Date</Label><Input type="date" value={payrollStartDate} onChange={e => setPayrollStartDate(e.target.value)} className="bg-slate-800"/></div>
                    <div><Label>End Date</Label><Input type="date" value={payrollEndDate} onChange={e => setPayrollEndDate(e.target.value)} className="bg-slate-800"/></div>
                  </div>
                  <Button onClick={handlePreparePayroll} disabled={isLoading} className="w-full">{isLoading ? 'Preparing...' : 'Prepare Payroll'}</Button>
                </CardContent>
              </Card>
              <Card className="bg-slate-700/50">
                <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5"/>Add Contractor Payment</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Select value={contractorId} onValueChange={setContractorId}>
                    <SelectTrigger className="bg-slate-800"><SelectValue placeholder="Select Contractor"/></SelectTrigger>
                    <SelectContent>{employees.filter(e => e.employment_type === 'Contractor').map(e => <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" placeholder="Payment Amount" value={contractorAmount} onChange={e => setContractorAmount(e.target.value)} className="bg-slate-800"/>
                  <Button onClick={handleAddContractor} variant="outline">Add Contractor Payment</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="review" className="space-y-4">
              <Card className="bg-slate-700/50">
                <CardHeader><CardTitle>Review Paystubs ({paystubs.length})</CardTitle><CardDescription>Edit deductions, taxes, bonuses before approval</CardDescription></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Gross</TableHead><TableHead>Fed Tax</TableHead><TableHead>State Tax</TableHead><TableHead>Child Support</TableHead><TableHead>Garnishments</TableHead><TableHead>Bonus</TableHead><TableHead>Net Pay</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                      <TableBody>{paystubs.map(stub => <TableRow key={stub.id}><TableCell>{stub.employee_name}</TableCell><TableCell>{editingPaystubId === stub.id ? <Input type="number" value={editedPaystub.grosspay} onChange={e => setEditedPaystub({...editedPaystub, grosspay: parseFloat(e.target.value)})} className="w-24 bg-slate-800"/> : `$${stub.grosspay.toFixed(2)}`}</TableCell><TableCell>{editingPaystubId === stub.id ? <Input type="number" value={editedPaystub.federal_tax} onChange={e => setEditedPaystub({...editedPaystub, federal_tax: parseFloat(e.target.value)})} className="w-24 bg-slate-800"/> : `$${stub.federal_tax.toFixed(2)}`}</TableCell><TableCell>{editingPaystubId === stub.id ? <Input type="number" value={editedPaystub.state_tax} onChange={e => setEditedPaystub({...editedPaystub, state_tax: parseFloat(e.target.value)})} className="w-24 bg-slate-800"/> : `$${stub.state_tax.toFixed(2)}`}</TableCell><TableCell>{editingPaystubId === stub.id ? <Input type="number" value={editedPaystub.child_support || 0} onChange={e => setEditedPaystub({...editedPaystub, child_support: parseFloat(e.target.value)})} className="w-24 bg-slate-800"/> : `$${(stub.child_support || 0).toFixed(2)}`}</TableCell><TableCell>{editingPaystubId === stub.id ? <Input type="number" value={editedPaystub.garnishments || 0} onChange={e => setEditedPaystub({...editedPaystub, garnishments: parseFloat(e.target.value)})} className="w-24 bg-slate-800"/> : `$${(stub.garnishments || 0).toFixed(2)}`}</TableCell><TableCell>{editingPaystubId === stub.id ? <Input type="number" value={editedPaystub.bonus || 0} onChange={e => setEditedPaystub({...editedPaystub, bonus: parseFloat(e.target.value)})} className="w-24 bg-slate-800"/> : `$${(stub.bonus || 0).toFixed(2)}`}</TableCell><TableCell className="font-bold">${stub.netpay.toFixed(2)}</TableCell><TableCell>{editingPaystubId === stub.id ? <Button size="sm" onClick={saveEditedPaystub}><Save className="w-4 h-4"/></Button> : <Button size="sm" variant="outline" onClick={() => startEditingPaystub(stub)}><Edit className="w-4 h-4"/></Button>}</TableCell></TableRow>)}</TableBody></Table>
                  </div>
                  <Button onClick={() => setActiveTab('approve')} className="mt-4 w-full">Continue to Approval</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="approve" className="space-y-4">
              <Card className="bg-slate-700/50">
                <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-400"/>Approve Payroll</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="bg-yellow-900/50 border-yellow-500/50"><AlertCircle className="h-4 w-4"/><AlertDescription>Review all paystubs carefully. Once approved, they will be queued for processing.</AlertDescription></Alert>
                  <div className="text-lg">Total Paystubs: <strong>{paystubs.length}</strong></div>
                  <div className="text-lg">Total Net Pay: <strong>${paystubs.reduce((sum, s) => sum + s.netpay, 0).toFixed(2)}</strong></div>
                  <Button onClick={handleApprovePayroll} className="w-full bg-green-600 hover:bg-green-700">Approve All Paystubs</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="process" className="space-y-4">
              <Card className="bg-slate-700/50">
                <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-400"/>Process Payments</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="bg-blue-900/50 border-blue-500/50"><AlertDescription>Approved paystubs ready for payment processing. This will mark them as "processed".</AlertDescription></Alert>
                  <Button onClick={handleProcessPayments} className="w-full bg-blue-600 hover:bg-blue-700">Process Payments</Button>
                </CardContent>
              </Card>
            </TabsContent>
            {/*
            <TabsContent value="bankaccounts" className="space-y-4">
              <BankAccountManager organizationId={organizationId} userId={userId} />
            </TabsContent>
            */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkforceManagementSystem;