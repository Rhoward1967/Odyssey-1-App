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
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { TrialBanner } from './components/TrialBanner';
import { APIProvider } from './contexts/APIContext';
import { FundingProvider } from './contexts/FundingContext';
import { PositionLotsProvider } from './contexts/PositionLotsProvider';
import Subscribe from './pages/Subscribe';
import Onboard from './pages/Onboard';
import PublicHomePage from './components/PublicHomePage';

function App() {
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
