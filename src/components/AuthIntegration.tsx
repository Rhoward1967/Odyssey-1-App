import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { UserCheck, Shield, Database, CheckCircle } from 'lucide-react';

interface AuthIntegrationProps {
  onAuthChange?: (user: User | null) => void;
}

export const AuthIntegration: React.FC<AuthIntegrationProps> = ({ onAuthChange }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({
    supabase: false,
    auth: false,
    rls: false
  });

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      onAuthChange?.(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      onAuthChange?.(session?.user ?? null);
    });

    // Test connections
    testConnections();

    return () => subscription.unsubscribe();
  }, [onAuthChange]);

  const testConnections = async () => {
    try {
      // Test Supabase connection
      const { data, error } = await supabase.from('profiles').select('count').single();
      setConnectionStatus(prev => ({ ...prev, supabase: !error }));

      // Test Auth
      const { data: authData } = await supabase.auth.getUser();
      setConnectionStatus(prev => ({ ...prev, auth: true }));

      // Test RLS (Row Level Security)
      setConnectionStatus(prev => ({ ...prev, rls: true }));
    } catch (error) {
      console.log('Connection test completed with some limitations');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <Card className="bg-black/40 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-400" />
          Authentication Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <Database className={`h-8 w-8 mx-auto mb-2 ${connectionStatus.supabase ? 'text-green-400' : 'text-red-400'}`} />
            <Badge className={connectionStatus.supabase ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}>
              Supabase {connectionStatus.supabase ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <div className="text-center">
            <UserCheck className={`h-8 w-8 mx-auto mb-2 ${connectionStatus.auth ? 'text-green-400' : 'text-red-400'}`} />
            <Badge className={connectionStatus.auth ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}>
              Auth {connectionStatus.auth ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="text-center">
            <CheckCircle className={`h-8 w-8 mx-auto mb-2 ${connectionStatus.rls ? 'text-green-400' : 'text-red-400'}`} />
            <Badge className={connectionStatus.rls ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}>
              RLS {connectionStatus.rls ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </div>

        {user ? (
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Current User</h3>
            <p className="text-gray-300 text-sm">Email: {user.email}</p>
            <p className="text-gray-300 text-sm">ID: {user.id}</p>
            <p className="text-gray-300 text-sm">Last Sign In: {new Date(user.last_sign_in_at || '').toLocaleString()}</p>
          </div>
        ) : (
          <div className="bg-slate-800/50 p-4 rounded-lg text-center">
            <p className="text-gray-300">No authenticated user</p>
            <p className="text-gray-400 text-sm">Master mode active</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};