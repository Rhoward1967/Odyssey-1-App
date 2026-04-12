/**
 * ODYSSEY-1 Main Application
 * © 2026 Rickey A Howard. All Rights Reserved.
 */

import { lazy, Suspense } from "react";
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

// Static — must be available immediately (login flow + 404)
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import PublicHomePage from "./components/PublicHomePage";
import HowardJanitorial from "./pages/HowardJanitorial";

// Lazy — each page loads only when its route is visited
const Index                        = lazy(() => import("./pages/Index"));
const Subscribe                    = lazy(() => import("./pages/Subscribe"));
const Onboard                      = lazy(() => import("./pages/Onboard"));
const Profile                      = lazy(() => import("./pages/Profile"));
const Subscription                 = lazy(() => import("./pages/Subscription"));
const Admin                        = lazy(() => import("./pages/Admin"));
const ContractorOnboarding         = lazy(() => import("./pages/ContractorOnboarding"));
const ApexDashboard                = lazy(() => import("./pages/ApexDashboard"));
const OSCWalletDashboard           = lazy(() => import("./components/OSCWalletDashboard"));
const WorkforceDashboard           = lazy(() => import("./components/WorkforceDashboard"));
const Invoicing                    = lazy(() => import("./pages/Invoicing"));
const ContractorManager            = lazy(() => import("./components/ContractorManager"));
const BidsList                     = lazy(() => import("./pages/BidsList"));
const Mel                          = lazy(() => import("./pages/Mel"));
const CatalogManager               = lazy(() => import("./pages/CatalogManager"));
const Trading                      = lazy(() => import("./pages/Trading"));
const Calculator                   = lazy(() => import("./pages/Calculator"));
const SovereignContractIntake      = lazy(() => import("./pages/SovereignContractIntake"));
const LegalDefenseDashboard        = lazy(() => import("./components/LegalDefenseDashboard"));
const Handbook                     = lazy(() => import("./pages/Handbook"));
const UserManual                   = lazy(() => import("./components/UserManual"));
const MediaCenter                  = lazy(() => import("./pages/MediaCenter"));
const TestCheckout                 = lazy(() => import("./pages/TestCheckout"));
const SystemObservabilityDashboard = lazy(() => import("./components/SystemObservabilityDashboard"));
const AIIntelligenceLiveFeed       = lazy(() => import("./components/AIIntelligenceLiveFeed"));
const SystemEvolutionTracker       = lazy(() => import("./components/SystemEvolutionTracker"));
const SovereignScanner             = lazy(() => import("./pages/SovereignScanner"));

const queryClient = new QueryClient();

const App = () => {
  // 1. Identify Domain First
  const hostname = window.location.hostname;
  const isHowardJanitorialDomain = hostname.includes("howardjanitorial.com") || hostname.includes("hjs-services");

  // 2. Wrap everything in the ErrorBoundary
  return (
    <ErrorBoundary componentName="App">
      {isHowardJanitorialDomain ? (
        // Route for the Janitorial Business
        <HowardJanitorial />
      ) : (
        // Main Odyssey-1 Infrastructure
        <>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <APIProvider>
                <FundingProvider>
                  <PositionLotsProvider>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-slate-100">
                        <Suspense fallback={
                          <div className="flex items-center justify-center min-h-screen">
                            <div className="text-white text-lg">Loading...</div>
                          </div>
                        }>
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

                                {/* Wallet with Safety Check for Auth State */}
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
                              </Route>
                            </Route>

                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
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

/**
 * Small helper to handle the user check safely for the Wallet
 * This prevents the 'user_id=eq.undefined' error in your console
 */
const OSCWalletRoute = () => {
  const { user } = useAuth();
  if (!user) return <div className="p-8 text-center text-blue-400">Authenticating Secure Access...</div>;
  return <OSCWalletDashboard userId={user.id} />;
};

export default App;
