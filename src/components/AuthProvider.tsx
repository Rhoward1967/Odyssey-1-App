import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: { id: string; email: string } | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- THE ARCHITECT'S BACKDOOR ---
    // If the bypass switch is on, create a fake user and stop.
    if (import.meta.env.VITE_AUTH_BYPASS === "true") {
      console.log('🚪 Architect backdoor activated - bypassing authentication');
      setUser({ id: 'dev-user-id', email: 'architect@odyssey1.ai' });
      setLoading(false);
      return; // Stop the real auth logic from running
    }

    // --- REAL SUPABASE AUTH LOGIC ---
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ? { id: session.user.id, email: session.user.email || '' } : null);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email || '' } : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = { user, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
