import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle, CreditCard, Download, Mail } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import InvoicePayment from './InvoicePayment';

interface CustomerInvoiceViewProps {
  invoiceId: string;
}

export default function CustomerInvoiceView({ invoiceId }: CustomerInvoiceViewProps) {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'check' | null>(null);

  const loadInvoice = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (
            company_name,
            email
          ),
          invoice_line_items (*)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) {
        // RLS may block access if invoice doesn't belong to current user
        if (error.code === 'PGRST116') {
          console.error('Invoice not found or access denied (RLS):', error);
        }
        throw error;
      }
      setInvoice(data);
    } catch (error) {
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const handlePaymentSuccess = async () => {
    await loadInvoice();
    setShowPayment(false);
    setPaymentMethod(null);
  };

  const downloadPDF = () => {
    // TODO: Implement PDF generation
    console.log('Download PDF for invoice:', invoice.invoice_number);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="flex justify-center p-8">Invoice not found</div>;
  }

  const customerName = invoice.customers?.company_name || 'Customer';

  const isPaid = invoice.status === 'paid';
  const isOverdue = new Date(invoice.due_date) < new Date() && !isPaid;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Invoice Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">Invoice</CardTitle>
              <p className="text-lg font-mono mt-2">{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <Badge className={
                isPaid ? 'bg-green-500' : 
                isOverdue ? 'bg-red-500' : 
                'bg-yellow-500'
              }>
                {isPaid ? 'PAID' : isOverdue ? 'OVERDUE' : 'PENDING'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* From */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-2">FROM</h3>
              <div className="space-y-1">
                <p className="font-semibold">Odyssey-1 AI LLC</p>
                <p className="text-sm text-gray-600">Howard Janitorial Services</p>
                <p className="text-sm text-gray-600">PO Box 80054</p>
                <p className="text-sm text-gray-600">Athens, GA 30608</p>
              </div>
            </div>

            {/* To */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-2">BILL TO</h3>
              <div className="space-y-1">
                <p className="font-semibold">{customerName}</p>
                {invoice.customers?.email && (
                  <p className="text-sm text-gray-600">{invoice.customers.email}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div>
              <p className="text-sm text-gray-600">Invoice Date</p>
              <p className="font-semibold">{new Date(invoice.issue_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="font-semibold">{new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount Due</p>
              <p className="text-2xl font-bold text-blue-600">${invoice.total_amount.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.invoice_line_items?.map((item: any) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3">{item.description}</td>
                  <td className="py-3 text-right">{item.quantity}</td>
                  <td className="py-3 text-right">${item.unit_price.toFixed(2)}</td>
                  <td className="py-3 text-right font-semibold">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2">
              <tr>
                <td colSpan={3} className="py-3 text-right font-semibold">Total:</td>
                <td className="py-3 text-right text-xl font-bold">${invoice.total_amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          {invoice.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Options */}
      {!isPaid && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showPayment && !paymentMethod && (
              <>
                {/* Credit/Debit Card */}
                <Button 
                  onClick={() => {
                    setPaymentMethod('card');
                    setShowPayment(true);
                  }}
                  className="w-full justify-start text-left h-auto py-4"
                  variant="outline"
                >
                  <CreditCard className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-semibold">Pay by Credit or Debit Card</div>
                    <div className="text-sm text-gray-600">Secure payment processed by Stripe</div>
                  </div>
                </Button>

                {/* Check/Mail */}
                <Button 
                  onClick={() => setPaymentMethod('check')}
                  className="w-full justify-start text-left h-auto py-4"
                  variant="outline"
                >
                  <Mail className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-semibold">Pay by Check (Mail)</div>
                    <div className="text-sm text-gray-600">Send check to our mailing address</div>
                  </div>
                </Button>

                {/* Download PDF */}
                <Button 
                  onClick={downloadPDF}
                  className="w-full justify-start text-left h-auto py-4"
                  variant="outline"
                >
                  <Download className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-semibold">Download Invoice PDF</div>
                    <div className="text-sm text-gray-600">Save or print invoice</div>
                  </div>
                </Button>
              </>
            )}

            {/* Card Payment Form */}
            {showPayment && paymentMethod === 'card' && (
              <div className="space-y-4">
                <InvoicePayment
                  invoiceId={invoice.id}
                  invoiceNumber={invoice.invoice_number}
                  amount={invoice.total_amount}
                  onPaymentSuccess={handlePaymentSuccess}
                />
                <Button 
                  onClick={() => {
                    setShowPayment(false);
                    setPaymentMethod(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Check Payment Instructions */}
            {paymentMethod === 'check' && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900">Mail Payment To:</p>
                        <div className="mt-2 space-y-1 text-sm text-blue-800">
                          <p className="font-semibold">Odyssey-1 AI LLC</p>
                          <p>PO Box 80054</p>
                          <p>Athens, GA 30608</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Please include:</strong> Invoice #{invoice.invoice_number} on your check
                      </p>
                      <p className="text-sm text-blue-800 mt-2">
                        <strong>Make check payable to:</strong> Odyssey-1 AI LLC
                      </p>
                    </div>

                    <Button 
                      onClick={() => setPaymentMethod(null)}
                      variant="outline"
                      className="w-full"
                    >
                      Back to Payment Options
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {isPaid && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Payment Received</p>
                <p className="text-sm text-green-700">Thank you for your payment!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
