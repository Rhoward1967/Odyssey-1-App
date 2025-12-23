import { useState } from 'react';

// This should be initialized from your central Supabase client instance

// Type definition for a single appointment object
type Appointment = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: 'Confirmed' | 'Tentative' | 'Cancelled';
};

// Props for the AppointmentList component
type AppointmentListProps = {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
};


export default function AppointmentList({ appointments, onEdit, onDelete }: AppointmentListProps) {
  // --- NEW STATE FOR ERROR HANDLING ---
  const [error, setError] = useState<string | null>(null);

  if (appointments.length === 0 && !error) {
    return <p className="text-center text-gray-500">No appointments scheduled.</p>;
  }

  return (
    <div className="space-y-4">
      {/* --- NEW UI ELEMENT TO DISPLAY ERRORS --- */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg" role="alert">
          <p>{error}</p>
        </div>
      )}
      {appointments.map((app) => (
        <div key={app.id} className="p-4 bg-white border rounded-lg shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-gray-800">{app.title}</h3>
            <p className="text-sm text-gray-600">
              {new Date(app.start_time).toLocaleString()} - {new Date(app.end_time).toLocaleString()}
            </p>
            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
              app.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
              app.status === 'Tentative' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {app.status}
            </span>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => onEdit(app)}
              className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(app.id)}
              className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
