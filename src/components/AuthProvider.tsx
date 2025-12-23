import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // --- THE ARCHITECT'S BACKDOOR ---
    // If the bypass switch is on, create a fake user and stop.
    if (import.meta.env.VITE_AUTH_BYPASS === "true") {
      console.log('🚪 Architect backdoor activated - bypassing authentication');
      setUser({ id: 'dev-user-id', email: 'architect@odyssey1.ai' } as User);
      setLoading(false);
      return; // Stop the real auth logic from running
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // If user is authenticated and on public routes, redirect to app
      if (session && (window.location.pathname === '/' || window.location.pathname === '/login')) {
        console.log('🔀 AuthProvider: Redirecting authenticated user to /app');
        window.location.href = '/app';
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Redirect authenticated users away from public pages
      if (session && (window.location.pathname === '/' || window.location.pathname === '/login')) {
        console.log('🔀 AuthProvider: Auth change - redirecting to /app');
        window.location.href = '/app';
      }
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = { user, loading };

  // We show a loading indicator while the initial session is being fetched.
  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
