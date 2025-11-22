-- Storage Buckets for File Upload System
-- Educational collaboration platform file storage

-- Create storage bucket for user files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-files',
  'user-files',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'application/zip'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for study group resources
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'study-group-files',
  'study-group-files',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'application/zip'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user-files bucket

-- Users can upload their own files
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own files
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'user-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for study-group-files bucket

-- Group members can upload files to their groups
CREATE POLICY "Group members can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'study-group-files' AND
  EXISTS (
    SELECT 1 FROM study_group_members
    WHERE user_id = auth.uid()
    AND group_id::text = (storage.foldername(name))[1]
  )
);

-- Group members can view files in their groups
CREATE POLICY "Group members can view files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'study-group-files' AND
  EXISTS (
    SELECT 1 FROM study_group_members
    WHERE user_id = auth.uid()
    AND group_id::text = (storage.foldername(name))[1]
  )
);

-- File uploaders can delete their own files
CREATE POLICY "Users can delete their group uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'study-group-files' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Moderators can delete any files in their groups
CREATE POLICY "Moderators can delete group files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'study-group-files' AND
  EXISTS (
    SELECT 1 FROM study_group_members
    WHERE user_id = auth.uid()
    AND group_id::text = (storage.foldername(name))[1]
    AND role IN ('creator', 'moderator')
  )
);

-- User files table for metadata tracking
CREATE TABLE IF NOT EXISTS user_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    bucket_name TEXT NOT NULL,
    description TEXT,
    tags TEXT[],
    is_shared BOOLEAN DEFAULT FALSE,
    share_token TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_files_user ON user_files(user_id);
CREATE INDEX idx_user_files_share_token ON user_files(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_user_files_bucket ON user_files(bucket_name);

-- RLS for user_files
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own files metadata"
    ON user_files FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own files metadata"
    ON user_files FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own files metadata"
    ON user_files FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own files metadata"
    ON user_files FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Anyone can view shared files metadata"
    ON user_files FOR SELECT
    TO authenticated
    USING (is_shared = TRUE AND share_token IS NOT NULL);

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_file_share_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    token TEXT;
BEGIN
    token := encode(gen_random_bytes(16), 'base64');
    token := replace(token, '/', '_');
    token := replace(token, '+', '-');
    RETURN token;
END;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_files_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_user_files_updated_at
BEFORE UPDATE ON user_files
FOR EACH ROW
EXECUTE FUNCTION update_user_files_updated_at();

COMMENT ON TABLE user_files IS 'Metadata for user-uploaded files';
COMMENT ON COLUMN user_files.share_token IS 'Unique token for sharing files publicly';
