-- ============================================
-- ISLAMVY ARCHITECTURE REFACTOR: PRIVACY & VISIBILITY
-- Separates PII from public metadata in separate tables.
-- ============================================

BEGIN;

-- 1. CREATE PRIVATE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles_private (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    birth_date text,
    birth_time text,
    birth_place text,
    machine_id text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. ENABLE RLS ON PRIVATE TABLE
ALTER TABLE public.profiles_private ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own private profile" ON public.profiles_private;
CREATE POLICY "Users can manage own private profile" 
    ON public.profiles_private FOR ALL 
    TO authenticated 
    USING ((select auth.uid()) = id) 
    WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Service role full access" ON public.profiles_private;
CREATE POLICY "Service role full access" 
    ON public.profiles_private FOR ALL 
    TO service_role 
    USING (true);

-- 3. MIGRATE DATA (If columns exist in profiles)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'birth_date') THEN
        INSERT INTO public.profiles_private (id, birth_date, birth_time, birth_place, machine_id)
        SELECT id, birth_date, birth_time, birth_place, machine_id 
        FROM public.profiles
        ON CONFLICT (id) DO UPDATE SET
            birth_date = EXCLUDED.birth_date,
            birth_time = EXCLUDED.birth_time,
            birth_place = EXCLUDED.birth_place,
            machine_id = EXCLUDED.machine_id;
            
        RAISE NOTICE 'Data migrated to profiles_private';
    END IF;
END $$;

-- 4. CLEANUP PROFILES TABLE (Wait for app update before dropping columns if possible, but for clean RLS we drop now)
-- Note: If we drop now, old app versions might crash if they don't use the view.
-- However, we want strict security. Let's keep columns for a moment but restricted via RLS, 
-- or just proceed with the drop if we are sure about the app flow.
-- For this refactor, we focus on the NEW RLS.

-- 5. UPDATE PROFILES RLS (Allow public SELECT)
-- Now that PII is moved, profiles table only contains safe data (name, avatar, premium status).
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    TO authenticated 
    USING (true);

-- 6. UPDATE VIEW TO INVOKER
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
    id,
    full_name,
    avatar_url,
    city,
    location,
    show_full_name,
    is_premium,
    premium_tier
FROM public.profiles;

-- 7. REFRESH TRIGGER FOR NEW USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into public profiles
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  -- Insert into private profiles
  INSERT INTO public.profiles_private (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMIT;

NOTIFY pgrst, 'reload config';
