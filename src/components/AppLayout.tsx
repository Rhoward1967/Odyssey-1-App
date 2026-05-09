import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNavigationMenu from './MobileNavigationMenu';
import RomanErrorBoundary from './RomanErrorBoundary';
import DisclaimerGate from './DisclaimerGate';

export default function AppLayout() {
  const { pathname } = useLocation();
  const isChatPage = pathname === '/app/roman';

  return (
    <DisclaimerGate>
      <div className="flex h-screen overflow-hidden bg-slate-900">
        <Sidebar />

        <main className={`flex-1 flex flex-col ${isChatPage ? 'overflow-hidden' : 'overflow-auto'}`}>
          <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-white">ODYSSEY-1</h1>
              <MobileNavigationMenu />
            </div>
          </div>

          {isChatPage ? (
            <div className="flex-1 min-h-0 flex flex-col">
              <RomanErrorBoundary>
                <Outlet />
              </RomanErrorBoundary>
            </div>
          ) : (
            <div className="p-4 md:p-6 max-w-none mt-16 md:mt-0">
              <RomanErrorBoundary>
                <Outlet />
              </RomanErrorBoundary>
            </div>
          )}
        </main>
      </div>
    </DisclaimerGate>
  );
}