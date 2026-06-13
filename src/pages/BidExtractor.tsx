import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileScan, Loader2, CheckCircle2, AlertCircle, Save } from 'lucide-react';

type Extracted = {
  customer_name: string | null;
  contact_person: string | null;
  contact_title: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  bid_title: string | null;
  billing_frequency: string | null;
  total_cents: number | null;
  description: string | null;
  notes: string | null;
};

const empty: Extracted = {
  customer_name: '', contact_person: '', contact_title: '', email: '', phone: '',
  address: '', city: '', state: '', zip: '',
  bid_title: '', billing_frequency: '', total_cents: 0, description: '', notes: '',
};

export default function BidExtractor() {
  const navigate = useNavigate();
  const [docText, setDocText] = useState('');
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function dollars(cents: number | null): string {
    if (!cents) return '';
    return (cents / 100).toFixed(2);
  }

  async function handleExtract() {
    setError(null);
    setSuccess(null);
    if (docText.trim().length < 20) {
      setError('Paste at least 20 characters of bid text.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bid-extract', { body: { text: docText } });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.extracted) throw new Error('No extraction returned.');
      setExtracted({ ...empty, ...data.extracted });
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  function update<K extends keyof Extracted>(key: K, value: any) {
    if (!extracted) return;
    setExtracted({ ...extracted, [key]: value });
  }

  async function handleSave() {
    if (!extracted) return;
    if (!extracted.customer_name) {
      setError('Customer name is required to save.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated.');

      const { data: cust, error: cErr } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          customer_name: extracted.customer_name,
          company_name: extracted.customer_name,
          organization: extracted.customer_name,
          customer_type: 'rfp_bid',
          first_name: extracted.contact_person?.split(' ')[0] ?? null,
          last_name: extracted.contact_person?.split(' ').slice(1).join(' ') ?? null,
          email: extracted.email,
          phone: extracted.phone,
          address: extracted.address,
          billing_address_line1: extracted.address,
          billing_city: extracted.city,
          billing_state: extracted.state,
          billing_zip: extracted.zip,
          notes: [extracted.contact_title, extracted.notes].filter(Boolean).join(' — ') || null,
          status: 'active',
          source: 'bid_extract',
        })
        .select('id, customer_name')
        .single();
      if (cErr) throw cErr;

      const { data: bid, error: bErr } = await supabase
        .from('bids')
        .insert({
          user_id: user.id,
          customer_id: cust.id,
          title: extracted.bid_title ?? `${extracted.customer_name} — Bid`,
          description: extracted.description,
          status: 'draft',
          total_cents: extracted.total_cents ?? 0,
          notes: extracted.notes,
        })
        .select('id, title')
        .single();
      if (bErr) throw bErr;

      setSuccess(`Draft bid created: "${bid.title}" linked to ${cust.customer_name}. Redirecting to /app/bids…`);
      setTimeout(() => navigate('/app/bids'), 1800);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileScan className="w-7 h-7 text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Bid Document Extractor</h1>
          <p className="text-sm text-slate-400">Paste a bid/proposal — R.O.M.A.N. pulls customer, pricing, and billing frequency for review.</p>
        </div>
      </div>

      {error && (
        <Card className="border-red-500/40 bg-red-950/30">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-500/40 bg-green-950/30">
          <CardContent className="pt-6 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <p className="text-sm text-green-200">{success}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">1. Paste bid document text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={10}
            placeholder="Paste the full text of the bid, proposal, or RFP response here. R.O.M.A.N. will extract customer info, pricing, and billing frequency…"
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
            className="font-mono text-xs"
          />
          <Button onClick={handleExtract} disabled={loading} className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Extracting…</>) : (<><FileScan className="w-4 h-4 mr-2" />Extract with R.O.M.A.N.</>)}
          </Button>
        </CardContent>
      </Card>

      {extracted && (
        <Card className="border-yellow-500/30 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white">2. Review & edit before saving</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><Label className="text-slate-300">Customer / Organization</Label><Input value={extracted.customer_name ?? ''} onChange={(e) => update('customer_name', e.target.value)} /></div>
              <div><Label className="text-slate-300">Bid title</Label><Input value={extracted.bid_title ?? ''} onChange={(e) => update('bid_title', e.target.value)} /></div>
              <div><Label className="text-slate-300">Contact person</Label><Input value={extracted.contact_person ?? ''} onChange={(e) => update('contact_person', e.target.value)} /></div>
              <div><Label className="text-slate-300">Contact title</Label><Input value={extracted.contact_title ?? ''} onChange={(e) => update('contact_title', e.target.value)} /></div>
              <div><Label className="text-slate-300">Email</Label><Input type="email" value={extracted.email ?? ''} onChange={(e) => update('email', e.target.value)} /></div>
              <div><Label className="text-slate-300">Phone</Label><Input value={extracted.phone ?? ''} onChange={(e) => update('phone', e.target.value)} /></div>
              <div className="md:col-span-2"><Label className="text-slate-300">Address</Label><Input value={extracted.address ?? ''} onChange={(e) => update('address', e.target.value)} /></div>
              <div><Label className="text-slate-300">City</Label><Input value={extracted.city ?? ''} onChange={(e) => update('city', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-slate-300">State</Label><Input value={extracted.state ?? ''} onChange={(e) => update('state', e.target.value)} /></div>
                <div><Label className="text-slate-300">ZIP</Label><Input value={extracted.zip ?? ''} onChange={(e) => update('zip', e.target.value)} /></div>
              </div>
              <div>
                <Label className="text-slate-300">Billing frequency</Label>
                <Select value={extracted.billing_frequency ?? ''} onValueChange={(v) => update('billing_frequency', v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One Time</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly (Annual)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Total contract value ($)</Label>
                <Input
                  type="number" step="0.01" min="0"
                  value={dollars(extracted.total_cents)}
                  onChange={(e) => update('total_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
                />
              </div>
            </section>

            <div>
              <Label className="text-slate-300">Description</Label>
              <Textarea rows={2} value={extracted.description ?? ''} onChange={(e) => update('description', e.target.value)} />
            </div>
            <div>
              <Label className="text-slate-300">Notes</Label>
              <Textarea rows={2} value={extracted.notes ?? ''} onChange={(e) => update('notes', e.target.value)} />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
                {saving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>) : (<><Save className="w-4 h-4 mr-2" />Create Customer + Draft Bid</>)}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setExtracted(null); setDocText(''); }} disabled={saving}>Reset</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
