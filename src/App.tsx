/**
 * ODYSSEY-1 Main Application
 * © 2026 Rickey A Howard. All Rights Reserved.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { APIProvider } from "./contexts/APIContext";
import { FundingProvider } from "./contexts/FundingContext";
import { PositionLotsProvider } from "./contexts/PositionLotsProvider";
import { ErrorBoundary } from "./lib/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

// Static imports — MetaMask SES compatible (no dynamic import() at runtime)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PublicHomePage from "./components/PublicHomePage";
import Subscribe from "./pages/Subscribe";
import Onboard from "./pages/Onboard";
import LoginPage from "./pages/LoginPage";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import Admin from "./pages/Admin";
import ContractorOnboarding from "./pages/ContractorOnboarding";
import ApexDashboard from "./pages/ApexDashboard";
import OSCWalletDashboard from "./components/OSCWalletDashboard";
import WorkforceDashboard from "./components/WorkforceDashboard";
import Invoicing from "./pages/Invoicing";
import ContractorManager from "./components/ContractorManager";
import BidsList from "./pages/BidsList";
import Mel from "./pages/Mel";
import CatalogManager from "./pages/CatalogManager";
import Trading from "./pages/Trading";
import Calculator from "./pages/Calculator";
import SovereignContractIntake from "./pages/SovereignContractIntake";
import LegalDefenseDashboard from "./components/LegalDefenseDashboard";
import Handbook from "./pages/Handbook";
import UserManual from "./components/UserManual";
import MediaCenter from "./pages/MediaCenter";
import TestCheckout from "./pages/TestCheckout";
import SystemObservabilityDashboard from "./components/SystemObservabilityDashboard";
import AIIntelligenceLiveFeed from "./components/AIIntelligenceLiveFeed";
import SystemEvolutionTracker from "./components/SystemEvolutionTracker";
import HowardJanitorial from "./pages/HowardJanitorial";
import SovereignScanner from "./pages/SovereignScanner";
import DiscordBotDashboard from "./pages/DiscordBotDashboard";
import SovereignBooks from "./pages/SovereignBooks";
import MusicDistribution from "./pages/MusicDistribution";

const queryClient = new QueryClient();

const App = () => {
  const hostname = window.location.hostname;
  const isHowardJanitorialDomain = hostname.includes("howardjanitorial.com") || hostname.includes("hjs-services");

  return (
    <ErrorBoundary componentName="App">
      {isHowardJanitorialDomain ? (
        <HowardJanitorial />
      ) : (
        <>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <APIProvider>
                <FundingProvider>
                  <PositionLotsProvider>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-slate-100">
                        <Routes>
                          {/* Public Routes */}
                          <Route path="/" element={<PublicHomePage />} />
                          <Route path="/subscribe" element={<Subscribe />} />
                          <Route path="/onboard" element={<Onboard />} />
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/onboarding/contractor/:token" element={<ContractorOnboarding />} />

                          {/* Protected Routes */}
                          <Route element={<ProtectedRoute />}>
                            <Route path="/app" element={<AppLayout />}>
                              <Route index element={<Index />} />
                              <Route path="profile" element={<Profile />} />
                              <Route path="subscription" element={<Subscription />} />
                              <Route path="admin" element={<Admin />} />
                              <Route path="apex" element={<ApexDashboard />} />
                              <Route path="osc-wallet" element={<OSCWalletRoute />} />
                              <Route path="workforce" element={<WorkforceDashboard />} />
                              <Route path="invoicing" element={<Invoicing />} />
                              <Route path="contractors" element={<ContractorManager />} />
                              <Route path="bids" element={<BidsList />} />
                              <Route path="mel" element={<Mel />} />
                              <Route path="catalog" element={<CatalogManager />} />
                              <Route path="trading" element={<Trading />} />
                              <Route path="calculator" element={<Calculator />} />
                              <Route path="contracts/new" element={<SovereignContractIntake />} />
                              <Route path="legal-defense" element={<LegalDefenseDashboard />} />
                              <Route path="handbook" element={<Handbook />} />
                              <Route path="user-manual" element={<UserManual />} />
                              <Route path="media-center" element={<MediaCenter />} />
                              <Route path="test-checkout" element={<TestCheckout />} />
                              <Route path="admin/observability" element={<SystemObservabilityDashboard />} />
                              <Route path="admin/ai-intelligence" element={<AIIntelligenceLiveFeed />} />
                              <Route path="admin/evolution" element={<SystemEvolutionTracker />} />
                              <Route path="scanner" element={<SovereignScanner />} />
                              <Route path="discord-bot" element={<DiscordBotDashboard />} />
                              <Route path="sovereign-books" element={<SovereignBooks />} />
                              <Route path="music" element={<MusicDistribution />} />
                            </Route>
                          </Route>

                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
                    </BrowserRouter>
                  </PositionLotsProvider>
                </FundingProvider>
              </APIProvider>
            </QueryClientProvider>
          </AuthProvider>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </ErrorBoundary>
  );
};

const OSCWalletRoute = () => {
  const { user } = useAuth();
  if (!user) return <div className="p-8 text-center text-blue-400">Authenticating Secure Access...</div>;
  return <OSCWalletDashboard userId={user.id} />;
};

export default App;
