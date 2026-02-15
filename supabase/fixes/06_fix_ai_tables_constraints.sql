-- ============================================
-- Islamvy App - Fix dream_interpretations user_id constraint
-- Allows Edge Function to create records even if user profile doesn't exist
-- ============================================

-- The user_id column has a foreign key to profiles with NOT NULL constraint
-- This causes issues when the user's profile hasn't been created yet
-- Solution: Allow NULL for user_id (for guest/anonymous interpretations)

-- 1. Drop the NOT NULL constraint from user_id column
DO $$ 
BEGIN
    -- Check if the column is NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'dream_interpretations' 
        AND column_name = 'user_id'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.dream_interpretations ALTER COLUMN user_id DROP NOT NULL;
        RAISE NOTICE 'Made user_id nullable in dream_interpretations table';
    ELSE
        RAISE NOTICE 'user_id is already nullable in dream_interpretations table';
    END IF;
END $$;

-- 2. Same fix for dhikr_sessions
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'dhikr_sessions' 
        AND column_name = 'user_id'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.dhikr_sessions ALTER COLUMN user_id DROP NOT NULL;
        RAISE NOTICE 'Made user_id nullable in dhikr_sessions table';
    ELSE
        RAISE NOTICE 'user_id is already nullable in dhikr_sessions table';
    END IF;
END $$;

-- 3. Add recommended_action column to dhikr_sessions if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'dhikr_sessions' 
                   AND column_name = 'recommended_action') THEN
        ALTER TABLE public.dhikr_sessions ADD COLUMN recommended_action text;
        RAISE NOTICE 'Added recommended_action column to dhikr_sessions table';
    END IF;
END $$;

-- 4. Add recommended_action column to dream_interpretations if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'dream_interpretations' 
                   AND column_name = 'recommended_action') THEN
        ALTER TABLE public.dream_interpretations ADD COLUMN recommended_action text;
        RAISE NOTICE 'Added recommended_action column to dream_interpretations table';
    END IF;
END $$;

-- Verify the changes
SELECT 
    table_name, 
    column_name, 
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('dream_interpretations', 'dhikr_sessions')
AND column_name IN ('user_id', 'recommended_action')
ORDER BY table_name, column_name;
