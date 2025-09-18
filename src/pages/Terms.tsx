import React from 'react';
import Navigation from '@/components/Navigation';
import { AppProvider } from '@/contexts/AppContext';

const Terms: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h1>Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using ODYSSEY-1, you accept and agree to be bound by the terms and provision of this agreement.</p>
            
            <h2>2. Use License</h2>
            <p>Permission is granted to temporarily access ODYSSEY-1 for personal, non-commercial transitory viewing only.</p>
            
            <h2>3. Disclaimer</h2>
            <p>The materials on ODYSSEY-1 are provided on an 'as is' basis. ODYSSEY-1 makes no warranties, expressed or implied.</p>
            
            <h2>4. Limitations</h2>
            <p>In no event shall ODYSSEY-1 or its suppliers be liable for any damages arising out of the use or inability to use the materials.</p>
            
            <h2>5. Contact Information</h2>
            <p>If you have any questions about these Terms of Service, please contact us through the help center.</p>
          </div>
        </div>
      </div>
    </AppProvider>
  );
};

export default Terms;