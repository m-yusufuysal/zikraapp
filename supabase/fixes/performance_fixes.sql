-- ============================================
-- SUPABASE PERFORMANCE & ARCHITECTURE OPTIMIZATION
-- Resolves: auth_rls_initplan, multiple_permissive_policies, duplicate_index
-- ============================================

-- 1. DROP ALL PROBLEMATIC POLICIES (Profiles, Sessions, Dreams, Settings, App Config, Logs, Favorites)
-- We drop everything first to ensure a clean state and resolve "multiple permissive policies".

DO $$ 
DECLARE 
    t text;
    p text;
BEGIN
    -- profiles
    FOR p IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', p);
    END LOOP;
    
    -- dhikr_sessions
    FOR p IN SELECT policyname FROM pg_policies WHERE tablename = 'dhikr_sessions' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.dhikr_sessions', p);
    END LOOP;

    -- dream_interpretations
    FOR p IN SELECT policyname FROM pg_policies WHERE tablename = 'dream_interpretations' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.dream_interpretations', p);
    END LOOP;

    -- settings
    FOR p IN SELECT policyname FROM pg_policies WHERE tablename = 'settings' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.settings', p);
    END LOOP;

    -- app_config
    FOR p IN SELECT policyname FROM pg_policies WHERE tablename = 'app_config' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.app_config', p);
    END LOOP;

    -- blocked_ips
    FOR p IN SELECT policyname FROM pg_policies WHERE tablename = 'blocked_ips' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.blocked_ips', p);
    END LOOP;

    -- rate_limits
    FOR p IN SELECT policyname FROM pg_policies WHERE tablename = 'rate_limits' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.rate_limits', p);
    END LOOP;

    -- prayer_logs (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prayer_logs' AND table_schema = 'public') THEN
        FOR p IN SELECT policyname FROM pg_policies WHERE tablename = 'prayer_logs' AND schemaname = 'public' LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.prayer_logs', p);
        END LOOP;
    END IF;

    -- favorites (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorites' AND table_schema = 'public') THEN
        FOR p IN SELECT policyname FROM pg_policies WHERE tablename = 'favorites' AND schemaname = 'public' LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.favorites', p);
        END LOOP;
    END IF;
END $$;

-- 2. RE-CREATE OPTIMIZED RLS POLICIES (auth_rls_initplan Fix)
-- Use (SELECT auth.uid()) and (SELECT auth.jwt()) to prevent row-by-row re-evaluation.

-- PROFILES
CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Service role full access"
  ON public.profiles FOR ALL
  USING (((SELECT auth.jwt()) ->> 'role') = 'service_role');

-- DHIKR_SESSIONS
CREATE POLICY "Users can manage own dhikr sessions"
  ON public.dhikr_sessions FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Service role full access"
  ON public.dhikr_sessions FOR ALL
  USING (((SELECT auth.jwt()) ->> 'role') = 'service_role');

-- DREAM_INTERPRETATIONS
CREATE POLICY "Users can manage own dreams"
  ON public.dream_interpretations FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Service role full access"
  ON public.dream_interpretations FOR ALL
  USING (((SELECT auth.jwt()) ->> 'role') = 'service_role');

-- SETTINGS
CREATE POLICY "Users can manage own settings"
  ON public.settings FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- APP_CONFIG
CREATE POLICY "Allow public read access"
  ON public.app_config FOR SELECT
  USING (true);

CREATE POLICY "Allow service role write access"
  ON public.app_config FOR ALL
  USING (((SELECT auth.jwt()) ->> 'role') = 'service_role');

-- BLOCKED_IPS
CREATE POLICY "Service role full access"
  ON public.blocked_ips FOR ALL
  USING (((SELECT auth.jwt()) ->> 'role') = 'service_role');

-- RATE_LIMITS
CREATE POLICY "Service role full access"
  ON public.rate_limits FOR ALL
  USING (((SELECT auth.jwt()) ->> 'role') = 'service_role');

-- PRAYER_LOGS (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prayer_logs' AND table_schema = 'public') THEN
        CREATE POLICY "Users can manage own prayer logs"
          ON public.prayer_logs FOR ALL
          USING ((SELECT auth.uid()) = user_id)
          WITH CHECK ((SELECT auth.uid()) = user_id);
    END IF;
END $$;

-- FAVORITES (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorites' AND table_schema = 'public') THEN
        CREATE POLICY "Users can manage own favorites"
          ON public.favorites FOR ALL
          USING ((SELECT auth.uid()) = user_id)
          WITH CHECK ((SELECT auth.uid()) = user_id);
    END IF;
END $$;

-- 3. REMOVE DUPLICATE INDEXES (duplicate_index Fix)

DROP INDEX IF EXISTS public.idx_dreams_status;

-- Use ALTER TABLE to drop constraint as dropping index directly fails if it's tied to a constraint
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorites' AND table_schema = 'public') THEN
        ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS unique_user_fav;
    END IF;
EXCEPTION WHEN OTHERS THEN 
    DROP INDEX IF EXISTS public.unique_user_fav;
END $$;

-- 4. FINAL VERIFICATION
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('dream_interpretations', 'favorites')
ORDER BY tablename;
