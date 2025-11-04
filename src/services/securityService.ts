import { supabase } from '@/lib/supabaseClient';

export class SecurityService {
  // Enhanced logout with proper cleanup
  static async secureLogout() {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  }

  // Validate session server-side for Edge Functions
  static async validateServerSession(authHeader: string) {
    const jwt = authHeader.replace('Bearer ', '');
    
    if (!jwt) {
      throw new Error('No authorization token provided');
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(jwt);
      
      if (error || !user) {
        throw new Error('Invalid session');
      }
      
      return user;
    } catch (error) {
      throw new Error('Session validation failed');
    }
  }

  // Test RLS policies
  static async testRLSAccess() {
    try {
      const { data, error } = await supabase
        .from('handbook_categories')
        .select('count(*)')
        .eq('is_active', true);
        
      if (error) {
        console.error('RLS test failed:', error);
        return false;
      }
      
      console.log('✅ RLS test passed - authenticated access working');
      return true;
    } catch (error) {
      console.error('RLS test error:', error);
      return false;
    }
  }

  // Valid Supabase auth event types for reference
  static getValidAuthEvents() {
    return [
      'INITIAL_SESSION',
      'SIGNED_IN', 
      'SIGNED_OUT',
      'PASSWORD_RECOVERY',
      'TOKEN_REFRESHED',
      'USER_UPDATED',
      'MFA_CHALLENGE_VERIFIED'
    ] as const;
  }
}
