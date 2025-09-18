import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Bell, Check, X, Settings } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  categories: Record<string, boolean>;
  frequency: string;
  quietHours: boolean;
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    categories: {
      'System': true,
      'AI Chat': true,
      'Research': true,
      'Security': true,
      'Updates': false
    },
    frequency: 'immediate',
    quietHours: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulate receiving notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'System Update Available',
        message: 'A new version of ODYSSEY-1 is ready for installation.',
        type: 'info',
        category: 'System',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'medium'
      },
      {
        id: '2',
        title: 'AI Chat Session Started',
        message: 'New conversation initiated with advanced AI model.',
        type: 'success',
        category: 'AI Chat',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        read: false,
        priority: 'low'
      },
      {
        id: '3',
        title: 'Security Alert',
        message: 'Unusual login activity detected from new location.',
        type: 'warning',
        category: 'Security',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        read: true,
        priority: 'high'
      },
      {
        id: '4',
        title: 'Research Export Complete',
        message: 'Your research data has been successfully exported.',
        type: 'success',
        category: 'Research',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        read: false,
        priority: 'medium'
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge variant="default">Medium</Badge>;
      default: return <Badge variant="secondary">Low</Badge>;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'high') return notif.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showSettings && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label>Email Notifications</label>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label>Push Notifications</label>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label>Quiet Hours (9 PM - 8 AM)</label>
                  <Switch
                    checked={settings.quietHours}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, quietHours: checked }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Categories</label>
                  <div className="space-y-2">
                    {Object.entries(settings.categories).map(([category, enabled]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm">{category}</span>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({
                              ...prev,
                              categories: { ...prev.categories, [category]: checked }
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            </h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark All Read
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No notifications</p>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 ${getTypeColor(notification.type)} ${
                    !notification.read ? 'border-l-4' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{notification.title}</h4>
                        {getPriorityBadge(notification.priority)}
                        <Badge variant="outline">{notification.category}</Badge>
                        {!notification.read && <Badge variant="default">New</Badge>}
                      </div>
                      <p className="text-sm mb-2">{notification.message}</p>
                      <p className="text-xs opacity-75">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-4">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}