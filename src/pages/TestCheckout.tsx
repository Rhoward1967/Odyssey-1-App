import { useState } from 'react';
import { supabase } from '../services/supabase';

export default function TestCheckout() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCheckoutSession = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          priceId: 'price_1QkVqOBQBvXXXXXXXXXX', // Replace with actual price ID
          userId: 'test-user-123' 
        }
      });

      setResult({ data, error, success: !error });
    } catch (err: any) {
      setResult({ error: err.message, success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Checkout Session Test</h1>
      <button 
        onClick={testCheckoutSession} 
        disabled={loading}
        style={{ padding: '1rem 2rem', fontSize: '1rem', cursor: 'pointer' }}
      >
        {loading ? 'Testing...' : 'Test Checkout Session'}
      </button>
      
      {result && (
        <pre style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#f5f5f5', 
          borderRadius: '8px',
          overflow: 'auto'
        }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
