import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/AuthProvider';

import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Subscription from './pages/Subscription';
import ControlPanel from './pages/ControlPanel';
import BiddingCalculator from './pages/BiddingCalculator';
import Research from './pages/Research';
import AIResearch from './pages/AIResearch';
import ResearchNotes from './pages/ResearchNotes';
import Web3 from './pages/Web3';
import EmailStudio from './pages/EmailStudio';
import Appointments from './pages/Appointments';
import MediaWorkstation from './pages/MediaWorkstation';
import Profile from './pages/Profile';
import Budget from './pages/Budget';
import Odyssey from './pages/Odyssey';
import Help from './pages/Help';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { CleaningQuoteForm } from './components/CleaningQuoteForm';
import Invoicing from './pages/Invoicing';
import UserLoginPortal from './components/UserLoginPortal';
import { useAuth } from './components/AuthProvider';

// AuthRoute: Only render children if user is authenticated, else redirect to /login
import { Navigate, useLocation } from 'react-router-dom';
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to='/login' state={{ from: location }} replace />;
  return <>{children}</>;
}

const queryClient = new QueryClient();

const App = () => {
  return (
    <ThemeProvider defaultTheme='light'>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path='/login' element={<UserLoginPortal />} />
                <Route
                  path='/'
                  element={
                    <AuthRoute>
                      <Index />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/subscription'
                  element={
                    <AuthRoute>
                      <Subscription />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/control-panel'
                  element={
                    <AuthRoute>
                      <ControlPanel />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/bidding-calculator'
                  element={
                    <AuthRoute>
                      <BiddingCalculator />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/research'
                  element={
                    <AuthRoute>
                      <Research />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/ai-research'
                  element={
                    <AuthRoute>
                      <AIResearch />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/research-notes'
                  element={
                    <AuthRoute>
                      <ResearchNotes />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/web3'
                  element={
                    <AuthRoute>
                      <Web3 />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/email-studio'
                  element={
                    <AuthRoute>
                      <EmailStudio />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/appointments'
                  element={
                    <AuthRoute>
                      <Appointments />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/media-workstation'
                  element={
                    <AuthRoute>
                      <MediaWorkstation />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/profile'
                  element={
                    <AuthRoute>
                      <Profile />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/budget'
                  element={
                    <AuthRoute>
                      <Budget />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/odyssey'
                  element={
                    <AuthRoute>
                      <Odyssey />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/help'
                  element={
                    <AuthRoute>
                      <Help />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/terms'
                  element={
                    <AuthRoute>
                      <Terms />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/privacy'
                  element={
                    <AuthRoute>
                      <Privacy />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/cleaning-quote'
                  element={
                    <AuthRoute>
                      <CleaningQuoteForm />
                    </AuthRoute>
                  }
                />
                <Route
                  path='/invoicing'
                  element={
                    <AuthRoute>
                      <Invoicing />
                    </AuthRoute>
                  }
                />
                <Route path='*' element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
