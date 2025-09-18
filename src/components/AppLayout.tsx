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
          <TabsList className="grid w-full grid-cols-7 bg-white border-b">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="timeclock" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Clock
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Onboarding
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              I-9 Compliance
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Profiles
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2 bg-red-100">
              <Settings className="w-4 h-4" />
              Admin
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