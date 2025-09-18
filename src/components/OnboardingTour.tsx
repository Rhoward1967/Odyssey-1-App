import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ODYSSEY-1',
    content: 'Your AI-powered bidding platform. Let\'s take a quick tour to get you started!'
  },
  {
    id: 'navigation',
    title: 'Navigation',
    content: 'Use the sidebar to access different features: Calculator, Research, Admin tools, and more.'
  },
  {
    id: 'calculator',
    title: 'Bidding Calculator',
    content: 'Create detailed bids with AI assistance. Add specifications, calculate totals, and export to PDF.'
  },
  {
    id: 'research',
    title: 'AI Research',
    content: 'Get real-time market intelligence and competitive analysis powered by advanced AI.'
  },
  {
    id: 'admin',
    title: 'Admin Panel',
    content: 'Access system controls, user management, and advanced features (admin users only).'
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('odyssey_tour_completed');
    if (hasSeenTour) {
      setIsVisible(false);
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem('odyssey_tour_completed', 'true');
    setIsVisible(false);
    onComplete();
  };

  const skipTour = () => {
    completeTour();
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-800 border-blue-500/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <CardTitle className="text-blue-300">{step.title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={skipTour}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-300">{step.content}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-blue-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <div className="text-sm text-gray-400">
              {currentStep + 1} of {TOUR_STEPS.length}
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button variant="ghost" onClick={skipTour}>
                Skip Tour
              </Button>
              <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                {currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < TOUR_STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};