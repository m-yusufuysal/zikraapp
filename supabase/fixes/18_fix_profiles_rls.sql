-- ============================================
-- Zikra App - Profiles Permission & Location Fix
-- 1. Unlocks Profiles Data (so notifications show Names, not "Someone")
-- 2. Adds Location Support (City/Country)
-- ============================================

-- 1. Add LOCATION column to profiles if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'location') THEN
        ALTER TABLE public.profiles ADD COLUMN location text;
    END IF;
END $$;

-- 2. RESET RLS POLICIES FOR PROFILES
-- We need to ensure AUTHENTICATED users can READ essential profile info (Name, Avatar, Location) of OTHERS.
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles access" ON public.profiles;

-- Allow users to UPDATE/DELETE only their own profile
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow authenticated users to VIEW ALL profiles (Essential for Community Features)
CREATE POLICY "Users can view all profiles" 
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- Service Role Bypass
CREATE POLICY "Service role full access" 
    ON public.profiles FOR ALL 
    TO service_role 
    USING (true);

-- 3. refresh schema cache workaround
NOTIFY pgrst, 'reload config';
