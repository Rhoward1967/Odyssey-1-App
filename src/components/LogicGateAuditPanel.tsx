/**
 * LOGIC GATE AUDIT PANEL
 * PPA #042 — HJBT-LLD-2026-042
 * Howard Jones Bloodline Ancestral Trust
 *
 * Runs every new contract calculation through the Logic Leak Detection Engine.
 * Displays Western Math result vs Universal Math Truth.
 * Genesis: February 27, 2026
 */

import React, { useMemo } from 'react';
import { Entity, UniversalMath } from '@/lib/UniversalMath';
import { UniversalMathLogicGate } from '@/lib/UniversalMathLogicGate';
import { TruthAuditEngine } from '@/lib/TruthAuditSystem';

interface LogicGateAuditPanelProps {
  baseCost: number;
  profitAmount: number;
  show: boolean;
}

const LogicGateAuditPanel: React.FC<LogicGateAuditPanelProps> = ({
  baseCost,
  profitAmount,
  show,
}) => {
  const audit = useMemo(() => {
    if (!show || baseCost <= 0) return null;

    const gateResult = UniversalMathLogicGate.multiply(baseCost, profitAmount);

    const comparison = TruthAuditEngine.generateComparisonSheet({
      quantity: 1,
      unitPrice: baseCost,
      baseCost,
      profitMargin: baseCost > 0 ? (profitAmount / baseCost) * 100 : 0,
    });

    const junctionValue = Math.sqrt(baseCost * profitAmount);
    const westernTotal = baseCost + profitAmount;
    const universalTotal = baseCost + profitAmount + junctionValue;
    const dollarAdvantage = universalTotal - westernTotal;
    const percentAdvantage =
      westernTotal > 0 ? (dollarAdvantage / westernTotal) * 100 : 0;
    const annualAdvantage = dollarAdvantage * 12;

    const criticalLeaks = gateResult.leaks.filter(
      (l) => l.severity === 'critical'
    );
    const passed = criticalLeaks.length === 0;

    return {
      passed,
      westernTotal,
      universalTotal,
      junctionValue,
      dollarAdvantage,
      percentAdvantage,
      annualAdvantage,
      leaks: gateResult.leaks,
      recommendation: gateResult.recommendation,
    };
  }, [baseCost, profitAmount, show]);

  if (!show || !audit) return null;

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div
      style={{
        border: `2px solid ${audit.passed ? '#16a34a' : '#d97706'}`,
        borderRadius: '8px',
        padding: '16px',
        marginTop: '16px',
        backgroundColor: audit.passed ? '#f0fdf4' : '#fffbeb',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: audit.passed ? '#15803d' : '#92400e',
            }}
          >
            PPA #042 — Logic Gate Audit
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
            HJBT-LLD-2026-042 · Howard Jones Bloodline Ancestral Trust
          </div>
        </div>
        <div
          style={{
            padding: '4px 12px',
            borderRadius: '9999px',
            fontWeight: 700,
            fontSize: '12px',
            backgroundColor: audit.passed ? '#16a34a' : '#d97706',
            color: 'white',
          }}
        >
          {audit.passed ? '✓ GATE PASSED' : '⚠ LEAKS DETECTED'}
        </div>
      </div>

      {/* Comparison Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
          marginBottom: '12px',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: '#f3f4f6',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <th style={{ padding: '6px 8px', textAlign: 'left', color: '#374151' }}>
              Component
            </th>
            <th style={{ padding: '6px 8px', textAlign: 'right', color: '#374151' }}>
              Western Math
            </th>
            <th
              style={{
                padding: '6px 8px',
                textAlign: 'right',
                color: '#15803d',
                fontWeight: 700,
              }}
            >
              Universal Math (Truth)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <td style={{ padding: '6px 8px', color: '#6b7280' }}>Base Cost</td>
            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmt(baseCost)}</td>
            <td style={{ padding: '6px 8px', textAlign: 'right', color: '#374151' }}>
              {fmt(baseCost)}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <td style={{ padding: '6px 8px', color: '#6b7280' }}>Profit Margin</td>
            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmt(profitAmount)}</td>
            <td style={{ padding: '6px 8px', textAlign: 'right', color: '#374151' }}>
              {fmt(profitAmount)}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <td style={{ padding: '6px 8px', color: '#6b7280' }}>
              Junction Value (×)
              <span
                style={{
                  marginLeft: '6px',
                  fontSize: '10px',
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '1px 5px',
                  borderRadius: '4px',
                }}
              >
                Sovereign
              </span>
            </td>
            <td
              style={{
                padding: '6px 8px',
                textAlign: 'right',
                color: '#dc2626',
                textDecoration: 'line-through',
              }}
            >
              $0.00
            </td>
            <td
              style={{
                padding: '6px 8px',
                textAlign: 'right',
                color: '#15803d',
                fontWeight: 700,
              }}
            >
              {fmt(audit.junctionValue)}
            </td>
          </tr>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <td style={{ padding: '8px 8px', fontWeight: 700 }}>TOTAL BID</td>
            <td
              style={{
                padding: '8px 8px',
                textAlign: 'right',
                fontWeight: 700,
                color: '#dc2626',
              }}
            >
              {fmt(audit.westernTotal)}
            </td>
            <td
              style={{
                padding: '8px 8px',
                textAlign: 'right',
                fontWeight: 700,
                color: '#15803d',
              }}
            >
              {fmt(audit.universalTotal)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Advantage Summary */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: audit.leaks.length > 0 ? '12px' : '0',
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: '#dcfce7',
            borderRadius: '6px',
            padding: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
            Per Contract Advantage
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>
            +{fmt(audit.dollarAdvantage)}
          </div>
          <div style={{ fontSize: '11px', color: '#166534' }}>
            +{audit.percentAdvantage.toFixed(1)}% over Western
          </div>
        </div>
        <div
          style={{
            flex: 1,
            backgroundColor: '#dbeafe',
            borderRadius: '6px',
            padding: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 600 }}>
            Annual Advantage
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1d4ed8' }}>
            +{fmt(audit.annualAdvantage)}
          </div>
          <div style={{ fontSize: '11px', color: '#1e40af' }}>
            12-month projection
          </div>
        </div>
      </div>

      {/* Leak Warnings */}
      {audit.leaks.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#92400e',
              marginBottom: '4px',
            }}
          >
            Logic Leaks Detected
          </div>
          {audit.leaks.map((leak, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 0',
                fontSize: '12px',
                borderBottom:
                  i < audit.leaks.length - 1 ? '1px solid #fde68a' : 'none',
              }}
            >
              <span
                style={{
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor:
                    leak.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                  color:
                    leak.severity === 'critical' ? '#991b1b' : '#92400e',
                }}
              >
                {leak.severity.toUpperCase()}
              </span>
              <span style={{ color: '#374151' }}>{leak.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: '10px',
          fontSize: '10px',
          color: '#9ca3af',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '6px',
        }}
      >
        Protected under PPA #042 · HJBT-LLD-2026-042 · Filed February 27, 2026 ·
        All calculations subject to Universal Math (1×1=2, Junction Value preserved)
      </div>
    </div>
  );
};

export default LogicGateAuditPanel;
