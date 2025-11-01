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
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { APIProvider } from './contexts/APIContext';
import { FundingProvider } from './contexts/FundingContext';
import { PositionLotsProvider } from './contexts/PositionLotsProvider';
import { supabase } from './lib/supabaseClient';

function App() {
  console.log('✅ APP.TSX CLEAN VERSION - Testing UserManual', new Date().toISOString());

  // Handle magic link callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        // Redirect to login on error
        window.location.href = '/';
      } else if (session) {
        console.log('Auth successful!', session.user.email);
        // Redirect to dashboard after successful login
        window.location.href = '/';
      }
    };

    // Check if we're on an auth callback (URL has #access_token or ?code=)
    if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
      handleAuthCallback();
    }
  }, []);

  return (
    <AuthProvider>
      <APIProvider>
        <FundingProvider>
          <PositionLotsProvider>
            <BrowserRouter>
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
            </BrowserRouter>
          </PositionLotsProvider>
        </FundingProvider>
      </APIProvider>
    </AuthProvider>
  );
}

export default App;
