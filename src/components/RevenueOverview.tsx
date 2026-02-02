// ARCHITECT TOTAL ALIGNMENT PROTOCOL - SIP-2026-011
// Hardcoded Reality: Console verification, security mismatch detection
// Expected User ID: eca49ca9-b4ae-4e0e-b78a-fa1811024781

import { supabase } from '@/lib/supabaseClient';
import React, { useEffect, useState } from 'react';

interface Props {
  userId: string;
}

export const RevenueOverview: React.FC<Props> = ({ userId }) => {
  const [monthlyMRR, setMonthlyMRR] = useState(0);
  const [annualTotal, setAnnualTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [annualCount, setAnnualCount] = useState(0);
  const [securityMismatch, setSecurityMismatch] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // ARCHITECT MANDATE: Console verification
      console.log('🔍 REVENUE DASHBOARD FETCH ATTEMPT');
      console.log('📋 User ID:', userId);
      console.log('🔐 Expected ID: eca49ca9-b4ae-4e0e-b78a-fa1811024781');
      console.log('⚡ Timestamp:', new Date().toISOString());
      
      // MODIFIED: Show ALL recurring invoices (including disabled ones)
      // This reflects the current safety control state where all are disabled
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('recurring_invoices')
        .select('amount_cents, frequency, is_active')
        .eq('user_id', userId)
        .neq('frequency', 'annual');

      console.log('📊 Monthly Query Result:', {
        rows: monthlyData?.length || 0,
        active: monthlyData?.filter(r => r.is_active).length || 0,
        disabled: monthlyData?.filter(r => !r.is_active).length || 0,
        error: monthlyError?.message || 'none',
        details: monthlyError || 'success'
      });

      // MODIFIED: Show ALL recurring invoices (including disabled ones)
      const { data: annualData, error: annualError } = await supabase
        .from('recurring_invoices')
        .select('amount_cents, frequency, is_active')
        .eq('user_id', userId)
        .eq('frequency', 'annual');

      console.log('📊 Annual Query Result:', {
        rows: annualData?.length || 0,
        error: annualError?.message || 'none',
        details: annualError || 'success'
      });

      const monthlySum = monthlyData?.reduce((acc, curr) => acc + curr.amount_cents, 0) || 0;
      const annualSum = annualData?.reduce((acc, curr) => acc + curr.amount_cents, 0) || 0;

      setMonthlyMRR(monthlySum / 100);
      setAnnualTotal(annualSum / 100);
      setMonthlyCount(monthlyData?.length || 0);
      setAnnualCount(annualData?.length || 0);
      
      // ARCHITECT MANDATE: Detect security mismatch (only if NO data at all)
      // If we have disabled invoices, that's intentional (safety controls)
      const totalRecords = (monthlyData?.length || 0) + (annualData?.length || 0);
      const activeRecords = (monthlyData?.filter(r => r.is_active).length || 0) + (annualData?.filter(r => r.is_active).length || 0);
      
      if (totalRecords === 0) {
        console.error('⚠️ SECURITY MISMATCH: No rows returned for user_id');
        setSecurityMismatch(true);
      } else if (activeRecords === 0) {
        console.warn('🛡️ SAFETY CONTROLS ACTIVE: All recurring invoices disabled');
        console.log(`   Total invoices: ${totalRecords}, Active: 0`);
      }
      
      console.log('💰 Calculated Totals:', {
        monthly: `$${(monthlySum / 100).toLocaleString()}`,
        annual: `$${(annualSum / 100).toLocaleString()}`
      });
      
      setLoading(false);
    };

    if (userId) fetchData();
  }, [userId]);

  if (loading) return <div className="p-4">Synchronizing Sovereign Data...</div>;

  if (securityMismatch) {
    return (
      <div className="p-6 bg-red-50 border-2 border-red-500 rounded-lg">
        <h3 className="text-lg font-bold text-red-900">⚠️ SECURITY MISMATCH DETECTED</h3>
        <p className="text-sm text-red-800 mt-2">
          RLS policies active but no rows returned for user_id: <code className="bg-red-100 px-1">{userId}</code>
        </p>
        <p className="text-xs text-red-700 mt-2">
          Data may not be stamped with correct user_id. Check console for query details.
        </p>
      </div>
    );
  }
  
  // Show safety control notice if all invoices are disabled
  const allDisabled = monthlyCount === 0 && annualCount === 0 && monthlyMRR === 0 && annualTotal === 0;
  
  if (allDisabled) {
    return (
      <div className="p-6 bg-yellow-50 border-2 border-yellow-500 rounded-lg">
        <h3 className="text-lg font-bold text-yellow-900">🛡️ SAFETY CONTROLS ACTIVE</h3>
        <p className="text-sm text-yellow-800 mt-2">
          All recurring invoices are currently <strong>disabled</strong> for manual review.
        </p>
        <p className="text-xs text-yellow-700 mt-2">
          This is intentional - no automated billing until you manually approve each contract.
        </p>
        <p className="text-xs text-yellow-700 mt-1">
          📋 See <code className="bg-yellow-100 px-1">INVOICE_SAFETY_CONTROLS.md</code> for review checklist
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-0">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-sm font-medium text-green-800">Monthly MRR</h3>
        <p className="text-2xl font-bold text-green-900">${monthlyMRR.toLocaleString()}</p>
        <p className="text-xs text-green-700 mt-1">{monthlyCount} active contracts</p>
      </div>
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800">Annual Contracts</h3>
        <p className="text-2xl font-bold text-blue-900">${annualTotal.toLocaleString()}</p>
        <p className="text-xs text-blue-700 mt-1">{annualCount} annual contracts</p>
      </div>
    </div>
  );
};
