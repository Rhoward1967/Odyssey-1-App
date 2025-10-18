import { Outlet } from 'react-router-dom';
import Navigation from '@/components/Navigation';

/**
 * This component defines the main structure of your application,
 * including the navigation bar and the content area where pages will be displayed.
 */
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="container mx-auto p-4">
        {/* The <Outlet /> is a placeholder where your page
            components (Dashboard, Profile, etc.) will be rendered. */}
        <Outlet />
      </main>
    </div>
  );
}