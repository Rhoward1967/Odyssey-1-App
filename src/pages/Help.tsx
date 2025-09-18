import React from 'react';
import { SubscriberHelp } from '@/components/SubscriberHelp';
import { CapabilityStatus } from '@/components/CapabilityStatus';
import Navigation from '@/components/Navigation';
import { AppProvider } from '@/contexts/AppContext';

const Help: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                ODYSSEY-1 Help Center
              </h1>
              <p className="text-lg text-muted-foreground">
                Comprehensive documentation and guides for using your AI system
              </p>
            </div>
            <div className="space-y-8">
              <CapabilityStatus />
              <SubscriberHelp />
            </div>
          </div>
        </div>
      </div>
    </AppProvider>
  );
};

export default Help;