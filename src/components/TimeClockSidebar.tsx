import React, { useState, useEffect } from 'react';
import { Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from './ui/badge';

interface Employee {
  id: string;
  name: string;
  photoUrl?: string;
  status: 'clocked-in' | 'clocked-out' | 'on-break';
  lastAction: string;
  hoursToday: number;
}

const TimeClockSidebar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'John Smith',
      photoUrl: '',
      status: 'clocked-in',
      lastAction: '6:00 AM',
      hoursToday: 8.5
    },
    {
      id: '2',
      name: 'Maria Garcia',
      photoUrl: '',
      status: 'on-break',
      lastAction: '12:30 PM',
      hoursToday: 6.5
    },
    {
      id: '3',
      name: 'Robert Johnson',
      photoUrl: '',
      status: 'clocked-out',
      lastAction: '2:00 PM',
      hoursToday: 8.0
    },
    {
      id: '4',
      name: 'Sarah Williams',
      photoUrl: '',
      status: 'clocked-in',
      lastAction: '7:00 AM',
      hoursToday: 7.5
    },
    {
      id: '5',
      name: 'Michael Brown',
      photoUrl: '',
      status: 'clocked-in',
      lastAction: '10:00 PM',
      hoursToday: 2.0
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clocked-in':
        return 'bg-green-500';
      case 'on-break':
        return 'bg-yellow-500';
      case 'clocked-out':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clocked-in':
        return <CheckCircle className="w-3 h-3" />;
      case 'on-break':
        return <Clock className="w-3 h-3" />;
      case 'clocked-out':
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const activeCount = employees.filter(e => e.status === 'clocked-in').length;
  const onBreakCount = employees.filter(e => e.status === 'on-break').length;

  return (
    <div className="h-full bg-white border-l p-4 overflow-y-auto">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time Clock
          </h3>
          <div className="text-sm font-medium">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="flex gap-2 text-xs">
          <Badge variant="default" className="bg-green-500">
            Active: {activeCount}
          </Badge>
          <Badge variant="secondary" className="bg-yellow-500 text-white">
            Break: {onBreakCount}
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {employee.photoUrl ? (
                  <img 
                    src={employee.photoUrl} 
                    alt={employee.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(employee.status)} rounded-full flex items-center justify-center text-white`}>
                {getStatusIcon(employee.status)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{employee.name}</div>
              <div className="text-xs text-gray-500">
                {employee.status === 'clocked-in' ? 'Since' : 
                 employee.status === 'on-break' ? 'Break at' : 'Out at'} {employee.lastAction}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs font-medium">{employee.hoursToday.toFixed(1)}h</div>
              <div className="text-xs text-gray-500">today</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t">
        <h4 className="text-sm font-medium mb-2">Quick Stats</h4>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Total Hours Today</span>
            <span className="font-medium">
              {employees.reduce((sum, e) => sum + e.hoursToday, 0).toFixed(1)}h
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Avg Hours/Employee</span>
            <span className="font-medium">
              {(employees.reduce((sum, e) => sum + e.hoursToday, 0) / employees.length).toFixed(1)}h
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeClockSidebar;