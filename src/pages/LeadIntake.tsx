import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Target, CheckCircle2, AlertCircle } from 'lucide-react';

interface RecentLead {
  id: string;
  company_name: string;
  contact_person: string | null;
  city: string | null;
  state: string | null;
  building_type: string | null;
  lead_score: number;
  status: string;
  estimated_value: number | null;
  created_at: string;
}

const BUILDING_TYPES = [
  'Office Building',
  'Medical Facility',
  'School / Educational',
  'Retail',
  'Industrial / Warehouse',
  'Restaurant',
  'Government',
  'Other',
];

const SERVICE_FREQUENCIES = [
  'Daily',
  'Weekly',
  'Bi-Weekly',
  'Monthly',
  'One-time',
];

const initialForm = {
  company_name: '',
  contact_person: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  building_type: '',
  square_footage: '',
  service_frequency: '',
  current_provider: '',
  budget_range: '',
  special_requirements: '',
  estimated_value: '',
};

export default function LeadIntake() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<
    | { kind: 'success'; lead: { id: string; company_name: string; lead_score: number; status: string } }
    | { kind: 'error'; message: string }
    | null
  >(null);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  useEffect(() => {
    fetchRecentLeads();
  }, []);

  async function fetchRecentLeads() {
    setLoadingLeads(true);
    const { data, error } = await supabase
      .from('janitorial_leads')
      .select('id, company_name, contact_person, city, state, building_type, lead_score, status, estimated_value, created_at')
      .order('created_at', { ascending: false })
      .limit(25);
    if (!error && data) setRecentLeads(data as RecentLead[]);
    setLoadingLeads(false);
  }

  function update<K extends keyof typeof initialForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_name.trim()) {
      setSubmitResult({ kind: 'error', message: 'Company name is required.' });
      return;
    }
    setSubmitting(true);
    setSubmitResult(null);

    const payload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(form)) {
      if (v === '' || v === null || v === undefined) continue;
      if (k === 'square_footage') payload[k] = Number(v);
      else if (k === 'estimated_value') payload[k] = Number(v);
      else payload[k] = v;
    }

    try {
      const { data, error } = await supabase.functions.invoke('lead-intake', { body: payload });
      if (error) {
        setSubmitResult({ kind: 'error', message: error.message || 'Submission failed.' });
      } else if (data?.lead) {
        setSubmitResult({ kind: 'success', lead: data.lead });
        setForm(initialForm);
        fetchRecentLeads();
      } else if (data?.error) {
        setSubmitResult({ kind: 'error', message: data.error });
      } else {
        setSubmitResult({ kind: 'error', message: 'Unexpected response from server.' });
      }
    } catch (err: any) {
      setSubmitResult({ kind: 'error', message: err?.message ?? String(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target className="w-7 h-7 text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Janitorial Leads</h1>
          <p className="text-sm text-slate-400">Capture prospects → convert to bids → win contracts.</p>
        </div>
      </div>

      {submitResult?.kind === 'success' && (
        <Card className="border-green-500/40 bg-green-950/30">
          <CardContent className="pt-6 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-green-300 font-semibold">Lead captured: {submitResult.lead.company_name}</p>
              <p className="text-slate-400 mt-1">
                ID <span className="font-mono text-xs">{submitResult.lead.id}</span> · score{' '}
                <span className="font-mono">{submitResult.lead.lead_score}</span>/100 · status{' '}
                <span className="text-slate-200">{submitResult.lead.status}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {submitResult?.kind === 'error' && (
        <Card className="border-red-500/40 bg-red-950/30">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{submitResult.message}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">New Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company & Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name" className="text-slate-300">
                    Company name <span className="text-red-400">*</span>
                  </Label>
                  <Input id="company_name" value={form.company_name} onChange={(e) => update('company_name', e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="contact_person" className="text-slate-300">Contact person</Label>
                  <Input id="contact_person" value={form.contact_person} onChange={(e) => update('contact_person', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email" className="text-slate-300">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-slate-300">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-slate-300">Address</Label>
                  <Input id="address" value={form.address} onChange={(e) => update('address', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="city" className="text-slate-300">City</Label>
                  <Input id="city" value={form.city} onChange={(e) => update('city', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="state" className="text-slate-300">State</Label>
                    <Input id="state" value={form.state} onChange={(e) => update('state', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="zip_code" className="text-slate-300">ZIP</Label>
                    <Input id="zip_code" value={form.zip_code} onChange={(e) => update('zip_code', e.target.value)} />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Building & Service</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="building_type" className="text-slate-300">Building type</Label>
                  <Select value={form.building_type} onValueChange={(v) => update('building_type', v)}>
                    <SelectTrigger id="building_type"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {BUILDING_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="square_footage" className="text-slate-300">Square footage</Label>
                  <Input id="square_footage" type="number" min="0" value={form.square_footage} onChange={(e) => update('square_footage', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="service_frequency" className="text-slate-300">Service frequency</Label>
                  <Select value={form.service_frequency} onValueChange={(v) => update('service_frequency', v)}>
                    <SelectTrigger id="service_frequency"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {SERVICE_FREQUENCIES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="current_provider" className="text-slate-300">Current provider</Label>
                  <Input id="current_provider" value={form.current_provider} onChange={(e) => update('current_provider', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="budget_range" className="text-slate-300">Budget range</Label>
                  <Input id="budget_range" placeholder="e.g., $2,000–$3,500/mo" value={form.budget_range} onChange={(e) => update('budget_range', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="estimated_value" className="text-slate-300">Estimated contract value ($)</Label>
                  <Input id="estimated_value" type="number" min="0" step="0.01" value={form.estimated_value} onChange={(e) => update('estimated_value', e.target.value)} />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes</h3>
              <div>
                <Label htmlFor="special_requirements" className="text-slate-300">Special requirements</Label>
                <Textarea id="special_requirements" rows={3} value={form.special_requirements} onChange={(e) => update('special_requirements', e.target.value)} />
              </div>
            </section>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={submitting} className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
                {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>) : 'Save Lead'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setForm(initialForm)} disabled={submitting}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLeads ? (
            <div className="flex items-center text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading…
            </div>
          ) : recentLeads.length === 0 ? (
            <p className="text-sm text-slate-500">No leads yet. Capture the first one above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Est. Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium text-white">{lead.company_name}</TableCell>
                    <TableCell className="text-slate-300">{lead.contact_person ?? '—'}</TableCell>
                    <TableCell className="text-slate-300">
                      {[lead.city, lead.state].filter(Boolean).join(', ') || '—'}
                    </TableCell>
                    <TableCell className="text-slate-300">{lead.building_type ?? '—'}</TableCell>
                    <TableCell className="text-right font-mono text-yellow-300">{lead.lead_score}</TableCell>
                    <TableCell className="text-right font-mono text-slate-300">
                      {lead.estimated_value != null ? `$${Number(lead.estimated_value).toLocaleString()}` : '—'}
                    </TableCell>
                    <TableCell className="text-slate-300">{lead.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
