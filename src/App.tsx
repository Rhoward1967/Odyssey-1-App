/**
 * ODYSSEY-1 Main Application
 * © 2025 Rickey A Howard. All Rights Reserved.
 */

import AIIntelligenceLiveFeed from '@/components/AIIntelligenceLiveFeed';
import AppLayout from '@/components/AppLayout';
import { AuthProvider } from '@/components/AuthProvider';
import ContractorManager from '@/components/ContractorManager';
import ProtectedRoute from '@/components/ProtectedRoute';
import SystemEvolutionTracker from '@/components/SystemEvolutionTracker';
import SystemObservabilityDashboard from '@/components/SystemObservabilityDashboard';
import UserManual from '@/components/UserManual';
import Admin from '@/pages/Admin';
import BidsList from '@/pages/BidsList';
import Calculator from '@/pages/Calculator';
import CatalogManager from '@/pages/CatalogManager';
import Handbook from '@/pages/Handbook';
import Index from '@/pages/Index';
import Invoicing from '@/pages/Invoicing';
import LoginPage from '@/pages/LoginPage';
import Mel from '@/pages/Mel';
import NotFound from '@/pages/NotFound';
import Profile from '@/pages/Profile';
import Subscription from '@/pages/Subscription';
import Trading from '@/pages/Trading';
import WorkforceDashboard from '@/pages/WorkforceDashboard';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PublicHomePage from './components/PublicHomePage';
import { APIProvider } from './contexts/APIContext';
import { FundingProvider } from './contexts/FundingContext';
import { PositionLotsProvider } from './contexts/PositionLotsProvider';
import { ErrorBoundary } from './lib/ErrorBoundary';
import { supabase } from './lib/supabaseClient';
import MediaCenter from './pages/MediaCenter';
import Onboard from './pages/Onboard';
import Subscribe from './pages/Subscribe';
import TestCheckout from './pages/TestCheckout';

function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Enhanced magic link handling with security improvements
    const handleAuth = async () => {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      
      // Handle newer PKCE/code flow (recommended)
      if (params.get('code')) {
        console.log('🔗 Processing magic link with code...');
        setRedirecting(true);
        
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          
          // Clean URL immediately for security
          window.history.replaceState({}, document.title, window.location.pathname);
          
          if (error) {
            console.error('Magic link processing error:', error);
            setRedirecting(false);
            return;
          }
          
          setTimeout(() => {
            window.location.href = '/app';
          }, 500);
          
        } catch (error) {
          console.error('Auth exchange failed:', error);
          setRedirecting(false);
        }
        return;
      }

      // Handle legacy access_token flow (fallback)
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      
      if (accessToken || refreshToken || type === 'magiclink') {
        console.log('🔗 Processing legacy magic link...');
        setRedirecting(true);
        
        // Clean URL for security
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Small delay to prevent flickering
        setTimeout(() => {
          window.location.href = '/app';
        }, 500);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && window.location.pathname === '/') {
        console.log('✅ User already authenticated, redirecting to /app');
        setRedirecting(true);
        setTimeout(() => {
          window.location.href = '/app';
        }, 300);
        return;
      }

      setSession(session);
      setLoading(false);
    };

    handleAuth();

    // Enhanced auth state listener with correct event types
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session && window.location.pathname === '/') {
        console.log('✅ User signed in, redirecting to /app');
        setRedirecting(true);
        setTimeout(() => {
          window.location.href = '/app';
        }, 500);
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out, redirecting to login');
        setSession(null);
        if (window.location.pathname.startsWith('/app')) {
          window.location.href = '/login';
        }
      } else {
        setSession(session);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading || redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <p className="text-white text-xl">
            {redirecting ? 'Redirecting to ODYSSEY-1...' : 'Loading ODYSSEY-1...'}
          </p>
          {redirecting && (
            <p className="text-purple-400 text-sm mt-2">
              🔗 Magic link authentication successful
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary componentName="App">
      <AuthProvider>
        <APIProvider>
          <FundingProvider>
            <PositionLotsProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                        <Route 
                          path="admin" 
                          element={
                            <ErrorBoundary componentName="AdminDashboard">
                              <Admin />
                            </ErrorBoundary>
                          } 
                        />
                        
                        {/* R.O.M.A.N. Observability Dashboards */}
                        <Route 
                          path="admin/observability" 
                          element={
                            <ErrorBoundary componentName="SystemObservability">
                              <SystemObservabilityDashboard />
                            </ErrorBoundary>
                          } 
                        />
                        <Route 
                          path="admin/ai-intelligence" 
                          element={
                            <ErrorBoundary componentName="AIIntelligence">
                              <AIIntelligenceLiveFeed />
                            </ErrorBoundary>
                          } 
                        />
                        <Route 
                          path="admin/evolution" 
                          element={
                            <ErrorBoundary componentName="SystemEvolution">
                              <SystemEvolutionTracker />
                            </ErrorBoundary>
                          } 
                        />
                        
                        <Route 
                          path="trading" 
                          element={
                            <ErrorBoundary componentName="Trading">
                              <Trading />
                            </ErrorBoundary>
                          } 
                        />
                        <Route path="calculator" element={<Calculator />} />
                        <Route 
                          path="workforce" 
                          element={
                            <ErrorBoundary componentName="Workforce">
                              <WorkforceDashboard />
                            </ErrorBoundary>
                          } 
                        />
                        <Route 
                          path="invoicing" 
                          element={
                            <ErrorBoundary componentName="Invoicing">
                              <Invoicing />
                            </ErrorBoundary>
                          } 
                        />
                        <Route 
                          path="contractors" 
                          element={
                            <ErrorBoundary componentName="Contractors">
                              <ContractorManager />
                            </ErrorBoundary>
                          } 
                        />
                        <Route 
                          path="bids" 
                          element={
                            <ErrorBoundary componentName="Bids">
                              <BidsList />
                            </ErrorBoundary>
                          } 
                        />                        <Route 
                          path="mel" 
                          element={
                            <ErrorBoundary componentName="MEL">
                              <Mel />
                            </ErrorBoundary>
                          } 
                        />                        <Route path="catalog" element={<CatalogManager />} />
                        <Route path="handbook" element={<Handbook />} />
                        <Route path="user-manual" element={<UserManual />} />
                        <Route path="media-center" element={<MediaCenter />} />
                        <Route path="test-checkout" element={<TestCheckout />} />
                        
                        {/* Catch-all for invalid /app/* routes */}
                        <Route path="*" element={<NotFound />} />
                      </Route>
                    </Route>
                    
                    {/* Catch-all route for other 404 pages */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </BrowserRouter>
            </PositionLotsProvider>
          </FundingProvider>
        </APIProvider>
        <Analytics />
        <SpeedInsights />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
