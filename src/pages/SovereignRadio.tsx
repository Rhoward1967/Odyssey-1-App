import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, Radio, RefreshCw, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { romanSupabase } from '@/services/romanSupabase';

interface Track {
  id: string;
  title: string;
  album?: string;
  theme?: string;
  frequency_hz?: number;
  storage_url: string;
}

type QueueItem =
  | { type: 'track'; track: Track }
  | { type: 'commercial' }
  | { type: 'dj'; text: string }
  | { type: 'weather' }
  | { type: 'news' };

const HJS_COMMERCIAL =
  'H J S Services. Professional cleaning since 1988. Serving Athens and the surrounding area. ' +
  "Whether it's your office, your facility, or your space — H J S Services brings the standard. " +
  'Dependable, sovereign, trusted. Call H J S Services — your professional cleaning partner.';

const DJ_LINES = [
  (t: string) => `Yeah, we're not stopping. This is Sovereign Radio and we're just getting warmed up. ${t} is next — let it hit you.`,
  (t: string) => `Rickey Howard, Believing Self Creations. This is the catalog they didn't think would exist. ${t} — turn it up.`,
  (t: string) => `You're locked in to Sovereign Radio. Nobody's cutting this signal. Here's ${t}.`,
  (t: string) => `This one right here — ${t}. Straight from the sovereign frequency. Feel every note.`,
  (t: string) => `We stay on. We stay moving. That's the mandate. ${t} coming at you now.`,
  (t: string) => `The trust is real, the music is real, and ${t} is about to remind you why. Stay with us.`,
  (t: string) => `Sovereign Radio — where the frequency never lies. ${t} is up next.`,
  (t: string) => `I don't just play music. I play truth. ${t} from Believing Self Creations — this is it.`,
  (t: string) => `They said it couldn't be built. Well, you're listening to it right now. ${t} — go.`,
  (t: string) => `No filler, no noise, just sovereignty. ${t} is on deck — don't move.`,
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const WX_CODES: Record<number, string> = {
  0:'clear skies', 1:'mostly clear', 2:'partly cloudy', 3:'overcast',
  45:'foggy', 48:'icy fog', 51:'light drizzle', 53:'drizzle', 55:'heavy drizzle',
  61:'light rain', 63:'rain', 65:'heavy rain', 71:'light snow', 73:'snow', 75:'heavy snow',
  80:'rain showers', 81:'showers', 82:'heavy showers', 95:'thunderstorms', 99:'severe storms',
};

async function fetchWeatherScript(): Promise<string> {
  try {
    // Athens, GA coordinates
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=33.9519&longitude=-83.3576' +
      '&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m' +
      '&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America/New_York'
    );
    const data = await res.json();
    const c    = data.current;
    const temp = Math.round(c.temperature_2m);
    const wind = Math.round(c.windspeed_10m);
    const desc = WX_CODES[c.weathercode] ?? 'variable conditions';
    const hum  = Math.round(c.relative_humidity_2m);
    const now  = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
    return `Sovereign Radio weather update for Athens, Georgia. As of ${now} — ${temp} degrees, ${desc}. ` +
           `Wind at ${wind} miles per hour. Humidity ${hum} percent. Stay sovereign out there.`;
  } catch {
    return 'Weather data temporarily unavailable on Sovereign Radio. Stay tuned.';
  }
}

async function fetchNewsScript(): Promise<string> {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/anthropic-chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message:
            'You are the R.O.M.A.N. news anchor on Sovereign Radio. Give a concise 3-sentence radio news brief ' +
            'about current events from a sovereign, independent perspective. Plain speech only, no markdown, no lists. ' +
            'End with: "That is your Sovereign Radio news update."',
          chatHistory: [],
        }),
      }
    );
    const data = await res.json();
    return data.response ?? 'No news update available at this time on Sovereign Radio.';
  } catch {
    return 'Sovereign Radio news is standing by. Stay informed, stay sovereign.';
  }
}

function buildQueue(tracks: Track[]): QueueItem[] {
  const queue: QueueItem[] = [];
  const shuffled = shuffle(tracks);
  shuffled.forEach((track, i) => {
    queue.push({ type: 'dj', text: DJ_LINES[i % DJ_LINES.length](track.title) });
    queue.push({ type: 'track', track });
    if ((i + 1) % 3 === 0) queue.push({ type: 'commercial' });
    if ((i + 1) % 5 === 0) queue.push({ type: 'weather' });
    if ((i + 1) % 8 === 0) queue.push({ type: 'news' });
  });
  return queue;
}

