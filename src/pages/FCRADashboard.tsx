import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const weaponColors: Record<string, string> = {
  "Weapon 7": "bg-red-100 border-red-500 text-red-900",
  "Weapon 4": "bg-orange-100 border-orange-500 text-orange-900",
  "Weapon 2": "bg-yellow-100 border-yellow-500 text-yellow-900",
  "Weapon 1": "bg-blue-100 border-blue-500 text-blue-900",
};

function getWeaponColor(weapon: string): string {
  for (const key of Object.keys(weaponColors)) {
    if (weapon?.includes(key)) return weaponColors[key];
  }
  return "bg-gray-100 border-gray-500 text-gray-900";
}

interface Violation {
  id: string;
  violation_type: string;
  statute_violated: string;
  description: string;
  evidence_summary: string;
  statutory_damages_min: number;
  statutory_damages_max: number;
  punitive_damages_eligible: boolean;
  toolkit_weapon: string;
  status: string;
  active_credit_accounts: {
    creditor_name: string;
    account_number_last4: string;
    reported_balance: number;
  } | null;
}

interface Account {
  id: string;
  creditor_name: string;
  account_number_last4: string;
  account_type: string;
  reported_balance: number;
  has_violations: boolean;
  forensic_audit_status: string;
  notes: string;
}

export default function FCRADashboard() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("violations");

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: v }, { data: a }] = await Promise.all([
          supabase
            .from("fcra_violations")
            .select("*, active_credit_accounts(creditor_name, account_number_last4, reported_balance)")
            .order("statutory_damages_max", { ascending: false }),
          supabase
            .from("active_credit_accounts")
            .select("*")
            .order("reported_balance", { ascending: false }),
        ]);
        setViolations(Array.isArray(v) ? v : []);
        setAccounts(Array.isArray(a) ? a : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(String(a.reported_balance || 0)), 0);
  const totalDamages = violations.reduce((sum, v) => sum + parseFloat(String(v.statutory_damages_max || 0)), 0);
  const uniqueViolations = [...new Map(violations.map(v => [v.id, v])).values()];

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">⚔️</div>
        <p className="text-slate-400 text-lg">R.O.M.A.N. Forensic Audit Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-mono">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="border border-slate-700 rounded-lg p-6 mb-6 bg-slate-900">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⚔️</span>
            <div>
              <h1 className="text-2xl font-bold text-white">TOOLKIT VIII</h1>
              <p className="text-slate-400 text-sm">Debt Architecture Defense — R.O.M.A.N. Forensic Audit</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-500">Howard Jones Bloodline Ancestral Trust</p>
              <p className="text-xs text-slate-500">Audit Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">ACCOUNTS SCANNED</p>
            <p className="text-2xl font-bold text-white">{accounts.length}</p>
          </div>
          <div className="bg-red-950 border border-red-700 rounded-lg p-4">
            <p className="text-xs text-red-400 mb-1">VIOLATIONS FOUND</p>
            <p className="text-2xl font-bold text-red-300">{uniqueViolations.length}</p>
          </div>
          <div className="bg-orange-950 border border-orange-700 rounded-lg p-4">
            <p className="text-xs text-orange-400 mb-1">STATUTORY DAMAGES</p>
            <p className="text-2xl font-bold text-orange-300">${totalDamages.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">TOTAL DEBT</p>
            <p className="text-2xl font-bold text-white">${totalBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Weapons Activated Banner */}
        {uniqueViolations.length > 0 && (
          <div className="bg-red-950 border border-red-600 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-xs font-bold mb-2">⚡ WEAPONS ACTIVATED</p>
            <div className="flex flex-wrap gap-2">
              {[...new Set(uniqueViolations.map(v => v.toolkit_weapon))].map(w => (
                <span key={w} className="bg-red-800 text-red-100 text-xs px-3 py-1 rounded-full">{w}</span>
              ))}
            </div>
            <p className="text-red-300 text-xs mt-3">
              ⚠️ Forward fcra_violations to attorney. Issue formal dispute letters.
              Demand adequate assurance of performance on all flagged accounts.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {["violations", "accounts"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-slate-100 text-slate-900"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {tab === "violations" ? `⚔️ Violations (${uniqueViolations.length})` : `📋 All Accounts (${accounts.length})`}
            </button>
          ))}
        </div>

        {/* Violations Tab */}
        {activeTab === "violations" && (
          <div className="space-y-4">
            {uniqueViolations.length === 0 ? (
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center">
                <p className="text-slate-400">No violations logged yet.</p>
              </div>
            ) : uniqueViolations.map((v, i) => (
              <div key={v.id || i} className={`border-l-4 rounded-lg p-4 ${getWeaponColor(v.toolkit_weapon)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm">{v.active_credit_accounts?.creditor_name || "Unknown Creditor"}</p>
                    <p className="text-xs opacity-75">xxxx-{v.active_credit_accounts?.account_number_last4}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">Up to ${parseFloat(String(v.statutory_damages_max || 0)).toLocaleString()}</p>
                    {v.punitive_damages_eligible && (
                      <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">PUNITIVE ELIGIBLE</span>
                    )}
                  </div>
                </div>
                <p className="text-xs font-mono bg-black bg-opacity-20 px-2 py-1 rounded mb-2">{v.statute_violated}</p>
                <p className="text-xs mb-2">{v.description}</p>
                <p className="text-xs opacity-75 italic">{v.evidence_summary}</p>
                <div className="mt-2 pt-2 border-t border-current border-opacity-20 flex items-center justify-between">
                  <span className="text-xs font-bold">{v.toolkit_weapon}</span>
                  <span className="text-xs bg-black bg-opacity-20 px-2 py-0.5 rounded uppercase">{v.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === "accounts" && (
          <div className="space-y-2">
            {accounts.map((a, i) => (
              <div key={a.id || i} className={`border rounded-lg p-3 ${
                a.has_violations ? "bg-red-950 border-red-700" : "bg-slate-900 border-slate-700"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-white">{a.creditor_name}</p>
                    <p className="text-xs text-slate-400">{a.account_type} · xxxx-{a.account_number_last4}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">${parseFloat(String(a.reported_balance || 0)).toLocaleString()}</p>
                    {a.has_violations
                      ? <span className="text-xs text-red-400">⚠️ VIOLATION</span>
                      : <span className="text-xs text-slate-500">{a.forensic_audit_status || "pending"}</span>
                    }
                  </div>
                </div>
                {a.notes && <p className="text-xs text-slate-400 mt-1 italic">{a.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 border border-slate-800 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-600">CONFIDENTIAL — Howard Jones Bloodline Ancestral Trust · Toolkit VIII</p>
          <p className="text-xs text-slate-700 mt-1">Not legal advice. For use with licensed counsel only.</p>
        </div>

      </div>
    </div>
  );
}