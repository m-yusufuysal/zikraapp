-- ============================================
-- Zikra App - Schema Migration
-- Add premium status columns to profiles table
-- ============================================

-- Add is_premium column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'is_premium') THEN
        ALTER TABLE public.profiles ADD COLUMN is_premium boolean DEFAULT false;
        RAISE NOTICE 'Added is_premium column to profiles table';
    ELSE
        RAISE NOTICE 'is_premium column already exists in profiles table';
    END IF;
END $$;

-- Add premium_tier column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'premium_tier') THEN
        ALTER TABLE public.profiles ADD COLUMN premium_tier text;
        RAISE NOTICE 'Added premium_tier column to profiles table';
    ELSE
        RAISE NOTICE 'premium_tier column already exists in profiles table';
    END IF;
END $$;

-- Refresh schema cache
DO $$ 
BEGIN
    -- Drop and recreate policy (trick to refresh cache)
    DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
    CREATE POLICY "Users can update their own profile."
        ON public.profiles FOR UPDATE USING (auth.uid() = id);
    RAISE NOTICE 'Schema cache refreshed';
END $$;
