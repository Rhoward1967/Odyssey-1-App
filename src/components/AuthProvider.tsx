import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// ARCHITECT'S NOTE (PROJECT RESTORATION - DEFINITIVE):
// This is the restored, architecturally sound AuthProvider. It uses a centralized,
// backend-driven call to `is_super_admin()` to determine administrative status.
// This is the definitive blueprint for Directive RESTORATION-1.

interface AuthContextType {
  user: User | null;
  isSuperAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ARCHITECT_EMAIL = import.meta.env.VITE_ARCHITECT_EMAIL;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- DEVELOPER BYPASS LOGIC ---
    if (ARCHITECT_EMAIL) {
      console.warn(
        `%cARCHITECT MODE ACTIVE: Simulating super admin login for ${ARCHITECT_EMAIL}`,
        'color: yellow; font-weight: bold;'
      );
      const architectUser = {
        id: 'architect-bypass-uuid',
        email: ARCHITECT_EMAIL,
      } as User;
      setUser(architectUser);
      setIsSuperAdmin(true);
      setLoading(false);
      return;
    }

    // --- STANDARD AUTHENTICATION FLOW ---
    const checkSessionAndSetUser = async (session: Session | null) => {
      const authUser = session?.user ?? null;
      setUser(authUser);

      if (authUser) {
        try {
          const { data: isAdmin, error } = await supabase.rpc('is_super_admin');
          if (error) throw error;
          setIsSuperAdmin(isAdmin);
        } catch (error) {
          console.error('Error checking super admin status:', error);
          setIsSuperAdmin(false);
        }
      } else {
        setIsSuperAdmin(false);
      }
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkSessionAndSetUser(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkSessionAndSetUser(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = { user, isSuperAdmin, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthUser extends User {
  role?: 'admin' | 'user' | 'master';
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isMaster: boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Master user bypass - Rickey A. Howard
const MASTER_USER: AuthUser = {
  id: 'master-rickey-howard',
  email: 'rickey@odyssey.com',
  role: 'master',
  name: 'Rickey A. Howard',
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: { name: 'Rickey A. Howard', role: 'master' },
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(MASTER_USER);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          ...session.user,
          role: session.user.user_metadata?.role || 'user',
          name: session.user.user_metadata?.name || session.user.email,
        });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          ...session.user,
          role: session.user.user_metadata?.role || 'user',
          name: session.user.user_metadata?.name || session.user.email,
        });
      } else {
        setUser(MASTER_USER); // Fallback to master
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      // Fallback to master on error
      setUser(MASTER_USER);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: 'user' },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Sign up error:', error);
      setUser(MASTER_USER);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    setUser(MASTER_USER); // Always revert to master
  };

  const authValue = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isMaster: user?.role === 'master' || user?.id === 'master-rickey-howard',
    session,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};
