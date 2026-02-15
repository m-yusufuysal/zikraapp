-- ============================================
-- Islamvy App - Security Hardening (Fixing Lints)
-- ============================================

-- Fix 1: function_search_path_mutable (LINT 0011)
-- Setting fixed search_path to public to prevent search path hijacking.
ALTER FUNCTION public.send_push_on_notification() SET search_path = public;

-- Fix 2: rls_policy_always_true (LINT 0024)
-- Tightening RLS for shop_analytics. Instead of WITH CHECK (true), 
-- we ensure the insert comes from an app role (anon or authenticated)
-- and has basic required data.
DROP POLICY IF EXISTS "Allow public insert to analytics" ON public.shop_analytics;
CREATE POLICY "Allow public insert to analytics"
ON public.shop_analytics FOR INSERT
TO public
WITH CHECK (
  (auth.role() = 'anon' OR auth.role() = 'authenticated') AND
  click_type IS NOT NULL AND
  product_id IS NOT NULL
);

-- Fix 3: Security Hardening for get_daily_quote (if it exists)
-- It's good practice to set search_path for all public functions
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_daily_quote' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.get_daily_quote() SET search_path = public;
    END IF;
END $$;

-- Note on Fix 4 (auth_leaked_password_protection):
-- This must be enabled in the Supabase Dashboard:
-- Dashboard > Auth > Settings > Password Protection > Enable "Leaked password protection"
