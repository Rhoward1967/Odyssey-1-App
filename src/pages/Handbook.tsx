import React, { useState } from 'react';
import HandbookContent from '@/components/HandbookContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, Download } from 'lucide-react';

export default function Handbook() {
  const [activeSection, setActiveSection] = useState('cover');

  const sections = [
    { id: 'cover', title: 'Cover Page' },
    { id: 'welcome', title: 'Welcome Message' },
    { id: 'about', title: 'About This Manual' },
    { id: 'policies', title: 'Company Policies' },
    { id: 'procedures', title: 'Procedures' },
    { id: 'benefits', title: 'Benefits' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Employee Handbook</h1>
            <p className="text-gray-600">HJS Services LLC - Howard Janitorial Services</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Table of Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.title}
                </Button>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <Badge variant="outline" className="mb-2">Updated 09/01/2024</Badge>
              <p className="text-xs text-gray-600">
                This handbook contains important information about your employment with HJS Services LLC.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Handbook Content */}
        <div className="lg:col-span-3">
          <HandbookContent activeSection={activeSection} />
        </div>
      </div>
    </div>
  );
}
