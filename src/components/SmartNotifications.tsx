import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bell, BellOff, Check, X, AlertCircle, MessageCircle, Users, Brain, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  type: 'conversation_mention' | 'collaboration_invite' | 'research_complete' | 'voice_command' | 'system_update';
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  expires_at?: string;
}

interface SmartNotificationsProps {
  onNotificationClick?: (notification: Notification) => void;
}

export default function SmartNotifications({ onNotificationClick }: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('smart_notifications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'smart_notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show browser notification if enabled
            if (isEnabled && 'Notification' in window && Notification.permission === 'granted') {
              const notification = payload.new as Notification;
              new Notification(notification.title, {
                body: notification.message,
                icon: '/placeholder.svg',
                tag: notification.id
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isEnabled]);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('smart_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('smart_notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('smart_notifications')
        .update({ is_read: true })
        .eq('is_read', false);
      
      if (error) throw error;
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('smart_notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const createTestNotification = async () => {
    try {
      const { error } = await supabase
        .from('smart_notifications')
        .insert([{
          type: 'system_update',
          title: 'Test Notification',
          message: 'This is a test notification from ODYSSEY-1 smart notification system.',
          priority: 'normal',
          data: { test: true }
        }]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error creating test notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'conversation_mention':
        return <MessageCircle className="w-4 h-4" />;
      case 'collaboration_invite':
        return <Users className="w-4 h-4" />;
      case 'research_complete':
        return <Brain className="w-4 h-4" />;
      case 'voice_command':
        return <Settings className="w-4 h-4" />;
      case 'system_update':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'normal':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'low':
        return 'bg-gray-100 border-gray-200 text-gray-800';
      default:
        return 'bg-blue-100 border-blue-200 text-blue-800';
    }
  };

  const visibleNotifications = showAll ? notifications : notifications.slice(0, 10);

  return (
    <Card className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-indigo-900">
          <div className="flex items-center">
            {isEnabled ? (
              <Bell className="w-5 h-5 mr-2 text-indigo-600" />
            ) : (
              <BellOff className="w-5 h-5 mr-2 text-gray-400" />
            )}
            Smart Notifications
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="bg-red-500">
                {unreadCount}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEnabled(!isEnabled)}
              className="text-indigo-700 border-indigo-200 hover:bg-indigo-50"
            >
              {isEnabled ? (
                <>
                  <BellOff className="w-4 h-4 mr-1" />
                  Disable
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-1" />
                  Enable
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-indigo-700 border-indigo-200 hover:bg-indigo-50"
              >
                <Check className="w-4 h-4 mr-1" />
                Mark All Read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={createTestNotification}
              className="text-indigo-700 border-indigo-200 hover:bg-indigo-50"
            >
              Test Notification
            </Button>
          </div>
          
          {notifications.length > 10 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-indigo-600"
            >
              {showAll ? 'Show Less' : `Show All (${notifications.length})`}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                notification.is_read 
                  ? 'bg-white border-gray-200' 
                  : getPriorityColor(notification.priority)
              }`}
              onClick={() => {
                if (!notification.is_read) {
                  markAsRead(notification.id);
                }
                onNotificationClick?.(notification);
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  {getNotificationIcon(notification.type)}
                  <h4 className="font-medium">
                    {notification.title}
                  </h4>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {notification.priority}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">
                {notification.message}
              </p>
              
              <div className="text-xs text-gray-500">
                {new Date(notification.created_at).toLocaleString()}
              </div>
            </div>
          ))}
          
          {notifications.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications yet.</p>
              <p className="text-xs mt-1">You'll receive smart notifications about conversations, research, and system updates.</p>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="text-xs text-gray-500 bg-indigo-50 p-2 rounded flex items-center justify-between">
          <span>🔔 Real-time smart notifications with priority filtering</span>
          <Badge variant="outline" className={isEnabled ? "text-green-600" : "text-gray-400"}>
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}