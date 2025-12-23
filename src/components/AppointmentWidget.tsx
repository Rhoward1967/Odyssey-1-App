import React, { useState, useEffect, useCallback } from 'react';
import AppointmentForm from './AppointmentForm';
import AppointmentList from './AppointmentList';

// This should be initialized from your central Supabase client instance
import { supabase } from '@/lib/supabaseClient';

// Type definitions
type Appointment = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: 'Confirmed' | 'Tentative' | 'Cancelled';
};

export default function AppointmentWidget() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for managing the form (create vs. edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>(undefined);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from('appointment')
      .select('*')
      .order('start_time', { ascending: false });

    if (fetchError) {
      console.error('Error fetching appointments:', fetchError);
      setError(`Failed to load appointments: ${fetchError.message}`);
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingAppointment(undefined);
    fetchAppointments(); // Refetch to ensure data consistency
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsFormOpen(true);
  };


  // --- OPTIMISTIC SAVE (CREATE & UPDATE) ---
  type AppointmentFormData = Omit<Appointment, 'id'> & { id?: string };
  const handleSaveAppointment = async (formData: AppointmentFormData) => {
    const originalAppointments = [...appointments];
    setIsFormOpen(false);
    setEditingAppointment(undefined);

    if (formData.id) {
      // --- Optimistic Update ---
      setAppointments(prev => prev.map(app => app.id === formData.id ? { ...app, ...formData } : app));
      const { error: updateError } = await supabase.from('appointment').update(formData).eq('id', formData.id);
      if (updateError) {
        console.error('Failed to update:', updateError);
        setError('Failed to update appointment. Reverting changes.');
        setAppointments(originalAppointments);
      }
    } else {
      // --- Optimistic Create ---
      const tempId = `temp-${Date.now()}`;
      const newAppointment = { ...formData, id: tempId };
      setAppointments(prev => [newAppointment as Appointment, ...prev]);
      const { error: createError } = await supabase.from('appointment').insert([formData]);
      if (createError) {
        console.error('Failed to create:', createError);
        setError('Failed to create appointment. Removing temporary item.');
        setAppointments(originalAppointments);
      } else {
        // Refetch to get the real ID from the server
        fetchAppointments();
      }
    }
  };

  // --- OPTIMISTIC DELETE IMPLEMENTATION ---
  const handleDelete = async (appointmentId: string) => {
    const originalAppointments = [...appointments];
    setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    const { error: deleteError } = await supabase
      .from('appointment')
      .delete()
      .eq('id', appointmentId);
    if (deleteError) {
      console.error('Failed to delete appointment:', deleteError);
      setError(`Failed to delete. Restoring appointment.`);
      setAppointments(originalAppointments);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <button
            onClick={() => {
              setEditingAppointment(undefined);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            New Appointment
          </button>
        </div>

        {isFormOpen && (
          <div className="mb-6">
            <AppointmentForm
              onSave={handleSaveAppointment}
              onCancel={() => setIsFormOpen(false)}
              initialData={editingAppointment ? {
                ...editingAppointment,
                start_time: editingAppointment.start_time ? new Date(editingAppointment.start_time) : undefined,
                end_time: editingAppointment.end_time ? new Date(editingAppointment.end_time) : undefined,
              } : undefined}
            />
          </div>
        )}

        {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        {loading ? (
          <div className='space-y-3'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='p-4 bg-white border rounded-lg shadow-sm animate-pulse'>
                <div className='h-5 bg-gray-200 rounded w-1/3 mb-2' />
                <div className='h-4 bg-gray-200 rounded w-2/3' />
              </div>
            ))}
          </div>
        ) : (
          <AppointmentList
            appointments={appointments}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
