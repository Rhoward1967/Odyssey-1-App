import React from 'react';
import Navigation from '@/components/Navigation';
import { AppProvider } from '@/contexts/AppContext';

const Privacy: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h1>Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us.</p>
            
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
            
            <h2>Information Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
            
            <h2>Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            
            <h2>Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information. Contact us through the help center to exercise these rights.</p>
          </div>
        </div>
      </div>
    </AppProvider>
  );
};

export default Privacy;