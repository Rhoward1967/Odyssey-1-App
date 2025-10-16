import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bell,
  Calendar,
  CreditCard,
  FileText,
  Home,
  Menu,
  Search,
  Settings,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Subscription', href: '/subscription', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className='fixed inset-0 z-40 lg:hidden'>
          <div
            className='fixed inset-0 bg-gray-600 bg-opacity-75'
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className='flex h-16 items-center justify-between px-6 border-b border-gray-200'>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>O1</span>
            </div>
            <h1 className='ml-3 text-xl font-bold text-gray-900'>Odyssey-1</h1>
          </div>
          <Button
            variant='ghost'
            size='sm'
            className='lg:hidden'
            onClick={() => setSidebarOpen(false)}
          >
            <X className='h-5 w-5' />
          </Button>
        </div>

        {/* User profile section */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center'>
            <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center'>
              <User className='h-5 w-5 text-gray-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-900'>
                {user?.email || 'User'}
              </p>
              <p className='text-xs text-gray-500'>Premium Member</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className='mt-6 px-3'>
          <div className='space-y-1'>
            {navigation.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group ${
                    isActive
                      ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive
                        ? 'text-blue-600'
                        : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className='absolute bottom-0 w-full p-4 border-t border-gray-200'>
          <Button
            variant='outline'
            size='sm'
            className='w-full'
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className='lg:pl-64'>
        {/* Top header */}
        <header className='bg-white shadow-sm border-b border-gray-200'>
          <div className='flex h-16 items-center justify-between px-6'>
            <div className='flex items-center'>
              <Button
                variant='ghost'
                size='sm'
                className='lg:hidden mr-4'
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className='h-5 w-5' />
              </Button>

              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input placeholder='Search...' className='pl-10 w-64' />
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <Button variant='ghost' size='sm'>
                <Bell className='h-5 w-5' />
              </Button>
              <div className='text-sm text-gray-700'>
                Welcome back, {user?.email?.split('@')[0] || 'User'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className='p-6'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}