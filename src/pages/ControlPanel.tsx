import React, { useState } from 'react';
import { AppProvider } from '@/contexts/AppContext';

import ControlPanel from '@/components/ControlPanel';
import VerticalNavigation from '@/components/VerticalNavigation';

const ControlPanelPage: React.FC = () => {
  const [showMainSidebar, setShowMainSidebar] = useState(true);

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Desktop sidebar - always visible on desktop */}
        <div className="hidden md:block">
          <VerticalNavigation />
        </div>
        
        {/* Main content area with proper spacing for sidebar */}
        <div className="md:ml-64">
          <ControlPanel 
            onMobileContentShow={() => setShowMainSidebar(false)}
            onMobileMenuShow={() => setShowMainSidebar(true)}
          />
        </div>
      </div>
    </AppProvider>
  );
};

export default ControlPanelPage;