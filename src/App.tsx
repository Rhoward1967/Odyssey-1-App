import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/AuthProvider";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Subscription from "./pages/Subscription";
import ControlPanel from "./pages/ControlPanel";

import BiddingCalculator from "./pages/BiddingCalculator";
import Research from "./pages/Research";
import AIResearch from "./pages/AIResearch";
import ResearchNotes from "./pages/ResearchNotes";
import Web3 from "./pages/Web3";
import EmailStudio from "./pages/EmailStudio";
import Appointments from "./pages/Appointments";
import MediaWorkstation from "./pages/MediaWorkstation";
import Profile from "./pages/Profile";
import Budget from "./pages/Budget";
import Odyssey from "./pages/Odyssey";
import Help from "./pages/Help";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import { CleaningQuoteForm } from "./components/CleaningQuoteForm";
import Invoicing from "./pages/Invoicing";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/control-panel" element={<ControlPanel />} />
              <Route path="/bidding-calculator" element={<BiddingCalculator />} />
              <Route path="/research" element={<Research />} />
              <Route path="/ai-research" element={<AIResearch />} />
              <Route path="/research-notes" element={<ResearchNotes />} />
              <Route path="/web3" element={<Web3 />} />
              <Route path="/email-studio" element={<EmailStudio />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/media-workstation" element={<MediaWorkstation />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/odyssey" element={<Odyssey />} />
              <Route path="/help" element={<Help />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cleaning-quote" element={<CleaningQuoteForm />} />
              <Route path="/invoicing" element={<Invoicing />} />
              <Route path="/admin/help" element={<Help />} />
              <Route path="/admin" element={<ControlPanel />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
           </BrowserRouter>
          </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
