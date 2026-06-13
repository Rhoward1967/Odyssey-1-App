// ANNUAL BILLING WATCHMAN
// Protocol: SIP-2026-005 - Phase 3 Automation
// Component: Beth Smith Renewal Alert System
// Mission: Prevent $61,030 annual revenue from being overlooked

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { Bell, Calendar, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnnualContract {
  id: string;
  location_label: string;
  amount_cents: number;
  next_invoice_date: string;
  reprice_sent_on: string | null;
  customers: {
    company_name: string | null;
    customer_name: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

type RenewalStage = 'reprice' | 'notify' | 'invoiced' | 'overdue';

function parseLocalDate(yyyyMmDd: string): Date {
  const [y, m, d] = yyyyMmDd.split('T')[0].split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatLocal(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function customerDisplayName(c: AnnualContract['customers']): string {
  if (!c) return 'Unknown Customer';
  const personName = [c.first_name, c.last_name].filter(Boolean).join(' ').trim();
  return c.company_name || c.customer_name || personName || c.email || 'Unknown Customer';
}

function computeRenewal(nextInvoiceDate: string, repriceSentOn: string | null) {
  const renewalOn = parseLocalDate(nextInvoiceDate);
  const repriceBy = new Date(renewalOn);
  repriceBy.setDate(renewalOn.getDate() - 16);
  const paymentDue = new Date(renewalOn);
  paymentDue.setDate(renewalOn.getDate() + 31);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let stage: RenewalStage;
  let nextMilestone: Date;
  let stageLabel: string;
  let stageDetail: string;

  const repriceComplete = !!repriceSentOn;

  if (!repriceComplete && today < repriceBy) {
    stage = 'reprice';
    nextMilestone = repriceBy;
    stageLabel = `Reprice by ${formatLocal(repriceBy)}`;
    stageDetail = 'Finalize new pricing and send to customer contact';
  } else if (today < renewalOn) {
    stage = 'notify';
    nextMilestone = renewalOn;
    stageLabel = `Send invoice ${formatLocal(renewalOn)}`;
    const sentNote = repriceSentOn ? ` (repricing sent ${formatLocal(parseLocalDate(repriceSentOn))})` : '';
    stageDetail = `Repricing sent${sentNote ? sentNote : ''} — invoice goes out on this date`;
  } else if (today < paymentDue) {
    stage = 'invoiced';
    nextMilestone = paymentDue;
    stageLabel = `Invoice sent — payment due ${formatLocal(paymentDue)}`;
    stageDetail = 'Awaiting customer acceptance and payment';
  } else {
    stage = 'overdue';
    nextMilestone = paymentDue;
    stageLabel = `Payment overdue (due ${formatLocal(paymentDue)})`;
    stageDetail = 'Follow up with customer for payment';
  }

  const daysUntil = Math.max(0, Math.ceil((nextMilestone.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  return { stage, stageLabel, stageDetail, daysUntil, renewalOn, paymentDue };
}

interface AnnualBillingReminderProps {
  userId: string;
}

export function AnnualBillingReminder({ userId }: AnnualBillingReminderProps) {
  const [upcomingRenewals, setUpcomingRenewals] = useState<AnnualContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnualContracts = async () => {
      try {
        // Verify authenticated session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return; // Silent fail - no alerts if not logged in
        }

        // Query: Find billing_category = 'annual' with renewals in next 60 days
        const today = new Date();
        const sixtyDaysOut = new Date();
        sixtyDaysOut.setDate(today.getDate() + 60);

        const { data, error } = await supabase
          .from('recurring_invoices')
          .select('id, location_label, amount_cents, next_invoice_date, reprice_sent_on, customers(company_name, customer_name, first_name, last_name, email)')
          .eq('is_active', true)
          .or('billing_category.eq.annual,frequency.eq.annual')
          .lte('next_invoice_date', sixtyDaysOut.toISOString().split('T')[0])
          .gte('next_invoice_date', today.toISOString().split('T')[0])
          .order('next_invoice_date', { ascending: true });

        if (!error && data) {
          // Transform data: Supabase returns customers as array, we need single object
          const transformed = data.map(item => ({
            ...item,
            customers: Array.isArray(item.customers) && item.customers.length > 0
              ? item.customers[0]
              : null
          }));
          setUpcomingRenewals(transformed as AnnualContract[]);
        }
      } catch (err) {
        console.error('Error loading annual contracts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnnualContracts();
  }, []);

  const getStageVariant = (stage: RenewalStage): 'default' | 'destructive' => {
    return stage === 'overdue' || stage === 'notify' ? 'destructive' : 'default';
  };

  if (loading) {
    return null;
  }

  if (upcomingRenewals.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-500 bg-amber-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-amber-900">Annual Contract Renewals</CardTitle>
          <Badge className="bg-amber-600">{upcomingRenewals.length} upcoming</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingRenewals.map((contract) => {
          const renewal = computeRenewal(contract.next_invoice_date, contract.reprice_sent_on);
          const amount = contract.amount_cents / 100;
          const displayName = customerDisplayName(contract.customers);

          return (
            <Alert
              key={contract.id}
              variant={getStageVariant(renewal.stage)}
              className="border-l-4"
            >
              <AlertTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-bold">{displayName}</span>
                </div>
                <Badge variant={renewal.daysUntil <= 30 ? 'destructive' : 'secondary'}>
                  {renewal.daysUntil} days
                </Badge>
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-1">
                <p className="text-sm font-medium">{contract.location_label}</p>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-bold text-lg">
                    ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-gray-600">/ year</span>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Invoice Date:</strong> {formatLocal(renewal.renewalOn)}
                  {' · '}
                  <strong>Payment Due:</strong> {formatLocal(renewal.paymentDue)}
                </p>
                <p className="text-sm font-semibold text-amber-900 mt-2">
                  📌 {renewal.stageLabel}
                </p>
                <p className="text-xs text-gray-600">{renewal.stageDetail}</p>
              </AlertDescription>
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
}

// WATCHMAN SPECIFICATIONS:
// - Scans for billing_category = 'annual' contracts
// - Triggers alert 60 days before renewal (escalates at 30 days)
// - Beth Smith ACC contracts (July 1, 2026):
//   * Dougherty Street Government Building: $31,250.00
//   * Satula Avenue Government Building: $29,780.00
// - Total protected revenue: $61,030.00/year
