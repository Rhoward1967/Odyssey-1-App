/**
 * SOVEREIGN MUSIC SERVICE — Believing Self Creations
 * ===================================================
 * Manages the full music catalog for Rickey Allan Howard.
 * 150–200 tracks, ASCAP registered, stored in Supabase Storage.
 * Powers the future Sovereign Radio broadcast node.
 *
 * © 2026 Howard Jones Bloodline Ancestral Trust — UCC 1-308
 */

import { romanSupabase } from './romanSupabase';
import { readFileSync } from 'fs';
import { basename, extname } from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MusicTrack {
  id?:              string;
  title:            string;
  subtitle?:        string;
  album?:           string;
  track_number?:    number;
  theme?:           string;
  frequency_hz?:    number;
  spiritual_theme?: string;
  keywords?:        string[];
  ascap_id?:        string;
  copyright_year?:  number;
  registered_under?: string;
  storage_path?:    string;
  storage_url?:     string;
  file_format?:     string;
  file_size_mb?:    number;
  duration_seconds?: number;
  bpm?:             number;
  key_signature?:   string;
  radio_approved?:  boolean;
  radio_order?:     number;
  upload_status?:   'pending' | 'uploaded' | 'processing' | 'live' | 'archived';
  notes?:           string;
}

export interface CatalogStats {
  total:         number;
  live:          number;
  pending:       number;
  uploaded:      number;
  total_minutes: number;
  themes:        Record<string, number>;
}

// ─── Catalog Queries ──────────────────────────────────────────────────────────

export async function getCatalogStats(): Promise<CatalogStats> {
  const { data } = await romanSupabase
    .from('sovereign_music')
    .select('upload_status, theme, duration_seconds');

  if (!data) return { total: 0, live: 0, pending: 0, uploaded: 0, total_minutes: 0, themes: {} };

  const themes: Record<string, number> = {};
  let totalSeconds = 0;

  for (const track of data) {
    if (track.theme) themes[track.theme] = (themes[track.theme] || 0) + 1;
    if (track.duration_seconds) totalSeconds += track.duration_seconds;
  }

  return {
    total:         data.length,
    live:          data.filter(t => t.upload_status === 'live').length,
    pending:       data.filter(t => t.upload_status === 'pending').length,
    uploaded:      data.filter(t => t.upload_status === 'uploaded').length,
    total_minutes: Math.round(totalSeconds / 60),
    themes,
  };
}

export async function getAllTracks(filter?: { theme?: string; status?: string }): Promise<MusicTrack[]> {
  let query = romanSupabase
    .from('sovereign_music')
    .select('*')
    .order('radio_order', { ascending: true, nullsFirst: false })
    .order('title');

  if (filter?.theme)  query = query.eq('theme', filter.theme);
  if (filter?.status) query = query.eq('upload_status', filter.status);

  const { data } = await query;
  return data || [];
}

export async function searchTracks(keyword: string): Promise<MusicTrack[]> {
  const { data } = await romanSupabase
    .from('sovereign_music')
    .select('*')
    .or(`title.ilike.%${keyword}%,theme.ilike.%${keyword}%,spiritual_theme.ilike.%${keyword}%,notes.ilike.%${keyword}%`)
    .order('title');

  return data || [];
}

// ─── Add / Update Tracks ─────────────────────────────────────────────────────

/**
 * Add a new track to the catalog (no file yet — metadata only).
 */
export async function addTrack(track: MusicTrack): Promise<{ success: boolean; id?: string; error?: string }> {
  const { data, error } = await romanSupabase
    .from('sovereign_music')
    .insert({
      ...track,
      registered_under: track.registered_under || 'Believing Self Creations',
      upload_status:    track.upload_status || 'pending',
    })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, id: data?.id };
}

/**
 * Add multiple tracks at once — bulk catalog entry.
 */
export async function addTracks(tracks: MusicTrack[]): Promise<{ success: boolean; count: number; error?: string }> {
  const rows = tracks.map(t => ({
    ...t,
    registered_under: t.registered_under || 'Believing Self Creations',
    upload_status:    t.upload_status || 'pending',
  }));

  const { error, count } = await romanSupabase
    .from('sovereign_music')
    .upsert(rows, { onConflict: 'title' })
    .select();

  if (error) return { success: false, count: 0, error: error.message };
  return { success: true, count: count || tracks.length };
}

