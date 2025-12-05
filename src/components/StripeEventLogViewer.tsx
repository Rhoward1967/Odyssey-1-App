import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface StripeEventLog {
  event_id: string;
  event_type: string;
  received_at: string;
  payload: any;
}

export default function StripeEventLogViewer() {
  const [logs, setLogs] = useState<StripeEventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('stripe_event_log')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(100);
      if (error) setError(error.message);
      else setLogs(data || []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Stripe Event Log</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {!loading && !error && (
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left">Event ID</th>
              <th className="px-2 py-1 text-left">Type</th>
              <th className="px-2 py-1 text-left">Received At</th>
              <th className="px-2 py-1 text-left">Payload</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.event_id} className="border-b">
                <td className="px-2 py-1 font-mono">{log.event_id}</td>
                <td className="px-2 py-1">{log.event_type}</td>
                <td className="px-2 py-1">{new Date(log.received_at).toLocaleString()}</td>
                <td className="px-2 py-1 max-w-xs truncate">
                  <details>
                    <summary>View</summary>
                    <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
