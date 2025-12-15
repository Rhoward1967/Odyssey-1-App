import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

/**
 * Emergency diagnostic tool for customer data issues
 * Shows actual database state and provides cleanup tools
 */
export function CustomerDataDiagnostic() {
  const [stats, setStats] = useState<{
    total: number;
    withEmail: number;
    withPhone: number;
    withAddress: number;
    sample: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Not authenticated');
      setLoading(false);
      return;
    }

    const { data, error, count } = await supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .range(0, 9999);

    if (error) {
      console.error('Error loading customers:', error);
      alert(`Error: ${error.message}`);
      setLoading(false);
      return;
    }

    const withEmail = data?.filter(c => c.email && c.email.trim() !== '').length || 0;
    const withPhone = data?.filter(c => c.phone && c.phone.trim() !== '').length || 0;
    const withAddress = data?.filter(c => c.billing_city && c.billing_city.trim() !== '').length || 0;

    setStats({
      total: count || 0,
      withEmail,
      withPhone,
      withAddress,
      sample: data?.slice(0, 5) || []
    });
    setLoading(false);
  };

  const clearAllCustomers = async () => {
    if (!confirm('⚠️ This will DELETE ALL customer data. Are you sure?')) return;
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Not authenticated');
      setLoading(false);
      return;
    }

    // Use server-side function for efficient deletion
    const { data, error } = await supabase.rpc('clear_customers_for_current_user', {
      batch_size: 5000
    });

    if (error) {
      console.error(`❌ Clear error:`, error);
      alert(`Error clearing data: ${error.message}`);
      setLoading(false);
      return;
    }

    alert(`✅ Deleted ${data || 0} customer records. Re-upload your CSV now.`);
    await loadStats();
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) return <div>Loading diagnostics...</div>;
  if (!stats) return <div>No stats loaded</div>;

  return (
    <div style={{ 
      border: '2px solid #f59e0b', 
      padding: '1rem', 
      margin: '1rem 0',
      backgroundColor: '#fffbeb',
      borderRadius: '8px'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#92400e' }}>🔍 Customer Data Diagnostic</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>Database State:</strong>
        <ul style={{ marginTop: '0.5rem' }}>
          <li><strong>Total Records:</strong> {stats.total}</li>
          <li><strong>With Email:</strong> {stats.withEmail} ({stats.total > 0 ? Math.round(stats.withEmail/stats.total*100) : 0}%)</li>
          <li><strong>With Phone:</strong> {stats.withPhone} ({stats.total > 0 ? Math.round(stats.withPhone/stats.total*100) : 0}%)</li>
          <li><strong>With City:</strong> {stats.withAddress} ({stats.total > 0 ? Math.round(stats.withAddress/stats.total*100) : 0}%)</li>
        </ul>
      </div>

      {stats.sample.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <strong>Sample Records (first 5):</strong>
          <pre style={{ 
            fontSize: '11px', 
            backgroundColor: '#fff', 
            padding: '0.5rem',
            overflowX: 'auto',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            marginTop: '0.5rem'
          }}>
            {JSON.stringify(stats.sample.map(c => ({
              name: c.customer_name,
              email: c.email,
              phone: c.phone,
              city: c.billing_city
            })), null, 2)}
          </pre>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={loadStats}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh Stats
        </button>
        <button
          onClick={clearAllCustomers}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear All Customers
        </button>
      </div>

      <div style={{ 
        marginTop: '1rem', 
        fontSize: '0.875rem', 
        color: '#78716c',
        borderTop: '1px solid #d6d3d1',
        paddingTop: '0.5rem'
      }}>
        <strong>Instructions:</strong>
        <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>Check if records have actual data (not all null)</li>
          <li>If data is corrupted, click "Clear All Customers"</li>
          <li>Re-upload your CSV file</li>
          <li>Click "Refresh Stats" to verify data saved correctly</li>
        </ol>
      </div>
    </div>
  );
}
