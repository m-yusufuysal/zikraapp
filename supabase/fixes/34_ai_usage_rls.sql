-- ============================================
-- ISLAMVY SECURITY HARDENING: AI_USAGE RLS
-- Fixes: rls_enabled_no_policy (Supabase Lint 0008)
-- ============================================

-- 1. Ensure RLS is enabled
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies just in case
DROP POLICY IF EXISTS "Users can view own usage" ON public.ai_usage;
DROP POLICY IF EXISTS "Service role full access" ON public.ai_usage;

-- 3. Policy: Allow users to see their own usage records
CREATE POLICY "Users can view own usage" 
    ON public.ai_usage FOR SELECT 
    TO authenticated 
    USING ((select auth.uid()) = user_id);

-- 4. Policy: Allow service role (Edge Functions/Admins) full access
CREATE POLICY "Service role full access" 
    ON public.ai_usage FOR ALL 
    TO service_role 
    USING (true);

-- Maintenance
NOTIFY pgrst, 'reload config';

COMMENT ON TABLE public.ai_usage IS 'Tracks AI usage with RLS enabled. Users can only see their own usage data.';
