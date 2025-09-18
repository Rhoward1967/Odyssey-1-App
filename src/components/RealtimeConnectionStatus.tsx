import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';

interface ConnectionStatusProps {
  connected: boolean;
  lastUpdate: Date | null;
  className?: string;
}

export function RealtimeConnectionStatus({ 
  connected, 
  lastUpdate, 
  className = '' 
}: ConnectionStatusProps) {
  const { isOnline, pendingSync, forcSync } = useOfflineSync();

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (!connected) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (!connected) return 'Connecting';
    return 'Live';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-3 h-3" />;
    if (!connected) return <AlertCircle className="w-3 h-3" />;
    return <Wifi className="w-3 h-3" />;
  };

  return (
    <Card className={`p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <Badge variant="outline" className="text-xs">
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {lastUpdate && (
            <span>
              {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          
          {pendingSync > 0 && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer"
              onClick={forcSync}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              {pendingSync}
            </Badge>
          )}
        </div>
      </div>
      
      {!isOnline && (
        <div className="mt-2 text-xs text-red-600">
          Working offline. Changes will sync when connection is restored.
        </div>
      )}
    </Card>
  );
}