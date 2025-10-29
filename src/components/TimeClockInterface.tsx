import { supabase } from '@/lib/supabase';
import React, { useState } from 'react';
interface TimeEntry {
  id: string;
  clock_in: string;
  clock_out?: string;
  total_hours?: number;
  status: string;
}

export const TimeClockInterface: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [message, setMessage] = useState('');

  const handleClockInOut = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('hr-orchestrator', {
        body: {
          action: 'CLOCK_IN_OUT',
          payload: {
            organization_id: '1',
            gps_location: {
              address: 'Office Location'
            }
          }
        }
      });

      if (error) throw error;

      setMessage(data.message);
      setIsClockedIn(data.status === 'CLOCKED_IN');
      setCurrentEntry(data.entry);

    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Time Clock</h2>
      
      <div className="text-center">
        <div className="mb-4">
          <div className="text-lg font-semibold">
            Status: <span className={isClockedIn ? 'text-green-600' : 'text-red-600'}>
              {isClockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}
            </span>
          </div>
          
          {currentEntry && (
            <div className="text-sm text-gray-600 mt-2">
              {isClockedIn ? (
                <p>Clocked in at: {new Date(currentEntry.clock_in).toLocaleTimeString()}</p>
              ) : (
                <p>Total hours: {currentEntry.total_hours?.toFixed(2) || '0.00'}</p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleClockInOut}
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : isClockedIn 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
          } transition-colors`}
        >
          {isLoading ? 'Processing...' : isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded ${
            message.includes('Error') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};