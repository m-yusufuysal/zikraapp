-- ============================================
-- Zikra App - HARDENED Database Schema
-- Version 2.0 - Security & AI Handler Ready
-- Idempotent (safe to run multiple times)
-- ============================================

-- ============================================
-- 1. PROFILES TABLE (HARDENED RLS)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name text,
  birth_date text, -- Stored as DD/MM/YYYY string for flexibility
  birth_time text,
  birth_place text,
  location text,
  avatar_url text,
  is_premium boolean DEFAULT false,
  premium_tier text CHECK (premium_tier IS NULL OR premium_tier IN ('starter', 'pro', 'unlimited')),
  premium_until timestamp with time zone,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies safely
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
  DROP POLICY IF EXISTS "Public info is viewable by everyone." ON public.profiles;
  DROP POLICY IF EXISTS "Sensitive info is private." ON public.profiles;
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
  DROP POLICY IF EXISTS "Users can delete their own profile." ON public.profiles;
  DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
END $$;

-- HARDENED: Users can ONLY see their OWN profile (not everyone's)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile."
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- Service role bypass for Edge Functions
CREATE POLICY "Service role full access"
  ON public.profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');


-- ============================================
-- 2. DHIKR_SESSIONS TABLE (AI Handler Ready)
-- ============================================
CREATE TABLE IF NOT EXISTS public.dhikr_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- User Input
  intention text NOT NULL,
  name text,
  birth_date text,
  birth_time text,
  
  -- AI Output
  dhikr_list jsonb,
  numerology_analysis text,
  esma text,
  daily_dua text,
  closing_dua text,
  recommended_action text,
  personal_warning text,
  prescription_title text,
  
  -- Progress Tracking
  completed_count integer DEFAULT 0,
  target_count integer DEFAULT 0,
  current_step integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  
  -- Status for Realtime
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  
  -- Idempotency
  request_hash text,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns if they don't exist (for existing tables)
DO $$ BEGIN
  ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
  ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS error_message text;
  ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS name text;
  ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS birth_date text;
  ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS birth_time text;
  ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS prescription_title text;
  ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS closing_dua text;
  ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS recommended_action text;
  ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS current_step integer DEFAULT 0;
  ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add check constraint if missing
DO $$ BEGIN
  ALTER TABLE public.dhikr_sessions DROP CONSTRAINT IF EXISTS dhikr_sessions_status_check;
  ALTER TABLE public.dhikr_sessions ADD CONSTRAINT dhikr_sessions_status_check 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.dhikr_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own dhikr sessions." ON public.dhikr_sessions;
  DROP POLICY IF EXISTS "Users can create their own dhikr sessions." ON public.dhikr_sessions;
  DROP POLICY IF EXISTS "Users can update their own dhikr sessions." ON public.dhikr_sessions;
  DROP POLICY IF EXISTS "Users can delete their own dhikr sessions." ON public.dhikr_sessions;
  DROP POLICY IF EXISTS "Service role full access" ON public.dhikr_sessions;
END $$;

CREATE POLICY "Users can view their own dhikr sessions."
  ON public.dhikr_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dhikr sessions."
  ON public.dhikr_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dhikr sessions."
  ON public.dhikr_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dhikr sessions."
  ON public.dhikr_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- CRITICAL: Service role needs INSERT for Edge Functions
CREATE POLICY "Service role full access"
  ON public.dhikr_sessions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');


-- ============================================
-- 3. DREAM_INTERPRETATIONS TABLE (AI Handler Ready)
-- ============================================
CREATE TABLE IF NOT EXISTS public.dream_interpretations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- User Input
  dream_text text NOT NULL,
  name text,
  birth_date text,
  birth_time text,
  birth_place text,
  
  -- AI Output
  summary text,
  symbols jsonb,
  personal_interpretation text,
  spiritual_advice text,
  warning text,
  recommended_action text,
  
  -- Status for Realtime
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  
  -- Idempotency
  request_hash text,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns if they don't exist
DO $$ BEGIN
  ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
  ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS error_message text;
  ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS name text;
  ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS birth_time text;
  ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS birth_place text;
  ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS recommended_action text;
  ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

ALTER TABLE public.dream_interpretations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own dream interpretations." ON public.dream_interpretations;
  DROP POLICY IF EXISTS "Users can create their own dream interpretations." ON public.dream_interpretations;
  DROP POLICY IF EXISTS "Users can delete their own dream interpretations." ON public.dream_interpretations;
  DROP POLICY IF EXISTS "Service role full access" ON public.dream_interpretations;
END $$;

CREATE POLICY "Users can view their own dream interpretations."
  ON public.dream_interpretations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dream interpretations."
  ON public.dream_interpretations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dream interpretations."
  ON public.dream_interpretations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
  ON public.dream_interpretations FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');


-- ============================================
-- 4. SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.settings (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  language text DEFAULT 'tr',
  notifications_enabled boolean DEFAULT true,
  prayer_notifications boolean DEFAULT true,
  haptic_enabled boolean DEFAULT true,
  theme text DEFAULT 'system',
  calculation_method integer DEFAULT 13,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own settings." ON public.settings;
  DROP POLICY IF EXISTS "Users can insert their own settings." ON public.settings;
  DROP POLICY IF EXISTS "Users can update their own settings." ON public.settings;
  DROP POLICY IF EXISTS "Users can delete their own settings." ON public.settings;
END $$;

CREATE POLICY "Users can view their own settings."
  ON public.settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings."
  ON public.settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings."
  ON public.settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings."
  ON public.settings FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dhikr_sessions_user_id ON public.dhikr_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_dhikr_sessions_status ON public.dhikr_sessions(status);
CREATE INDEX IF NOT EXISTS idx_dhikr_sessions_created_at ON public.dhikr_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dhikr_sessions_request_hash ON public.dhikr_sessions(request_hash);
CREATE INDEX IF NOT EXISTS idx_dream_interpretations_user_id ON public.dream_interpretations(user_id);
CREATE INDEX IF NOT EXISTS idx_dream_interpretations_status ON public.dream_interpretations(status);
CREATE INDEX IF NOT EXISTS idx_dream_interpretations_created_at ON public.dream_interpretations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dream_interpretations_request_hash ON public.dream_interpretations(request_hash);


-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-create settings on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_profile_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.settings (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_settings ON public.profiles;
CREATE TRIGGER on_profile_created_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_profile_settings();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_settings_updated ON public.settings;
CREATE TRIGGER on_settings_updated
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_dhikr_sessions_updated ON public.dhikr_sessions;
CREATE TRIGGER on_dhikr_sessions_updated
  BEFORE UPDATE ON public.dhikr_sessions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_dream_interpretations_updated ON public.dream_interpretations;
CREATE TRIGGER on_dream_interpretations_updated
  BEFORE UPDATE ON public.dream_interpretations
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- ============================================
-- 7. ENABLE REALTIME
-- ============================================
-- Run these in Supabase Dashboard > Database > Replication
-- ALTER PUBLICATION supabase_realtime ADD TABLE dhikr_sessions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE dream_interpretations;

-- Verification query
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
