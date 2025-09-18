import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, CheckCircle, Building, Users, Target } from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
}

export const OnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    teamSize: '',
    primaryGoal: '',
    businessType: ''
  });

  const industries = [
    'Healthcare', 'Education', 'Legal', 'Manufacturing', 
    'Retail', 'Technology', 'Finance', 'Government'
  ];

  const teamSizes = ['1-5', '6-20', '21-50', '51-200', '200+'];
  const goals = ['Increase Efficiency', 'Reduce Costs', 'Scale Operations', 'Improve Customer Service'];
  const businessTypes = ['Startup', 'Small Business', 'Enterprise', 'Non-Profit'];

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: 'Welcome to ODYSSEY-1',
      description: 'Let\'s set up your AI-powered business platform',
      component: (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Welcome to the Future of Business</h3>
          <p className="text-gray-300 mb-6">
            In just a few steps, we'll customize ODYSSEY-1 to perfectly fit your industry and business needs.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-white text-sm">Industry Templates</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-white text-sm">Team Collaboration</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-white text-sm">Custom AI Tools</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: 'Business Information',
      description: 'Tell us about your business',
      component: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="businessName" className="text-white">Business Name</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              placeholder="Enter your business name"
              className="bg-white/10 border-white/20 text-white mt-2"
            />
          </div>
          <div>
            <Label className="text-white">Business Type</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {businessTypes.map(type => (
                <Button
                  key={type}
                  variant={formData.businessType === type ? "default" : "outline"}
                  onClick={() => setFormData({...formData, businessType: type})}
                  className={formData.businessType === type ? "bg-blue-600" : "border-white/20 text-white"}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Industry Selection',
      description: 'Choose your primary industry',
      component: (
        <div>
          <Label className="text-white mb-4 block">Select Your Industry</Label>
          <div className="grid grid-cols-2 gap-3">
            {industries.map(industry => (
              <Button
                key={industry}
                variant={formData.industry === industry ? "default" : "outline"}
                onClick={() => setFormData({...formData, industry})}
                className={formData.industry === industry ? "bg-blue-600" : "border-white/20 text-white"}
              >
                {industry}
              </Button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Team & Goals',
      description: 'Help us understand your needs',
      component: (
        <div className="space-y-6">
          <div>
            <Label className="text-white">Team Size</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {teamSizes.map(size => (
                <Button
                  key={size}
                  variant={formData.teamSize === size ? "default" : "outline"}
                  onClick={() => setFormData({...formData, teamSize: size})}
                  className={formData.teamSize === size ? "bg-blue-600" : "border-white/20 text-white"}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-white">Primary Goal</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {goals.map(goal => (
                <Button
                  key={goal}
                  variant={formData.primaryGoal === goal ? "default" : "outline"}
                  onClick={() => setFormData({...formData, primaryGoal: goal})}
                  className={formData.primaryGoal === goal ? "bg-blue-600" : "border-white/20 text-white"}
                >
                  {goal}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Setup Complete',
      description: 'Your platform is ready!',
      component: (
        <div className="text-center py-8">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-4">All Set!</h3>
          <p className="text-gray-300 mb-6">
            Your ODYSSEY-1 platform has been customized for {formData.industry} with tools perfect for your {formData.teamSize} person team.
          </p>
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <h4 className="text-white font-semibold mb-2">Your Configuration:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Business:</span>
                <span className="text-white">{formData.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Industry:</span>
                <Badge className="bg-blue-600">{formData.industry}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Team Size:</span>
                <span className="text-white">{formData.teamSize}</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.businessName && formData.businessType;
      case 2: return formData.industry;
      case 3: return formData.teamSize && formData.primaryGoal;
      default: return true;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-white">{steps[currentStep].title}</CardTitle>
            <Badge variant="outline" className="border-white/20 text-white">
              {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <p className="text-gray-300">{steps[currentStep].description}</p>
          <div className="w-full bg-white/20 rounded-full h-2 mt-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {steps[currentStep].component}
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="border-white/20 text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button className="bg-green-600 hover:bg-green-700">
                Launch Platform
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
                disabled={!isStepValid()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};