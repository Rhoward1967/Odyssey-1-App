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

// --- END OF DEFINITIVE IMPLEMENTATION ---
