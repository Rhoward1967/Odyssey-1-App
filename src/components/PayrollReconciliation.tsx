import { usePayrollOutgoingLinks } from '@/services/payrollReconciliationService';
import React from 'react';

interface PayrollReconciliationProps {
  organizationId: number;
}

export const PayrollReconciliation: React.FC<PayrollReconciliationProps> = ({ organizationId }) => {
  const { links, loading, error } = usePayrollOutgoingLinks(organizationId);
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Payroll Reconciliation</h2>
      {loading && <div>Loading reconciliation data...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th>Run ID</th>
            <th>Period</th>
            <th>Status</th>
            <th>Payment ID</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Scheduled</th>
            <th>Payment Status</th>
          </tr>
        </thead>
        <tbody>
          {links.map(link => (
            <tr key={link.link_id}>
              <td>{link.payroll_run_id}</td>
              <td>{link.period_start} - {link.period_end}</td>
              <td>{link.payroll_run_status}</td>
              <td>{link.outgoing_payment_id}</td>
              <td>{(link.payment_amount_cents / 100).toFixed(2)}</td>
              <td>{link.payment_currency}</td>
              <td>{link.scheduled_for}</td>
              <td>{link.payment_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
