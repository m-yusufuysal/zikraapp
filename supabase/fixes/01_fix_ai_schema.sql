-- ============================================
-- Islamvy App - Schema Fix Script
-- Run this in the Supabase SQL Editor to fix missing columns
-- ============================================

DO $$
BEGIN
    -- 1. Fix 'dream_interpretations' table
    -- Add 'dream_text' if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dream_interpretations' AND column_name='dream_text') THEN
        ALTER TABLE public.dream_interpretations ADD COLUMN dream_text text;
    END IF;

    -- Add 'request_hash' if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dream_interpretations' AND column_name='request_hash') THEN
        ALTER TABLE public.dream_interpretations ADD COLUMN request_hash text unique;
    END IF;

    -- 2. Fix 'dhikr_sessions' table
    -- Add 'request_hash' if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dhikr_sessions' AND column_name='request_hash') THEN
        ALTER TABLE public.dhikr_sessions ADD COLUMN request_hash text unique;
    END IF;

    -- Add other potentially missing AI fields to dhikr_sessions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dhikr_sessions' AND column_name='esma') THEN
        ALTER TABLE public.dhikr_sessions ADD COLUMN esma text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dhikr_sessions' AND column_name='daily_dua') THEN
        ALTER TABLE public.dhikr_sessions ADD COLUMN daily_dua text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dhikr_sessions' AND column_name='numerology_analysis') THEN
        ALTER TABLE public.dhikr_sessions ADD COLUMN numerology_analysis text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dhikr_sessions' AND column_name='personal_warning') THEN
        ALTER TABLE public.dhikr_sessions ADD COLUMN personal_warning text;
    END IF;

    -- 3. Verify RLS is enabled (Safety check)
    ALTER TABLE public.dream_interpretations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.dhikr_sessions ENABLE ROW LEVEL SECURITY;

END $$;
