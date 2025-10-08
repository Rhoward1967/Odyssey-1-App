import React, { useState } from 'react';

interface AppointmentFormProps {
  onSubmit: (formData: {
    title: string;
    status: string;
    startTime: string;
    endTime: string;
  }) => void;
  initialData?: {
    title?: string;
    status?: string;
    start_time?: string;
    end_time?: string;
  };
}

export default function AppointmentForm({ onSubmit, initialData = {} }: AppointmentFormProps) {
  const [title, setTitle] = useState(initialData.title || '');
  const [status, setStatus] = useState(initialData.status || 'Confirmed');
  const [startTime, setStartTime] = useState(initialData.start_time || '');
  const [endTime, setEndTime] = useState(initialData.end_time || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      status,
      startTime,
      endTime,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white/10">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-white">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-white mb-1">Start Time</label>
          <input
            type="datetime-local"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-white mb-1">End Time</label>
          <input
            type="datetime-local"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-white">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="Confirmed">Confirmed</option>
          <option value="Tentative">Tentative</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <button
        type="submit"
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Save Appointment
      </button>
    </form>
  );
}