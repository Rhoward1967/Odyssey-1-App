import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassPanel from './GlassPanel';
import TabButton from './TabButton';
import CalculatorTab from './CalculatorTab';
import ToolsTab from './ToolsTab';
import StorageTab from './StorageTab';
import SettingsTab from './SettingsTab';
import UsersTab from './UsersTab';
import SystemTab from './SystemTab';
import SecurityTab from './SecurityTab';
import MobileTabIndicator from './MobileTabIndicator';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { Button } from './ui/button';
import { ArrowLeft, Menu } from 'lucide-react';

type TabType = 'overview' | 'calculator' | 'tools' | 'storage' | 'settings' | 'users' | 'system' | 'security';

interface ControlPanelProps {
  onMobileContentShow?: () => void;
  onMobileMenuShow?: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onMobileContentShow, onMobileMenuShow }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  
  const tabs: TabType[] = ['overview', 'calculator', 'tools', 'storage', 'settings', 'users', 'system', 'security'];
  
  const navigateTab = (direction: 'next' | 'prev') => {
    const currentIndex = tabs.indexOf(activeTab);
    if (direction === 'next' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // Add swipe gesture support for mobile
  useSwipeGesture({
    onSwipeLeft: () => navigateTab('next'),
    onSwipeRight: () => navigateTab('prev'),
    threshold: 50
  });

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    setShowMobileMenu(false); // Hide menu on mobile after selection
    onMobileContentShow?.(); // Hide main Odyssey-1 sidebar on mobile
  };

  const handleBackToMenu = () => {
    setShowMobileMenu(true);
    onMobileMenuShow?.(); // Show main Odyssey-1 sidebar on mobile
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">System Status</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">System Health</span>
                    <span className="text-green-400">🟢 Online</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">CPU Usage</span>
                    <span className="text-blue-400">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Memory Usage</span>
                    <span className="text-yellow-400">62%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Active Users</span>
                    <span className="text-purple-400">1,247</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors">
                    System Backup
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors">
                    Update System
                  </button>
                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg transition-colors">
                    Maintenance Mode
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'calculator':
        return <CalculatorTab />;
      case 'tools':
        return <ToolsTab />;
      case 'storage':
        return <StorageTab />;
      case 'settings':
        return <SettingsTab />;
      case 'users':
        return <UsersTab />;
      case 'system':
        return <SystemTab />;
      case 'security':
        return <SecurityTab />;
      default:
        return (
          <div className="text-center text-gray-400">
            <p>Select a tab to view content</p>
          </div>
        );
    }
  };

  const getTabTitle = (tab: TabType) => {
    const titles = {
      overview: 'Overview',
      calculator: 'Calculator',
      tools: 'Tools',
      storage: 'Storage',
      settings: 'Settings',
      users: 'Users',
      system: 'System',
      security: 'Security'
    };
    return titles[tab];
  };
  // Desktop and mobile responsive design with horizontal tabs
  return (
    <div className="flex flex-col h-full">
      {/* Mobile Back Button - Only visible on small screens */}
      <div className="md:hidden flex items-center justify-between p-3 bg-black/30 backdrop-blur-sm border-b border-gray-700/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h3 className="text-lg font-semibold text-white">Control Panel</h3>
        <div className="w-16"></div> {/* Spacer for centering */}
      </div>

      {/* Horizontal Tab Navigation - Always visible */}
      <div className="border-b border-gray-700/50 bg-black/20 backdrop-blur-sm">
        <div className="p-3">
          <h3 className="hidden md:block text-lg font-semibold text-white mb-4">Control Panel</h3>
          
          {/* Horizontal Tab Buttons */}
          <div className="flex flex-wrap gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <TabButton 
                key={tab}
                active={activeTab === tab} 
                onClick={() => setActiveTab(tab)}
                className="flex-shrink-0 px-3 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap"
              >
                <span className="mr-2 text-base flex-shrink-0">
                  {tab === 'overview' && '📊'}
                  {tab === 'calculator' && '🧮'}
                  {tab === 'tools' && '🛠️'}
                  {tab === 'storage' && '💾'}
                  {tab === 'settings' && '⚙️'}
                  {tab === 'users' && '👥'}
                  {tab === 'system' && '⚡'}
                  {tab === 'security' && '🔒'}
                </span>
                <span className="hidden sm:inline">{getTabTitle(tab)}</span>
              </TabButton>
            ))}
          </div>
          
          {/* Research Pages Section - Horizontal */}
          <div className="mt-4 pt-4 border-t border-gray-600/50">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">RESEARCH</h4>
            <div className="flex gap-2 flex-wrap">
              <a 
                href="/ai-research" 
                className="flex items-center px-3 py-2 rounded-lg text-xs sm:text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
              >
                <span className="mr-2 text-base flex-shrink-0">🤖</span>
                <span className="hidden sm:inline">AI Research</span>
              </a>
              <a 
                href="/research-notes" 
                className="flex items-center px-3 py-2 rounded-lg text-xs sm:text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
              >
                <span className="mr-2 text-base flex-shrink-0">📝</span>
                <span className="hidden sm:inline">Research Notes</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 p-2 md:p-4 overflow-y-auto">
        <GlassPanel className="h-full">
          <div className="p-3 md:p-6 h-full">
            {renderTabContent()}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};

export default ControlPanel;