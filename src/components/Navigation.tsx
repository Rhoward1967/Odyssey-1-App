import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Home, DollarSign, HelpCircle, CreditCard, BarChart3, Calendar, Monitor } from 'lucide-react';
import SocialMediaIcons from './SocialMediaIcons';
import MobileNavigationMenu from './MobileNavigationMenu';

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/odyssey', label: 'ODYSSEY-1', icon: BarChart3 },
    { path: '/control-panel', label: 'Control Panel', icon: BarChart3 },
    { path: '/media-workstation', label: 'Media Room', icon: Monitor },
    { path: '/budget', label: 'Budget', icon: DollarSign },
    { path: '/help', label: 'Help', icon: HelpCircle },
    { path: '/subscription', label: 'Subscription', icon: CreditCard },
    { path: '/appointments', label: 'Appointments', icon: Calendar }
  ];

  return (
    <>
      <nav className="bg-slate-800/50 border-b border-slate-700 px-4 py-3 relative z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Logo/Brand removed to give more space for tabs */}
          </div>
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant={isActive ? "default" : "ghost"} 
                    size="sm"
                    className={`${
                      isActive ? "bg-purple-500 hover:bg-purple-600 text-white" : "text-slate-300 hover:bg-slate-600 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
          <div className="flex items-center space-x-4">
            {/* Social Media Icons - Desktop and tablet */}
            <div className="hidden md:block">
              <SocialMediaIcons size="sm" />
            </div>
            
            {/* User Profile - Always visible */}
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
            
            {/* Enhanced Mobile Navigation Menu */}
            <MobileNavigationMenu />
          </div>
        </div>
      </nav>
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent mb-8">
              ODYSSEY-1
            </div>
            
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-64"
                >
                  <Button 
                    variant={isActive ? "default" : "ghost"} 
                    className={`w-full justify-start text-lg py-6 ${
                      isActive ? "bg-purple-500 hover:bg-purple-600 text-white" : "text-slate-300 hover:bg-slate-600 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            
            {/* Social Media Icons for Mobile */}
            <div className="mt-8 pt-6 border-t border-slate-600">
              <SocialMediaIcons size="md" className="justify-center" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
export { Navigation };