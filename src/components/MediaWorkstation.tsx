import React, { useState } from 'react';
import { Users, MessageSquare, Image, Search, FileText, Settings, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MediaChat from './MediaChat';
import MediaGallery from './MediaGallery';
import ContactPhoneBook from './ContactPhoneBook';
import FileManager from './FileManager';
export default function MediaWorkstation() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Media Workstation</h1>
              <p className="text-gray-600">Collaborate, share, and connect with your team</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Premium Feature
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r p-4">
          <div className="space-y-6">
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
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <Tabs defaultValue="gallery" className="h-full">
            <div className="overflow-x-auto mb-6">
              <TabsList className="flex w-max min-w-full">
                <TabsTrigger value="gallery" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                  <Image className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Gallery</span>
                  <span className="sm:hidden">📷</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Chat</span>
                  <span className="sm:hidden">💬</span>
                </TabsTrigger>
                <TabsTrigger value="contacts" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Contacts</span>
                  <span className="sm:hidden">📞</span>
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Files</span>
                  <span className="sm:hidden">📁</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="gallery" className="h-[calc(100%-60px)]">
              <MediaGallery onBack={() => window.history.back()} />
            </TabsContent>

            <TabsContent value="chat" className="h-[calc(100%-60px)]">
              <MediaChat />
            </TabsContent>

            <TabsContent value="contacts" className="h-[calc(100%-60px)]">
              <ContactPhoneBook />
            </TabsContent>

            <TabsContent value="files" className="h-[calc(100%-60px)]">
              <FileManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}