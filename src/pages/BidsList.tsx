import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { supabase } from '@/lib/supabaseClient';
import { FileText, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Bid {
  id: string;
  bid_number: string | null;
  title: string;
  total_cents: number;
  status: string;
  created_at: string;
  customer_name: string | null;
  organization: string | null;
}

export default function BidsList() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [convertingBidId, setConvertingBidId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please log in to view bids');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('view_user_bids')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setBids(data || []);
    } catch (err: any) {
      console.error('Error fetching bids:', err);
      setError(err.message || 'Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToInvoice = async (bidId: string) => {
    if (!confirm('Convert this bid to an invoice? This will mark the bid as converted.')) {
      return;
    }

    setConvertingBidId(bidId);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase
        .rpc('convert_bid_to_invoice', { p_bid_id: bidId });

      if (rpcError) throw rpcError;

      // Success - refresh the list and navigate to invoice
      await fetchBids();
      
      if (data) {
        // Navigate to the new invoice if we have the ID
        alert(`✅ Bid converted successfully! Invoice ID: ${data}`);
        // Optionally navigate to invoice page when it's ready:
        // navigate(`/app/invoicing?invoice=${data}`);
      } else {
        alert('✅ Bid converted successfully!');
      }
    } catch (err: any) {
      console.error('Error converting bid:', err);
      setError(`Failed to convert bid: ${err.message}`);
    } finally {
      setConvertingBidId(null);
    }
  };

  const formatCurrency = (cents: number): string => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      converted: 'bg-blue-100 text-blue-800',
    };

    const colorClass = statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCustomerDisplay = (bid: Bid): string => {
    if (bid.customer_name) return bid.customer_name;
    if (bid.organization) return bid.organization;
    return 'Unknown Customer';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Bids</h1>
          <p className="text-slate-400 mt-1">Manage your bids and convert them to invoices</p>
        </div>
        <Button onClick={() => navigate('/app/calculator')} className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
          <FileText className="w-4 h-4 mr-2" />
          Create New Bid
        </Button>
      </div>

      {error && (
        <Card className="border-red-500/40 bg-red-950/30">
          <CardContent className="pt-6">
            <p className="text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">All Bids</CardTitle>
        </CardHeader>
        <CardContent>
          {bids.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-slate-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No bids yet</h3>
              <p className="text-slate-400 mb-4">Create your first bid using the Bidding Calculator</p>
              <Button onClick={() => navigate('/app/calculator')} className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
                Create Bid
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-300">Bid Number</TableHead>
                  <TableHead className="text-slate-300">Customer</TableHead>
                  <TableHead className="text-slate-300">Title</TableHead>
                  <TableHead className="text-slate-300 text-right">Total Amount</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Date</TableHead>
                  <TableHead className="text-slate-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell className="font-medium text-white">
                      {bid.bid_number || `BID-${(bid.id ?? '').toString().slice(0, 8)}`}
                    </TableCell>
                    <TableCell className="text-slate-300">{getCustomerDisplay(bid)}</TableCell>
                    <TableCell className="text-slate-300">{bid.title ?? '—'}</TableCell>
                    <TableCell className="text-right text-white">
                      <div className="font-semibold">{formatCurrency(bid.total_cents)} <span className="text-xs text-slate-400 font-normal">/yr</span></div>
                      <div className="text-xs text-slate-400">{formatCurrency(Math.round(bid.total_cents / 4))} /quarter</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(bid.status)}</TableCell>
                    <TableCell className="text-slate-300">
                      {formatDate(bid.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {bid.status !== 'converted' ? (
                        <Button
                          size="sm"
                          onClick={() => handleConvertToInvoice(bid.id)}
                          disabled={convertingBidId === bid.id}
                          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
                        >
                          {convertingBidId === bid.id ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                              Converting...
                            </>
                          ) : (
                            'Convert to Invoice'
                          )}
                        </Button>
                      ) : (
                        <span className="text-sm text-slate-400">Converted</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
