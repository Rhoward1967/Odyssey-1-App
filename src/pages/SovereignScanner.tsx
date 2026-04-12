/**
 * SOVEREIGN SCANNER — Odyssey-1 Financial Firewall
 * ==================================================
 * Block-stacked mobile-first UI with 4 primary blocks:
 *   [1] SCANNER  — Barcode camera scan
 *   [2] STACK    — Stacked discounts (price match → coupon → senior → tax exempt)
 *   [3] SETTLE   — Master QR code for checkout
 *   [4] LEDGER   — Wealth preserved history
 *
 * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/components/AuthProvider';
import {
  processScan,
  getSavingsSummary,
  type SovereignAudit,
} from '@/services/sovereignCouponEngine';

// ─── Icons (inline SVG — no extra dep) ───────────────────────────────────────

const ScanIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>;
const QRIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h1v1h-1zM18 14h3v1h-3zM14 18h1v3h-1zM16 16h1v1h-1zM18 18h1v3h-1zM20 16h1v2h-1z"/></svg>;
const ShieldIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const LedgerIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const CheckIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>;
const AlertIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

// ─── Discount type labels/colors ──────────────────────────────────────────────

const DISCOUNT_META: Record<string, { label: string; color: string; bg: string }> = {
  price_match:    { label: 'PRICE MATCH',     color: 'text-blue-400',   bg: 'bg-blue-950/50' },
  store_coupon:   { label: 'STORE COUPON',    color: 'text-green-400',  bg: 'bg-green-950/50' },
  manufacturer:   { label: 'MANUFACTURER',    color: 'text-yellow-400', bg: 'bg-yellow-950/50' },
  senior:         { label: 'SENIOR',          color: 'text-purple-400', bg: 'bg-purple-950/50' },
  medical_copay:  { label: 'COPAY ASSIST',    color: 'text-pink-400',   bg: 'bg-pink-950/50' },
  cashback:       { label: 'CASHBACK',        color: 'text-cyan-400',   bg: 'bg-cyan-950/50' },
  tax_exempt:     { label: 'TAX EXEMPT',      color: 'text-emerald-400',bg: 'bg-emerald-950/50' },
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'scanner' | 'stack' | 'settle' | 'ledger';

// ─── Component ────────────────────────────────────────────────────────────────

export default function SovereignScanner() {
  const { user }                          = useAuth();
  const [tab, setTab]                     = useState<Tab>('scanner');
  const [scanning, setScanning]           = useState(false);
  const [loading, setLoading]             = useState(false);
  const [audit, setAudit]                 = useState<SovereignAudit | null>(null);
  const [error, setError]                 = useState<string | null>(null);
  const [storePrice, setStorePrice]       = useState('');
  const [storeName, setStoreName]         = useState('Kroger');
  const [manualBarcode, setManualBarcode] = useState('');
  const [summary, setSummary]             = useState<any>(null);
  const scannerRef                        = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivId                      = 'sovereign-scanner-div';

  // Load savings summary
  useEffect(() => {
    if (user?.id && tab === 'ledger') {
      getSavingsSummary(user.id).then(setSummary);
    }
  }, [tab, user?.id]);

  // Start/stop scanner
  useEffect(() => {
    if (tab !== 'scanner' || !scanning) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    const scanner = new Html5QrcodeScanner(
      scannerDivId,
      {
        fps: 10,
        qrbox: { width: 280, height: 180 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        scanner.clear().catch(() => {});
        scannerRef.current = null;
        setScanning(false);
        await handleBarcode(decodedText);
      },
      (err) => { /* scan errors are normal — camera searching */ }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanning, tab]);

  const handleBarcode = useCallback(async (barcode: string) => {
    const price = parseFloat(storePrice);
    if (isNaN(price) || price <= 0) {
      setError('Enter the store price before scanning');
      return;
    }

    setLoading(true);
    setError(null);
    setTab('stack');

    const result = await processScan(barcode, price, storeName, user?.id);

    setLoading(false);

    if (result.success && result.audit) {
      setAudit(result.audit);
    } else {
      setError(result.error || 'Scan failed — try again');
      setTab('scanner');
    }
  }, [storePrice, storeName, user?.id]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    await handleBarcode(manualBarcode.trim());
    setManualBarcode('');
  };

  const resetScan = () => {
    setAudit(null);
    setError(null);
    setStorePrice('');
    setManualBarcode('');
    setScanning(false);
    setTab('scanner');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col max-w-md mx-auto">

      {/* Header */}
      <div className="px-4 pt-6 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-1">
          <ShieldIcon />
          <h1 className="text-lg font-bold tracking-wider">SOVEREIGN SCANNER</h1>
        </div>
        <p className="text-xs text-gray-500">Howard Jones Bloodline Ancestral Trust • UCC 1-308</p>
        {audit && (
          <div className="mt-2 flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <CheckIcon />
            Saved ${audit.totalSaved.toFixed(2)} ({audit.savingsPercent}%)
          </div>
        )}
      </div>

      {/* Tab Bar — 4 blocks */}
      <div className="grid grid-cols-4 border-b border-gray-800">
        {([
          { id: 'scanner', label: 'SCAN',    Icon: ScanIcon   },
          { id: 'stack',   label: 'STACK',   Icon: ShieldIcon },
          { id: 'settle',  label: 'SETTLE',  Icon: QRIcon     },
          { id: 'ledger',  label: 'LEDGER',  Icon: LedgerIcon },
        ] as const).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-col items-center py-3 gap-1 text-xs font-bold tracking-widest transition-colors
              ${tab === id ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── BLOCK 1: SCANNER ── */}
        {tab === 'scanner' && (
          <div className="p-4 space-y-4">

            {/* Store selector */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold tracking-wider">STORE</label>
              <select
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {['Kroger', "Harris Teeter", 'Walmart', 'Target', 'Publix', 'CVS', 'Walgreens',
                  'Rite Aid', 'AutoZone', "O'Reilly Auto", 'Home Depot', "Lowe's", 'Best Buy',
                  'Dollar General', 'Dollar Tree', 'Aldi', 'Costco', 'Other'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Store price */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold tracking-wider">SHELF PRICE ($)</label>
              <input
                type="number"
                value={storePrice}
                onChange={e => setStorePrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-xl font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Camera scan button */}
            <button
              onClick={() => setScanning(s => !s)}
              disabled={!storePrice || parseFloat(storePrice) <= 0}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-wider transition-all
                ${scanning
                  ? 'bg-red-900/60 border border-red-700 text-red-300'
                  : 'bg-emerald-900/60 border border-emerald-700 text-emerald-300 hover:bg-emerald-900/80 disabled:opacity-40 disabled:cursor-not-allowed'}`}
            >
              {scanning ? '⏹ STOP SCANNING' : '📷 SCAN BARCODE'}
            </button>

            {/* Scanner viewfinder */}
            {scanning && (
              <div className="rounded-xl overflow-hidden border border-gray-700 bg-black">
                <div id={scannerDivId} className="w-full" />
              </div>
            )}

            {/* Manual entry fallback */}
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <label className="text-xs text-gray-500 tracking-wider">OR ENTER BARCODE MANUALLY</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={e => setManualBarcode(e.target.value)}
                  placeholder="012345678901"
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!manualBarcode || !storePrice}
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm font-bold disabled:opacity-40"
                >
                  AUDIT
                </button>
              </div>
            </form>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg p-3">
                <AlertIcon />
                {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="text-center py-8 text-gray-400 text-sm animate-pulse">
                Running Sovereign Audit...
              </div>
            )}
          </div>
        )}

        {/* ── BLOCK 2: STACK ── */}
        {tab === 'stack' && (
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-400 animate-pulse">
                <ShieldIcon />
                <p className="mt-3 text-sm">Auditing price stack...</p>
              </div>
            ) : !audit ? (
              <div className="text-center py-12 text-gray-600 text-sm">
                <p>No scan yet.</p>
                <button onClick={() => setTab('scanner')} className="mt-3 text-emerald-500 underline">
                  Go to Scanner
                </button>
              </div>
            ) : (
              <>
                {/* Product info */}
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <p className="text-xs text-gray-500 mb-1">{audit.product.brand}</p>
                  <p className="font-bold text-white text-base leading-snug">{audit.product.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-gray-800 rounded px-2 py-0.5 text-gray-400 capitalize">
                      {audit.product.category}
                    </span>
                    {audit.product.isPharmacy && (
                      <span className="text-xs bg-pink-950/60 border border-pink-900 rounded px-2 py-0.5 text-pink-400">
                        PHARMACY
                      </span>
                    )}
                    {audit.taxExempt && (
                      <span className="text-xs bg-emerald-950/60 border border-emerald-900 rounded px-2 py-0.5 text-emerald-400">
                        TAX EXEMPT
                      </span>
                    )}
                  </div>
                </div>

                {/* Price comparison */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-4 text-center">
                    <p className="text-xs text-red-400 mb-1 font-semibold tracking-wider">FRAUD PRICE</p>
                    <p className="text-2xl font-bold text-red-300 line-through">${audit.storePrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">{audit.storeName}</p>
                  </div>
                  <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-xl p-4 text-center">
                    <p className="text-xs text-emerald-400 mb-1 font-semibold tracking-wider">SOVEREIGN PRICE</p>
                    <p className="text-2xl font-bold text-emerald-300">${audit.sovereignPrice.toFixed(2)}</p>
                    <p className="text-xs text-emerald-500 mt-1">You save ${audit.totalSaved.toFixed(2)}</p>
                  </div>
                </div>

                {/* Discount stack */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-semibold tracking-wider">APPLIED DISCOUNTS</p>
                  {audit.discounts.length === 0 ? (
                    <p className="text-sm text-gray-600 italic">No additional discounts found.</p>
                  ) : (
                    audit.discounts.map((d, i) => {
                      const meta = DISCOUNT_META[d.type] || { label: d.type.toUpperCase(), color: 'text-gray-400', bg: 'bg-gray-900' };
                      return (
                        <div key={i} className={`${meta.bg} border border-gray-800 rounded-xl p-3 flex items-start justify-between gap-3`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-xs font-bold tracking-wider ${meta.color}`}>{meta.label}</span>
                            </div>
                            <p className="text-xs text-gray-400 leading-snug truncate">{d.source}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`font-bold text-sm ${meta.color}`}>-${d.amount.toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setTab('settle')}
                    className="py-3 bg-emerald-900/60 border border-emerald-700 rounded-xl text-emerald-300 font-bold text-sm tracking-wider"
                  >
                    PAY NOW
                  </button>
                  <button
                    onClick={resetScan}
                    className="py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-400 font-bold text-sm tracking-wider"
                  >
                    NEW SCAN
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── BLOCK 3: SETTLE ── */}
        {tab === 'settle' && (
          <div className="p-4 space-y-4">
            {!audit ? (
              <div className="text-center py-12 text-gray-600 text-sm">
                <p>No audit to settle.</p>
                <button onClick={() => setTab('scanner')} className="mt-3 text-emerald-500 underline">
                  Go to Scanner
                </button>
              </div>
            ) : (
              <>
                <div className="text-center space-y-1">
                  <p className="text-xs text-gray-500 tracking-wider font-semibold">MASTER QR — SHOW AT REGISTER</p>
                  <p className="text-xs text-gray-600">Contains: sovereign price + all discounts + Trust tax exemption</p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-2xl">
                    <QRCodeSVG
                      value={audit.masterQRData}
                      size={240}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="M"
                    />
                  </div>
                </div>

                {/* Settlement summary */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
                  <div className="flex justify-between p-3 text-sm">
                    <span className="text-gray-400">Original Price</span>
                    <span className="text-red-400 line-through">${audit.storePrice.toFixed(2)}</span>
                  </div>
                  {audit.discounts.map((d, i) => (
                    <div key={i} className="flex justify-between p-3 text-sm">
                      <span className="text-gray-500">{d.label}</span>
                      <span className="text-emerald-400">-${d.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between p-3">
                    <span className="font-bold text-white">SOVEREIGN TOTAL</span>
                    <span className="font-bold text-emerald-400 text-lg">${audit.sovereignPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Trust credential */}
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3 text-xs text-emerald-700 text-center">
                  Howard Jones Bloodline Ancestral Trust | EIN: 41-6850149<br/>
                  Tax-Exempt | UCC 1-308 | Without Prejudice
                </div>

                <button
                  onClick={resetScan}
                  className="w-full py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-400 font-bold text-sm tracking-wider"
                >
                  DONE — NEW SCAN
                </button>
              </>
            )}
          </div>
        )}

        {/* ── BLOCK 4: LEDGER ── */}
        {tab === 'ledger' && (
          <div className="p-4 space-y-4">
            <p className="text-xs text-gray-500 font-semibold tracking-wider">WEALTH PRESERVED</p>

            {!summary ? (
              <div className="text-center py-8 text-gray-600 text-sm animate-pulse">Loading ledger...</div>
            ) : (
              <>
                {/* Running totals */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-xl p-4 text-center">
                    <p className="text-xs text-emerald-500 mb-1">ALL TIME SAVED</p>
                    <p className="text-2xl font-bold text-emerald-300">${summary.allTime.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">THIS MONTH</p>
                    <p className="text-2xl font-bold text-white">${summary.thisMonth.toFixed(2)}</p>
                  </div>
                </div>

                {/* Category breakdown */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
                  <div className="flex justify-between p-3 text-sm">
                    <span className="text-gray-400">Total Scans</span>
                    <span className="text-white font-bold">{summary.totalScans}</span>
                  </div>
                  <div className="flex justify-between p-3 text-sm">
                    <span className="text-blue-400">Price Matches</span>
                    <span className="text-white">{summary.byCategory.priceMatch}</span>
                  </div>
                  <div className="flex justify-between p-3 text-sm">
                    <span className="text-yellow-400">Coupons Applied</span>
                    <span className="text-white">{summary.byCategory.coupons}</span>
                  </div>
                  <div className="flex justify-between p-3 text-sm">
                    <span className="text-emerald-400">Tax Exempt Saved</span>
                    <span className="text-emerald-400">${summary.byCategory.taxExempt.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 text-sm">
                    <span className="text-purple-400">Senior Discounts</span>
                    <span className="text-purple-400">${summary.byCategory.senior.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 text-sm">
                    <span className="text-pink-400">Medical Copay</span>
                    <span className="text-pink-400">${summary.byCategory.medical.toFixed(2)}</span>
                  </div>
                </div>

                {/* Trust statement */}
                <div className="border border-gray-800 rounded-xl p-4 text-xs text-gray-600 leading-relaxed">
                  Every dollar recorded above represents a <strong className="text-gray-400">recovered Trust asset</strong> — money
                  that was targeted by dynamic pricing, hidden markups, and convenience fraud.
                  The Sovereign Procurement Engine ensures the Howard Jones Bloodline Ancestral Trust
                  never pays the "fraud price."
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
