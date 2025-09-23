import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, Calendar, Phone, Shield, ClipboardList, Settings } from 'lucide-react';
import MainScheduleWithSidebar from './MainScheduleWithSidebar';
import TimeClockManagement from './TimeClockManagement';
import EmployeeOnboardingSystem from './EmployeeOnboardingSystem';
import I9ComplianceSystem from './I9ComplianceSystem';
import ContactPhoneBook from './ContactPhoneBook';
import EmployeeProfileSystem from './EmployeeProfileSystem';
import AdminDashboard from './AdminDashboard';

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState('schedule');

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
          <TabsList className="grid w-full grid-cols-7 bg-white border-b md:grid-cols-7 sm:grid-cols-4 grid-cols-3 sm:h-auto h-12">
            <TabsTrigger value="schedule" className="flex items-center gap-2 md:flex-row flex-col md:gap-2 gap-0.5 md:text-sm text-xs md:px-4 px-1 md:py-2 py-1">
              <Calendar className="md:w-4 md:h-4 w-3 h-3 flex-shrink-0" />
              <span className="hidden md:inline">Schedule</span>
              <span className="md:hidden text-[10px] leading-tight">Sched</span>
            </TabsTrigger>
            <TabsTrigger value="timeclock" className="flex items-center gap-2 md:flex-row flex-col md:gap-2 gap-0.5 md:text-sm text-xs md:px-4 px-1 md:py-2 py-1">
              <Clock className="md:w-4 md:h-4 w-3 h-3 flex-shrink-0" />
              <span className="hidden md:inline">Time Clock</span>
              <span className="md:hidden text-[10px] leading-tight">Clock</span>
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="flex items-center gap-2 md:flex-row flex-col md:gap-2 gap-0.5 md:text-sm text-xs md:px-4 px-1 md:py-2 py-1">
              <Users className="md:w-4 md:h-4 w-3 h-3 flex-shrink-0" />
              <span className="hidden md:inline">Onboarding</span>
              <span className="md:hidden text-[10px] leading-tight">Board</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2 md:flex-row flex-col md:gap-2 gap-0.5 md:text-sm text-xs md:px-4 px-1 md:py-2 py-1 sm:block hidden">
              <Shield className="md:w-4 md:h-4 w-3 h-3 flex-shrink-0" />
              <span className="hidden md:inline">I-9 Compliance</span>
              <span className="md:hidden text-[10px] leading-tight">I-9</span>
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center gap-2 md:flex-row flex-col md:gap-2 gap-0.5 md:text-sm text-xs md:px-4 px-1 md:py-2 py-1 sm:block hidden">
              <ClipboardList className="md:w-4 md:h-4 w-3 h-3 flex-shrink-0" />
              <span className="hidden md:inline">Profiles</span>
              <span className="md:hidden text-[10px] leading-tight">Prof</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2 md:flex-row flex-col md:gap-2 gap-0.5 md:text-sm text-xs md:px-4 px-1 md:py-2 py-1 sm:block hidden">
              <Phone className="md:w-4 md:h-4 w-3 h-3 flex-shrink-0" />
              <span className="hidden md:inline">Contacts</span>
              <span className="md:hidden text-[10px] leading-tight">Call</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2 md:flex-row flex-col md:gap-2 gap-0.5 md:text-sm text-xs md:px-4 px-1 md:py-2 py-1 bg-red-100 sm:block hidden">
              <Settings className="md:w-4 md:h-4 w-3 h-3 flex-shrink-0" />
              <span className="hidden md:inline">Admin</span>
              <span className="md:hidden text-[10px] leading-tight">Adm</span>
            </TabsTrigger>
          </TabsList>

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