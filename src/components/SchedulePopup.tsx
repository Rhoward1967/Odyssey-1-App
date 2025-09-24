import React, { useState } from 'react';
import { X, MapPin, Clock, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface SchedulePopupProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  employee?: {
    id: string;
    name: string;
    position: string;
    department: string;
  } | null;
  existingShift?: {
    id: string;
    startTime: string;
    endTime: string;
    location?: string;
    notes?: string;
  } | null;
  onSave: (data: ScheduleData) => void;
}

interface ScheduleData {
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
}

export default function SchedulePopup({ isOpen, onClose, date, employee, existingShift, onSave }: SchedulePopupProps) {
  const [formData, setFormData] = useState<ScheduleData>({
    startTime: existingShift?.startTime || '',
    endTime: existingShift?.endTime || '',
    location: existingShift?.location || '',
    notes: existingShift?.notes || ''
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    setFormData({ startTime: '', endTime: '', location: '', notes: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-black/80 backdrop-blur-sm border-white/20 w-96">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {employee ? `${employee.name} - ${employee.position}` : 'Schedule Details'} - {date}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm mb-1 block">Start Time</label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="text-white text-sm mb-1 block">End Time</label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="text-white text-sm mb-1 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Enter location..."
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="text-white text-sm mb-1 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Add notes, special instructions..."
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Schedule
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}