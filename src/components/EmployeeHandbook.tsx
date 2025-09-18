import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Book, Building, Phone, Globe } from 'lucide-react';
import HandbookContent from './HandbookContent';

const EmployeeHandbook = () => {
  const [activeSection, setActiveSection] = useState('welcome');

  const tableOfContents = [
    { id: 'cover', title: 'Cover Page', page: 1 },
    { id: 'about', title: 'About Us', page: 2 },
    { id: 'welcome', title: 'Welcome to Howard Janitorial Services', page: 3 },
    { id: 'manual', title: 'About This Manual', page: 4 },
    { id: 'job-description', title: 'Job Description (Northeast GA Area Supervisor)', page: '5-7' },
    { id: 'promotion', title: 'Promotion Requirements', page: 8 },
    { id: 'payroll', title: 'Payroll', page: 8 },
    { id: 'mission', title: 'Mission Statement', page: 9 },
    { id: 'ada', title: 'ADA/Equal Opportunity Employment', page: 10 },
    { id: 'chain-command', title: 'Chain of Command', page: 11 },
    { id: 'performance', title: 'Onsite Performance', page: 12 },
    { id: 'reporting', title: 'Reporting For Duty', page: 13 },
    { id: 'site-prep', title: 'Site Preparation', page: 14 },
    { id: 'safety', title: 'Injury Reporting and Health and Safety', page: '15-16' },
    { id: 'bloodborne', title: 'Bloodborne Pathogens', page: 17 },
    { id: 'drug-free', title: 'Payroll/Drug-Free Workplace', page: '18-24' },
    { id: 'dress-code', title: 'Rules/Dress Code', page: 25 },
    { id: 'osha', title: 'OSHA Regulations', page: '26-31' },
    { id: 'cleaning-specs', title: 'Cleaning Specifications', page: '32-39' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">HJS Services LLC Employee Handbook</h1>
          <p className="text-lg text-gray-600">dba Howard Janitorial Services</p>
          <Badge variant="secondary" className="mt-2">Updated 09/01/2024</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Table of Contents
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {tableOfContents.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setActiveSection(item.id)}
                    >
                      <div className="flex justify-between w-full">
                        <span className="text-sm">{item.title}</span>
                        <span className="text-xs text-gray-500">{item.page}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <HandbookContent activeSection={activeSection} />
          </div>
        </div>

        {/* Company Footer Info */}
        <div className="mt-8 text-center">
          <Card className="bg-blue-900 text-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>DUNS: 82-902-9292</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>www.howardjanitorial.net</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>800-403-8492</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHandbook;