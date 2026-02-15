-- ============================================
-- SUPABASE PERFORMANCE & ARCHITECTURE OPTIMIZATION (VERSION 2.0)
-- Resolves: auth_rls_initplan, multiple_permissive_policies, duplicate_index
-- IMPORTANT: Now uses explicit TO clauses to satisfy the linter.
-- ============================================

-- 1. DROP ALL EXISTING POLICIES (CLEAN SLATE)
DO $$ 
DECLARE 
    r record;
BEGIN
    FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'dhikr_sessions', 'dream_interpretations', 'settings', 'app_config', 'blocked_ips', 'rate_limits', 'prayer_logs', 'favorites')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 2. RE-CREATE OPTIMIZED & ROLE-SPECIFIC POLICIES

-- PROFILES
CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Service role full access"
  ON public.profiles FOR ALL
  TO service_role
  USING (true); -- TO service_role automatically handles the role check

-- DHIKR_SESSIONS
CREATE POLICY "Users can manage own dhikr sessions"
  ON public.dhikr_sessions FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Service role full access"
  ON public.dhikr_sessions FOR ALL
  TO service_role
  USING (true);

-- DREAM_INTERPRETATIONS
CREATE POLICY "Users can manage own dreams"
  ON public.dream_interpretations FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Service role full access"
  ON public.dream_interpretations FOR ALL
  TO service_role
  USING (true);

-- SETTINGS
CREATE POLICY "Users can manage own settings"
  ON public.settings FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- APP_CONFIG
CREATE POLICY "Allow public read access"
  ON public.app_config FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow service role write access"
  ON public.app_config FOR ALL
  TO service_role
  USING (true);

-- BLOCKED_IPS
CREATE POLICY "Service role full access"
  ON public.blocked_ips FOR ALL
  TO service_role
  USING (true);

-- RATE_LIMITS
CREATE POLICY "Service role full access"
  ON public.rate_limits FOR ALL
  TO service_role
  USING (true);

-- PRAYER_LOGS (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prayer_logs' AND table_schema = 'public') THEN
        CREATE POLICY "Users can manage own prayer logs"
          ON public.prayer_logs FOR ALL
          TO authenticated
          USING ((SELECT auth.uid()) = user_id)
          WITH CHECK ((SELECT auth.uid()) = user_id);
    END IF;
END $$;

-- FAVORITES (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorites' AND table_schema = 'public') THEN
        CREATE POLICY "Users can manage own favorites"
          ON public.favorites FOR ALL
          TO authenticated
          USING ((SELECT auth.uid()) = user_id)
          WITH CHECK ((SELECT auth.uid()) = user_id);
    END IF;
END $$;

-- 3. REMOVE DUPLICATE & UNUSED INDEXES (duplicate_index, unused_index Fix)

-- Duplicate
DROP INDEX IF EXISTS public.idx_dreams_status;

-- Unused
DROP INDEX IF EXISTS public.idx_profiles_created_at;
DROP INDEX IF EXISTS public.idx_profiles_premium_tier;
DROP INDEX IF EXISTS public.idx_favorites_user_id;
DROP INDEX IF EXISTS public.idx_favorites_type;
DROP INDEX IF EXISTS public.idx_prayer_logs_user_id;
DROP INDEX IF EXISTS public.idx_prayer_logs_date;
DROP INDEX IF EXISTS public.idx_dhikr_list_gin;
DROP INDEX IF EXISTS public.idx_analytics_logs_user_id;

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
