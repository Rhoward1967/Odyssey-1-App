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
import PublicHomePage from './components/PublicHomePage';
import { APIProvider } from './contexts/APIContext';
import { FundingProvider } from './contexts/FundingContext';
import { PositionLotsProvider } from './contexts/PositionLotsProvider';
import { supabase } from './lib/supabaseClient';
import Onboard from './pages/Onboard';
import Subscribe from './pages/Subscribe';

function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Handle auth callback
    const handleAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // If authenticated, redirect to /app instead of showing public pages
        const currentPath = window.location.pathname;
        if (
          currentPath === '/' ||
          currentPath === '/subscribe' ||
          currentPath === '/onboard'
        ) {
          window.location.href = '/app';
          return;
        }
      }

      setSession(session);
      setLoading(false);
    };

    handleAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && (window.location.pathname === '/' || window.location.pathname === '/subscribe')) {
        window.location.href = '/app';
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <p className="text-white text-xl">Loading ODYSSEY-1...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <APIProvider>
        <FundingProvider>
          <PositionLotsProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<PublicHomePage />} />
                  <Route path="/subscribe" element={<Subscribe />} />
                  <Route path="/onboard" element={<Onboard />} />
                  <Route path="/login" element={<LoginPage />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/app" element={<AppLayout />}>
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
