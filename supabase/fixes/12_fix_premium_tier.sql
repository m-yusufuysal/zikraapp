-- ============================================
-- Islamvy App - Schema Migration
-- Fix premium_tier column and update existing premium users
-- ============================================

-- 1. Add premium_tier column if it doesn't exist
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

-- 2. Add constraint for valid tier values
DO $$
BEGIN
    -- Drop existing constraint if any
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_premium_tier_check;
    
    -- Add the constraint
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_premium_tier_check 
        CHECK (premium_tier IS NULL OR premium_tier IN ('starter', 'pro', 'unlimited'));
    
    RAISE NOTICE 'Added premium_tier constraint';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Constraint may already exist or other error: %', SQLERRM;
END $$;

-- 3. CRITICAL: Update existing premium users who have no tier set
-- Set them to 'unlimited' so they don't hit rate limits
UPDATE public.profiles 
SET premium_tier = 'unlimited' 
WHERE is_premium = true AND (premium_tier IS NULL OR premium_tier = '');

-- 4. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_premium_tier ON public.profiles(premium_tier);

-- 5. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verification query
SELECT 
    id, 
    full_name, 
    is_premium, 
    premium_tier,
    updated_at
FROM public.profiles 
WHERE is_premium = true
LIMIT 10;
