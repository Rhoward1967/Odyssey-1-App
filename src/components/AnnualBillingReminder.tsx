// ANNUAL BILLING WATCHMAN
// Protocol: SIP-2026-005 - Phase 3 Automation
// Component: Annual Contract Renewal Alert System
// Mission: Prevent $67,833 annual revenue from being overlooked
// Data source: annual_contracts_summary view (isolated from QuickBooks sync)

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { Bell, Calendar, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnnualContractSummary {
  customer_name: string | null;
  company_name: string | null;
  location_label: string;
  amount_usd: number;
  reprice_sent_on: string | null;
  renewal_stage: string;
  renewal_on: string;
  days_until_due: number;
  invoice_out: string;
  payment_due: string;
}

function parseLocalDate(yyyyMmDd: string): Date {
  const [y, m, d] = yyyyMmDd.split('T')[0].split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatLocal(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function customerDisplayName(row: AnnualContractSummary): string {
  return row.customer_name || row.company_name || 'Unknown Customer';
}

function stageIcon(stage: string): string {
  if (stage.includes('Send invoice')) return '🧾';
  if (stage.includes('Awaiting acceptance')) return '⏳';
  if (stage.includes('Awaiting payment')) return '💰';
  if (stage.includes('overdue') || stage.includes('Overdue')) return '🚨';
  if (stage.includes('Reprice')) return '✏️';
  return '📌';
}

function isUrgent(stage: string): boolean {
  return stage.toLowerCase().includes('overdue');
}

interface AnnualBillingReminderProps {
  userId: string;
}

export function AnnualBillingReminder({ userId }: AnnualBillingReminderProps) {
  const [renewals, setRenewals] = useState<AnnualContractSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoading(false); return; }

        const { data, error } = await supabase
          .from('annual_contracts_summary')
          .select('customer_name, company_name, location_label, amount_usd, reprice_sent_on, renewal_stage, renewal_on, days_until_due, invoice_out, payment_due')
          .order('days_until_due', { ascending: true });

        if (!error && data) {
          setRenewals(data as AnnualContractSummary[]);
        } else if (error) {
          console.error('AnnualBillingReminder error:', error.message);
        }
      } catch (err) {
        console.error('AnnualBillingReminder exception:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return null;
  if (renewals.length === 0) return null;

  return (
    <Card className="border-amber-500 bg-amber-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-amber-900">Annual Contract Renewals</CardTitle>
          <Badge className="bg-amber-600">{renewals.length} upcoming</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {renewals.map((contract, idx) => {
          const invoiceDate = formatLocal(parseLocalDate(contract.invoice_out));
          const paymentDate = formatLocal(parseLocalDate(contract.payment_due));
          const urgent = isUrgent(contract.renewal_stage);
          const icon = stageIcon(contract.renewal_stage);

          return (
            <Alert
              key={idx}
              variant={urgent ? 'destructive' : 'default'}
              className="border-l-4"
            >
              <AlertTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-bold">{customerDisplayName(contract)}</span>
                </div>
                <Badge variant={contract.days_until_due <= 30 ? 'destructive' : 'secondary'}>
                  {contract.days_until_due} days
                </Badge>
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-1">
                <p className="text-sm font-medium">{contract.location_label}</p>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-bold text-lg">
                    ${Number(contract.amount_usd).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-gray-600">/ year</span>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Invoice Date:</strong> {invoiceDate}
                  {' · '}
                  <strong>Payment Due:</strong> {paymentDate}
                </p>
                <p className="text-sm font-semibold text-amber-900 mt-2">
                  {icon} {contract.renewal_stage}
                </p>
                {contract.reprice_sent_on && (
                  <p className="text-xs text-gray-600">
                    Repricing sent {formatLocal(parseLocalDate(contract.reprice_sent_on))} · Invoices sent via QuickBooks
                  </p>
                )}
              </AlertDescription>
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
}

// WATCHMAN SPECIFICATIONS:
// - Reads from annual_contracts_summary view (NOT recurring_invoices directly)
// - View is isolated from QuickBooks sync — safe from data overwrites
// - Stage auto-advances: reprice → send invoice → awaiting payment → overdue
// - Jackie Cross (Athens-Clarke County Government) contracts (July 1, 2026):
//   * Dougherty Street Government Building: $34,875.00
//   * Satula Avenue Government Building: $32,958.00
// - Total protected revenue: $67,833.00/year