-- ============================================
-- Islamvy App - Schema Migration Fix
-- Add missing columns to existing tables
-- ============================================

-- Add birth_place column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'birth_place') THEN
        ALTER TABLE public.profiles ADD COLUMN birth_place text;
        RAISE NOTICE 'Added birth_place column to profiles table';
    ELSE
        RAISE NOTICE 'birth_place column already exists in profiles table';
    END IF;
END $$;

-- Add birth_time column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'birth_time') THEN
        ALTER TABLE public.profiles ADD COLUMN birth_time text;
        RAISE NOTICE 'Added birth_time column to profiles table';
    ELSE
        RAISE NOTICE 'birth_time column already exists in profiles table';
    END IF;
END $$;

-- Add birth_date column to profiles table if it doesn't exist
-- NOTE: This should be TEXT type to store DD/MM/YYYY format
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'birth_date') THEN
        ALTER TABLE public.profiles ADD COLUMN birth_date text;
        RAISE NOTICE 'Added birth_date column (text type) to profiles table';
    ELSE
        RAISE NOTICE 'birth_date column already exists in profiles table';
    END IF;
END $$;

-- Refresh the schema cache by recreating the policy (this forces a schema refresh)
-- This is a workaround for the Supabase schema cache issue
DO $$ 
BEGIN
    -- Drop and recreate one policy to refresh the cache
    DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
    CREATE POLICY "Users can update their own profile."
        ON public.profiles FOR UPDATE USING (auth.uid() = id);
    RAISE NOTICE 'Schema cache refreshed';
END $$;

-- Verify the columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;
