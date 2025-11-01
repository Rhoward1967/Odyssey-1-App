/**
 * ODYSSEY-1 Main Application
 * © 2025 Rickey A Howard. All Rights Reserved.
 */

import AppLayout from '@/components/AppLayout';
import { AuthProvider } from '@/components/AuthProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserManual from '@/components/UserManual';
import Admin from '@/pages/Admin';
import Calculator from '@/pages/Calculator';
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import Profile from '@/pages/Profile';
import Subscription from '@/pages/Subscription';
import Trading from '@/pages/Trading';
import WorkforceDashboard from '@/pages/WorkforceDashboard';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import SubscriptionOnboarding from './components/SubscriptionOnboarding';
import { TrialBanner } from './components/TrialBanner';
import { APIProvider } from './contexts/APIContext';
import { FundingProvider } from './contexts/FundingContext';
import { PositionLotsProvider } from './contexts/PositionLotsProvider';
import { supabase } from './lib/supabaseClient';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    // Handle magic link callback
    const handleAuthCallback = async () => {
      // Check if we're on an auth callback (URL has #access_token)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (hashParams.get('access_token')) {
        console.log('Magic link detected - processing authentication...');
      }

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        setLoading(false);
        return;
      }

      console.log('Session found:', session?.user?.email);
      setSession(session);
      
      // Check if user needs onboarding
      if (session?.user) {
        const hasCompletedOnboarding = session.user.user_metadata?.subscription_status;
        console.log('Onboarding status:', hasCompletedOnboarding);
        setNeedsOnboarding(!hasCompletedOnboarding);
      }
      
      setLoading(false);
    };

    handleAuthCallback();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      
      if (session?.user) {
        const hasCompletedOnboarding = session.user.user_metadata?.subscription_status;
        setNeedsOnboarding(!hasCompletedOnboarding);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <p className="text-white text-xl mb-2">Loading ODYSSEY-1...</p>
          <p className="text-gray-400 text-sm">Authenticating your session...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!session) {
    console.log('No session - showing landing page');
    return <LandingPage />;
  }

  // Show onboarding if authenticated but hasn't completed profile
  if (needsOnboarding) {
    console.log('Session found but needs onboarding');
    return <SubscriptionOnboarding onComplete={() => setNeedsOnboarding(false)} />;
  }

  // Show main app if authenticated and onboarded
  console.log('Session found and onboarded - showing main app');
  return (
    <AuthProvider>
      <APIProvider>
        <FundingProvider>
          <PositionLotsProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
                {/* ADD TRIAL BANNER HERE */}
                <div className="container mx-auto px-4 py-2">
                  <TrialBanner onUpgradeClick={() => {
                    // Navigate to subscription page
                    window.location.href = '/subscription';
                  }} />
                </div>

                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<AppLayout />}>
                      <Route index element={<Index />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="subscription" element={<Subscription />} />
                      <Route path="admin" element={<Admin />} />
                      <Route path="trading" element={<Trading />} />
                      <Route path="calculator" element={<Calculator />} />
                      <Route path="workforce" element={<WorkforceDashboard />} />
                      <Route path="user-manual" element={<UserManual />} />
                    </Route>
                  </Route>
                </Routes>
              </div>
            </BrowserRouter>
          </PositionLotsProvider>
        </FundingProvider>
      </APIProvider>
    </AuthProvider>
  );
}

export default App;
