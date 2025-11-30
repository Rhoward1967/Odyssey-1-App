import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign, HelpCircle,
  Home
} from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const VerticalNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/control-panel', label: 'Control Panel', icon: BarChart3 },
    { path: '/budget', label: 'Budget', icon: DollarSign },
    { path: '/subscription', label: 'Subscription', icon: CreditCard },
    { path: '/admin/help', label: 'Help', icon: HelpCircle },
    { path: '/appointments', label: 'Appointments', icon: Calendar }
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-slate-800/95 border-r border-slate-700 z-50 flex flex-col md:flex">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          ODYSSEY-1
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path} className="block">
              <Button 
                variant={isActive ? "default" : "ghost"} 
                className={`w-full justify-start ${
                  isActive ? "bg-purple-500 hover:bg-purple-600 text-white" : "text-slate-300 hover:bg-slate-600 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default VerticalNavigation;