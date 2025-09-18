import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MapPin, Play, Square, Users, Calendar } from 'lucide-react';

export default function TimeTrackingSystem() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setClockedIn(true);
        setClockInTime(new Date());
        // In real app, would send GPS coordinates to server
        console.log('Clocked in at:', position.coords.latitude, position.coords.longitude);
      });
    }
  };

  const handleClockOut = () => {
    setClockedIn(false);
    setClockInTime(null);
  };

  const timeEntries = [
    {
      id: 1,
      employee: 'Maria Rodriguez',
      date: '2024-03-15',
      clockIn: '08:00 AM',
      clockOut: '04:30 PM',
      hours: 8.5,
      location: 'Downtown Office Building',
      status: 'Approved'
    },
    {
      id: 2,
      employee: 'James Wilson',
      date: '2024-03-15',
      clockIn: '07:30 AM',
      clockOut: '05:00 PM',
      hours: 9.5,
      location: 'Medical Center',
      status: 'Pending'
    },
    {
      id: 3,
      employee: 'Sarah Chen',
      date: '2024-03-15',
      clockIn: '09:00 AM',
      clockOut: '03:00 PM',
      hours: 6.0,
      location: 'Retail Plaza',
      status: 'Approved'
    }
  ];

  const getElapsedTime = () => {
    if (!clockInTime) return '00:00:00';
    const diff = currentTime.getTime() - clockInTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Time Tracking</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">Current Time</p>
          <p className="text-xl font-mono">{currentTime.toLocaleTimeString()}</p>
        </div>
      </div>

      <Tabs defaultValue="clock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clock">Time Clock</TabsTrigger>
          <TabsTrigger value="entries">Time Entries</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="clock">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Employee Time Clock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-mono font-bold text-blue-600 mb-2">
                    {clockedIn ? getElapsedTime() : '00:00:00'}
                  </div>
                  <p className="text-gray-600">
                    {clockedIn ? 'Currently clocked in' : 'Not clocked in'}
                  </p>
                </div>

                <div className="flex justify-center">
                  {!clockedIn ? (
                    <Button 
                      size="lg" 
                      onClick={handleClockIn}
                      className="w-32 h-32 rounded-full text-lg"
                    >
                      <div className="text-center">
                        <Play className="w-8 h-8 mx-auto mb-2" />
                        Clock In
                      </div>
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      variant="destructive"
                      onClick={handleClockOut}
                      className="w-32 h-32 rounded-full text-lg"
                    >
                      <div className="text-center">
                        <Square className="w-8 h-8 mx-auto mb-2" />
                        Clock Out
                      </div>
                    </Button>
                  )}
                </div>

                {clockedIn && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">GPS Location Verified</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Clocked in at: {clockInTime?.toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span>Total Hours Today</span>
                    <span className="font-semibold">
                      {clockedIn ? getElapsedTime().substring(0, 5) : '0:00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>Regular Hours</span>
                    <span className="font-semibold">8:00</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <span>Overtime Hours</span>
                    <span className="font-semibold">0:00</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span>Break Time</span>
                    <span className="font-semibold">1:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recent Time Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{entry.employee}</p>
                        <p className="text-sm text-gray-600">{entry.date}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {entry.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{entry.hours} hours</p>
                      <p className="text-sm text-gray-600">
                        {entry.clockIn} - {entry.clockOut}
                      </p>
                    </div>
                    <Badge variant={entry.status === 'Approved' ? 'default' : 'secondary'}>
                      {entry.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Weekly Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Hours:</span>
                    <span className="font-semibold">187.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regular Hours:</span>
                    <span className="font-semibold">160.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime Hours:</span>
                    <span className="font-semibold">27.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average per Employee:</span>
                    <span className="font-semibold">7.8 hrs/day</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GPS Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <span className="text-sm">Location Accuracy</span>
                    <Badge variant="default">98.5%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <span className="text-sm">On-Site Compliance</span>
                    <Badge variant="default">100%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                    <span className="text-sm">GPS Alerts</span>
                    <Badge variant="outline">2 this week</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}