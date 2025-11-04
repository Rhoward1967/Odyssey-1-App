import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Enhanced security guard for routes with proper session handling
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Enhanced session validation
    const validateSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session validation error:', error);
          setSessionValid(false);
          return;
        }

        // Check if session exists and is not expired
        if (session && session.expires_at) {
          const now = Math.floor(Date.now() / 1000);
          const isExpired = session.expires_at < now;
          setSessionValid(!isExpired);
        } else {
          setSessionValid(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setSessionValid(false);
      }
    };

    if (!loading) {
      validateSession();
    }

    // Listen for auth state changes with correct event types
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔒 Auth state change:', event);
      
      if (event === 'SIGNED_OUT') {
        setSessionValid(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSessionValid(!!session);
      }
    });

    return () => subscription.unsubscribe();
  }, [loading]);

  // Show loading while checking authentication
  if (loading || sessionValid === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">🔒 Verifying authentication...</div>
      </div>
    );
  }

  // Redirect if no user or invalid session
  if (!user || sessionValid === false) {
    return <Navigate to="/login" replace />;
  }

  // Allow access to protected content
  return <Outlet />;
}