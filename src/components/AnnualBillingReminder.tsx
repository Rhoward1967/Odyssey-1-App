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
  customers: {
    company_name: string;
    email: string;
  } | null;
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
          .select('id, location_label, amount_cents, next_invoice_date, customers(company_name, email)')
          .eq('is_active', true)
          .eq('frequency', 'annual') // Temporary: Use frequency until billing_category exists
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

  // Calculate days until next renewal
  const getDaysUntil = (dateStr: string): number => {
    const today = new Date();
    const renewalDate = new Date(dateStr);
    const diffTime = renewalDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Determine alert severity
  const getAlertVariant = (daysUntil: number): 'default' | 'destructive' => {
    return daysUntil <= 30 ? 'destructive' : 'default';
  };

  if (loading) {
    return null; // Silent loading
  }

  if (upcomingRenewals.length === 0) {
    return null; // No alerts needed
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
          const daysUntil = getDaysUntil(contract.next_invoice_date);
          const amount = contract.amount_cents / 100;
          
          return (
            <Alert 
              key={contract.id} 
              variant={getAlertVariant(daysUntil)}
              className="border-l-4"
            >
              <AlertTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-bold">{contract.customers?.company_name || 'Unknown Customer'}</span>
                </div>
                <Badge variant={daysUntil <= 30 ? 'destructive' : 'secondary'}>
                  {daysUntil} days
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
                  <strong>Renewal Date:</strong> {new Date(contract.next_invoice_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                {daysUntil <= 30 && (
                  <p className="text-sm font-semibold text-red-700 mt-2">
                    ⚠️ COLLECTION ALERT: Contact {contract.customers?.email || 'customer'} to confirm renewal
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
// - Scans for billing_category = 'annual' contracts
// - Triggers alert 60 days before renewal (escalates at 30 days)
// - Beth Smith ACC contracts (July 1, 2026):
//   * Dougherty Street Government Building: $31,250.00
//   * Satula Avenue Government Building: $29,780.00
// - Total protected revenue: $61,030.00/year
