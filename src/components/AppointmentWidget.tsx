import React, { useState, useEffect, useState as useReactState } from 'react';
import { toast } from './ui/sonner';
import { Calendar, Clock, Plus, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { supabase } from '@/lib/supabase';

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showQuickSchedule, setShowQuickSchedule] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    start_time: '',
    end_time: '',
    attendees: '',
    status: 'scheduled',
  });
  const [editId, setEditId] = useState<string|null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setErrorMsg(null);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('start_time', { ascending: true });
    if (!error && data) {
      setAppointments(data);
    } else {
      setErrorMsg('Failed to load appointments. Please try again.');
      toast.error('Failed to load appointments from the server.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getTypeColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const attendeesArr = formData.attendees.split(',').map(a => a.trim()).filter(Boolean);
    if (editId) {
      // Update
      await supabase.from('appointments').update({
        title: formData.title,
        start_time: formData.start_time,
        end_time: formData.end_time,
        attendees: attendeesArr,
        status: formData.status,
      }).eq('id', editId);
    } else {
      // Create
      await supabase.from('appointments').insert({
        title: formData.title,
        start_time: formData.start_time,
        end_time: formData.end_time,
        attendees: attendeesArr,
        status: formData.status,
      });
    }
    setShowForm(false);
    setEditId(null);
    setFormData({ title: '', start_time: '', end_time: '', attendees: '', status: 'scheduled' });
    await fetchAppointments();
    setLoading(false);
  };

  const handleEdit = (apt: Appointment) => {
    setEditId(apt.id);
    setFormData({
      title: apt.title,
      start_time: apt.start_time.slice(0, 16),
      end_time: apt.end_time.slice(0, 16),
      attendees: (apt.attendees || []).join(', '),
      status: apt.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await supabase.from('appointments').delete().eq('id', id);
    await fetchAppointments();
    setLoading(false);
  };

  if (compact) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Appointments</span>
          </div>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setShowQuickSchedule(!showQuickSchedule)}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {loading ? (
            <div className="text-xs text-gray-400">Loading...</div>
          ) : appointments.slice(0, 2).map((apt) => {
            const start = new Date(apt.start_time);
            return (
              <div key={apt.id} className="flex items-center space-x-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${getTypeColor(apt.status)}`} />
                <span className="text-gray-300 truncate flex-1">{apt.title}</span>
                <span className="text-gray-400">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            );
          })}
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
            onClick={() => { setShowForm(true); setEditId(null); setFormData({ title: '', start_time: '', end_time: '', attendees: '', status: 'scheduled' }); }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Schedule
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <form onSubmit={handleCreateOrUpdate} className="bg-white/5 rounded-lg p-4 mb-2 space-y-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white">Title</label>
              <input name="title" value={formData.title} onChange={handleFormChange} required className="rounded px-2 py-1 text-black" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white">Start Time</label>
              <input name="start_time" type="datetime-local" value={formData.start_time} onChange={handleFormChange} required className="rounded px-2 py-1 text-black" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white">End Time</label>
              <input name="end_time" type="datetime-local" value={formData.end_time} onChange={handleFormChange} required className="rounded px-2 py-1 text-black" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white">Attendees (comma separated)</label>
              <input name="attendees" value={formData.attendees} onChange={handleFormChange} className="rounded px-2 py-1 text-black" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white">Status</label>
              <select name="status" value={formData.status} onChange={handleFormChange} className="rounded px-2 py-1 text-black">
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                {editId ? 'Update' : 'Create'}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>
                Cancel
              </Button>
            </div>
          </form>
        )}
        {loading ? (
          <div className="text-gray-400">Loading appointments...</div>
        ) : errorMsg ? (
          <div className="text-red-500 bg-red-100 border border-red-300 rounded p-2 text-center">{errorMsg}</div>
        ) : appointments.length === 0 ? (
          <div className="text-gray-400">No appointments found.</div>
        ) : appointments.map((apt) => {
          const start = new Date(apt.start_time);
          const end = new Date(apt.end_time);
          return (
            <div key={apt.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${getTypeColor(apt.status)}`} />
              <div className="flex-1">
                <div className="text-white font-medium">{apt.title}</div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <Clock className="w-3 h-3" />
                  <span>{start.toLocaleDateString()} {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {apt.attendees && apt.attendees.length > 0 && (
                    <>
                      <Users className="w-3 h-3 ml-2" />
                      <span>{apt.attendees.join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => handleEdit(apt)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(apt.id)}>
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
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