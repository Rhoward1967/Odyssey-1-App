import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          // This is where the user will be redirected after clicking the magic link
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      setMessage('Success! Please check your email for the magic link.');
    } catch (error: any) {
      console.error('Error sending magic link:', error);
      setMessage(`Error: ${error.error_description || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Odyssey-1 Login</CardTitle>
          <CardDescription>
            Enter your email below to receive a magic link to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </form>
          {message && <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}