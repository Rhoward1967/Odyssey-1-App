/**
 * SecuritizationLookup — Odyssey-1 Dashboard Component
 * =======================================================
 * Allows users to search SEC EDGAR for ABS trust filings
 * tied to a creditor. If securitized, auto-applies CUSIP flag
 * to the debt_vectors record, triggering Section 3 demands in
 * the §1692g validation letter (SPV / Trust / Servicer standing).
 *
 * Legal Basis:
 *   UCC § 3-301  — Person Entitled to Enforce (must be Holder)
 *   UCC § 3-302  — Holder in Due Course
 *   15 USC §1692g — Right to demand full chain of title
 *
 * Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Search, Shield, AlertTriangle, CheckCircle, FileText, Building2 } from 'lucide-react';
import {
  searchSecuritization,
  applySecuritizationToDebt,
  buildEdgarFullTextUrl,
  LIKELIHOOD_CONFIG,
  ACCOUNT_TYPE_LABELS,
  buildUCCStandingSummary,
  type SecuritizationResult,
  type AccountType,
  type ABSTrust,
} from '@/services/secEdgarService';

// ─────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────

interface SecuritizationLookupProps {
  /** If provided, "Apply to Debt Record" button is shown */
  debtVectorId?: string;
  /** Pre-fill the bank name from a debt_vectors record */
  initialBankName?: string;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export default function SecuritizationLookup({
  debtVectorId,
  initialBankName = '',
}: SecuritizationLookupProps) {
  const [bankName, setBankName]       = useState(initialBankName);
  const [accountType, setAccountType] = useState<AccountType | ''>('');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<SecuritizationResult | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [applied, setApplied]         = useState(false);
  const [selectedTrust, setSelectedTrust] = useState<ABSTrust | null>(null);

  async function handleSearch() {
    if (!bankName.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setApplied(false);

    try {
      const data = await searchSecuritization(
        bankName.trim(),
        accountType as AccountType || undefined,
      );
      setResult(data);
      if (data.knownTrusts.length > 0) {
        setSelectedTrust(data.knownTrusts[0]);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
    if (!result || !debtVectorId) return;
    try {
      await applySecuritizationToDebt(debtVectorId, result, selectedTrust || undefined);
      setApplied(true);
    } catch (err) {
      setError(String(err));
    }
  }

  const config = result ? LIKELIHOOD_CONFIG[result.securitizationLikelihood] : null;

  return (
    <div className="space-y-4">

      {/* ── HEADER ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Securitization Lookup — SEC EDGAR
          </CardTitle>
          <CardDescription>
            Search the SEC's public database to identify whether a creditor has
            packaged your debt into an Asset-Backed Security (ABS) trust. If securitized,
            the bank is a <strong>servicer</strong>, not the Holder under UCC § 3-301 —
            and lacks standing to collect.
          </CardDescription>
        </CardHeader>
        <CardContent>

          {/* ── SEARCH FORM ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Bank / Creditor name (e.g. Chase, Capital One, Synchrony...)"
              className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={accountType}
              onChange={e => setAccountType(e.target.value as AccountType | '')}
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Account Types</option>
              {(Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map(type => (
                <option key={type} value={type}>{ACCOUNT_TYPE_LABELS[type]}</option>
              ))}
            </select>
            <Button onClick={handleSearch} disabled={loading || !bankName.trim()}>
              {loading ? (
                <span className="animate-spin mr-2">⟳</span>
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Searching EDGAR...' : 'Search'}
            </Button>
          </div>

          {/* ── ERROR ── */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── RESULTS ── */}
      {result && config && (
        <>
          {/* Likelihood Banner */}
          <Card className={`border-2 ${config.bgColor}`}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className={`text-lg font-bold mb-1 ${config.color}`}>
                    <Shield className="h-5 w-5 inline mr-2" />
                    Securitization Likelihood: {config.label}
                  </div>
                  <p className="text-sm text-slate-700">{config.description}</p>
                  <p className="text-sm mt-2 font-medium">{result.legalImplication}</p>
                </div>
                <Badge className={`text-xs ${result.cusipDemandRequired ? 'bg-red-500' : 'bg-slate-400'}`}>
                  {result.cusipDemandRequired ? 'Section 3 Demands Required' : 'Standard Letter'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Known ABS Trusts */}
          {result.knownTrusts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Known ABS Trusts — SEC Registry
                </CardTitle>
                <CardDescription>
                  These trusts are documented in the SEC EDGAR registry. Click a trust
                  to select it for your debt validation letter.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.knownTrusts.map((trust, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedTrust(trust)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTrust?.name === trust.name
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            {selectedTrust?.name === trust.name && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                            {trust.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex gap-2 flex-wrap">
                            <span className="bg-slate-100 px-2 py-0.5 rounded">
                              {ACCOUNT_TYPE_LABELS[trust.accountType as AccountType] || trust.accountType}
                            </span>
                            {trust.cik && (
                              <span className="bg-blue-50 px-2 py-0.5 rounded">CIK: {trust.cik}</span>
                            )}
                            {trust.filingTypes.map(f => (
                              <span key={f} className="bg-amber-50 px-2 py-0.5 rounded">{f}</span>
                            ))}
                          </div>
                          {trust.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{trust.notes}</p>
                          )}
                        </div>
                        <a
                          href={trust.edgarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* EDGAR Live Filings */}
          {result.edgarFilings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Recent EDGAR Filings Found
                </CardTitle>
                <CardDescription>
                  Live results from SEC EDGAR full-text search (ABS-15G, 10-D filings)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.edgarFilings.map((filing, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded text-sm">
                      <div>
                        <span className="font-medium">{filing.trustName}</span>
                        <span className="text-muted-foreground ml-2">
                          {filing.filingType} — {filing.filingDate}
                        </span>
                      </div>
                      <a
                        href={filing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* UCC Standing Summary */}
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                UCC § 3-301 Standing Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 font-mono leading-relaxed">
                {buildUCCStandingSummary(result)}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            {debtVectorId && (
              <Button
                onClick={handleApply}
                disabled={applied}
                className={applied ? 'bg-green-600' : ''}
              >
                {applied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Applied to Debt Record
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Apply to Debt Record (Triggers Section 3)
                  </>
                )}
              </Button>
            )}

            <Button variant="outline" asChild>
              <a
                href={result.edgarSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Search EDGAR Manually
              </a>
            </Button>

            <Button variant="outline" asChild>
              <a
                href={buildEdgarFullTextUrl(result.bankName)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="h-4 w-4 mr-2" />
                ABS-15G Filings
              </a>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
