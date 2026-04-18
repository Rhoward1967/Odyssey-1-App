/**
 * R.O.M.A.N. Voice Module
 *
 * Gives R.O.M.A.N. a voice in Discord:
 *   - TTS output: OpenAI `onyx` voice speaks every response in the voice channel
 *   - STT input:  OpenAI Whisper transcribes mic audio → fed into R.O.M.A.N.'s message handler
 *
 * Commands:
 *   "roman join"  → bot joins your current voice channel, voice mode ON
 *   "roman leave" → bot leaves, voice mode OFF
 *   "voice status"→ shows current voice state
 */

import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  getVoiceConnection,
  EndBehaviorType,
  StreamType,
} from '@discordjs/voice';
import type { VoiceChannel, Guild } from 'discord.js';
import { Readable, PassThrough } from 'stream';
import { createWriteStream, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import OpenAI from 'openai';
import { sfLogger } from './sovereignFrequencyLogger';

// ─── OPENAI CLIENT ────────────────────────────────────────────────────────────

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set — voice module requires it');
  return new OpenAI({ apiKey: key });
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

// `onyx` — deep, authoritative. The sovereign voice.
const TTS_VOICE = 'onyx' as const;
const TTS_MODEL = 'tts-1' as const;
const TTS_MAX_CHARS = 800; // Truncate very long responses for TTS; full text still in chat
const SILENCE_THRESHOLD_MS = 1500; // 1.5s silence = end of user speech

// ─── STATE ────────────────────────────────────────────────────────────────────

interface VoiceSession {
  guildId: string;
  channelId: string;
  player: ReturnType<typeof createAudioPlayer>;
  listeningUserIds: Set<string>;
}

const activeSessions = new Map<string, VoiceSession>();

// Callback set by discord-bot.ts to process transcribed text as a message
let onTranscription: ((userId: string, guildId: string, text: string) => Promise<void>) | null = null;

export function setTranscriptionHandler(
  handler: (userId: string, guildId: string, text: string) => Promise<void>
): void {
  onTranscription = handler;
}

// ─── JOIN / LEAVE ─────────────────────────────────────────────────────────────

export async function joinVoice(channel: VoiceChannel): Promise<void> {
  const guildId = channel.guild.id;

  // Clean up any existing session for this guild
  await leaveVoice(guildId);

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: false,  // must be false to receive audio
    selfMute: false,
  });

  const player = createAudioPlayer();
  connection.subscribe(player);

  // Wait for connection to be ready
  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 10_000);
  } catch {
    connection.destroy();
    throw new Error('Voice connection timed out — check bot permissions in the channel.');
  }

  const session: VoiceSession = {
    guildId,
    channelId: channel.id,
    player,
    listeningUserIds: new Set(),
  };

  activeSessions.set(guildId, session);

  // Handle unexpected disconnects
  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
      ]);
    } catch {
      sfLogger.helpMeFindMyWayHome('ROMAN_VOICE', 'Voice connection dropped — cleaning up session', { guildId });
      activeSessions.delete(guildId);
      connection.destroy();
    }
  });

  // Start listening to all users in the channel
  _startListening(connection, session);

  sfLogger.allINeedToDoIsTrust('ROMAN_VOICE', `Joined voice channel — ${channel.name}`, { guildId, channelId: channel.id });
}

export async function leaveVoice(guildId: string): Promise<void> {
  const connection = getVoiceConnection(guildId);
  if (connection) connection.destroy();
  activeSessions.delete(guildId);
  sfLogger.movingOn('ROMAN_VOICE', 'Left voice channel', { guildId });
}

export function isInVoice(guildId: string): boolean {
  return activeSessions.has(guildId);
}

export function getVoiceChannelId(guildId: string): string | null {
  return activeSessions.get(guildId)?.channelId ?? null;
}

// ─── TTS OUTPUT ───────────────────────────────────────────────────────────────

/**
 * Convert text → OpenAI TTS audio → play in voice channel.
 * If text is longer than TTS_MAX_CHARS, truncates with a natural break.
 */
