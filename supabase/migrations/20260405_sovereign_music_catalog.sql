-- ─────────────────────────────────────────────────────────────────────────────
-- SOVEREIGN MUSIC CATALOG
-- Believing Self Creations — ASCAP Registered
-- Rickey Allan Howard | Howard Jones Bloodline Ancestral Trust
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sovereign_music (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  title            TEXT        NOT NULL,
  subtitle         TEXT,
  album            TEXT,
  track_number     INTEGER,

  -- Classification
  theme            TEXT,        -- 'spiritual', 'sovereignty', 'love', 'truth', 'healing', etc.
  frequency_hz     NUMERIC,     -- primary resonance frequency (e.g. 528, 432, 741)
  spiritual_theme  TEXT,        -- deeper descriptor for R.O.M.A.N. context
  keywords         TEXT[],

  -- Copyright & Registration
  ascap_id         TEXT,        -- ASCAP song registration ID
  copyright_year   INTEGER,
  registered_under TEXT        DEFAULT 'Believing Self Creations',
  iswc             TEXT,        -- International Standard Musical Work Code (optional)

  -- File Storage
  storage_path     TEXT,        -- Supabase Storage path: music/[filename]
  storage_url      TEXT,        -- Public URL for streaming/download
  file_format      TEXT,        -- 'mp3', 'wav', 'flac'
  file_size_mb     NUMERIC,
  duration_seconds INTEGER,     -- track length

  -- Radio / Playlist
  bpm              INTEGER,
  key_signature    TEXT,        -- 'A minor', 'C major', etc.
  radio_approved   BOOLEAN     DEFAULT TRUE,   -- cleared for Sovereign Radio broadcast
  radio_order      INTEGER,     -- playlist position

  -- Status
  upload_status    TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (upload_status IN ('pending', 'uploaded', 'processing', 'live', 'archived')),
  notes            TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_sovereign_music_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sovereign_music_updated ON sovereign_music;
CREATE TRIGGER sovereign_music_updated
  BEFORE UPDATE ON sovereign_music
  FOR EACH ROW EXECUTE FUNCTION update_sovereign_music_timestamp();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sovereign_music_status   ON sovereign_music (upload_status);
CREATE INDEX IF NOT EXISTS idx_sovereign_music_theme    ON sovereign_music (theme);
CREATE INDEX IF NOT EXISTS idx_sovereign_music_radio    ON sovereign_music (radio_approved, radio_order);

-- RLS
ALTER TABLE sovereign_music ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON sovereign_music
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "anon_read" ON sovereign_music
  FOR SELECT TO anon USING (upload_status = 'live');

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: 12 known titles from Believing Self Creations
-- Upload status 'pending' until files are loaded
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO sovereign_music (title, theme, frequency_hz, spiritual_theme, registered_under, copyright_year, upload_status) VALUES
  ('All I Need To Do Is Trust',        'spiritual',    528,  'Faith and surrender',              'Believing Self Creations', 2000, 'pending'),
  ('Moving On',                         'healing',      432,  'Release and forward motion',       'Believing Self Creations', 2000, 'pending'),
  ('No More Tears',                     'healing',      528,  'Restoration after pain',           'Believing Self Creations', 2000, 'pending'),
  ('Stand By The Water',                'spiritual',    741,  'Covenant and standing',            'Believing Self Creations', 2000, 'pending'),
  ('Don''t Stick Your Nose In It',      'truth',        396,  'Boundaries and sovereignty',       'Believing Self Creations', 2000, 'pending'),
  ('Let Me Down Again',                 'love',         432,  'Relational truth',                 'Believing Self Creations', 2000, 'pending'),
  ('Thanks For Giving Back My Love',    'love',         528,  'Gratitude and restoration',        'Believing Self Creations', 2000, 'pending'),
  ('If It Be Your Will',                'spiritual',    963,  'Alignment with divine authority',  'Believing Self Creations', 2000, 'pending'),
  ('I Give You My Heart',               'love',         528,  'Covenant of the heart',            'Believing Self Creations', 2000, 'pending'),
  ('Someone To Love',                   'love',         432,  'Human connection',                 'Believing Self Creations', 2000, 'pending'),
  ('They Don''t Know',                  'sovereignty',  741,  'Hidden truth revealed',            'Believing Self Creations', 2000, 'pending'),
  ('My Emotions',                       'healing',      528,  'Emotional sovereignty',            'Believing Self Creations', 2000, 'pending')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- View: music dashboard for R.O.M.A.N. and Discord reporting
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW music_dashboard AS
SELECT
  upload_status,
  COUNT(*)                                              AS track_count,
  COUNT(*) FILTER (WHERE radio_approved = TRUE)        AS radio_ready,
  COUNT(*) FILTER (WHERE storage_url IS NOT NULL)      AS files_uploaded,
  ROUND(SUM(file_size_mb), 1)                          AS total_size_mb,
  ROUND(SUM(duration_seconds) / 60.0, 1)              AS total_minutes
FROM sovereign_music
GROUP BY upload_status
ORDER BY upload_status;

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage bucket for audio files (run via Supabase dashboard if not exists)
-- ─────────────────────────────────────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('sovereign-music', 'sovereign-music', false)
-- ON CONFLICT (id) DO NOTHING;
