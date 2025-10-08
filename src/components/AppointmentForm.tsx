import React, { useState } from 'react';
import { format } from 'date-fns';

// This is a stand-in for your actual UI components like ShadCN
// You would import Button, Calendar, Popover, etc. from your library
// For this fix, we are ensuring the component structure is valid.

// Mock UI components for structure validation
const Button = ({ children, ...props }) => <button {...props}>{children}</button>;
const Input = (props) => <input {...props} />;
const Label = ({ children, ...props }) => <label {...props}>{children}</label>;
const Select = ({ children, ...props }) => <select {...props}>{children}</select>;

interface AppointmentData {
  title?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
}

export default function AppointmentForm({ onSubmit, initialData = {} }: { onSubmit: (data: any) => void; initialData?: AppointmentData }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [status, setStatus] = useState(initialData.status || 'Confirmed');
  const [startTime, setStartTime] = useState<Date | undefined>(initialData.start_time ? new Date(initialData.start_time) : undefined);
  const [endTime, setEndTime] = useState<Date | undefined>(initialData.end_time ? new Date(initialData.end_time) : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation
    if (!startTime || !endTime || startTime >= endTime) {
      alert('Please ensure the start time is before the end time.');
      return;
    }

    const formData = {
      title,
      status,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white rounded-lg shadow-md">
      <div>
        <Label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Appointment Title
        </Label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start Time
          </Label>
          <Input
            type="datetime-local"
            id="startTime"
            value={startTime ? format(startTime, "yyyy-MM-dd'T'HH:mm") : ''}
            onChange={(e) => setStartTime(new Date(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <Label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            End Time
          </Label>
          <Input
            type="datetime-local"
            id="endTime"
            value={endTime ? format(endTime, "yyyy-MM-dd'T'HH:mm") : ''}
            onChange={(e) => setEndTime(new Date(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </Label>
        <Select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="Confirmed">Confirmed</option>
          <option value="Tentative">Tentative</option>
          <option value="Cancelled">Cancelled</option>
        </Select>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Save Appointment
        </Button>
      </div>
    </form>
  );
} // The extra brace was here, now it is removed.

