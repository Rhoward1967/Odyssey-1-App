/**
 * OSC Ministerial Grant Panel
 * Admin-only UI for the Managing Officer to issue OSC from the Vault
 *
 * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 */

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface GrantResult {
  success: boolean;
  transaction_id: string;
  target_user: string;
  amount: number;
  new_balance: number;
  reason: string;
}

export default function OSCAdminGrantPanel() {
  const [targetUserId, setTargetUserId] = useState('');
  const [amount, setAmount]             = useState('');
  const [reason, setReason]             = useState('');
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState<GrantResult | null>(null);
  const [error, setError]               = useState('');

  async function handleGrant() {
    setError('');
    setResult(null);

    if (!targetUserId.trim() || !amount || parseInt(amount) <= 0) {
      setError('Target User ID and a positive amount are required.');
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated.');
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/osc-ministerial-grant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: targetUserId.trim(),
          amount: parseInt(amount),
          reason: reason.trim() || 'Ministerial Grant',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Grant failed.');
        return;
      }

      setResult(data);
      setTargetUserId('');
      setAmount('');
      setReason('');

    } catch (err: any) {
      setError(err.message || 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a0a2e 0%, #0d1f3c 100%)',
      border: '1px solid #7c3aed',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '520px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '22px' }}>⚜️</span>
          <h2 style={{ color: '#e9d5ff', fontSize: '18px', fontWeight: '700', margin: 0 }}>
            Ministerial Grant Protocol
          </h2>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
          Managing Officer only — Issues OSC from the Vault to any user account.
        </p>
      </div>

      {/* Target User ID */}
      <div style={{ marginBottom: '14px' }}>
        <label style={{ color: '#c4b5fd', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
          TARGET USER ID (Supabase UUID)
        </label>
        <input
          type="text"
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #4c1d95',
            borderRadius: '8px',
            padding: '10px 12px',
            color: '#f3f4f6',
            fontSize: '13px',
            fontFamily: 'monospace',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Amount */}
      <div style={{ marginBottom: '14px' }}>
        <label style={{ color: '#c4b5fd', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
          OSC AMOUNT (max 1,000,000 per grant)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 1000"
          min="1"
          max="1000000"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #4c1d95',
            borderRadius: '8px',
            padding: '10px 12px',
            color: '#fbbf24',
            fontSize: '16px',
            fontWeight: '700',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Reason */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ color: '#c4b5fd', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
          GRANT REASON (audit record)
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Founding Minister — Trust Service Q1 2026"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #4c1d95',
            borderRadius: '8px',
            padding: '10px 12px',
            color: '#f3f4f6',
            fontSize: '13px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Grant Button */}
      <button
        onClick={handleGrant}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          background: loading ? '#4c1d95' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '15px',
          fontWeight: '700',
          cursor: loading ? 'not-allowed' : 'pointer',
          letterSpacing: '0.5px',
        }}
      >
        {loading ? 'Executing Grant...' : '⚜️ Issue Ministerial Grant'}
      </button>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: '16px',
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '12px',
          color: '#fca5a5',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {/* Success */}
      {result && (
        <div style={{
          marginTop: '16px',
          background: 'rgba(16,185,129,0.15)',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '16px',
        }}>
          <div style={{ color: '#6ee7b7', fontWeight: '700', marginBottom: '10px', fontSize: '14px' }}>
            Grant Executed Successfully
          </div>
          <div style={{ display: 'grid', gap: '6px', fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>
            <div><span style={{ color: '#c4b5fd' }}>TX ID:</span> {result.transaction_id}</div>
            <div><span style={{ color: '#c4b5fd' }}>Issued:</span> <span style={{ color: '#fbbf24', fontWeight: '700' }}>{result.amount.toLocaleString()} OSC</span></div>
            <div><span style={{ color: '#c4b5fd' }}>New Balance:</span> {result.new_balance.toLocaleString()} OSC</div>
            <div><span style={{ color: '#c4b5fd' }}>Reason:</span> {result.reason}</div>
          </div>
        </div>
      )}

      {/* Vault notice */}
      <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '16px', marginBottom: 0, textAlign: 'center' }}>
        Grants deducted from Vault (3.8B allocation) — Full audit trail in osc_transactions
      </p>
    </div>
  );
}
