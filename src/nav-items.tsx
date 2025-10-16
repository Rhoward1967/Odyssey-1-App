import {
  Calendar,
  CreditCard,
  FileText,
  Home,
  Settings,
  User,
} from 'lucide-react';

export const navItems = [
  {
    title: 'Dashboard',
    to: '/',
    icon: <Home className='h-4 w-4' />,
    page: (
      <div className='p-8'>
        <h1>Dashboard</h1>
        <p>Welcome to Odyssey-1 Dashboard</p>
      </div>
    ),
  },
  {
    title: 'Profile',
    to: '/profile',
    icon: <User className='h-4 w-4' />,
    page: (
      <div className='p-8'>
        <h1>Profile</h1>
        <p>User Profile Page</p>
      </div>
    ),
  },
  {
    title: 'Calendar',
    to: '/calendar',
    icon: <Calendar className='h-4 w-4' />,
    page: (
      <div className='p-8'>
        <h1>Calendar</h1>
        <p>Calendar Page</p>
      </div>
    ),
  },
  {
    title: 'Documents',
    to: '/documents',
    icon: <FileText className='h-4 w-4' />,
    page: (
      <div className='p-8'>
        <h1>Documents</h1>
        <p>Documents Page</p>
      </div>
    ),
  },
  {
    title: 'Subscription',
    to: '/subscription',
    icon: <CreditCard className='h-4 w-4' />,
    page: (
      <div className='p-8'>
        <h1>Subscription</h1>
        <p>Subscription Page</p>
      </div>
    ),
  },
  {
    title: 'Settings',
    to: '/settings',
    icon: <Settings className='h-4 w-4' />,
    page: (
      <div className='p-8'>
        <h1>Settings</h1>
        <p>Settings Page</p>
      </div>
    ),
  },
];
