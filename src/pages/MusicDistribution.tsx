import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { romanSupabase } from '@/services/romanSupabase';
import { Archive, CheckCircle, Clock, DollarSign, Edit2, ExternalLink, Music, Plus, Radio, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Track {
  id: string;
  title: string;
  subtitle?: string;
  album?: string;
  theme?: string;
  spiritual_theme?: string;
  frequency_hz?: number;
  ascap_id?: string;
  upload_status: string;
  radio_approved?: boolean;
  radio_order?: number;
  file_format?: string;
  duration_seconds?: number;
  notes?: string;
  storage_url?: string;
  purchase_url?: string;
}

const STATUS_COLORS: Record<string, string> = {
  live:       'bg-green-600',
  uploaded:   'bg-blue-600',
  processing: 'bg-yellow-600',
  pending:    'bg-gray-600',
  archived:   'bg-slate-600',
};

const STATUS_ICONS: Record<string, any> = {
  live:       CheckCircle,
  uploaded:   Upload,
  processing: Clock,
  pending:    Clock,
  archived:   Archive,
};

const THEMES    = ['spiritual', 'sovereignty', 'healing', 'love', 'truth', 'identity', 'commercial', 'other'];
const STATUSES  = ['live', 'uploaded', 'pending', 'archived'];

export default function MusicDistribution() {
  const [tracks, setTracks]       = useState<Track[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [showAdd, setShowAdd]     = useState(false);
  const [editTrack, setEditTrack]       = useState<Track | null>(null);
  const [priceTrack, setPriceTrack]     = useState<Track | null>(null);
  const [priceInput, setPriceInput]     = useState('0.99');
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceMsg, setPriceMsg]         = useState('');
  const [bulkPrice, setBulkPrice]       = useState('');
  const [bulkLoading, setBulkLoading]   = useState(false);
  const [bulkMsg, setBulkMsg]           = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [editMsg, setEditMsg]     = useState('');

  // Add form
  const [file, setFile]           = useState<File | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formAlbum, setFormAlbum] = useState('');
  const [formTheme, setFormTheme] = useState('');
  const [formFreq, setFormFreq]   = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [dragging, setDragging]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form (mirrors track fields)
  const [eTitle, setETitle]       = useState('');
  const [eAlbum, setEAlbum]       = useState('');
  const [eTheme, setETheme]       = useState('');
  const [eFreq, setEFreq]         = useState('');
  const [eNotes, setENotes]       = useState('');
  const [eStatus, setEStatus]     = useState('');
  const [ePurchase, setEPurchase] = useState('');
  const [eRadio, setERadio]       = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await romanSupabase
      .from('sovereign_music')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setTracks(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const stats = {
    total:          tracks.length,
    live:           tracks.filter(t => t.upload_status === 'live').length,
    pending:        tracks.filter(t => t.upload_status === 'pending').length,
    radio_approved: tracks.filter(t => t.radio_approved).length,
  };

  const filtered = filter === 'all' ? tracks : tracks.filter(t => t.upload_status === filter);

  function openEdit(track: Track) {
    setEditTrack(track);
    setETitle(track.title);
    setEAlbum(track.album ?? '');
    setETheme(track.theme ?? '');
    setEFreq(track.frequency_hz?.toString() ?? '');
    setENotes(track.notes ?? '');
    setEStatus(track.upload_status);
    setEPurchase(track.purchase_url ?? '');
    setERadio(track.radio_approved ?? true);
    setEditMsg('');
  }

  async function handleSaveEdit() {
    if (!editTrack) return;
    setSaving(true);
    setEditMsg('Saving...');
    const { error } = await romanSupabase
      .from('sovereign_music')
      .update({
        title:          eTitle.trim(),
        album:          eAlbum.trim() || null,
        theme:          eTheme || null,
        frequency_hz:   eFreq ? Number(eFreq) : null,
        notes:          eNotes.trim() || null,
        upload_status:  eStatus,
        purchase_url:   ePurchase.trim() || null,
        radio_approved: eRadio,
      })
      .eq('id', editTrack.id);

    if (error) {
      setEditMsg(`Error: ${error.message}`);
    } else {
      setEditMsg('Saved!');
      setTimeout(() => { setEditTrack(null); load(); }, 800);
    }
    setSaving(false);
  }

  async function generateStripeLink() {
    if (!priceTrack) return;
    const cents = Math.round(parseFloat(priceInput) * 100);
    if (!cents || cents < 50) { setPriceMsg('Minimum price is $0.50'); return; }
    setPriceLoading(true);
    setPriceMsg('Creating Stripe payment link...');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-link`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name: priceTrack.title,
            price_cents: cents,
            item_type: 'music',
          }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await romanSupabase
        .from('sovereign_music')
        .update({ purchase_url: data.url })
        .eq('id', priceTrack.id);
      setPriceMsg('Payment link created!');
      setTimeout(() => { setPriceTrack(null); setPriceMsg(''); load(); }, 1000);
    } catch (err: any) {
      setPriceMsg(`Error: ${err.message}`);
    } finally {
      setPriceLoading(false);
    }
  }

  async function generateBulkLinks() {
    const cents = Math.round(parseFloat(bulkPrice) * 100);
    if (!cents || cents < 50) { setBulkMsg('Minimum price is $0.50'); return; }
    const targets = tracks.filter(t => t.upload_status === 'live' && t.theme !== 'commercial' && !t.purchase_url);
    if (!targets.length) { setBulkMsg('All live tracks already have links.'); return; }
    setBulkLoading(true);
    setBulkMsg(`Generating links for ${targets.length} tracks...`);
    let done = 0, failed = 0;
    for (const track of targets) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-link`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ name: track.title, price_cents: cents, item_type: 'music' }),
          }
        );
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        await romanSupabase.from('sovereign_music').update({ purchase_url: data.url }).eq('id', track.id);
        done++;
        setBulkMsg(`${done} / ${targets.length} links created...`);
      } catch { failed++; }
    }
    setBulkMsg(`Done — ${done} links created${failed ? `, ${failed} failed` : ''}.`);
    setBulkLoading(false);
    load();
  }

  function onFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && /\.(mp3|wav|flac|m4a)$/i.test(f.name)) {
      setFile(f);
      if (!formTitle) setFormTitle(f.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '));
    }
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (!formTitle) setFormTitle(f.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '));
    }
  }

  async function handleUpload() {
    if (!file || !formTitle.trim()) return;
    setUploading(true);
    setUploadMsg('Uploading audio file...');
    try {
      const ext         = file.name.split('.').pop()?.toLowerCase() ?? 'mp3';
      const safeName    = file.name.replace(/[^a-zA-Z0-9._\-() ]/g, '_');
      const storagePath = `music/${safeName}`;

      const { error: upErr } = await romanSupabase.storage
        .from('sovereign-music')
        .upload(storagePath, file, { contentType: file.type || 'audio/mpeg', upsert: true });
      if (upErr) throw new Error(`Storage: ${upErr.message}`);

      setUploadMsg('Generating stream URL...');
      const { data: urlData, error: urlErr } = await romanSupabase.storage
        .from('sovereign-music')
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365);
      if (urlErr) throw new Error(`URL: ${urlErr.message}`);

      setUploadMsg('Saving to catalog...');
      const { error: dbErr } = await romanSupabase.from('sovereign_music').insert({
        title:            formTitle.trim(),
        album:            formAlbum.trim() || null,
        theme:            formTheme || null,
        frequency_hz:     formFreq ? Number(formFreq) : null,
        notes:            formNotes.trim() || null,
        storage_path:     storagePath,
        storage_url:      urlData.signedUrl,
        file_format:      ext,
        file_size_mb:     Math.round((file.size / 1024 / 1024) * 100) / 100,
        upload_status:    'live',
        radio_approved:   true,
        registered_under: 'Believing Self Creations',
        copyright_year:   2026,
      });
      if (dbErr) throw new Error(`DB: ${dbErr.message}`);

      setUploadMsg('Track added!');
      setTimeout(() => {
        setShowAdd(false);
        setFile(null); setFormTitle(''); setFormAlbum('');
        setFormTheme(''); setFormFreq(''); setFormNotes('');
        setUploadMsg('');
        load();
      }, 1000);
    } catch (err: any) {
      setUploadMsg(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  const inputCls = 'w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Music className="w-7 h-7 text-blue-400" />
            Music Distribution
          </h1>
          <p className="text-sm text-gray-400 mt-1">Believing Self Creations · ASCAP Registered · Sovereign Radio Catalog</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Track
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tracks',   value: stats.total,          icon: Music,       color: 'text-blue-400' },
          { label: 'Live',           value: stats.live,           icon: CheckCircle, color: 'text-green-400' },
          { label: 'Radio Approved', value: stats.radio_approved, icon: Radio,       color: 'text-purple-400' },
          { label: 'Pending Upload', value: stats.pending,        icon: Clock,       color: 'text-yellow-400' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs text-gray-400">{s.label}</span>
                </div>
                <p className="text-3xl font-bold text-white">{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'live', 'uploaded', 'pending', 'archived'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>
            {f === 'all' ? `All (${stats.total})` : f}
          </button>
        ))}
      </div>

      {/* Bulk pricing */}
      <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex-wrap">
        <DollarSign className="w-4 h-4 text-green-400 shrink-0" />
        <span className="text-sm text-gray-300">Price all unpriced live tracks:</span>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">$</span>
          <input value={bulkPrice} onChange={e => setBulkPrice(e.target.value)}
            type="number" min="0.50" step="0.01" placeholder="0.99"
            className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white outline-none focus:border-blue-500" />
        </div>
        <button onClick={generateBulkLinks} disabled={bulkLoading || !bulkPrice}
          className="px-4 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors">
          {bulkLoading ? 'Working...' : 'Generate All Links'}
        </button>
        {bulkMsg && <span className={`text-xs ${bulkMsg.startsWith('Done') ? 'text-green-400' : 'text-blue-400'}`}>{bulkMsg}</span>}
      </div>

      {/* Track list */}
      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading catalog...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-400 text-center py-12">No tracks found.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(track => {
            const StatusIcon = STATUS_ICONS[track.upload_status] ?? Clock;
            return (
              <Card key={track.id} className="bg-slate-800 border-slate-700 hover:border-slate-500 transition-colors">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white truncate">{track.title}</span>
                        {track.radio_approved && <Badge className="bg-purple-700 text-xs">📻 Radio</Badge>}
                        {track.frequency_hz   && <Badge className="bg-slate-600 text-xs">{track.frequency_hz}Hz</Badge>}
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        {track.album && <span>💿 {track.album}</span>}
                        {track.theme && <span>🎯 {track.theme}</span>}
                        {track.ascap_id && <span>ASCAP: {track.ascap_id}</span>}
                        {track.duration_seconds && (
                          <span>⏱ {Math.floor(track.duration_seconds / 60)}:{String(track.duration_seconds % 60).padStart(2, '0')}</span>
                        )}
                      </div>
                      {track.notes && <p className="text-xs text-gray-500 mt-1 italic">{track.notes}</p>}
                      {track.purchase_url && (
                        <a href={track.purchase_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 bg-green-700 hover:bg-green-600 text-white text-xs rounded-full transition-colors">
                          <ExternalLink className="w-3 h-3" /> Buy MP3
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-white ${STATUS_COLORS[track.upload_status] ?? 'bg-gray-600'}`}>
                        <StatusIcon className="w-3 h-3" />
                        {track.upload_status}
                      </span>
                      {track.file_format && <span className="text-xs text-gray-500 uppercase">{track.file_format}</span>}
                      <button onClick={() => openEdit(track)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => { setPriceTrack(track); setPriceInput('0.99'); setPriceMsg(''); }}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-400 transition-colors">
                        <DollarSign className="w-3 h-3" /> {track.purchase_url ? 'Reprice' : 'Set Price'}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Add Track Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Add Track</h2>
              <button onClick={() => { setShowAdd(false); setFile(null); setUploadMsg(''); }}
                className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)} onDrop={onFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                dragging ? 'border-blue-400 bg-blue-900/20' : 'border-slate-600 hover:border-slate-400'}`}>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              {file ? <p className="text-sm text-green-400 font-medium">{file.name}</p>
                    : <p className="text-sm text-gray-400">Drop MP3 here or click to browse</p>}
              <input ref={fileInputRef} type="file" accept=".mp3,.wav,.flac,.m4a" className="hidden" onChange={onFileSelect} />
            </div>
            <div className="space-y-3">
              <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Track title *" className={inputCls} />
              <input value={formAlbum} onChange={e => setFormAlbum(e.target.value)} placeholder="Album (optional)" className={inputCls} />
              <div className="flex gap-3">
                <select value={formTheme} onChange={e => setFormTheme(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
                  <option value="">Theme</option>
                  {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input value={formFreq} onChange={e => setFormFreq(e.target.value)}
                  placeholder="Hz (e.g. 528)" type="number"
                  className="w-28 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500" />
              </div>
              <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)}
                placeholder="Notes (optional)" rows={2}
                className={inputCls + ' resize-none'} />
            </div>
            {uploadMsg && (
              <p className={`text-sm text-center ${uploadMsg.startsWith('Error') ? 'text-red-400' : 'text-blue-400'}`}>{uploadMsg}</p>
            )}
            <button onClick={handleUpload} disabled={!file || !formTitle.trim() || uploading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors">
              {uploading ? 'Uploading...' : 'Upload & Go Live'}
            </button>
          </div>
        </div>
      )}

      {/* ── Set Price Modal ── */}
      {priceTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Set Price</h2>
              <button onClick={() => setPriceTrack(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-400 truncate">{priceTrack.title}</p>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg font-bold">$</span>
              <input
                value={priceInput}
                onChange={e => setPriceInput(e.target.value)}
                type="number" min="0.50" step="0.01"
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-lg text-white outline-none focus:border-blue-500"
              />
              <span className="text-gray-400 text-sm">USD</span>
            </div>
            <p className="text-xs text-gray-500">Creates a Stripe Payment Link. Buyer pays → money goes straight to your Stripe account.</p>
            {priceMsg && (
              <p className={`text-sm text-center ${priceMsg.startsWith('Error') ? 'text-red-400' : 'text-blue-400'}`}>{priceMsg}</p>
            )}
            <button onClick={generateStripeLink} disabled={priceLoading}
              className="w-full py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-semibold rounded-lg transition-colors">
              {priceLoading ? 'Creating...' : 'Generate Stripe Link'}
            </button>
          </div>
        </div>
      )}

      {/* ── Edit Track Modal ── */}
      {editTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Edit Track</h2>
              <button onClick={() => setEditTrack(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input value={eTitle} onChange={e => setETitle(e.target.value)} placeholder="Track title *" className={inputCls} />
              <input value={eAlbum} onChange={e => setEAlbum(e.target.value)} placeholder="Album" className={inputCls} />
              <div className="flex gap-3">
                <select value={eTheme} onChange={e => setETheme(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
                  <option value="">Theme</option>
                  {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input value={eFreq} onChange={e => setEFreq(e.target.value)}
                  placeholder="Hz" type="number"
                  className="w-24 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500" />
              </div>
              <select value={eStatus} onChange={e => setEStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input value={ePurchase} onChange={e => setEPurchase(e.target.value)}
                placeholder="Buy/download link (optional)" className={inputCls} />
              <textarea value={eNotes} onChange={e => setENotes(e.target.value)}
                placeholder="Notes" rows={2} className={inputCls + ' resize-none'} />
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={eRadio} onChange={e => setERadio(e.target.checked)}
                  className="accent-blue-500" />
                Radio approved
              </label>
            </div>
            {editMsg && (
              <p className={`text-sm text-center ${editMsg.startsWith('Error') ? 'text-red-400' : 'text-blue-400'}`}>{editMsg}</p>
            )}
            <button onClick={handleSaveEdit} disabled={!eTitle.trim() || saving}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
