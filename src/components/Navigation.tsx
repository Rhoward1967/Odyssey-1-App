import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  Home,
  DollarSign,
  HelpCircle,
  CreditCard,
  BarChart3,
  Calendar,
  Monitor,
} from 'lucide-react';
import SocialMediaIcons from './SocialMediaIcons';
import MobileNavigationMenu from './MobileNavigationMenu';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/odyssey', label: 'ODYSSEY-1', icon: BarChart3 },
    { path: '/control-panel', label: 'Control Panel', icon: BarChart3 },
    { path: '/media-workstation', label: 'Media Room', icon: Monitor },
    { path: '/trading', label: 'Trading', icon: DollarSign },
    { path: '/budget', label: 'Budget', icon: DollarSign },
    { path: '/invoicing', label: 'Invoicing', icon: CreditCard },
    { path: '/help', label: 'Help', icon: HelpCircle },
    { path: '/subscription', label: 'Subscription', icon: CreditCard },
    { path: '/appointments', label: 'Appointments', icon: Calendar },
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
