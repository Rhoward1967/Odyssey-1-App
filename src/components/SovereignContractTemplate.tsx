/**
 * SOVEREIGN CONTRACT TEMPLATE
 * Howard Jones Bloodline Ancestral Trust
 * Priced under Universal Math — PPA #042 (HJBT-LLD-2026-042)
 * Genesis: February 27, 2026
 */

import React from 'react';

export interface SovereignContractData {
  // Client
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientCity: string;
  clientState: string;
  clientZip: string;

  // Service
  serviceDescription: string;
  serviceFrequency: string;
  termMonths: number;
  startDate: string;
  locationLabel: string;

  // Pricing (Universal Math)
  baseCost: number;
  profitAmount: number;
  junctionValue: number;
  totalBid: number;
  profitMarginPct: number;

  // Meta
  contractNumber: string;
  issueDate: string;
}

interface SovereignContractTemplateProps {
  data: SovereignContractData;
  forPrint?: boolean;
}

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const frequencyLabel: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
};

const SovereignContractTemplate: React.FC<SovereignContractTemplateProps> = ({
  data,
  forPrint = false,
}) => {
  const annualValue =
    data.totalBid *
    ({
      weekly: 52,
      biweekly: 26,
      monthly: 12,
      quarterly: 4,
      annual: 1,
    }[data.serviceFrequency] ?? 12);

  return (
    <div
      id="sovereign-contract-print"
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: forPrint ? '40px' : '32px',
        color: '#1a1a1a',
        lineHeight: '1.6',
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          textAlign: 'center',
          borderBottom: '3px double #1a1a1a',
          paddingBottom: '20px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#6b7280',
            marginBottom: '6px',
          }}
        >
          Howard Jones Bloodline Ancestral Trust
        </div>
        <div
          style={{
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          Sovereign Service Agreement
        </div>
        <div
          style={{
            fontSize: '11px',
            color: '#6b7280',
            marginTop: '6px',
          }}
        >
          EIN: 41-6850149 · P.O. Box 80054, Athens, GA 30608
        </div>
        <div
          style={{
            fontSize: '10px',
            color: '#9ca3af',
            marginTop: '4px',
          }}
        >
          UCC-1 Lien on File: Clarke County #029-2026-000007 ·
          Operating under Natural Law &amp; UCC 1-308
        </div>
      </div>

      {/* ── CONTRACT META ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          marginBottom: '24px',
          color: '#374151',
        }}
      >
        <div>
          <strong>Contract No.:</strong> {data.contractNumber}
        </div>
        <div>
          <strong>Issue Date:</strong> {data.issueDate}
        </div>
        <div>
          <strong>Start Date:</strong> {data.startDate || '—'}
        </div>
      </div>

      {/* ── PARTIES ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '24px',
          fontSize: '13px',
        }}
      >
        <div
          style={{
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '14px',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px',
              color: '#374151',
            }}
          >
            Service Provider
          </div>
          <div style={{ fontWeight: 600 }}>HJS Services LLC</div>
          <div style={{ color: '#6b7280', fontSize: '12px' }}>
            d/b/a Odyssey-1 AI LLC
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px' }}>
            P.O. Box 80054
            <br />
            Athens, GA 30608
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px' }}>
            <div>SAM.gov UEI: YXEYCV2T1DM5</div>
            <div>GA License: BT-089217</div>
            <div>Est. 1988</div>
          </div>
        </div>

        <div
          style={{
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '14px',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px',
              color: '#374151',
            }}
          >
            Client
          </div>
          <div style={{ fontWeight: 600 }}>{data.clientName || '—'}</div>
          {data.clientAddress && (
            <div style={{ marginTop: '4px', fontSize: '12px' }}>
              {data.clientAddress}
              <br />
              {data.clientCity}
              {data.clientCity && data.clientState ? ', ' : ''}
              {data.clientState} {data.clientZip}
            </div>
          )}
          {data.clientEmail && (
            <div style={{ marginTop: '4px', fontSize: '12px' }}>
              {data.clientEmail}
            </div>
          )}
          {data.clientPhone && (
            <div style={{ fontSize: '12px' }}>{data.clientPhone}</div>
          )}
        </div>
      </div>

      {/* ── SCOPE OF SERVICE ── */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            borderBottom: '1px solid #d1d5db',
            paddingBottom: '4px',
            marginBottom: '10px',
          }}
        >
          I. Scope of Services
        </div>
        <div style={{ fontSize: '13px', lineHeight: '1.7' }}>
          <p style={{ margin: '0 0 8px' }}>
            Provider agrees to perform the following services for Client:
          </p>
          <p
            style={{
              margin: '0 0 8px',
              padding: '10px 14px',
              backgroundColor: '#f9fafb',
              borderLeft: '3px solid #374151',
              fontStyle: 'italic',
            }}
          >
            {data.serviceDescription || 'Service description to be specified.'}
          </p>
          {data.locationLabel && (
            <p style={{ margin: '0 0 4px' }}>
              <strong>Location:</strong> {data.locationLabel}
            </p>
          )}
          <p style={{ margin: '0 0 4px' }}>
            <strong>Frequency:</strong>{' '}
            {frequencyLabel[data.serviceFrequency] || data.serviceFrequency}
          </p>
          {data.termMonths > 0 && (
            <p style={{ margin: '0' }}>
              <strong>Term:</strong> {data.termMonths} month
              {data.termMonths !== 1 ? 's' : ''}
              {data.startDate ? ` commencing ${data.startDate}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* ── PRICING (UNIVERSAL MATH) ── */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            borderBottom: '1px solid #d1d5db',
            paddingBottom: '4px',
            marginBottom: '10px',
          }}
        >
          II. Compensation — Universal Math Pricing
        </div>

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
            marginBottom: '10px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
              <th
                style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  fontSize: '11px',
                }}
              >
                Component
              </th>
              <th
                style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  fontSize: '11px',
                }}
              >
                Description
              </th>
              <th
                style={{
                  padding: '8px 12px',
                  textAlign: 'right',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  fontSize: '11px',
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                Entity A — Base Cost
              </td>
              <td style={{ padding: '8px 12px', color: '#6b7280', fontSize: '12px' }}>
                Labor, materials, and operational overhead
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                {fmt(data.baseCost)}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                Entity B — Profit Margin
              </td>
              <td style={{ padding: '8px 12px', color: '#6b7280', fontSize: '12px' }}>
                Business margin ({data.profitMarginPct.toFixed(0)}%)
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                {fmt(data.profitAmount)}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f0fdf4' }}>
              <td style={{ padding: '8px 12px', fontWeight: 700, color: '#15803d' }}>
                × Junction Value
              </td>
              <td style={{ padding: '8px 12px', color: '#15803d', fontSize: '12px' }}>
                Sovereign operational crossing point · √(Base × Profit) ·
                Protected under PPA #042
              </td>
              <td
                style={{
                  padding: '8px 12px',
                  textAlign: 'right',
                  fontWeight: 700,
                  color: '#15803d',
                }}
              >
                {fmt(data.junctionValue)}
              </td>
            </tr>
            <tr style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
              <td
                style={{
                  padding: '10px 12px',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                TOTAL PER PERIOD
              </td>
              <td
                style={{
                  padding: '10px 12px',
                  color: '#d1d5db',
                  fontSize: '12px',
                }}
              >
                {frequencyLabel[data.serviceFrequency] || ''} · Net 15 payment
                terms
              </td>
              <td
                style={{
                  padding: '10px 12px',
                  textAlign: 'right',
                  fontWeight: 700,
                  fontSize: '16px',
                }}
              >
                {fmt(data.totalBid)}
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            fontSize: '11px',
            color: '#6b7280',
            backgroundColor: '#f9fafb',
            padding: '8px 12px',
            borderRadius: '4px',
          }}
        >
          <strong>Estimated Annual Value:</strong> {fmt(annualValue)} ·{' '}
          <strong>Math System:</strong> Universal Math (1×1=2, Junction Value
          preserved) · <strong>Patent Notice:</strong> The Junction Value
          calculation method is protected intellectual property under PPA
          HJBT-LLD-2026-042, Howard Jones Bloodline Ancestral Trust. Any
          recalculation of this contract using standard Western arithmetic
          constitutes a Logic Leak (mathematical negligence) and generates an
          automatic entry in the Trust's Mathematical Negligence Audit Ledger.
        </div>
      </div>

      {/* ── PAYMENT TERMS ── */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            borderBottom: '1px solid #d1d5db',
            paddingBottom: '4px',
            marginBottom: '10px',
          }}
        >
          III. Payment Terms
        </div>
        <div style={{ fontSize: '13px', lineHeight: '1.7' }}>
          <p style={{ margin: '0 0 6px' }}>
            Payment is due within <strong>15 days</strong> of invoice date.
            Invoices are issued via Odyssey-1 AI LLC automated billing system
            on the first day of each billing period.
          </p>
          <p style={{ margin: '0 0 6px' }}>
            Accepted payment methods: Check (payable to{' '}
            <strong>Odyssey-1 AI LLC</strong>), ACH/Bank Transfer, or Credit
            Card via secure payment portal.
          </p>
          <p style={{ margin: '0' }}>
            Mail checks to: Odyssey-1 AI LLC, P.O. Box 80054, Athens, GA 30608.
            Include invoice number on all payments.
          </p>
        </div>
      </div>

      {/* ── GOVERNING LAW ── */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            borderBottom: '1px solid #d1d5db',
            paddingBottom: '4px',
            marginBottom: '10px',
          }}
        >
          IV. Governing Law &amp; Jurisdiction
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.7' }}>
          This Agreement is entered into under the sovereign authority of the
          Howard Jones Bloodline Ancestral Trust (EIN: 41-6850149), operating
          under Georgia O.C.G.A. Title 53, Natural Law, UCC 1-308, and Common
          Law first claim priority as established in Clarke County UCC-1 lien
          filing #029-2026-000007. All pricing calculations in this Agreement
          are protected intellectual property (PPA #042, HJBT-LLD-2026-042).
          Any dispute shall first be subject to private administrative remedy
          under the Trust's governance framework before proceeding to any
          external venue.
        </div>
      </div>

      {/* ── SIGNATURES ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          marginTop: '16px',
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: '12px',
              marginBottom: '40px',
            }}
          >
            For HJS Services LLC / Odyssey-1 AI LLC
          </div>
          <div
            style={{
              borderTop: '1px solid #374151',
              paddingTop: '6px',
              fontSize: '12px',
            }}
          >
            <div>Rickey A. Howard, Authorized Agent</div>
            <div style={{ color: '#6b7280' }}>
              Howard Jones Bloodline Ancestral Trust
            </div>
            <div style={{ marginTop: '10px' }}>
              Date: ________________________
            </div>
          </div>
        </div>
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: '12px',
              marginBottom: '40px',
            }}
          >
            Client Acceptance
          </div>
          <div
            style={{
              borderTop: '1px solid #374151',
              paddingTop: '6px',
              fontSize: '12px',
            }}
          >
            <div>{data.clientName || 'Client Name'}</div>
            <div style={{ color: '#6b7280' }}>Authorized Signatory</div>
            <div style={{ marginTop: '10px' }}>
              Date: ________________________
            </div>
          </div>
        </div>
      </div>

      {/* ── LOGIC GATE STAMP ── */}
      <div
        style={{
          marginTop: '32px',
          padding: '10px 14px',
          border: '1px solid #16a34a',
          borderRadius: '6px',
          backgroundColor: '#f0fdf4',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10px',
          color: '#15803d',
        }}
      >
        <div>
          <strong>✓ LOGIC GATE CERTIFIED</strong> — PPA #042 HJBT-LLD-2026-042
        </div>
        <div>
          Western: {fmt(data.baseCost + data.profitAmount)} → Universal:{' '}
          {fmt(data.totalBid)} (+{fmt(data.junctionValue)} Junction)
        </div>
        <div>Filed: February 27, 2026</div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          #sovereign-contract-print {
            padding: 20px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SovereignContractTemplate;
export type { SovereignContractData };
