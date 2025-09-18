import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface StorageItem {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'data';
  size: string;
  lastModified: string;
  status: 'synced' | 'pending' | 'error';
}

const StorageTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const [storageItems] = useState<StorageItem[]>([
    {
      id: '1',
      name: 'Project Documentation.pdf',
      type: 'document',
      size: '2.4 MB',
      lastModified: '2 hours ago',
      status: 'synced'
    },
    {
      id: '2',
      name: 'System Architecture.png',
      type: 'image',
      size: '1.8 MB',
      lastModified: '1 day ago',
      status: 'synced'
    },
    {
      id: '3',
      name: 'Demo Video.mp4',
      type: 'video',
      size: '45.2 MB',
      lastModified: '3 days ago',
      status: 'pending'
    },
    {
      id: '4',
      name: 'User Database.json',
      type: 'data',
      size: '856 KB',
      lastModified: '5 hours ago',
      status: 'synced'
    },
    {
      id: '5',
      name: 'Backup Archive.zip',
      type: 'document',
      size: '128 MB',
      lastModified: '1 week ago',
      status: 'error'
    }
  ]);

  const storageStats = {
    used: 178.2,
    total: 500,
    files: storageItems.length
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return '📄';
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'data': return '💾';
      default: return '📁';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredItems = storageItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const usagePercentage = (storageStats.used / storageStats.total) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-white">Storage Management</h3>
        <p className="text-gray-300">Manage your files and data storage</p>
      </div>

      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>{storageStats.used} GB used of {storageStats.total} GB</span>
            <span>{storageStats.files} files</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl">📄</div>
              <div className="text-sm font-medium">Documents</div>
              <div className="text-xs text-gray-500">130.6 GB</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">🖼️</div>
              <div className="text-sm font-medium">Images</div>
              <div className="text-xs text-gray-500">25.4 GB</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">🎥</div>
              <div className="text-sm font-medium">Videos</div>
              <div className="text-xs text-gray-500">18.7 GB</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">💾</div>
              <div className="text-sm font-medium">Data</div>
              <div className="text-xs text-gray-500">3.5 GB</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <div className="flex flex-wrap gap-2">
          {['all', 'document', 'image', 'video', 'data'].map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* File List */}
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{getTypeIcon(item.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.size} • {item.lastModified}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                  <Badge variant="outline" className="text-xs capitalize">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
          <span className="text-2xl">📤</span>
          <span className="text-sm">Upload</span>
        </Button>
        <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
          <span className="text-2xl">🗂️</span>
          <span className="text-sm">New Folder</span>
        </Button>
        <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
          <span className="text-2xl">🔄</span>
          <span className="text-sm">Sync</span>
        </Button>
        <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
          <span className="text-2xl">🗑️</span>
          <span className="text-sm">Clean Up</span>
        </Button>
      </div>
    </div>
  );
};

export default StorageTab;