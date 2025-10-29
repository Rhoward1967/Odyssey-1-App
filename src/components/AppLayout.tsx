import Navigation from '@/components/Navigation';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header navigation */}
      <Navigation />
      {/* Sidebar */}

      {/* THIS IS CRITICAL - renders child routes */}
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}