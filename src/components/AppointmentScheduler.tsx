import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import CalendarLinkGenerator from './CalendarLinkGenerator';

interface AppointmentSchedulerProps {
  onAppointmentCreated?: () => void;
  selectedDate?: Date;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  onAppointmentCreated,
  selectedDate
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCalendarLinks, setShowCalendarLinks] = useState(false);
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    startTime: '',
    endTime: '',
    location: '',
    attendees: '',
    reminderMinutes: '15'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      if (endDateTime <= startDateTime) {
        toast({
          title: "Invalid Time",
          description: "End time must be after start time",
          variant: "destructive"
        });
        return;
      }

      const attendeesList = formData.attendees
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

      const { error } = await supabase
        .from('appointments')
        .insert({
          title: formData.title,
          description: formData.description || null,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          location: formData.location || null,
          attendees: attendeesList.length > 0 ? attendeesList : null,
          reminder_minutes: parseInt(formData.reminderMinutes),
          status: 'scheduled'
        });

      if (error) throw error;

      // Store appointment data for calendar links
      setAppointmentData({
        title: formData.title,
        description: formData.description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        location: formData.location
      });

      toast({
        title: "Appointment Created",
        description: "Your appointment has been scheduled successfully"
      });

      // Show calendar links instead of closing immediately
      setShowCalendarLinks(true);
      
      onAppointmentCreated?.();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setShowCalendarLinks(false);
    setAppointmentData(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      attendees: '',
      reminderMinutes: '15'
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 text-sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Schedule Appointment</span>
          <span className="sm:hidden">Schedule</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            {showCalendarLinks ? 'Add to Calendar' : 'Schedule New Appointment'}
          </DialogTitle>
        </DialogHeader>
        
        {showCalendarLinks && appointmentData ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your appointment has been created! Add it to your calendar:
            </p>
            <CalendarLinkGenerator {...appointmentData} />
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Meeting title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="startTime">Start *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="endTime">End *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Meeting location or video link"
              />
            </div>

            <div>
              <Label htmlFor="attendees">Attendees (emails)</Label>
              <Input
                id="attendees"
                value={formData.attendees}
                onChange={(e) => setFormData(prev => ({ ...prev, attendees: e.target.value }))}
                placeholder="email1@example.com, email2@example.com"
              />
            </div>

            <div>
              <Label htmlFor="reminder">Reminder</Label>
              <Select value={formData.reminderMinutes} onValueChange={(value) => setFormData(prev => ({ ...prev, reminderMinutes: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes before</SelectItem>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:justify-end pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="w-full md:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? 'Creating...' : 'Create Appointment'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};