import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ClipboardList, Clock, Phone, Settings, Shield, Users } from 'lucide-react';
import { useState } from 'react';
import MainScheduleWithSidebar from './MainScheduleWithSidebar';
import TimeClockManagement from './TimeClockManagement';
import EmployeeOnboardingSystem from './EmployeeOnboardingSystem';
import I9ComplianceSystem from './I9ComplianceSystem';
import ContactPhoneBook from './ContactPhoneBook';
import EmployeeProfileSystem from './EmployeeProfileSystem';
import AdminDashboard from './AdminDashboard';
import AutomatedInvoicing from './AutomatedInvoicing';

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState('admin');

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-blue-900 text-white p-4'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='font-bold text-lg md:text-2xl truncate max-w-[70vw]'>
              Rhoward1967/Odyssey-1ai
            </h1>
            <p className='text-blue-200'>
              ODYSSEY-1 Technology Platform - Powered by HJS SERVICES LLC
            </p>
          </div>
          <div className='text-right'>
            <p className='text-sm'>24/7 Emergency Response</p>
            <p className='text-xs text-blue-200'>
              Federal • State • County Operations
            </p>
          </div>
        </div>
      </header>

      <div className='w-full'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-4 md:grid-cols-8 bg-white border-b gap-1'>
            <TabsTrigger
              value='invoicing'
              className='flex items-center gap-1 md:gap-2 text-xs md:text-sm px-1 md:px-2 bg-green-100'
            >
              <ClipboardList className='w-3 h-3 md:w-4 md:h-4' />
              <span>Invoicing</span>
            </TabsTrigger>
            <TabsContent
              value='invoicing'
              className='hidden data-[state=active]:block m-0 p-0'
              forceMount
            >
              <div className='bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-6'>
                <AutomatedInvoicing />
              </div>
            </TabsContent>
            <TabsTrigger
              value='admin'
              className='flex items-center gap-1 md:gap-2 text-xs md:text-sm px-1 md:px-2 bg-red-100'
            >
              <Settings className='w-3 h-3 md:w-4 md:h-4' />
              <span>Admin</span>
            </TabsTrigger>
              <TabsTrigger value="schedule" className="w-full justify-center flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="timeclock" className="w-full justify-center flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Clock
              </TabsTrigger>
              <TabsTrigger value="onboarding" className="w-full justify-center flex items-center gap-2">
                <Users className="w-4 h-4" />
                Onboarding
              </TabsTrigger>
              <TabsTrigger value="compliance" className="w-full justify-center flex items-center gap-2">
                <Shield className="w-4 h-4" />
                I-9 Compliance
              </TabsTrigger>
              <TabsTrigger value="profiles" className="w-full justify-center flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Profiles
              </TabsTrigger>
              <TabsTrigger value="contacts" className="w-full justify-center flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contacts
              </TabsTrigger>
              <TabsTrigger value="admin" className="w-full justify-center flex items-center gap-2 bg-red-100">
                <Settings className="w-4 h-4" />
                Admin
              </TabsTrigger>
            <TabsTrigger
              value='timeclock'
              className='flex items-center gap-1 md:gap-2 text-xs md:text-sm px-1 md:px-2'
            >
              <Clock className='w-3 h-3 md:w-4 md:h-4' />
              <span>Time Clock</span>
            </TabsTrigger>
            <TabsTrigger
              value='onboarding'
              className='flex items-center gap-1 md:gap-2 text-xs md:text-sm px-1 md:px-2'
            >
              <Users className='w-3 h-3 md:w-4 md:h-4' />
              <span>Onboarding</span>
            </TabsTrigger>
            <TabsTrigger
              value='compliance'
              className='flex items-center gap-1 md:gap-2 text-xs md:text-sm px-1 md:px-2'
            >
              <Shield className='w-3 h-3 md:w-4 md:h-4' />
              <span>I-9 Compliance</span>
            </TabsTrigger>
            <TabsTrigger
              value='profiles'
              className='flex items-center gap-1 md:gap-2 text-xs md:text-sm px-1 md:px-2'
            >
              <ClipboardList className='w-3 h-3 md:w-4 md:h-4' />
              <span>Profiles</span>
            </TabsTrigger>
            <TabsTrigger
              value='contacts'
              className='flex items-center gap-1 md:gap-2 text-xs md:text-sm px-1 md:px-2'
            >
              <Phone className='w-3 h-3 md:w-4 md:h-4' />
              <span>Contacts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value='admin'
            className='hidden data-[state=active]:block m-0 p-0'
            forceMount
          >
            <div className='bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6'>
              <AdminDashboard />
            </div>
          </TabsContent>

          <TabsContent
            value='schedule'
            className='hidden data-[state=active]:block m-0 p-0'
            forceMount
          >
            <MainScheduleWithSidebar />
          </TabsContent>

          <TabsContent
            value='timeclock'
            className='hidden data-[state=active]:block m-0 p-0'
            forceMount
          >
            <TimeClockManagement />
          </TabsContent>

          <TabsContent
            value='onboarding'
            className='hidden data-[state=active]:block m-0 p-0'
            forceMount
          >
            <EmployeeOnboardingSystem />
          </TabsContent>

          <TabsContent
            value='compliance'
            className='hidden data-[state=active]:block m-0 p-0'
            forceMount
          >
            <I9ComplianceSystem />
          </TabsContent>

          <TabsContent
            value='profiles'
            className='hidden data-[state=active]:block m-0 p-0'
            forceMount
          >
            <EmployeeProfileSystem />
          </TabsContent>

          <TabsContent
            value='contacts'
            className='hidden data-[state=active]:block m-0 p-0'
            forceMount
          >
            <ContactPhoneBook />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
