import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Camera, CheckCircle, XCircle } from 'lucide-react';

interface TimeEntry {
  id: string;
  type: 'clock-in' | 'clock-out' | 'break-start' | 'break-end';
  timestamp: string;
  location?: string;
  jobsite: string;
}

const MobileTimeClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isWorking, setIsWorking] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);
  const [selectedJobsite, setSelectedJobsite] = useState('Downtown Office');

  const jobsites = ['Downtown Office', 'Medical Center', 'Shopping Mall', 'Warehouse District'];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const addTimeEntry = (type: TimeEntry['type']) => {
    const entry: TimeEntry = {
      id: Date.now().toString(),
      type,
      timestamp: new Date().toISOString(),
      jobsite: selectedJobsite,
      location: 'GPS Location'
    };
    setTodayEntries([...todayEntries, entry]);

    if (type === 'clock-in') setIsWorking(true);
    if (type === 'clock-out') { setIsWorking(false); setOnBreak(false); }
    if (type === 'break-start') setOnBreak(true);
    if (type === 'break-end') setOnBreak(false);
  };

  const getTotalHours = () => {
    const clockIns = todayEntries.filter(e => e.type === 'clock-in');
    const clockOuts = todayEntries.filter(e => e.type === 'clock-out');
    if (clockIns.length === 0) return 0;
    
    let total = 0;
    clockIns.forEach((clockIn, index) => {
      const clockOut = clockOuts[index];
      if (clockOut) {
        const diff = new Date(clockOut.timestamp).getTime() - new Date(clockIn.timestamp).getTime();
        total += diff / (1000 * 60 * 60);
      }
    });
    return total.toFixed(2);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Current Time Display */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-bold mb-2">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-lg text-gray-600">
            {currentTime.toLocaleDateString()}
          </div>
          <div className="mt-4 flex justify-center">
            <Badge variant={isWorking ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              {isWorking ? (onBreak ? 'On Break' : 'Working') : 'Clocked Out'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Jobsite Selection */}
      <Card>
        <CardContent className="p-4">
          <label className="block text-sm font-medium mb-2">Current Jobsite</label>
          <select 
            value={selectedJobsite}
            onChange={(e) => setSelectedJobsite(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            {jobsites.map(site => (
              <option key={site} value={site}>{site}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Clock Actions */}
      <div className="grid grid-cols-2 gap-4">
        {!isWorking ? (
          <Button 
            onClick={() => addTimeEntry('clock-in')} 
            className="h-20 text-lg bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-6 h-6 mr-2" />
            Clock In
          </Button>
        ) : (
          <Button 
            onClick={() => addTimeEntry('clock-out')} 
            className="h-20 text-lg bg-red-600 hover:bg-red-700"
          >
            <XCircle className="w-6 h-6 mr-2" />
            Clock Out
          </Button>
        )}

        {isWorking && (
          <Button 
            onClick={() => addTimeEntry(onBreak ? 'break-end' : 'break-start')} 
            className="h-20 text-lg"
            variant={onBreak ? 'default' : 'outline'}
          >
            <Clock className="w-6 h-6 mr-2" />
            {onBreak ? 'End Break' : 'Start Break'}
          </Button>
        )}
      </div>

      {/* Today's Summary */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Today's Summary</h3>
          <div className="flex justify-between items-center mb-4">
            <span>Total Hours:</span>
            <span className="font-bold text-lg">{getTotalHours()}h</span>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {todayEntries.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium capitalize">
                    {entry.type.replace('-', ' ')}
                  </div>
                  <div className="text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {entry.jobsite}
                  </div>
                </div>
                <div className="text-right">
                  <div>{new Date(entry.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileTimeClock;