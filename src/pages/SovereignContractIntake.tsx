/**
 * SOVEREIGN CONTRACT INTAKE
 * Day Zero — All new business enters through this gate.
 * Howard Jones Bloodline Ancestral Trust
 * PPA #042 Logic Gate enforced on every calculation.
 * Genesis: February 27, 2026
 */

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LogicGateAuditPanel from '@/components/LogicGateAuditPanel';
import SovereignContractTemplate, {
  SovereignContractData,
} from '@/components/SovereignContractTemplate';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientInfo {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
}

interface ServiceScope {
  serviceDescription: string;
  serviceFrequency: string;
  termMonths: number;
  startDate: string;
  locationLabel: string;
}

interface PricingData {
  estimatedHours: number;
  hourlyRate: number;
  profitMarginPct: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const generateContractNumber = () => {
  const d = new Date();
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `SSA-${yr}${mo}-${rand}`;
};

const today = () => new Date().toISOString().split('T')[0];

// ─── Step Labels ──────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: 'Client Info' },
  { n: 2, label: 'Service Scope' },
  { n: 3, label: 'Logic Gate Pricing' },
  { n: 4, label: 'Contract & Save' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const SovereignContractIntake: React.FC = () => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [contractNumber] = useState(generateContractNumber());

  const [client, setClient] = useState<ClientInfo>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientCity: '',
    clientState: '',
    clientZip: '',
  });

  const [scope, setScope] = useState<ServiceScope>({
    serviceDescription: '',
    serviceFrequency: 'monthly',
    termMonths: 12,
    startDate: '',
    locationLabel: '',
  });

  const [pricing, setPricing] = useState<PricingData>({
    estimatedHours: 0,
    hourlyRate: 25,
    profitMarginPct: 20,
  });

  // Derived pricing values
  const baseCost = pricing.estimatedHours * pricing.hourlyRate;
  const profitAmount = baseCost * (pricing.profitMarginPct / 100);
  const junctionValue = baseCost > 0 ? Math.sqrt(baseCost * profitAmount) : 0;
  const totalBid = baseCost + profitAmount + junctionValue;

  const contractData: SovereignContractData = {
    ...client,
    ...scope,
    baseCost,
    profitAmount,
    junctionValue,
    totalBid,
    profitMarginPct: pricing.profitMarginPct,
    contractNumber,
    issueDate: today(),
  };

  // ── Field helpers ────────────────────────────────────────────────────────

  const setClientField = (k: keyof ClientInfo, v: string) =>
    setClient((p) => ({ ...p, [k]: v }));

  const setScopeField = (k: keyof ServiceScope, v: string | number) =>
    setScope((p) => ({ ...p, [k]: v }));

  const setPricingField = (k: keyof PricingData, v: number) =>
    setPricing((p) => ({ ...p, [k]: v }));

  // ── Validation ───────────────────────────────────────────────────────────

  const step1Valid = client.clientName.trim().length > 0;
  const step2Valid = scope.serviceDescription.trim().length > 0;
  const step3Valid = baseCost > 0;

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from('bids').insert({
        user_id: user?.id,
        title: `${contractData.clientName} — ${contractData.locationLabel || contractData.serviceDescription.slice(0, 40)}`,
        status: 'draft',
        total_cents: Math.round(totalBid * 100),
        notes: JSON.stringify({
          contract_number: contractNumber,
          client,
          scope,
          universal_math: {
            base_cost: baseCost,
            profit_amount: profitAmount,
            junction_value: junctionValue,
            total_bid: totalBid,
            western_total: baseCost + profitAmount,
            logic_gate_certified: true,
            ppa: 'HJBT-LLD-2026-042',
          },
        }),
        line_items: [
          {
            description: 'Base Cost (Entity A)',
            amount_cents: Math.round(baseCost * 100),
          },
          {
            description: 'Profit Margin (Entity B)',
            amount_cents: Math.round(profitAmount * 100),
          },
          {
            description:
              'Junction Value (×) — PPA #042 Sovereign IP',
            amount_cents: Math.round(junctionValue * 100),
          },
        ],
      });

      if (error) throw error;
      setSaved(true);
    } catch (err: any) {
      setSaveError(err?.message || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Print ────────────────────────────────────────────────────────────────

  const handlePrint = () => window.print();

  // ─── Shared styles ────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '4px',
  };

  const fieldWrap: React.CSSProperties = { marginBottom: '14px' };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '22px',
            fontWeight: 700,
            margin: '0 0 4px',
          }}
        >
          Sovereign Contract Intake
        </h1>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          Howard Jones Bloodline Ancestral Trust · Day Zero Protocol ·
          All pricing certified by PPA #042 Logic Gate
        </div>
      </div>

      {/* Step Indicator */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          marginBottom: '28px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
      >
        {STEPS.map((s) => (
          <div
            key={s.n}
            style={{
              flex: 1,
              padding: '8px 4px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: step === s.n ? 700 : 400,
              backgroundColor:
                step === s.n
                  ? '#1a1a1a'
                  : step > s.n
                  ? '#16a34a'
                  : '#f9fafb',
              color:
                step === s.n ? 'white' : step > s.n ? 'white' : '#6b7280',
              borderRight:
                s.n < STEPS.length ? '1px solid #e5e7eb' : 'none',
              transition: 'background 0.2s',
            }}
          >
            {step > s.n ? '✓ ' : `${s.n}. `}
            {s.label}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Client Info ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div>
          <h2
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '16px',
              marginBottom: '16px',
            }}
          >
            Client Information
          </h2>

          <div style={fieldWrap}>
            <label style={labelStyle}>Client / Business Name *</label>
            <input
              style={inputStyle}
              value={client.clientName}
              onChange={(e) => setClientField('clientName', e.target.value)}
              placeholder="e.g. Georgia Eye Surgery Center"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Email</label>
              <input
                style={inputStyle}
                type="email"
                value={client.clientEmail}
                onChange={(e) => setClientField('clientEmail', e.target.value)}
                placeholder="contact@client.com"
              />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Phone</label>
              <input
                style={inputStyle}
                type="tel"
                value={client.clientPhone}
                onChange={(e) => setClientField('clientPhone', e.target.value)}
                placeholder="(xxx) xxx-xxxx"
              />
            </div>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Street Address</label>
            <input
              style={inputStyle}
              value={client.clientAddress}
              onChange={(e) => setClientField('clientAddress', e.target.value)}
              placeholder="123 Main St"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gap: '12px',
            }}
          >
            <div style={fieldWrap}>
              <label style={labelStyle}>City</label>
              <input
                style={inputStyle}
                value={client.clientCity}
                onChange={(e) => setClientField('clientCity', e.target.value)}
                placeholder="Athens"
              />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>State</label>
              <input
                style={inputStyle}
                value={client.clientState}
                onChange={(e) => setClientField('clientState', e.target.value)}
                placeholder="GA"
                maxLength={2}
              />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>ZIP</label>
              <input
                style={inputStyle}
                value={client.clientZip}
                onChange={(e) => setClientField('clientZip', e.target.value)}
                placeholder="30608"
              />
            </div>
          </div>

          <button
            disabled={!step1Valid}
            onClick={() => setStep(2)}
            style={{
              marginTop: '8px',
              padding: '10px 24px',
              backgroundColor: step1Valid ? '#1a1a1a' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: step1Valid ? 'pointer' : 'not-allowed',
            }}
          >
            Next: Service Scope →
          </button>
        </div>
      )}

      {/* ── STEP 2: Service Scope ────────────────────────────────────────────── */}
      {step === 2 && (
        <div>
          <h2
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '16px',
              marginBottom: '16px',
            }}
          >
            Service Scope
          </h2>

          <div style={fieldWrap}>
            <label style={labelStyle}>Service Description *</label>
            <textarea
              style={{
                ...inputStyle,
                minHeight: '80px',
                resize: 'vertical',
              }}
              value={scope.serviceDescription}
              onChange={(e) =>
                setScopeField('serviceDescription', e.target.value)
              }
              placeholder="Describe the cleaning or service work to be performed..."
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Location / Site Label</label>
            <input
              style={inputStyle}
              value={scope.locationLabel}
              onChange={(e) => setScopeField('locationLabel', e.target.value)}
              placeholder="e.g. Main Office, Building A, Milledgeville Rd"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
            }}
          >
            <div style={fieldWrap}>
              <label style={labelStyle}>Billing Frequency</label>
              <select
                style={inputStyle}
                value={scope.serviceFrequency}
                onChange={(e) =>
                  setScopeField('serviceFrequency', e.target.value)
                }
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Term (months)</label>
              <input
                style={inputStyle}
                type="number"
                min={1}
                value={scope.termMonths}
                onChange={(e) =>
                  setScopeField('termMonths', parseInt(e.target.value) || 12)
                }
              />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Start Date</label>
              <input
                style={inputStyle}
                type="date"
                value={scope.startDate}
                onChange={(e) => setScopeField('startDate', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                padding: '10px 20px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              disabled={!step2Valid}
              onClick={() => setStep(3)}
              style={{
                padding: '10px 24px',
                backgroundColor: step2Valid ? '#1a1a1a' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: step2Valid ? 'pointer' : 'not-allowed',
              }}
            >
              Next: Logic Gate Pricing →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Pricing + Logic Gate ────────────────────────────────────── */}
      {step === 3 && (
        <div>
          <h2
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '16px',
              marginBottom: '4px',
            }}
          >
            Logic Gate Pricing
          </h2>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
            Enter your cost inputs. PPA #042 Logic Gate will calculate the
            Universal Math total and display the Western vs. Sovereign
            difference.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
            }}
          >
            <div style={fieldWrap}>
              <label style={labelStyle}>Estimated Hours</label>
              <input
                style={inputStyle}
                type="number"
                min={0}
                step={0.5}
                value={pricing.estimatedHours || ''}
                onChange={(e) =>
                  setPricingField(
                    'estimatedHours',
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0"
              />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Hourly Rate ($)</label>
              <input
                style={inputStyle}
                type="number"
                min={0}
                step={0.5}
                value={pricing.hourlyRate || ''}
                onChange={(e) =>
                  setPricingField('hourlyRate', parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Profit Margin (%)</label>
              <input
                style={inputStyle}
                type="number"
                min={0}
                max={100}
                value={pricing.profitMarginPct || ''}
                onChange={(e) =>
                  setPricingField(
                    'profitMarginPct',
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>
          </div>

          {baseCost > 0 && (
            <div
              style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '4px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Base Cost:</span>
                <strong>{fmt(baseCost)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Profit:</span>
                <strong>{fmt(profitAmount)}</strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#15803d',
                }}
              >
                <span>Junction Value (×):</span>
                <strong>+{fmt(junctionValue)}</strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #d1d5db',
                  marginTop: '6px',
                  paddingTop: '6px',
                  fontWeight: 700,
                }}
              >
                <span>SOVEREIGN TOTAL:</span>
                <span style={{ fontSize: '16px' }}>{fmt(totalBid)}</span>
              </div>
            </div>
          )}

          <LogicGateAuditPanel
            baseCost={baseCost}
            profitAmount={profitAmount}
            show={baseCost > 0}
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={() => setStep(2)}
              style={{
                padding: '10px 20px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              disabled={!step3Valid}
              onClick={() => setStep(4)}
              style={{
                padding: '10px 24px',
                backgroundColor: step3Valid ? '#1a1a1a' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: step3Valid ? 'pointer' : 'not-allowed',
              }}
            >
              Next: Review Contract →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Preview + Save ───────────────────────────────────────────── */}
      {step === 4 && (
        <div>
          <div
            className="no-print"
            style={{ marginBottom: '16px' }}
          >
            <h2
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '16px',
                marginBottom: '4px',
              }}
            >
              Sovereign Contract Preview
            </h2>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 14px' }}>
              Review the contract below. Save it to the system or print/download
              for signature.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setStep(3)}
                style={{
                  padding: '8px 18px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                ← Edit Pricing
              </button>

              <button
                onClick={handlePrint}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#1d4ed8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🖨 Print / Download PDF
              </button>

              {!saved ? (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '8px 22px',
                    backgroundColor: saving ? '#6b7280' : '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Saving...' : '✓ Save Contract to System'}
                </button>
              ) : (
                <div
                  style={{
                    padding: '8px 18px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #16a34a',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#15803d',
                    fontWeight: 600,
                  }}
                >
                  ✓ Saved — Contract #{contractNumber}
                </div>
              )}
            </div>

            {saveError && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: '6px',
                  color: '#dc2626',
                  fontSize: '12px',
                }}
              >
                {saveError}
              </div>
            )}

            <hr style={{ margin: '20px 0', borderColor: '#e5e7eb' }} />
          </div>

          {/* Contract Document */}
          <SovereignContractTemplate data={contractData} />
        </div>
      )}
    </div>
  );
};

export default SovereignContractIntake;
