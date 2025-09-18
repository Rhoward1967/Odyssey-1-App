import React, { useState } from 'react';
import { Users, MessageSquare, Image, FileText, Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import MediaChat from './MediaChat';
import MediaGallery from './MediaGallery';
import FileManager from './FileManager';

export default function MobileMediaWorkstation() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [onlineUsers] = useState([
    { id: '1', name: 'Sarah Johnson', status: 'online' },
    { id: '2', name: 'Mike Chen', status: 'away' },
    { id: '3', name: 'Emily Davis', status: 'busy' },
    { id: '4', name: 'John Smith', status: 'online' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const tabs = [
    { id: 'gallery', icon: Image, label: 'Gallery' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'files', icon: FileText, label: 'Files' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'gallery':
        return <MediaGallery onBack={() => window.history.back()} />;
      case 'chat':
        return <MediaChat />;
      case 'files':
        return <FileManager />;
      default:
        return <MediaGallery onBack={() => window.history.back()} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Compact Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Media Center</h1>
          </div>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="space-y-6 mt-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Online Users</h3>
                <div className="space-y-2">
                  {onlineUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="relative">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Photos Shared</span>
                    <span className="font-medium">127</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Messages Today</span>
                    <span className="font-medium">45</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Projects</span>
                    <span className="font-medium">8</span>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t px-2 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg min-w-0 flex-1 ${
                  isActive 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}