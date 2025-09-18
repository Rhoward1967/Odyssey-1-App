import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  BellRing, 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  XCircle,
  Settings,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionRequired?: boolean;
}

export const RealtimeNotificationSystem = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'System Update Complete',
      message: 'Your Odyssey AI system has been successfully updated to version 2.1.0',
      type: 'success',
      timestamp: new Date(Date.now() - 300000),
      read: false
    },
    {
      id: '2',
      title: 'Budget Alert',
      message: 'You have reached 80% of your monthly API usage limit',
      type: 'warning',
      timestamp: new Date(Date.now() - 600000),
      read: false,
      actionRequired: true
    },
    {
      id: '3',
      title: 'New Research Available',
      message: 'AI market analysis report for Q4 2024 is now available',
      type: 'info',
      timestamp: new Date(Date.now() - 900000),
      read: true
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');

  useEffect(() => {
    // Set up real-time subscription for notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          handleRealtimeNotification(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRealtimeNotification = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newNotification: Notification = {
        ...payload.new,
        timestamp: new Date(payload.new.created_at)
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      toast({
        title: newNotification.title,
        description: newNotification.message,
        variant: newNotification.type === 'error' ? 'destructive' : 'default'
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread': return !notif.read;
      case 'important': return notif.actionRequired;
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <BellRing className="h-8 w-8" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No notifications to display</p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card key={notification.id} className={`transition-all ${!notification.read ? 'border-blue-200 bg-blue-50/50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{notification.title}</h3>
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs">New</Badge>
                              )}
                              {notification.actionRequired && (
                                <Badge variant="destructive" className="text-xs">Action Required</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <p className="text-xs text-gray-400">
                              {notification.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};