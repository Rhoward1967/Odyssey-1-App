import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

/**
 * This component acts as a security guard for our routes.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // 1. While we're checking for a user session, show a loading message.
  // This prevents a brief "flash" of the login page for authenticated users.
  if (loading) {
    return <div>Verifying authentication...</div>;
  }

  // 2. If loading is finished and there is NO user, redirect to the login page.
  // The `replace` prop prevents the user from navigating back to the protected page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If loading is finished and there IS a user, allow access to the requested page.
  // The <Outlet /> component renders the actual page (e.g., Dashboard, Profile).
  return <Outlet />;
}