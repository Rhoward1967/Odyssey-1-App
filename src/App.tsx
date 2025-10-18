import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthProvider';
import ProtectedRoute from '@/components/ProtectedRoute'; // <-- Import the guard
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage'; // <-- Import the login page
import Index from '@/pages/Index';
import Profile from '@/pages/Profile';
import Subscription from '@/pages/Subscription';
import Admin from '@/pages/Admin';
import TimeClock from '@/pages/TimeClock';
import Schedule from '@/pages/Schedule';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route: The login page */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes: All application pages are inside here */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Index />} />
              <Route path="profile" element={<Profile />} />
              <Route path="subscription" element={<Subscription />} />
              <Route path="admin" element={<Admin />} />
              <Route path="timeclock" element={<TimeClock />} />
              <Route path="schedule" element={<Schedule />} />
              {/* Add any future protected routes here */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
