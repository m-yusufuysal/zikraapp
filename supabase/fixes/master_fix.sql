-- ============================================
-- MASTER SUPABASE PERFORMANCE & SECURITY FIX
-- Version 3.0 (Consolidated)
-- ============================================

-- 1. CLEAN SLATE: DROP POLICIES FOR ALL TABLES WE MANAGE
DO $$ 
DECLARE 
    r record;
BEGIN
    FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'dhikr_sessions', 'dream_interpretations', 'settings', 'app_config', 'blocked_ips', 'rate_limits', 'prayer_logs', 'favorites', 'analytics_logs')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 2. PERFORMANCE & SECURITY OPTIMIZED POLICIES (TO clause + subqueries)

-- PROFILES
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL TO authenticated USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "Service role full access" ON public.profiles FOR ALL TO service_role USING (true);

-- DHIKR_SESSIONS
CREATE POLICY "Users can manage own dhikr sessions" ON public.dhikr_sessions FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Service role full access" ON public.dhikr_sessions FOR ALL TO service_role USING (true);

-- DREAM_INTERPRETATIONS
CREATE POLICY "Users can manage own dreams" ON public.dream_interpretations FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Service role full access" ON public.dream_interpretations FOR ALL TO service_role USING (true);

-- SETTINGS
CREATE POLICY "Users can manage own settings" ON public.settings FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- APP_CONFIG
CREATE POLICY "Allow public read access" ON public.app_config FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow service role write access" ON public.app_config FOR ALL TO service_role USING (true);

-- BLOCKED_IPS
CREATE POLICY "Service role full access" ON public.blocked_ips FOR ALL TO service_role USING (true);

-- RATE_LIMITS
CREATE POLICY "Service role full access" ON public.rate_limits FOR ALL TO service_role USING (true);

-- ANALYTICS_LOGS
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_logs' AND table_schema = 'public') THEN
        CREATE POLICY "Analytics insert public" ON public.analytics_logs FOR INSERT TO anon, authenticated 
        WITH CHECK ((SELECT auth.uid()) IS NOT NULL OR (SELECT auth.role()) = 'anon');
    END IF;
END $$;

-- PRAYER_LOGS (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prayer_logs' AND table_schema = 'public') THEN
        CREATE POLICY "Users can manage own prayer logs" ON public.prayer_logs FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
    END IF;
END $$;

-- FAVORITES (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorites' AND table_schema = 'public') THEN
        CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
    END IF;
END $$;

-- 3. INDEX MANAGEMENT (Remove Duplicates & Unused)
DROP INDEX IF EXISTS public.idx_dreams_status;
DROP INDEX IF EXISTS public.idx_profiles_created_at;
DROP INDEX IF EXISTS public.idx_profiles_premium_tier;
DROP INDEX IF EXISTS public.idx_favorites_user_id;
DROP INDEX IF EXISTS public.idx_favorites_type;
DROP INDEX IF EXISTS public.idx_prayer_logs_user_id;
DROP INDEX IF EXISTS public.idx_prayer_logs_date;
DROP INDEX IF EXISTS public.idx_dhikr_list_gin;
DROP INDEX IF EXISTS public.idx_analytics_logs_user_id;

-- Constraint Fix for Favorites
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorites' AND table_schema = 'public') THEN
        ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS unique_user_fav;
    END IF;
EXCEPTION WHEN OTHERS THEN 
    DROP INDEX IF EXISTS public.unique_user_fav;
END $$;

-- 4. INDEX MANAGEMENT (Final Optimization)
-- Restore analytics_logs index (It's an INFO warning if missing, and an INFO warning if unused.
-- We keep it because indexing foreign keys is best practice for delete/join performance).
CREATE INDEX IF NOT EXISTS idx_analytics_logs_user_id ON public.analytics_logs(user_id);

-- 5. SECURITY HARDENING: FUNCTION SEARCH PATHS
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_new_profile_settings() SET search_path = public;
ALTER FUNCTION public.fn_is_ip_blocked(text) SET search_path = public;
ALTER FUNCTION public.fn_check_rate_limit(text, int, int) SET search_path = public;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user_settings' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.handle_new_user_settings() SET search_path = public;
    END IF;
END $$;

-- 6. MAINTENANCE (Resolves catalog slowness)
ANALYZE;

-- 7. FINAL VERIFICATION
SELECT tablename, policyname, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
SELECT proname, proconfig FROM pg_proc WHERE pronamespace = 'public'::regnamespace AND proname IN ('handle_updated_at', 'handle_new_user', 'handle_new_profile_settings', 'fn_is_ip_blocked', 'fn_check_rate_limit');
