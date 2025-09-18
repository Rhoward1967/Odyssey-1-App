import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Play, ChevronRight, CheckCircle, HelpCircle } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  action: string;
  completed: boolean;
}

export default function PayrollTutorialBot() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'setup',
      title: 'System Setup',
      description: 'Configure your payroll settings and company information',
      action: 'Set up company details, tax settings, and pay periods',
      completed: false
    },
    {
      id: 'employees',
      title: 'Add Employees',
      description: 'Import or manually add employee information',
      action: 'Add employee profiles with pay rates and tax information',
      completed: false
    },
    {
      id: 'timesheets',
      title: 'Time Tracking',
      description: 'Learn how to manage employee hours and attendance',
      action: 'Set up time tracking and review timesheet approval process',
      completed: false
    },
    {
      id: 'calculate',
      title: 'Calculate Payroll',
      description: 'Process payroll calculations with AI assistance',
      action: 'Run payroll calculations and review deductions',
      completed: false
    },
    {
      id: 'deposits',
      title: 'Direct Deposits',
      description: 'Set up and process direct deposit payments',
      action: 'Configure banking information and process payments',
      completed: false
    },
    {
      id: 'reports',
      title: 'Generate Reports',
      description: 'Create payroll reports and tax documents',
      action: 'Generate paystubs, tax reports, and compliance documents',
      completed: false
    }
  ];

  const startTutorial = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const completeStep = () => {
    tutorialSteps[currentStep].completed = true;
    nextStep();
  };

  const resetTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
    tutorialSteps.forEach(step => step.completed = false);
  };

  if (!isActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-500" />
            Payroll System Tutorial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            New to the payroll system? Let our AI assistant guide you through the setup and daily operations.
          </p>
          <div className="flex gap-2">
            <Button onClick={startTutorial} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Start Interactive Tutorial
            </Button>
            <Button variant="outline">
              <HelpCircle className="w-4 h-4 mr-2" />
              Quick Help
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const current = tutorialSteps[currentStep];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-500" />
              Payroll Tutorial Assistant
            </div>
            <Badge variant="outline">
              Step {currentStep + 1} of {tutorialSteps.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{current.title}</h3>
              <p className="text-gray-600">{current.description}</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">What you'll do:</h4>
            <p className="text-sm text-gray-700">{current.action}</p>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={resetTutorial}>
              Exit Tutorial
            </Button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </Button>
              )}
              <Button onClick={completeStep}>
                {currentStep === tutorialSteps.length - 1 ? 'Complete' : 'Next Step'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tutorial Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tutorialSteps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-100 text-green-600' : 
                  index === currentStep ? 'bg-blue-100 text-blue-600' : 
                  'bg-gray-100 text-gray-400'
                }`}>
                  {step.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    index === currentStep ? 'text-blue-600' : 
                    step.completed ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}