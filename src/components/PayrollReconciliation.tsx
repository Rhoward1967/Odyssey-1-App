import { usePayrollOutgoingLinks } from '@/services/payrollReconciliationService';
import React from 'react';

interface PayrollReconciliationProps {
  organizationId: number;
}

export const PayrollReconciliation: React.FC<PayrollReconciliationProps> = ({ organizationId }) => {
  const { links, loading, error } = usePayrollOutgoingLinks(organizationId);
  return (
    <div className="p-6 bg-slate-900 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-white">Payroll Reconciliation</h2>
      {loading && <div className="text-blue-400">Loading reconciliation data...</div>}
      {error && <div className="text-red-400 bg-red-950 border border-red-500 rounded p-4 mb-4">Error: {error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-800 border-b border-slate-700">
              <th className="text-left p-3 text-slate-300 font-semibold">Run ID</th>
              <th className="text-left p-3 text-slate-300 font-semibold">Period</th>
              <th className="text-left p-3 text-slate-300 font-semibold">Status</th>
              <th className="text-left p-3 text-slate-300 font-semibold">Payment ID</th>
              <th className="text-left p-3 text-slate-300 font-semibold">Amount</th>
              <th className="text-left p-3 text-slate-300 font-semibold">Currency</th>
              <th className="text-left p-3 text-slate-300 font-semibold">Scheduled</th>
              <th className="text-left p-3 text-slate-300 font-semibold">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {links.length === 0 && !loading && !error && (
              <tr>
                <td colSpan={8} className="text-center p-8 text-slate-400">
                  No payroll reconciliation data found
                </td>
              </tr>
            )}
            {links.map(link => (
              <tr key={link.link_id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-3 text-slate-100">{link.payroll_run_id}</td>
                <td className="p-3 text-slate-100">{link.period_start} - {link.period_end}</td>
                <td className="p-3 text-slate-100">{link.payroll_run_status}</td>
                <td className="p-3 text-slate-100">{link.outgoing_payment_id}</td>
                <td className="p-3 text-emerald-400 font-semibold">${(link.payment_amount_cents / 100).toFixed(2)}</td>
                <td className="p-3 text-slate-100">{link.payment_currency}</td>
                <td className="p-3 text-slate-100">{link.scheduled_for}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    link.payment_status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    link.payment_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {link.payment_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
