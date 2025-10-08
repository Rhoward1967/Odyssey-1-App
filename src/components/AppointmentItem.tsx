import React from 'react';
import { Clock, Users } from 'lucide-react';
import { Button } from './ui/button';

interface Appointment {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees?: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  reminder_minutes: number;
  created_at: string;
}

interface AppointmentItemProps {
  appointment: Appointment;
  onEdit: (apt: Appointment) => void;
  onDelete: (id: string) => void;
  getTypeColor: (status: string) => string;
}

const AppointmentItem: React.FC<AppointmentItemProps> = ({ appointment, onEdit, onDelete, getTypeColor }) => {
  const start = new Date(appointment.start_time);
  const end = new Date(appointment.end_time);
  return (
    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
      <div className={`w-3 h-3 rounded-full ${getTypeColor(appointment.status)}`} />
      <div className="flex-1">
        <div className="text-white font-medium">{appointment.title}</div>
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <Clock className="w-3 h-3" />
          <span>{start.toLocaleDateString()} {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {appointment.attendees && appointment.attendees.length > 0 && (
            <>
              <Users className="w-3 h-3 ml-2" />
              <span>{appointment.attendees.join(', ')}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={() => onEdit(appointment)}>
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(appointment.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
};

export default AppointmentItem;
