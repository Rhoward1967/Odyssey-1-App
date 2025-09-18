import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Receipt, Download, Calendar } from 'lucide-react';

interface BillingRecord {
  id: string;
  amount: number;
  status: string;
  plan_id: string;
  created_at: string;
  invoice_url?: string;
}

const BillingHistory: React.FC = () => {
  const { user } = useAuth();
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBillingHistory();
    }
  }, [user]);

  const fetchBillingHistory = async () => {
    try {
      // Mock data for demonstration - in production, this would come from Stripe
      const mockData = [
        {
          id: '1',
          amount: 29900,
          status: 'paid',
          plan_id: 'pro',
          created_at: new Date().toISOString(),
          invoice_url: '#'
        },
        {
          id: '2', 
          amount: 29900,
          status: 'paid',
          plan_id: 'pro',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          invoice_url: '#'
        }
      ];
      
      setBillingHistory(mockData);
    } catch (err) {
      console.error('Error fetching billing history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const getPlanName = (planId: string) => {
    const plans = {
      basic: 'ODYSSEY Basic',
      pro: 'ODYSSEY Professional',
      enterprise: 'ODYSSEY Enterprise'
    };
    return plans[planId as keyof typeof plans] || planId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse text-gray-400">Loading billing history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Receipt className="w-5 h-5 mr-2 text-blue-500" />
          Billing History
        </CardTitle>
        <CardDescription>View your payment history and download invoices</CardDescription>
      </CardHeader>
      <CardContent>
        {billingHistory.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No billing history available</p>
        ) : (
          <div className="space-y-4">
            {billingHistory.map((record) => (
              <div 
                key={record.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-white">
                      {new Date(record.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{getPlanName(record.plan_id)}</p>
                    <p className="text-gray-400 text-sm">{formatAmount(record.amount)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(record.status)}>
                    {record.status}
                  </Badge>
                  {record.invoice_url && (
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Invoice
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillingHistory;