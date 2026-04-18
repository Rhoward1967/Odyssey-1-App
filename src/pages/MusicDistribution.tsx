import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { romanSupabase } from '@/services/romanSupabase';
import { Music, Radio, Upload, CheckCircle, Clock, Archive } from 'lucide-react';
import { useEffect, useState } from 'react';

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
}

interface Stats {
  total: number;
  live: number;
  pending: number;
  uploaded: number;
  archived: number;
  radio_approved: number;
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

export default function MusicDistribution() {
  const [tracks, setTracks]   = useState<Track[]>([]);
  const [stats, setStats]     = useState<Stats>({ total: 0, live: 0, pending: 0, uploaded: 0, archived: 0, radio_approved: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await romanSupabase
        .from('sovereign_music')
        .select('*')
        .order('radio_order', { ascending: true, nullsFirst: false });

      if (!error && data) {
        setTracks(data);
        setStats({
          total:         data.length,
          live:          data.filter(t => t.upload_status === 'live').length,
          pending:       data.filter(t => t.upload_status === 'pending').length,
          uploaded:      data.filter(t => t.upload_status === 'uploaded').length,
          archived:      data.filter(t => t.upload_status === 'archived').length,
          radio_approved: data.filter(t => t.radio_approved).length,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter === 'all' ? tracks : tracks.filter(t => t.upload_status === filter);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Music className="w-7 h-7 text-blue-400" />
          Music Distribution
        </h1>
        <p className="text-sm text-gray-400 mt-1">Believing Self Creations · ASCAP Registered · Sovereign Radio Catalog</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tracks',    value: stats.total,         icon: Music,      color: 'text-blue-400' },
          { label: 'Live',            value: stats.live,          icon: CheckCircle,color: 'text-green-400' },
          { label: 'Radio Approved',  value: stats.radio_approved,icon: Radio,      color: 'text-purple-400' },
          { label: 'Pending Upload',  value: stats.pending,       icon: Clock,      color: 'text-yellow-400' },
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
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {f === 'all' ? `All (${stats.total})` : f}
          </button>
        ))}
      </div>

      {/* Track list */}
      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading catalog...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-400 text-center py-12">
          No tracks found. Upload audio files and mark them live to populate the catalog.
        </div>
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
                        {track.radio_approved && (
                          <Badge className="bg-purple-700 text-xs">📻 Radio</Badge>
                        )}
                        {track.frequency_hz && (
                          <Badge className="bg-slate-600 text-xs">{track.frequency_hz}Hz</Badge>
                        )}
                      </div>
                      {track.subtitle && <p className="text-sm text-gray-400 mt-0.5">{track.subtitle}</p>}
                      <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        {track.album         && <span>💿 {track.album}</span>}
                        {track.theme         && <span>🎯 {track.theme}</span>}
                        {track.ascap_id      && <span>ASCAP: {track.ascap_id}</span>}
                        {track.duration_seconds && <span>⏱ {Math.floor(track.duration_seconds / 60)}:{String(track.duration_seconds % 60).padStart(2, '0')}</span>}
                      </div>
                      {track.notes && <p className="text-xs text-gray-500 mt-1 italic">{track.notes}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-white ${STATUS_COLORS[track.upload_status] ?? 'bg-gray-600'}`}>
                        <StatusIcon className="w-3 h-3" />
                        {track.upload_status}
                      </span>
                      {track.file_format && <span className="text-xs text-gray-500 uppercase">{track.file_format}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