export async function updateTrack(id: string, updates: Partial<MusicTrack>): Promise<{ success: boolean; error?: string }> {
  const { error } = await romanSupabase
    .from('sovereign_music')
    .update(updates)
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ─── File Upload ──────────────────────────────────────────────────────────────

/**
 * Upload an audio file to Supabase Storage and link it to the catalog.
 * filePath: local path to the audio file
 * trackTitle: must match exactly what's in the catalog (or pass trackId)
 */
export async function uploadTrackFile(
  filePath:   string,
  trackTitle: string,
  options: { isPublic?: boolean } = {}
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileName    = basename(filePath);
    const format      = extname(filePath).replace('.', '').toLowerCase();
    const fileBuffer  = readFileSync(filePath);
    const fileSizeMb  = fileBuffer.length / 1024 / 1024;
    const storagePath = `music/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await romanSupabase.storage
      .from('sovereign-music')
      .upload(storagePath, fileBuffer, {
        contentType:  format === 'mp3' ? 'audio/mpeg' : format === 'wav' ? 'audio/wav' : 'audio/flac',
        upsert:       true,
      });

    if (uploadError) return { success: false, error: uploadError.message };

    // Get URL
    let url: string;
    if (options.isPublic) {
      const { data } = romanSupabase.storage.from('sovereign-music').getPublicUrl(storagePath);
      url = data.publicUrl;
    } else {
      const { data } = await romanSupabase.storage
        .from('sovereign-music')
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 year signed URL
      url = data?.signedUrl || '';
    }

    // Update catalog record
    const { error: updateError } = await romanSupabase
      .from('sovereign_music')
      .update({
        storage_path:  storagePath,
        storage_url:   url,
        file_format:   format,
        file_size_mb:  Math.round(fileSizeMb * 100) / 100,
        upload_status: 'uploaded',
      })
      .eq('title', trackTitle);

    if (updateError) return { success: false, error: `Uploaded but DB update failed: ${updateError.message}` };

    return { success: true, url };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Mark a track as 'live' — cleared for Sovereign Radio broadcast.
 */
export async function goLive(trackTitle: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await romanSupabase
    .from('sovereign_music')
    .update({ upload_status: 'live', radio_approved: true })
    .eq('title', trackTitle)
    .not('storage_url', 'is', null);  // must have a file first

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ─── Radio Playlist ───────────────────────────────────────────────────────────

/**
 * Get the current radio playlist — all live, radio-approved tracks in order.
 */
export async function getRadioPlaylist(): Promise<MusicTrack[]> {
  const { data } = await romanSupabase
    .from('sovereign_music')
    .select('title, album, theme, frequency_hz, duration_seconds, storage_url, radio_order')
    .eq('upload_status', 'live')
    .eq('radio_approved', true)
    .order('radio_order', { ascending: true, nullsFirst: false })
    .order('title');

  return data || [];
}

// ─── Discord Formatters ───────────────────────────────────────────────────────

export async function formatMusicStatus(): Promise<string> {
  const stats  = await getCatalogStats();
  const tracks = await getAllTracks();

  const themeLines = Object.entries(stats.themes)
    .sort((a, b) => b[1] - a[1])
    .map(([theme, count]) => `  ${theme}: ${count}`)
    .join('\n');

  const pendingList = tracks
    .filter(t => t.upload_status === 'pending')
    .map(t => `  • ${t.title}`)
    .join('\n');

  const liveTracks = tracks.filter(t => t.upload_status === 'live');

  return [
    `🎵 **Believing Self Creations — Music Catalog**`,
    `*Rickey Allan Howard | ASCAP Registered*`,
    ``,
    `**CATALOG STATUS**`,
    `Total tracks:  ${stats.total}`,
    `Live (radio):  ${stats.live}`,
    `Uploaded:      ${stats.uploaded}`,
    `Pending file:  ${stats.pending}`,
    stats.total_minutes > 0 ? `Total runtime: ${stats.total_minutes} min` : '',
    ``,
    `**BY THEME**`,
    themeLines || '  (none yet)',
    liveTracks.length > 0 ? `\n**LIVE TRACKS**\n${liveTracks.map(t => `  ✅ ${t.title}`).join('\n')}` : '',
    pendingList ? `\n**AWAITING UPLOAD**\n${pendingList}` : '',
    ``,
    `*Howard Jones Bloodline Ancestral Trust — UCC 1-308*`,
  ].filter(Boolean).join('\n');
}

export function formatTrackAdded(track: MusicTrack): string {
  return [
    `🎵 **Track Added to Catalog**`,
    `Title:   ${track.title}`,
    track.album          ? `Album:   ${track.album}` : '',
    track.theme          ? `Theme:   ${track.theme}` : '',
    track.frequency_hz   ? `Freq:    ${track.frequency_hz}Hz` : '',
    track.ascap_id       ? `ASCAP:   ${track.ascap_id}` : '',
    `Status:  ${track.upload_status || 'pending'}`,
    ``,
    `*Upload the audio file to go live: \`upload track "${track.title}" [file_path]\`*`,
  ].filter(Boolean).join('\n');
}
