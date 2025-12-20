import { supabase } from '@/lib/supabase';
import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface InvoicePaymentProps {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  onPaymentSuccess?: () => void;
}

function PaymentForm({ 
  invoiceId, 
  invoiceNumber, 
  amount,
  clientSecret,
  onPaymentSuccess 
}: InvoicePaymentProps & { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/invoicing?payment_success=true&invoice_id=${invoiceId}`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful - record in database
        const { error: recordError } = await supabase.rpc('record_invoice_payment', {
          p_invoice_id: invoiceId,
          p_stripe_payment_intent_id: paymentIntent.id,
          p_amount: amount,
          p_payment_method: 'credit_card',
          p_metadata: {
            payment_intent_status: paymentIntent.status,
            timestamp: new Date().toISOString()
          }
        });

        if (recordError) {
          console.error('Error recording payment:', recordError);
          setError('Payment processed but failed to update invoice. Please contact support.');
        } else {
          setPaymentSuccess(true);
          setTimeout(() => {
            onPaymentSuccess?.();
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
        <p className="text-gray-600">Invoice #{invoiceNumber} has been paid.</p>
        <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Invoice Number:</span>
          <span className="font-semibold">#{invoiceNumber}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount Due:</span>
          <span className="text-2xl font-bold text-blue-600">${amount.toFixed(2)}</span>
        </div>
      </div>

      <PaymentElement />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Your payment is secure and encrypted. Powered by Stripe.
      </p>
    </form>
  );
}

export default function InvoicePayment({ 
  invoiceId, 
  invoiceNumber, 
  amount,
  onPaymentSuccess 
}: InvoicePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'invoice-payment-intent',
        {
          body: { invoiceId }
        }
      );

      if (functionError) throw functionError;

      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Initializing secure payment...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
          <Button onClick={initializePayment} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pay Invoice #{invoiceNumber}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg mb-6">
            <p className="text-blue-800 font-semibold mb-2">Amount Due: ${amount.toFixed(2)}</p>
            <p className="text-sm text-blue-600">
              Pay securely with credit card or debit card
            </p>
          </div>
          <Button onClick={initializePayment} className="w-full h-12 text-lg">
            <CreditCard className="mr-2 h-5 w-5" />
            Pay Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pay Invoice #{invoiceNumber}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#2563eb',
              },
            },
          }}
        >
          <PaymentForm
            invoiceId={invoiceId}
            invoiceNumber={invoiceNumber}
            amount={amount}
            clientSecret={clientSecret}
            onPaymentSuccess={onPaymentSuccess}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}
