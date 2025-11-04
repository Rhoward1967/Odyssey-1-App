import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log("AuthProvider: Component rendering..."); // <-- ADD LOG 1

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: useEffect started."); // <-- ADD LOG 2

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

    console.log("AuthProvider: Setting up onAuthStateChange listener..."); // <-- ADD LOG 6
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("AuthProvider: onAuthStateChange triggered:", _event, session); // <-- ADD LOG 7
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
      console.log("AuthProvider: Unsubscribing from auth changes."); // <-- ADD LOG 8
      subscription.unsubscribe();
    };
  }, []);

  const value = { user, loading };

  console.log("AuthProvider: Loading state is:", loading); // <-- ADD LOG 9
  // We show a loading indicator while the initial session is being fetched.
  if (loading) {
    console.log("AuthProvider: Returning loading indicator."); // <-- ADD LOG 10
    return <div>Loading authentication...</div>;
  }

  console.log("AuthProvider: Returning children, user:", user); // <-- ADD LOG 11
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
