-- ============================================
-- MASTER SCHEMA FIX - RUN THIS IN SUPABASE SQL EDITOR
-- ============================================
-- This script ensures ALL required columns exist for the AI features to work correctly.
-- It is safe to run multiple times (Idempotent).

-- 0. CRITICAL PRE-CHECKS: Add potentially missing base columns first
ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS birth_date text;
ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS birth_time text;
ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS birth_place text;
ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS dream_text text;

-- 1. Ensure birth_place explicitly exists (Redundant but safe)
ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS birth_place text;

-- Relax constraints: Make user_id nullable just in case (optional, but prevents FK errors)
ALTER TABLE public.dream_interpretations ALTER COLUMN user_id DROP NOT NULL;

-- Relax constraints: Ensure birth_date is TEXT to accept 'DD/MM/YYYY'
ALTER TABLE public.dream_interpretations ALTER COLUMN birth_date TYPE text;

-- CRITICAL FIX: Handle legacy 'dream_description' column if it exists
DO $$ BEGIN
    ALTER TABLE public.dream_interpretations ALTER COLUMN dream_description DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Ensure standard 'dream_text' column exists
ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS dream_text text;

-- 2. Ensure dhikr_sessions has all potential missing columns
ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS birth_date text;
ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS birth_time text;
ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS recommended_action text;
ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS dhikr_list jsonb;

-- 3. Verify RLS Policies (Critical for Edge Function Inserts)
DROP POLICY IF EXISTS "Service role full access" ON public.dream_interpretations;
CREATE POLICY "Service role full access" ON public.dream_interpretations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON public.dhikr_sessions;
CREATE POLICY "Service role full access" ON public.dhikr_sessions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 4. FIX DHIKR_SESSIONS TABLE (Original columns, ensuring idempotency)
-- Used by: generate-dhikr Edge Function
ALTER TABLE public.dhikr_sessions
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS error_message text,
ADD COLUMN IF NOT EXISTS closing_dua text,
ADD COLUMN IF NOT EXISTS prescription_title text,
ADD COLUMN IF NOT EXISTS numerology_analysis text,
ADD COLUMN IF NOT EXISTS esma text,
ADD COLUMN IF NOT EXISTS daily_dua text,
ADD COLUMN IF NOT EXISTS personal_warning text,
ADD COLUMN IF NOT EXISTS target_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS request_hash text;

-- Ensure status constraint exists
DO $$ BEGIN
  ALTER TABLE public.dhikr_sessions DROP CONSTRAINT IF EXISTS dhikr_sessions_status_check;
  ALTER TABLE public.dhikr_sessions ADD CONSTRAINT dhikr_sessions_status_check 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 2. FIX DREAM_INTERPRETATIONS TABLE
-- Used by: interpret-dream Edge Function
ALTER TABLE public.dream_interpretations 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS error_message text,
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS symbols jsonb,
ADD COLUMN IF NOT EXISTS personal_interpretation text,
ADD COLUMN IF NOT EXISTS spiritual_advice text,
ADD COLUMN IF NOT EXISTS warning text,
ADD COLUMN IF NOT EXISTS recommended_action text, -- THE MAIN CULPRIT
ADD COLUMN IF NOT EXISTS request_hash text;

-- Ensure status constraint exists
DO $$ BEGIN
  ALTER TABLE public.dream_interpretations DROP CONSTRAINT IF EXISTS dream_interpretations_status_check;
  ALTER TABLE public.dream_interpretations ADD CONSTRAINT dream_interpretations_status_check 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. VERIFY
-- Returns the columns to confirm they exist
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('dhikr_sessions', 'dream_interpretations')
ORDER BY table_name, column_name;
