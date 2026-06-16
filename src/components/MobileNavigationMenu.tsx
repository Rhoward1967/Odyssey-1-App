import { Button } from '@/components/ui/button';
import {
    BarChart3,
    Bell,
    BookMarked,
    BookOpen,
    Bot,
    Briefcase,
    Brain,
    Coins,
    CreditCard,
    DollarSign,
    FileText,
    Gavel,
    LayoutDashboard,
    ListChecks,
    Menu,
    MessageSquare,
    Monitor,
    Music,
    Package,
    Radio,
    Scale,
    ScanBarcode,
    Search,
    Settings,
    Tv,
    User,
    Users,
    X
} from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const MobileNavigationMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Scroll lock logic
  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/roman', label: 'R.O.M.A.N. Chat', icon: Bot },
    { path: '/app/apex', label: 'Apex Dashboard', icon: BarChart3 },
    { path: '/app/trading', label: 'Trading', icon: BarChart3 },
    { path: '/app/calculator', label: 'Calculator', icon: Monitor },
    { path: '/app/workforce', label: 'Workforce', icon: DollarSign },
    { path: '/app/invoicing', label: 'Invoicing', icon: FileText },
    { path: '/app/contractors', label: 'Contractors', icon: Users },
    { path: '/app/bids', label: 'Bids', icon: Briefcase },
    { path: '/app/mel', label: 'MEL', icon: Brain },
    { path: '/app/catalog', label: 'Catalog', icon: Package },
    { path: '/app/osc-wallet', label: 'OSC Wallet', icon: Coins },
    { path: '/app/legal-defense', label: 'Legal Defense', icon: Scale },
    { path: '/app/fcra', label: 'FCRA Tracking', icon: ListChecks },
    { path: '/app/scanner', label: 'Sovereign Scanner', icon: ScanBarcode },
    { path: '/app/discord-bot', label: 'Discord Bot', icon: MessageSquare },
    { path: '/app/sovereign-books', label: 'Sovereign Books', icon: BookOpen },
    { path: '/app/music', label: 'Music Distribution', icon: Music },
    { path: '/app/sovereign-radio', label: 'Sovereign Radio', icon: Radio },
    { path: '/app/handbook', label: 'Handbook', icon: BookMarked },
    { path: '/app/media-center', label: 'Media Center', icon: Tv },
    { path: '/app/layman-law', label: "Layman's Law", icon: Gavel },
    { path: '/app/admin', label: 'Admin Center', icon: Settings },
  ];

  // Define the missing secondaryNavItems
  const secondaryNavItems = [
    { path: '/app/profile', label: 'Profile', icon: User },
    { path: '/app/subscription', label: 'Subscription', icon: CreditCard },
    { path: '/app/user-manual', label: 'User Manual', icon: BookOpen },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        className='md:hidden text-slate-300 hover:text-white'
        onClick={() => setIsOpen(true)}
      >
        <Menu className='w-5 h-5' />
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className='fixed inset-0 z-50 md:hidden'>
          {/* Backdrop */}
          <div
            className='absolute inset-0 bg-black/50 backdrop-blur-sm'
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className='absolute left-0 top-0 h-full w-80 bg-slate-900 border-r border-slate-700 transform transition-transform duration-300'>
            <div className='flex flex-col h-full'>
              {/* Header */}
              <div className='flex items-center justify-between p-6 border-b border-slate-700'>
                <div>
                  <div className='text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent'>
                    ODYSSEY-1
                  </div>
                  <p className='text-sm text-slate-400 mt-1'>AI Platform</p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsOpen(false)}
                  className='text-slate-400 hover:text-white'
                >
                  <X className='w-5 h-5' />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className='p-4 border-b border-slate-700'>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm' className='flex-1'>
                    <Search className='w-4 h-4 mr-2' />
                    Search
                  </Button>
                  <Button variant='outline' size='sm'>
                    <Bell className='w-4 h-4' />
                  </Button>
                  <Button variant='outline' size='sm'>
                    <Settings className='w-4 h-4' />
                  </Button>
                </div>
              </div>

              {/* Main Navigation */}
              <div className='flex-1 p-4 overflow-y-auto'>
                <div className='space-y-2'>
                  <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3'>
                    Main Menu
                  </h3>
                  {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-purple-500 text-white'
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <Icon className='w-5 h-5 mr-3' />
                        <span className='font-medium'>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Secondary Navigation */}
                <div className='mt-8 space-y-2'>
                  <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3'>
                    Account
                  </h3>
                  {secondaryNavItems.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-purple-500 text-white'
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <Icon className='w-5 h-5 mr-3' />
                        <span className='font-medium'>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className='p-4 border-t border-slate-700'>
                <div className='text-xs text-slate-400 text-center'>
                  © 2026 ODYSSEY-1 Platform
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigationMenu;
