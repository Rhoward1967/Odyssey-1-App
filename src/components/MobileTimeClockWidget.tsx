import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Play, Square, Smartphone } from 'lucide-react';
import { clockIn, clockOut, getTimeEntries } from '@/lib/supabase/hr-actions';

interface MobileTimeClockWidgetProps {
  employeeId?: string;
  compact?: boolean;
}

export default function MobileTimeClockWidget({ employeeId, compact = false }: MobileTimeClockWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const checkCurrentStatus = useCallback(async () => {
    if (!employeeId) return;
    
    try {
      const result = await getTimeEntries(employeeId);
      if (result.success && result.entries) {
        const activeEntry = result.entries.find(entry => entry.status === 'active');
        if (activeEntry) {
          setClockedIn(true);
          setClockInTime(new Date(activeEntry.clock_in));
        }
      }
    } catch (error) {
      console.error('Failed to check time status:', error);
    }
  }, [employeeId]); // Add employeeId as dependency

  useEffect(() => {
    if (employeeId) {
      checkCurrentStatus();
    }
  }, [employeeId, checkCurrentStatus]); // Now include checkCurrentStatus

  const handleClockIn = async () => {
    if (!employeeId) return;
    
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationStr = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          setLocation(locationStr);
          
          const result = await clockIn(employeeId, locationStr);
          if (result.success) {
            setClockedIn(true);
            setClockInTime(new Date());
          }
          setLoading(false);
        },
        async () => {
          // Fallback without GPS
          const result = await clockIn(employeeId, 'Location unavailable');
          if (result.success) {
            setClockedIn(true);
            setClockInTime(new Date());
          }
          setLoading(false);
        }
      );
    }
  };

  const handleClockOut = async () => {
    if (!employeeId) return;
    
    setLoading(true);
    const result = await clockOut(employeeId);
    
    if (result.success) {
      setClockedIn(false);
      setClockInTime(null);
      setLocation('');
    }
    setLoading(false);
  };

  const getElapsedTime = () => {
    if (!clockInTime) return '00:00:00';
    const diff = currentTime.getTime() - clockInTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">Quick Clock</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Current Time</p>
              <p className="text-sm font-mono">{currentTime.toLocaleTimeString()}</p>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <div className="text-2xl font-mono font-bold text-blue-600 mb-1">
              {clockedIn ? getElapsedTime() : '00:00:00'}
            </div>
            <p className="text-sm text-gray-600">
              {clockedIn ? 'Currently clocked in' : 'Not clocked in'}
            </p>
          </div>

          <div className="flex gap-2">
            {!clockedIn ? (
              <Button 
                onClick={handleClockIn}
                disabled={loading || !employeeId}
                className="flex-1"
                size="sm"
              >
                <Play className="w-4 h-4 mr-1" />
                Clock In
              </Button>
            ) : (
              <Button 
                onClick={handleClockOut}
                disabled={loading}
                variant="destructive"
                className="flex-1"
                size="sm"
              >
                <Square className="w-4 h-4 mr-1" />
                Clock Out
              </Button>
            )}
          </div>

          {clockedIn && location && (
            <div className="mt-3 p-2 bg-green-50 rounded text-center">
              <div className="flex items-center justify-center gap-1 text-green-700 text-xs">
                <MapPin className="w-3 h-3" />
                <span>GPS Verified</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center">
          <Clock className="w-5 h-5" />
          Mobile Time Clock
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-blue-600 mb-2">
            {clockedIn ? getElapsedTime() : '00:00:00'}
          </div>
          <p className="text-gray-600">
            {clockedIn ? 'Currently clocked in' : 'Ready to clock in'}
          </p>
          <p className="text-sm text-gray-500">
            {currentTime.toLocaleString()}
          </p>
        </div>

        <div className="flex justify-center">
          {!clockedIn ? (
            <Button 
              size="lg" 
              onClick={handleClockIn}
              disabled={loading || !employeeId}
              className="w-24 h-24 rounded-full text-lg"
            >
              <div className="text-center">
                <Play className="w-6 h-6 mx-auto mb-1" />
                Clock In
              </div>
            </Button>
          ) : (
            <Button 
              size="lg" 
              variant="destructive"
              onClick={handleClockOut}
              disabled={loading}
              className="w-24 h-24 rounded-full text-lg"
            >
              <div className="text-center">
                <Square className="w-6 h-6 mx-auto mb-1" />
                Clock Out
              </div>
            </Button>
          )}
        </div>

        {clockedIn && (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">GPS Location Verified</span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Clocked in: {clockInTime?.toLocaleTimeString()}</p>
              {location && <p>Location: {location}</p>}
            </div>
          </div>
        )}

        {!employeeId && (
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <p className="text-orange-800 text-sm">
              Employee ID required for time tracking
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
