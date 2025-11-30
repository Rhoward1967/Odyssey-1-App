import type { UserRole } from '@/hooks/useUserAccess';
import {
  BarChart3,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Home,
  Shield,
  TrendingUp,
  User,
  Users
} from 'lucide-react';
import React, { lazy, Suspense } from 'react';

export interface AppRoute {
  path: string;
  component: React.ComponentType<any>;
  name: string;
  icon: React.ElementType;
  requiredRole?: UserRole;
  category: 'core' | 'trading' | 'business' | 'admin';
}

const DynamicComponent: React.FC<{ 
  componentPath: string; 
  fallbackName: string;
  icon?: React.ElementType;
}> = ({ componentPath, fallbackName, icon: Icon = BarChart3 }) => {
  const LazyComponent = lazy(() => 
    import(`../pages/${componentPath}.tsx`)
      .catch(() => ({
        default: () => (
          <div className="container mx-auto p-6">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border border-yellow-200 rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <Icon className="w-8 h-8 text-yellow-600 mr-3" />
                <h2 className="text-2xl font-bold text-yellow-900">
                  {fallbackName} - Coming Soon
                </h2>
              </div>
              <p className="text-yellow-800">
                This module is under development.
              </p>
            </div>
          </div>
        )
      }))
  );

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Loading {fallbackName}...</p>
        </div>
      </div>
    }>
      <LazyComponent />
    </Suspense>
  );
};

export const appRoutes: AppRoute[] = [
  { path: '/', component: () => <DynamicComponent componentPath="Index" fallbackName="Dashboard" />, name: 'Dashboard', icon: Home, category: 'core' },
  { path: '/trading', component: () => <DynamicComponent componentPath="Trading" fallbackName="Trading" />, name: 'Trading', icon: TrendingUp, category: 'trading' },
  { path: '/profile', component: () => <DynamicComponent componentPath="Profile" fallbackName="Profile" />, name: 'Profile', icon: User, category: 'core' },
  { path: '/budget', component: () => <DynamicComponent componentPath="Budget" fallbackName="Budget" />, name: 'Budget', icon: DollarSign, category: 'core' },
  { path: '/subscription', component: () => <DynamicComponent componentPath="Subscription" fallbackName="Subscription" />, name: 'Subscription', icon: CreditCard, category: 'core' },
  { path: '/timeclock', component: () => <DynamicComponent componentPath="TimeClock" fallbackName="Time Clock" />, name: 'Time Clock', icon: Clock, category: 'business' },
  { path: '/schedule', component: () => <DynamicComponent componentPath="Schedule" fallbackName="Schedule" />, name: 'Schedule', icon: Calendar, category: 'business' },
  { path: '/hr', component: () => <DynamicComponent componentPath="HRDashboard" fallbackName="HR Dashboard" />, name: 'HR', icon: Users, category: 'business', requiredRole: 'manager' },
  { path: '/admin', component: () => <DynamicComponent componentPath="Admin" fallbackName="Admin" />, name: 'Admin', icon: Shield, category: 'admin', requiredRole: 'admin' },
];