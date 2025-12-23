import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const tier = location.state?.tier;
  const price = location.state?.price;
  const industry = location.state?.industry;

  useEffect(() => {
    if (!tier || !price) {
      navigate('/pricing');
      return;
    }
    initializeStripe();
  }, [tier, price, navigate]);

  async function initializeStripe() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Create Stripe checkout session via Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          tier,
          price,
          industry,
          userId: user.id,
          successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing`
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error initializing checkout. Please try again.');
      navigate('/pricing');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle>Redirecting to Checkout</CardTitle>
          <CardDescription>
            Please wait while we prepare your payment...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center">
            <p className="font-semibold">{tier} Plan</p>
            <p className="text-2xl font-bold text-primary">{price}/month</p>
            <p className="text-sm text-muted-foreground mt-2">
              Industry: {industry}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
