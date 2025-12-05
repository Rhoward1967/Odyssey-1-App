-- Migration: Add app_admins table for in-app admin mapping
CREATE TABLE IF NOT EXISTS public.app_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Ahmad Barnett as admin
INSERT INTO public.app_admins (email) VALUES ('a.r.barnett11@gmail.com') ON CONFLICT DO NOTHING;
