
import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from './AuthProvider';

// Standalone CheckoutForm for Stripe Elements
const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found.');
      setProcessing(false);
      return;
    }

    // Create a PaymentIntent on the server and get the clientSecret.
    const response = await fetch('/functions/v1/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: 'ai-research-access' }] }), // Example payload
    });

    if (!response.ok) {
      setError('Failed to create payment intent.');
      setProcessing(false);
      return;
    }

    const { clientSecret } = await response.json();

    if (!clientSecret) {
      setError('Invalid client secret received from server.');
      setProcessing(false);
      return;
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (stripeError) {
      setError(stripeError.message ?? 'An unexpected error occurred.');
      setSucceeded(false);
    } else if (paymentIntent?.status === 'succeeded') {
      setError(null);
      setSucceeded(true);
      // TODO: Call a Supabase function to update user's subscription status.
    }

    setProcessing(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#ffffff',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-800 rounded-md">
        <CardElement options={cardElementOptions} />
      </div>
      <Button
        type="submit"
        disabled={!stripe || processing || succeeded}
        className="w-full"
      >
        {processing ? 'Processing...' : succeeded ? 'Payment Successful' : 'Pay Now'}
      </Button>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {succeeded && <div className="text-green-500 text-sm mt-2">Payment successful! You now have access to AI Research features.</div>}
    </form>
  );
};

const AIResearchPaywall: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gray-900 text-white border-gray-700">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>Please sign in to access AI Research features.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex justify-center items-center h-full p-4">
      <Card className="w-full max-w-md bg-gray-900 text-white border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl">Unlock AI Research</CardTitle>
          <CardDescription>
            Gain unlimited access to our powerful AI research assistant for just $10/month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CheckoutForm />
        </CardContent>
      </Card>
    </div>
  );
};

