import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, Calendar, Phone, Shield, ClipboardList, Settings, Menu, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import MainScheduleWithSidebar from './MainScheduleWithSidebar';
import TimeClockManagement from './TimeClockManagement';
import EmployeeOnboardingSystem from './EmployeeOnboardingSystem';
import I9ComplianceSystem from './I9ComplianceSystem';
import ContactPhoneBook from './ContactPhoneBook';
import EmployeeProfileSystem from './EmployeeProfileSystem';
import AdminDashboard from './AdminDashboard';

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState('schedule');
  const isMobile = useIsMobile();

  // Define all tabs with their properties
  const allTabs = [
    { value: 'schedule', icon: Calendar, label: 'Schedule', priority: 1 },
    { value: 'timeclock', icon: Clock, label: 'Time Clock', priority: 2 },
    { value: 'onboarding', icon: Users, label: 'Onboarding', priority: 4 },
    { value: 'compliance', icon: Shield, label: 'I-9 Compliance', priority: 5 },
    { value: 'profiles', icon: ClipboardList, label: 'Profiles', priority: 3 },
    { value: 'contacts', icon: Phone, label: 'Contacts', priority: 6 },
    { value: 'admin', icon: Settings, label: 'Admin', priority: 7, className: 'bg-red-100' },
  ];

  // On mobile, show only the first 3 most important tabs
  const visibleTabs = isMobile ? allTabs.filter(tab => tab.priority <= 3) : allTabs;
  const hiddenTabs = isMobile ? allTabs.filter(tab => tab.priority > 3) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Rhoward1967/Odyssey-1ai</h1>
            <p className="text-blue-200">ODYSSEY-1 Technology Platform - Powered by HJS SERVICES LLC</p>
          </div>
          <div className="text-right">
            <p className="text-sm">24/7 Emergency Response</p>
            <p className="text-xs text-blue-200">Federal • State • County Operations</p>
          </div>
        </div>
      </header>

      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex bg-white border-b">
            <TabsList className={`${isMobile ? 'grid grid-cols-3 flex-1' : 'grid w-full grid-cols-7'} bg-white border-b-0`}>
              {visibleTabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className={`flex items-center gap-2 ${tab.className || ''}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {isMobile ? '' : tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {/* Mobile dropdown for additional tabs */}
            {isMobile && hiddenTabs.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="border-b rounded-none h-10 px-3">
                    <Menu className="w-4 h-4" />
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {hiddenTabs.map(tab => {
                    const IconComponent = tab.icon;
                    return (
                      <DropdownMenuItem
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className="flex items-center gap-2"
                      >
                        <IconComponent className="w-4 h-4" />
                        {tab.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <TabsContent value="schedule" className="m-0 p-0">
            <MainScheduleWithSidebar />
          </TabsContent>

          <TabsContent value="timeclock" className="m-0 p-0">
            <TimeClockManagement />
          </TabsContent>

          <TabsContent value="onboarding" className="m-0 p-0">
            <EmployeeOnboardingSystem />
          </TabsContent>

          <TabsContent value="compliance" className="m-0 p-0">
            <I9ComplianceSystem />
          </TabsContent>

          <TabsContent value="profiles" className="m-0 p-0">
            <EmployeeProfileSystem />
          </TabsContent>

          <TabsContent value="contacts" className="m-0 p-0">
            <ContactPhoneBook />
          </TabsContent>

          <TabsContent value="admin" className="m-0 p-0">
            <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen p-6">
              <AdminDashboard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}