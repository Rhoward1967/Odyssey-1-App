import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, User, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GoogleAuthProps {
  onAuthSuccess?: (tokens: any, user: any) => void;
}

const ENABLE_TEST_AUTH = import.meta.env.VITE_ENABLE_TEST_AUTH === 'true';

export function GoogleAuth({ onAuthSuccess }: GoogleAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [user, setUser] = useState<any>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Listen for OAuth callback messages from popup
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'GOOGLE_OAUTH_RESULT') {
        setIsLoading(true);
        
        if (event.data.success && event.data.code) {
          try {
            const { data } = await supabase.functions.invoke('google-oauth-handler', {
              body: { action: 'exchange_code', code: event.data.code }
            });
            
            if (data.success) {
              setUser(data.user);
              setAuthStatus('success');
              onAuthSuccess?.(data.tokens, data.user);
            } else {
              setError(`Token exchange failed: ${data.error || 'Unknown error'}`);
              setAuthStatus('error');
            }
          } catch (err) {
            setError('OAuth exchange failed: ' + err.message);
            setAuthStatus('error');
          }
        } else {
          setError(`OAuth failed: ${event.data.error} - ${event.data.errorDescription}`);
          setAuthStatus('error');
        }
        
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAuthSuccess]);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setAuthStatus('idle');
    setError('');
    
    try {
      const { data } = await supabase.functions.invoke('google-oauth-handler', {
        body: { action: 'get_auth_url' }
      });
      
      if (data.success) {
        // Open OAuth URL in popup window
        const popup = window.open(
          data.auth_url,
          'google-oauth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        
        if (!popup) {
          setError('Popup blocked. Please allow popups for this site.');
          setAuthStatus('error');
          setIsLoading(false);
        }
      } else {
        setError('Failed to get authorization URL');
        setAuthStatus('error');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to initiate Google OAuth');
      setAuthStatus('error');
      setIsLoading(false);
    }
  };

  const handleAdminOverride = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { data } = await supabase.functions.invoke('google-oauth-handler', {
        body: { 
          action: 'admin_override', 
          email: adminEmail, 
          password: adminPassword 
        }
      });
      
      if (data.success) {
        const adminUser = { email: adminEmail, name: 'Admin User', admin: true };
        setUser(adminUser);
        setAuthStatus('success');
        onAuthSuccess?.({ admin_session: data.session_key }, adminUser);
      } else {
        setError('Invalid admin credentials');
        setAuthStatus('error');
      }
    } catch (err) {
      setError('Admin authentication failed');
      setAuthStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAuth = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { data } = await supabase.functions.invoke('google-oauth-handler', {
        body: { action: 'test_auth' }
      });
      
      if (data.success) {
        setUser(data.user);
        setAuthStatus('success');
        onAuthSuccess?.({ test_session: true }, data.user);
      }
    } catch (err) {
      setError('Test authentication failed');
      setAuthStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugInfo = async () => {
    try {
      const { data } = await supabase.functions.invoke('google-oauth-handler', {
        body: { action: 'debug' }
      });
      
      if (data.success) {
        alert(JSON.stringify(data.debug, null, 2));
      }
    } catch (err) {
      alert('Debug failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Access
          </CardTitle>
          <CardDescription>
            Connect your Google account to access all your calendars
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {authStatus === 'idle' && (
            <div className="space-y-2">
              <Button 
                onClick={handleGoogleAuth} 
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Connecting...' : 'Connect Google Calendar'}
              </Button>
              
              {ENABLE_TEST_AUTH && (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleTestAuth}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Test Auth
                  </Button>
                  <Button 
                    onClick={handleDebugInfo}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Debug Info
                  </Button>
                </div>
              )}
            </div>
          )}

          {authStatus === 'success' && user && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Connected Successfully!</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-8 w-8" />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <Badge variant="secondary" className="w-full justify-center">
                Calendar Access Granted
              </Badge>
            </div>
          )}

          {authStatus === 'error' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Connection Failed</span>
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={handleGoogleAuth} 
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
                {ENABLE_TEST_AUTH && (
                  <Button 
                    onClick={handleTestAuth}
                    variant="outline"
                    className="flex-1"
                  >
                    Test Mode
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            This will allow access to view and manage your Google Calendar events
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            Alternative Login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="your-email@example.com"
            />
          </div>
          <div>
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleAdminOverride}
            disabled={isLoading || !adminEmail || !adminPassword}
            variant="outline"
            className="w-full"
          >
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}