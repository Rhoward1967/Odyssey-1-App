import { Button } from '@/components/ui/button';
import {
  BookOpen // NEW - For User Manual icon
  ,









  Calculator,
  CreditCard,
  Home,
  Settings,
  TrendingUp,
  User,
  Users
} from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import MobileNavigationMenu from './MobileNavigationMenu';
import SocialMediaIcons from './SocialMediaIcons';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/app', label: 'Dashboard', icon: Home }, // Changed from '/'
    { path: '/app/trading', label: 'Trading', icon: TrendingUp },
    { path: '/app/calculator', label: 'Calculator', icon: Calculator },
    { path: '/app/workforce', label: 'Workforce', icon: Users },
    { path: '/app/admin', label: 'Admin Center', icon: Settings },
    { path: '/app/user-manual', label: 'Manual', icon: BookOpen }, // ✅ FIXED!
    { path: '/app/subscription', label: 'Subscription', icon: CreditCard },
    // REMOVED: /clients and /schedule (broken routes)
  ];

  return (
    <nav className='bg-slate-800/50 border-b border-slate-700 px-4 py-3 relative z-50'>
      <div className='container mx-auto flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          {/* Logo/Brand removed to give more space for tabs */}
        </div>
        
        {/* Desktop Navigation - Hidden on mobile */}
        <div className='hidden md:flex items-center space-x-1'>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size='sm'
                  className={`${
                    isActive
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : 'text-slate-300 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  <Icon className='w-4 h-4 mr-2' />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
        
        <div className='flex items-center space-x-4'>
          {/* Social Media Icons - Desktop and tablet */}
          <div className='hidden md:block'>
            <SocialMediaIcons size='sm' />
          </div>

          {/* User Profile - Always visible */}
          <Link to='/profile'>
            <Button
              variant='ghost'
              size='sm'
              className='text-slate-300 hover:text-white'
            >
              <User className='w-4 h-4 mr-2' />
              <span className='hidden sm:inline'>Profile</span>
            </Button>
          </Link>

          {/* Mobile Navigation Menu - Only on mobile */}
          <div className='md:hidden'>
            <MobileNavigationMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;