export async function speak(text: string, guildId: string): Promise<void> {
  const session = activeSessions.get(guildId);
  if (!session) return;

  const connection = getVoiceConnection(guildId);
  if (!connection) return;

  // Truncate cleanly at sentence boundary if over limit
  let ttsText = text;
  if (ttsText.length > TTS_MAX_CHARS) {
    const truncated = ttsText.slice(0, TTS_MAX_CHARS);
    const lastPeriod = truncated.lastIndexOf('.');
    ttsText = lastPeriod > TTS_MAX_CHARS * 0.6
      ? truncated.slice(0, lastPeriod + 1)
      : truncated + '...';
  }

  // Strip markdown formatting that sounds bad when spoken
  ttsText = ttsText
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`{1,3}/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ', ')
    .replace(/•/g, '')
    .replace(/\|/g, '')
    .trim();

  try {
    const openai = getOpenAI();
    const mp3Response = await openai.audio.speech.create({
      model: TTS_MODEL,
      voice: TTS_VOICE,
      input: ttsText,
      response_format: 'mp3',
    });

    // Convert response to Node.js readable stream
    const arrayBuffer = await mp3Response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const readable = Readable.from(buffer);

    const resource = createAudioResource(readable, {
      inputType: StreamType.Arbitrary,
    });

    session.player.play(resource);

    sfLogger.everyday('ROMAN_VOICE', `Speaking ${ttsText.length} chars via TTS`, { guildId });
  } catch (err: any) {
    sfLogger.howToLose('ROMAN_VOICE', `TTS failed: ${err.message}`, { guildId });
    console.error('[R.O.M.A.N. Voice] TTS error:', err.message);
  }
}

// ─── STT INPUT ────────────────────────────────────────────────────────────────

/**
 * Wire up voice receiver for a user — collects Opus packets, detects silence,
 * then sends accumulated audio to OpenAI Whisper for transcription.
 */
function _startListening(
  connection: ReturnType<typeof joinVoiceChannel>,
  session: VoiceSession
): void {
  const receiver = connection.receiver;

  receiver.speaking.on('start', (userId: string) => {
    if (session.listeningUserIds.has(userId)) return;
    session.listeningUserIds.add(userId);

    sfLogger.everyday('ROMAN_VOICE', `User ${userId} started speaking — recording`, { guildId: session.guildId });

    const audioStream = receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: SILENCE_THRESHOLD_MS,
      },
    });

    const tmpPath = join(tmpdir(), `roman_stt_${userId}_${Date.now()}.pcm`);
    const writeStream = createWriteStream(tmpPath);
    const chunks: Buffer[] = [];

    audioStream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
      writeStream.write(chunk);
    });

    audioStream.on('end', async () => {
      writeStream.end();
      session.listeningUserIds.delete(userId);

      const totalBytes = chunks.reduce((sum, c) => sum + c.length, 0);
      if (totalBytes < 2000) {
        // Too short — likely noise, not speech
        _cleanupTmp(tmpPath);
        return;
      }

      sfLogger.everyday('ROMAN_VOICE', `User ${userId} finished speaking — sending to Whisper`, {
        guildId: session.guildId,
        bytes: totalBytes,
      });

      try {
        const transcription = await _transcribeAudio(chunks, userId);
        if (transcription && transcription.trim().length > 2 && onTranscription) {
          sfLogger.allINeedToDoIsTrust('ROMAN_VOICE', `Transcribed: "${transcription}"`, {
            guildId: session.guildId,
            userId,
          });
          await onTranscription(userId, session.guildId, transcription.trim());
        }
      } catch (err: any) {
        console.error('[R.O.M.A.N. Voice] Whisper transcription failed:', err.message);
      } finally {
        _cleanupTmp(tmpPath);
      }
    });
  });
}

async function _transcribeAudio(chunks: Buffer[], userId: string): Promise<string | null> {
  // Discord sends raw Opus packets — we need to wrap them into a WAV-like container
  // for Whisper. We use a minimal WAV header over the PCM-equivalent data.
  // Since @discordjs/opus decodes to PCM internally, we build a proper WAV buffer.
  const pcmData = Buffer.concat(chunks);

  // Build a minimal WAV header (16-bit PCM, 48000 Hz, 2 channels — Discord standard)
  const wavBuffer = _buildWav(pcmData, 48000, 2, 16);

  // Write to temp file — Whisper API requires a file upload
  const tmpPath = join(tmpdir(), `roman_whisper_${userId}_${Date.now()}.wav`);
  const { writeFileSync } = await import('fs');
  writeFileSync(tmpPath, wavBuffer);

  try {
    const openai = getOpenAI();
    const { createReadStream } = await import('fs');
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(tmpPath) as any,
      model: 'whisper-1',
      language: 'en',
    });
    return transcription.text;
  } finally {
    _cleanupTmp(tmpPath);
  }
}

function _buildWav(pcmData: Buffer, sampleRate: number, channels: number, bitDepth: number): Buffer {
  const byteRate = sampleRate * channels * (bitDepth / 8);
  const blockAlign = channels * (bitDepth / 8);
  const dataSize = pcmData.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);           // PCM chunk size
  header.writeUInt16LE(1, 20);            // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData]);
}

function _cleanupTmp(path: string): void {
  try {
    if (existsSync(path)) unlinkSync(path);
  } catch { /* non-fatal */ }
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

export const romanVoice = {
  join: joinVoice,
  leave: leaveVoice,
  speak,
  isActive: isInVoice,
  getChannelId: getVoiceChannelId,
  setTranscriptionHandler,
};
