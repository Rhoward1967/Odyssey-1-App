import React, { useState } from 'react';
import { Calendar, Clock, Plus, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface Appointment {
  id: string;
  title: string;
  time: string;
  date: string;
  type: 'meeting' | 'call' | 'demo' | 'consultation';
  participants?: string[];
}

interface AppointmentWidgetProps {
  context?: string;
  onSchedule?: (appointment: Appointment) => void;
  compact?: boolean;
}

export default function AppointmentWidget({ 
  context = 'general', 
  onSchedule,
  compact = false 
}: AppointmentWidgetProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      title: 'Project Review',
      time: '2:00 PM',
      date: 'Today',
      type: 'meeting',
      participants: ['John', 'Sarah']
    },
    {
      id: '2',
      title: 'Client Call',
      time: '4:30 PM',
      date: 'Tomorrow',
      type: 'call'
    }
  ]);

  const [showQuickSchedule, setShowQuickSchedule] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'call': return 'bg-green-500';
      case 'demo': return 'bg-purple-500';
      case 'consultation': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (compact) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Appointments</span>
          </div>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {appointments.slice(0, 2).map((apt) => (
            <div key={apt.id} className="flex items-center space-x-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${getTypeColor(apt.type)}`} />
              <span className="text-gray-300 truncate flex-1">{apt.title}</span>
              <span className="text-gray-400">{apt.time}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span>Appointments</span>
            {context !== 'general' && (
              <Badge variant="outline" className="text-xs">
                {context}
              </Badge>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={() => setShowQuickSchedule(!showQuickSchedule)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Schedule
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {appointments.map((apt) => (
          <div key={apt.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${getTypeColor(apt.type)}`} />
            <div className="flex-1">
              <div className="text-white font-medium">{apt.title}</div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Clock className="w-3 h-3" />
                <span>{apt.date} at {apt.time}</span>
                {apt.participants && (
                  <>
                    <Users className="w-3 h-3 ml-2" />
                    <span>{apt.participants.join(', ')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {showQuickSchedule && (
          <div className="p-3 bg-white/5 rounded-lg border border-blue-500/30">
            <div className="text-sm text-white mb-2">Quick Schedule</div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                30min Call
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                1hr Meeting
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                Demo
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                Consultation
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}