-- ============================================
-- ISLAMVY SECURITY HARDENING: PROFILES TABLE
-- Fixes: Unauthorized data scraping risk
-- ============================================

-- 1. DROP OVERLY PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view safe profile data" ON public.profiles;

-- 2. RESTRICT PROFILES TABLE (Current user only)
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
CREATE POLICY "Users can view own profile only" 
    ON public.profiles FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = id);

-- 3. CREATE PUBLIC VIEW FOR COMMUNITY FEATURES
-- This view only exposes non-sensitive information.
-- WITH (security_invoker = true) ensures the view respects RLS of the querying user.
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

-- Deny direct access to the view except for authenticated users
-- (Supabase handles this via API if we use RLS on the table, but views need their own care)
-- Actually, a better Supabase pattern is to let the table be restricted and use a function 
-- or a separate public table. 
-- For now, let's stick to the technical consultation advice: 
-- "Restrict access to PII like email or machine_id."

-- 4. HARDEN UPDATE POLICY
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = id)
    WITH CHECK ((select auth.uid()) = id);

-- 4. ANALYTICS LOGS FINAL LOCKDOWN
-- Ensure no one can read analytics logs except service_role
DROP POLICY IF EXISTS "Analytics read" ON public.analytics_logs;
DROP POLICY IF EXISTS "Only admins can read analytics" ON public.analytics_logs;
CREATE POLICY "Only admins can read analytics" 
    ON public.analytics_logs FOR SELECT 
    TO service_role 
    USING (true);

-- 5. REFRESH
NOTIFY pgrst, 'reload config';

COMMENT ON TABLE public.profiles IS 'User profiles with hardened RLS. Private data must stay in auth.users or be split into a private_profiles table if needed.';
