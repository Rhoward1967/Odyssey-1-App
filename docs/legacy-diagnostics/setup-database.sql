-- Essential Odyssey-1 Database Schema (Aligned with Existing Schema)
-- Run this in your Supabase SQL Editor

-- 1. Profiles table (idempotent creation)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='email') THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='full_name') THEN
    ALTER TABLE profiles ADD COLUMN full_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='stripe_customer_id') THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='created_at') THEN
    ALTER TABLE profiles ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='updated_at') THEN
    ALTER TABLE profiles ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END$$;

-- 2. Activity logs table already exists with proper structure
-- Your existing activity_logs table has:
-- id uuid, user_id uuid, action text, details jsonb, created_at timestamptz, etc.
-- No changes needed - just ensure RLS policies exist

-- 3. Subscriptions table (idempotent creation)
CREATE TABLE IF NOT EXISTS subscriptions (
  id bigserial PRIMARY KEY
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' AND column_name='user_id') THEN
    ALTER TABLE subscriptions ADD COLUMN user_id uuid REFERENCES auth.users ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' AND column_name='stripe_subscription_id') THEN
    ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' AND column_name='status') THEN
    ALTER TABLE subscriptions ADD COLUMN status text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' AND column_name='current_period_start') THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_start timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' AND column_name='current_period_end') THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_end timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' AND column_name='created_at') THEN
    ALTER TABLE subscriptions ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' AND column_name='updated_at') THEN
    ALTER TABLE subscriptions ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END$$;

-- Add helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own activity" ON activity_logs;
DROP POLICY IF EXISTS "Users can insert own activity" ON activity_logs;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;

-- Create RLS policies with TO authenticated clause
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can view own activity" ON activity_logs
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own activity" ON activity_logs
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

-- Function to automatically create profile when user signs up (Security Hardened)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SET search_path = public, pg_catalog
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Secure the function permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- Create trigger (using newer syntax)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();