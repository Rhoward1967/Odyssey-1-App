import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRealtimeAdmin } from '@/hooks/useRealtimeAdmin';

interface AnnouncementBannerProps {
  userType?: 'trial' | 'subscriber' | 'public';
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ userType = 'public' }) => {
  const { announcements } = useRealtimeAdmin();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'destructive';
      default: return 'default';
    }
  };

  const activeAnnouncements = announcements.filter(announcement => {
    if (!announcement.is_active || dismissedIds.includes(announcement.id)) return false;
    if (!announcement.target_users.includes(userType) && userType !== 'public') return false;
    
    const now = new Date();
    if (announcement.start_date && new Date(announcement.start_date) > now) return false;
    if (announcement.end_date && new Date(announcement.end_date) < now) return false;
    
    return true;
  });

  const dismissAnnouncement = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  if (activeAnnouncements.length === 0) return null;

  return (
    <div className="space-y-2">
      {activeAnnouncements.map((announcement) => (
        <Alert key={announcement.id} variant={getVariant(announcement.type) as any}>
          {getIcon(announcement.type)}
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>{announcement.title}</strong>
              <p className="mt-1">{announcement.message}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissAnnouncement(announcement.id)}
              className="ml-4 p-1 h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};