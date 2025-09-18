import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export const HealthcareFeatures: React.FC = () => {
  const [activeModule, setActiveModule] = useState('patient');

  const modules = {
    patient: {
      title: 'Patient Management System',
      features: [
        { name: 'Electronic Health Records', patients: 2847, status: 'HIPAA Compliant' },
        { name: 'Appointment Scheduling', bookings: 156, efficiency: '94%' },
        { name: 'Prescription Management', scripts: 89, accuracy: '99.2%' },
        { name: 'Billing Integration', claims: 234, success_rate: '97%' }
      ],
      alerts: ['3 patients need follow-up', '12 appointments today', '5 lab results pending']
    },
    clinical: {
      title: 'Clinical Decision Support',
      features: [
        { name: 'Diagnostic AI Assistant', cases: 145, accuracy: '96.8%' },
        { name: 'Drug Interaction Checker', checks: 567, warnings: 23 },
        { name: 'Treatment Protocols', protocols: 89, compliance: '98%' },
        { name: 'Risk Assessment', assessments: 234, high_risk: 12 }
      ],
      alerts: ['2 high-risk patients identified', '1 drug interaction warning', '4 protocol updates available']
    },
    analytics: {
      title: 'Healthcare Analytics',
      features: [
        { name: 'Population Health Metrics', population: '12.4K', trends: 'improving' },
        { name: 'Quality Measures', score: 94, benchmark: '90%' },
        { name: 'Financial Analytics', revenue: '$2.1M', margin: '18%' },
        { name: 'Operational Efficiency', utilization: '87%', satisfaction: '4.8/5' }
      ],
      alerts: ['Patient satisfaction up 12%', 'Readmission rates decreased', 'Cost per patient optimized']
    }
  };

  const currentModule = modules[activeModule as keyof typeof modules];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {Object.entries(modules).map(([key, module]) => (
          <Button
            key={key}
            variant={activeModule === key ? "default" : "outline"}
            onClick={() => setActiveModule(key)}
            size="sm"
          >
            {module.title}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {currentModule.title}
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Healthcare</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-semibold">System Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentModule.features.map((feature, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
                    <h4 className="font-medium text-sm mb-3">{feature.name}</h4>
                    <div className="space-y-2">
                      {Object.entries(feature).filter(([key]) => key !== 'name').map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  Priority Alerts
                </h4>
                <ul className="space-y-2">
                  {currentModule.alerts.map((alert, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Compliance Status</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>HIPAA Compliance</span>
                      <span>100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Data Security</span>
                      <span>98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Quality Measures</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">AI Recommendations</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Schedule preventive care reminders</li>
                  <li>• Optimize staff scheduling for peak hours</li>
                  <li>• Review high-cost treatment protocols</li>
                  <li>• Update patient communication templates</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};