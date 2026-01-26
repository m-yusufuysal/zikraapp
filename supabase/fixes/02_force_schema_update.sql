-- ============================================
-- Zikra App - FORCE FIX SCRIPT (Run this if AI errors persist)
-- ============================================

DO $$
BEGIN
    -- 1. DREAM INTERPRETATION FIXES
    RAISE NOTICE 'Fixing dream_interpretations table...';
    
    -- Ensure table exists
    CREATE TABLE IF NOT EXISTS public.dream_interpretations (
        id uuid default gen_random_uuid() primary key,
        user_id uuid references public.profiles(id) on delete cascade not null,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );

    -- Add columns safely
    ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS dream_text text;
    ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS summary text;
    ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS symbols jsonb;
    ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS personal_interpretation text;
    ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS spiritual_advice text;
    ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS warning text;
    ALTER TABLE public.dream_interpretations ADD COLUMN IF NOT EXISTS request_hash text unique;

    -- Enable RLS
    ALTER TABLE public.dream_interpretations ENABLE ROW LEVEL SECURITY;


    -- 2. DHIKR SESSION FIXES
    RAISE NOTICE 'Fixing dhikr_sessions table...';

    CREATE TABLE IF NOT EXISTS public.dhikr_sessions (
        id uuid default gen_random_uuid() primary key,
        user_id uuid references public.profiles(id) on delete cascade not null,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );

    ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS intention text;
    ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS dhikr_list jsonb;
    ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS completed_count integer default 0;
    ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS target_count integer default 0;
    ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS is_completed boolean default false;
    
    -- AI Specific Columns
    ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS numerology_analysis text;
    ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS esma text;
    ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS daily_dua text;
    ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS personal_warning text;
    ALTER TABLE public.dhikr_sessions ADD COLUMN IF NOT EXISTS request_hash text unique;

    -- Enable RLS
    ALTER TABLE public.dhikr_sessions ENABLE ROW LEVEL SECURITY;

    RAISE NOTICE 'Schema fix completed successfully.';

END $$;