export default function SovereignRadio() {
  const [tracks, setTracks]             = useState<Track[]>([]);
  const [commercials, setCommercials]   = useState<Track[]>([]);
  const [playing, setPlaying]           = useState(false);
  const [volume, setVolume]             = useState(0.85);
  const [muted, setMuted]               = useState(false);
  const [nowPlaying, setNowPlaying]     = useState<{ label: string; sub?: string; type: string } | null>(null);
  const [upNext, setUpNext]             = useState<Track[]>([]);
  const [bars]                          = useState(() => Array.from({ length: 24 }, (_, i) => 0.3 + (i % 5) * 0.14));

  const queueRef       = useRef<QueueItem[]>([]);
  const tracksRef      = useRef<Track[]>([]);
  const commercialsRef = useRef<Track[]>([]);
  const indexRef    = useRef(0);
  const playingRef  = useRef(false);
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const ttsRef      = useRef<HTMLAudioElement | null>(null);
  const volRef      = useRef(0.85);
  const mutedRef    = useRef(false);

  // Keep refs in sync
  volRef.current   = volume;
  mutedRef.current = muted;

  useEffect(() => {
    romanSupabase
      .from('sovereign_music')
      .select('id, title, album, theme, frequency_hz, storage_url')
      .not('storage_url', 'is', null)
      .eq('radio_approved', true)
      .then(({ data }) => {
        if (data?.length) {
          const music = (data as Track[]).filter(t => t.theme !== 'commercial');
          const ads   = (data as Track[]).filter(t => t.theme === 'commercial');
          setTracks(music);
          setCommercials(ads);
          tracksRef.current      = music;
          commercialsRef.current = ads;
        }
      });
  }, []);

  const refreshUpNext = useCallback(() => {
    const upcoming = queueRef.current
      .slice(indexRef.current + 1)
      .filter(i => i.type === 'track')
      .slice(0, 3)
      .map(i => (i as any).track as Track);
    setUpNext(upcoming);
  }, []);

  async function speakTTS(text: string): Promise<void> {
    return new Promise(resolve => {
      const run = async () => {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/roman-tts`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({ text }),
            }
          );
          if (!res.ok) throw new Error('TTS fail');
          const buf  = await res.arrayBuffer();
          const blob = new Blob([buf], { type: 'audio/mpeg' });
          const url  = URL.createObjectURL(blob);
          ttsRef.current?.pause();
          const audio = new Audio(url);
          audio.volume = mutedRef.current ? 0 : volRef.current;
          ttsRef.current = audio;
          audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
          audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
          await audio.play();
        } catch {
          // browser TTS fallback
          if (!window.speechSynthesis) { resolve(); return; }
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(text);
          utt.rate = 0.92; utt.pitch = 0.85;
          const v = window.speechSynthesis.getVoices();
          const pick = v.find(x => /david|mark|guy/i.test(x.name)) ?? v[0];
          if (pick) utt.voice = pick;
          utt.onend  = () => resolve();
          utt.onerror = () => resolve();
          window.speechSynthesis.speak(utt);
        }
      };
      run();
    });
  }

  async function playTrack(url: string): Promise<void> {
    return new Promise(resolve => {
      audioRef.current?.pause();
      const audio = new Audio(url);
      audio.volume = mutedRef.current ? 0 : volRef.current;
      audioRef.current = audio;
      audio.onended  = () => resolve();
      audio.onerror  = () => resolve();
      audio.play().catch(() => resolve());
    });
  }

  const playFrom = useCallback(async (idx: number) => {
    if (!playingRef.current) return;

    // Loop: reload tracks from DB then rebuild queue
    if (idx >= queueRef.current.length) {
      const { data } = await romanSupabase
        .from('sovereign_music')
        .select('id, title, album, theme, frequency_hz, storage_url')
        .not('storage_url', 'is', null)
        .eq('radio_approved', true);
      if (data?.length) {
        const music = (data as Track[]).filter(t => t.theme !== 'commercial');
        const ads   = (data as Track[]).filter(t => t.theme === 'commercial');
        tracksRef.current      = music;
        commercialsRef.current = ads;
        setTracks(music);
        setCommercials(ads);
      }
      queueRef.current = buildQueue(tracksRef.current);
      indexRef.current = 0;
      playFrom(0);
      return;
    }

    indexRef.current = idx;
    refreshUpNext();
    const item = queueRef.current[idx];

    if (item.type === 'track') {
      setNowPlaying({ label: item.track.title, sub: item.track.album ?? item.track.theme, type: 'track' });
      await playTrack(item.track.storage_url);
    } else if (item.type === 'dj') {
      setNowPlaying({ label: 'R.O.M.A.N. — on the mic', sub: item.text, type: 'dj' });
      await speakTTS(item.text);
    } else if (item.type === 'weather') {
      setNowPlaying({ label: 'Weather Report', sub: 'Athens, Georgia — Live Conditions', type: 'weather' });
      const script = await fetchWeatherScript();
      await speakTTS(script);
    } else if (item.type === 'news') {
      setNowPlaying({ label: 'R.O.M.A.N. News Desk', sub: 'Sovereign Radio News Update', type: 'news' });
      const script = await fetchNewsScript();
      await speakTTS(script);
    } else {
      // Pick a random commercial from DB, or fall back to hardcoded TTS
      const adPool = commercialsRef.current;
      const ad     = adPool.length ? adPool[Math.floor(Math.random() * adPool.length)] : null;
      setNowPlaying({ label: ad?.title ?? 'HJS Services — Commercial Break', sub: 'Believing Self Creations', type: 'commercial' });
      if (ad?.storage_url) {
        await playTrack(ad.storage_url);
      } else {
        await speakTTS(HJS_COMMERCIAL);
      }
    }

    if (playingRef.current) playFrom(idx + 1);
  }, [refreshUpNext]);

  async function refreshCatalog() {
    const { data } = await romanSupabase
      .from('sovereign_music')
      .select('id, title, album, theme, frequency_hz, storage_url')
      .not('storage_url', 'is', null)
      .eq('radio_approved', true);
    if (!data?.length) return;
    const music = (data as Track[]).filter(t => t.theme !== 'commercial');
    const ads   = (data as Track[]).filter(t => t.theme === 'commercial');
    tracksRef.current      = music;
    commercialsRef.current = ads;
    setTracks(music);
    setCommercials(ads);
    if (playingRef.current) {
      queueRef.current = buildQueue(music);
      indexRef.current = 0;
    }
  }

  function startRadio() {
    if (!tracksRef.current.length) return;
    queueRef.current = buildQueue(tracksRef.current);
    indexRef.current = 0;
    playingRef.current = true;
    setPlaying(true);
    playFrom(0);
  }

  function pauseRadio() {
    playingRef.current = false;
    setPlaying(false);
    audioRef.current?.pause();
    ttsRef.current?.pause();
    window.speechSynthesis?.cancel();
  }

  function skip() {
    audioRef.current?.pause();
    ttsRef.current?.pause();
    window.speechSynthesis?.cancel();
    if (playingRef.current) playFrom(indexRef.current + 1);
  }

  // Apply volume/mute to active audio
  useEffect(() => {
    const v = muted ? 0 : volume;
    if (audioRef.current) audioRef.current.volume = v;
    if (ttsRef.current)   ttsRef.current.volume   = v;
  }, [volume, muted]);

  const typeColor: Record<string, string> = {
    track:      'text-blue-400',
    dj:         'text-purple-400',
    commercial: 'text-yellow-400',
    weather:    'text-cyan-400',
    news:       'text-orange-400',
  };
  const typeLabel: Record<string, string> = {
    track:      '🎵 Now Playing',
    dj:         '🎙 R.O.M.A.N. on the mic',
    commercial: '📢 Commercial Break',
    weather:    '🌤 Weather Report',
    news:       '📰 Sovereign News Desk',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <Radio className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Sovereign Radio</h1>
          <p className="text-xs text-gray-400">Believing Self Creations · ASCAP · Powered by R.O.M.A.N.</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {playing && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              LIVE
            </span>
          )}
          <button
            onClick={refreshCatalog}
            title="Refresh catalog"
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Player */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-8">

        {/* Visualizer */}
        <div className="flex items-end gap-1 h-16">
          {bars.map((h, i) => (
            <div
              key={i}
              className={`w-2 rounded-sm ${playing ? 'bg-blue-500' : 'bg-slate-700'}`}
              style={{
                height: playing ? `${12 + h * 44}px` : '6px',
                transition: 'height 0.4s ease',
                animationDuration: `${0.5 + h * 0.9}s`,
              }}
            />
          ))}
        </div>

        {/* Now Playing card */}
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
          {nowPlaying ? (
            <>
              <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${typeColor[nowPlaying.type as keyof typeof typeColor]}`}>
                {typeLabel[nowPlaying.type as keyof typeof typeLabel]}
              </p>
              <p className="text-xl font-bold text-white leading-tight">{nowPlaying.label}</p>
              {nowPlaying.sub && <p className="text-sm text-gray-400 mt-1">{nowPlaying.sub}</p>}
            </>
          ) : (
            <>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Ready to broadcast</p>
              <p className="text-xl font-bold text-white">
                {tracks.length ? `${tracks.length} tracks loaded` : 'Loading catalog...'}
              </p>
              {tracks.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">No tracks with audio URLs found. Run the link script to upload MP3s.</p>
              )}
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button onClick={() => setMuted(m => !m)} className="p-2 text-gray-400 hover:text-white transition-colors">
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={playing ? pauseRadio : startRadio}
            disabled={!tracks.length}
            className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
          </button>

          <button
            onClick={skip}
            disabled={!playing}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Volume */}
        <input
          type="range" min="0" max="1" step="0.05"
          value={muted ? 0 : volume}
          onChange={e => { setMuted(false); setVolume(Number(e.target.value)); }}
          className="w-48 accent-blue-500"
        />

        {/* Up Next */}
        {upNext.length > 0 && (
          <div className="w-full max-w-md">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Up Next</p>
            <div className="space-y-2">
              {upNext.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3 bg-slate-800 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">{t.title}</p>
                    {t.theme && <p className="text-xs text-gray-500 capitalize">{t.theme}</p>}
                  </div>
                  {t.frequency_hz && <span className="text-xs text-blue-400">{t.frequency_hz}Hz</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Catalog count */}
        {tracks.length > 0 && (
          <p className="text-xs text-gray-600">
            {tracks.length} tracks · shuffled · commercial every 3 songs · R.O.M.A.N. DJ
          </p>
        )}
      </div>
    </div>
  );
}
