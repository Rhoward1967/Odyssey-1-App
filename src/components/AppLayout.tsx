import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNavigationMenu from './MobileNavigationMenu';
import RomanErrorBoundary from './RomanErrorBoundary';

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      {/* Fixed sidebar on the left - hidden on mobile */}
      <Sidebar />
      
      {/* Main content area that takes up remaining space */}
      <main className="flex-1 overflow-auto">
        {/* Mobile navigation menu - only visible on small screens */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-white">ODYSSEY-1</h1>
            <MobileNavigationMenu />
          </div>
        </div>
        
        {/* Content area with responsive padding */}
        <div className="p-4 md:p-6 max-w-none mt-16 md:mt-0">
          <RomanErrorBoundary>
            <Outlet />
          </RomanErrorBoundary>
        </div>
      </main>
    </div>
  );
}