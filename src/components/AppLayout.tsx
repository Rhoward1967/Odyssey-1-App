import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-slate-900">
      {/* Fixed sidebar on the left */}
      <Sidebar />
      
      {/* Main content area that takes up remaining space */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-none">
          {/* THIS IS CRITICAL - renders child routes */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}