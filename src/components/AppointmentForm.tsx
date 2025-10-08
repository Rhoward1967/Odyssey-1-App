import React, { useState } from 'react';
import { format } from 'date-fns';

// This is a stand-in for your actual UI components like ShadCN
// You would import Button, Calendar, Popover, etc. from your library
// For this fix, we are ensuring the component structure is valid.

// Mock UI components for structure validation
const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>;
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />;
const Label = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => <label {...props}>{children}</label>;
const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...props}>{children}</select>;

// Define a type for validation errors to provide specific feedback
interface FormErrors {
  title?: string;
  dates?: string;
}

// Define a type for the initial data to ensure type safety
interface AppointmentData {
  title?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
}

// Define the types for the component's props
interface AppointmentFormProps {
  onSubmit: (formData: { title: string; status: string; start_time: string; end_time: string }) => void;
  initialData?: AppointmentData;
}

export default function AppointmentForm({ onSubmit, initialData = {} }: AppointmentFormProps) {
  const [title, setTitle] = useState(initialData.title || '');
  const [status, setStatus] = useState(initialData.status || 'Confirmed');
  const [startTime, setStartTime] = useState<Date | undefined>(initialData.start_time ? new Date(initialData.start_time) : undefined);
  const [endTime, setEndTime] = useState<Date | undefined>(initialData.end_time ? new Date(initialData.end_time) : undefined);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    }
    if (!startTime || !endTime || startTime >= endTime) {
      newErrors.dates = 'Please ensure the start time is before the end time.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    const formData = {
      title,
      status,
      start_time: startTime!.toISOString(),
      end_time: endTime!.toISOString(),
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
        {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
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
      {errors.dates && <p className="text-sm text-red-600 -mt-4">{errors.dates}</p>}


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
}

