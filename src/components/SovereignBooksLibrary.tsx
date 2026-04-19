import { BookOpen, Upload, Play, Pause, DollarSign, ExternalLink, Loader2, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { romanSupabase } from '@/services/romanSupabase';

interface Book {
  id: string;
  book_number: number;
  title: string;
  subtitle: string | null;
  status: string;
  audio_url: string | null;
  purchase_url: string | null;
  price_cents: number | null;
}

async function fetchBooks(): Promise<Book[]> {
  const { data, error } = await romanSupabase
    .from('books')
    .select('id, book_number, title, subtitle, status, audio_url, purchase_url, price_cents')
    .order('book_number');
  if (error) throw error;
  return data as Book[];
}

async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await romanSupabase.storage
    .from('sovereign-books')
    .createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export const SovereignBooksLibrary: React.FC = () => {
  const qc = useQueryClient();
  const { data: books = [], isLoading, error } = useQuery({ queryKey: ['sovereign-books'], queryFn: fetchBooks });

  if (isLoading) return <div className="text-gray-400 text-sm p-4">Loading books...</div>;
  if (error) return <div className="text-red-400 text-sm p-4">Error loading books: {String(error)}</div>;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-purple-400" />
            The Sovereign Self Series
          </CardTitle>
          <p className="text-purple-300 text-sm">
            8-Book System · Howard Jones Bloodline Ancestral Trust
          </p>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {books.map(book => (
          <BookCard key={book.id} book={book} onRefresh={() => qc.invalidateQueries({ queryKey: ['sovereign-books'] })} />
        ))}
      </div>
    </div>
  );
};

// ─── Book Card ───────────────────────────────────────────────────────────────

function BookCard({ book, onRefresh }: { book: Book; onRefresh: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pricing, setPricing] = useState(false);
  const [priceDollars, setPriceDollars] = useState('9.99');
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkError, setLinkError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePlay() {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    if (!book.audio_url) return;
    setLoadingAudio(true);
    try {
      const url = await getSignedUrl(book.audio_url);
      setAudioUrl(url);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.onerror = () => { setPlaying(false); setLoadingAudio(false); };
      await audio.play();
      setPlaying(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAudio(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `book-${book.book_number}/${file.name}`;
      const { error: upErr } = await romanSupabase.storage
        .from('sovereign-books')
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { error: dbErr } = await romanSupabase
        .from('books')
        .update({ audio_url: path })
        .eq('id', book.id);
      if (dbErr) throw dbErr;
      onRefresh();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed: ' + String(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleGenerateLink() {
    setGeneratingLink(true);
    setLinkError('');
    try {
      const cents = Math.round(parseFloat(priceDollars) * 100);
      if (!cents || cents < 50) { setLinkError('Minimum price is $0.50'); setGeneratingLink(false); return; }
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
            name: `Book ${book.book_number}: ${book.title}`,
            price_cents: cents,
            description: `${book.subtitle ?? 'Sovereign Self Series'} — Believing Self Creations`,
            item_type: 'book',
          }),
        }
      );
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      const { error: dbErr } = await romanSupabase
        .from('books')
        .update({ purchase_url: json.url, price_cents: cents })
        .eq('id', book.id);
      if (dbErr) throw dbErr;
      setPricing(false);
      onRefresh();
    } catch (err) {
      setLinkError(String(err));
    } finally {
      setGeneratingLink(false);
    }
  }

  return (
    <Card className="bg-slate-800/80 border-purple-500/30 hover:border-purple-400/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-purple-300 text-base">
              Book {book.book_number}: {book.title}
            </CardTitle>
            {book.subtitle && <p className="text-xs text-gray-400 mt-0.5">{book.subtitle}</p>}
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
            book.status === 'published' ? 'bg-green-900/50 text-green-300' : 'bg-slate-700 text-slate-400'
          }`}>
            {book.status}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Audio row */}
        <div className="flex items-center gap-2">
          {book.audio_url ? (
            <button
              onClick={handlePlay}
              disabled={loadingAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium disabled:opacity-50"
            >
              {loadingAudio ? <Loader2 className="h-3 w-3 animate-spin" /> : playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {playing ? 'Pause' : 'Listen'}
            </button>
          ) : (
            <span className="text-xs text-slate-500 italic">No audio yet</span>
          )}

          <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-gray-300 text-xs disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            {book.audio_url ? 'Replace Audio' : 'Upload Audio'}
          </button>
        </div>

        {/* Purchase row */}
        {book.purchase_url ? (
          <a
            href={book.purchase_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-700 hover:bg-green-600 text-white text-xs font-medium w-fit"
          >
            <ExternalLink className="h-3 w-3" />
            Buy Book {book.price_cents ? `— $${(book.price_cents / 100).toFixed(2)}` : ''}
          </a>
        ) : pricing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Price $</span>
              <input
                type="number"
                step="0.01"
                min="0.50"
                value={priceDollars}
                onChange={e => setPriceDollars(e.target.value)}
                className="w-24 px-2 py-1 rounded bg-slate-700 border border-slate-600 text-white text-xs"
              />
              <button
                onClick={handleGenerateLink}
                disabled={generatingLink}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-green-700 hover:bg-green-600 text-white text-xs font-medium disabled:opacity-50"
              >
                {generatingLink ? <Loader2 className="h-3 w-3 animate-spin" /> : <DollarSign className="h-3 w-3" />}
                Generate Link
              </button>
              <button onClick={() => { setPricing(false); setLinkError(''); }} className="text-slate-500 hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            {linkError && <p className="text-red-400 text-xs">{linkError}</p>}
          </div>
        ) : (
          <button
            onClick={() => setPricing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-gray-300 text-xs"
          >
            <DollarSign className="h-3 w-3" />
            Set Price & Generate Buy Link
          </button>
        )}
      </CardContent>
    </Card>
  );
}

export default SovereignBooksLibrary;
