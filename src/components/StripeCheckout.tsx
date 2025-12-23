import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';

interface StripeCheckoutProps {
  planId: string;
  planName: string;
  amount: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  planId,
  planName,
  amount,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!user) {
        throw new Error('Please log in to continue');
      }

      // Validate card details
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name) {
        throw new Error('Please fill in all card details');
      }

      // Create payment intent
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('stripe-payment-processor', {
        body: { 
          action: 'create-payment-intent',
          planId: planId,
          userId: user.id
        }
      });

      if (paymentError) throw paymentError;

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Confirm subscription
      const { error: subscriptionError } = await supabase.functions.invoke('stripe-payment-processor', {
        body: {
          action: 'confirm-subscription',
          planId: planId,
          userId: user.id
        }
      });

      if (subscriptionError) throw subscriptionError;

      onSuccess();
      
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center mb-4">
          <p className="text-gray-300">{planName}</p>
          <p className="text-2xl font-bold text-white">{amount}/month</p>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-gray-300">Card Number</Label>
            <Input
              placeholder="1234 5678 9012 3456"
              value={cardDetails.number}
              onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300">Expiry</Label>
              <Input
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">CVC</Label>
              <Input
                placeholder="123"
                value={cardDetails.cvc}
                onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Cardholder Name</Label>
            <Input
              placeholder="John Doe"
              value={cardDetails.name}
              onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center text-sm text-gray-400 mt-4">
          <Lock className="w-4 h-4 mr-2" />
          Secured by Stripe
        </div>

        <div className="flex gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripeCheckout;