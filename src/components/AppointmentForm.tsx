

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// This should be initialized from your central Supabase client instance
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Expanded Type definitions to include ID for updates
type Appointment = {
  id?: string; // ID is optional for new appointments, required for updates
  title?: string;
  start_time?: Date;
  end_time?: Date;
  status?: 'Confirmed' | 'Tentative' | 'Cancelled';
};


type AppointmentFormProps = {
  onSave: (data: {
    title: string;
    start_time: string;
    end_time: string;
    status: 'Confirmed' | 'Tentative' | 'Cancelled';
  }) => void | Promise<void>;
  onCancel: () => void;
  initialData?: Appointment;
};

export default function AppointmentForm({ onSave, onCancel, initialData = {} }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    start_time: initialData.start_time ? new Date(initialData.start_time).toISOString().slice(0, 16) : '',
    end_time: initialData.end_time ? new Date(initialData.end_time).toISOString().slice(0, 16) : '',
    status: initialData.status || 'Confirmed',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Effect to update form when initialData changes (for editing)
  useEffect(() => {
    setFormData({
      title: initialData.title || '',
      start_time: initialData.start_time ? new Date(initialData.start_time).toISOString().slice(0, 16) : '',
      end_time: initialData.end_time ? new Date(initialData.end_time).toISOString().slice(0, 16) : '',
      status: initialData.status || 'Confirmed',
    });
  }, [initialData]);

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required.');
      return false;
    }
    if (!formData.start_time || !formData.end_time) {
      setError('Both start and end times are required.');
      return false;
    }
    if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      setError('End time must be after the start time.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      await onSave({
        title: formData.title,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        status: formData.status as 'Confirmed' | 'Tentative' | 'Cancelled',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to save appointment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">Start Time</label>
          <input
            type="datetime-local"
            id="start_time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">End Time</label>
          <input
            type="datetime-local"
            id="end_time"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="Confirmed">Confirmed</option>
          <option value="Tentative">Tentative</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isLoading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
          {isLoading ? 'Saving...' : 'Save Appointment'}
        </button>
        <button type="button" onClick={onCancel} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Cancel
        </button>
      </div>
    </form>
  );
}

