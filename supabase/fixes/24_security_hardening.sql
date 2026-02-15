-- ============================================
-- Islamvy App - Security Hardening
-- Version 1.0
-- Addresses: function_search_path_mutable & rls_policy_always_true
-- ============================================

BEGIN;

-- 1. HARDEN FUNCTION SEARCH PATHS
-- Setting search_path to 'public' (or a fixed path) prevents search path hijacking
-------------------------------------------------------

ALTER FUNCTION public.handle_community_interaction() SET search_path = public;
ALTER FUNCTION public.notify_on_hatim_slot_taken() SET search_path = public;
ALTER FUNCTION public.notify_on_hatim_completed() SET search_path = public;
ALTER FUNCTION public.notify_on_new_product() SET search_path = public;
ALTER FUNCTION public.handle_referral_conversion() SET search_path = public;
ALTER FUNCTION public.notify_on_community_interaction() SET search_path = public;


-- 2. HARDEN NOTIFICATION RLS
-- Restricts who can manually insert notifications. 
-- SECURITY DEFINER triggers still work for everyone.
-------------------------------------------------------

DROP POLICY IF EXISTS "System insert notifications" ON public.community_notifications;
CREATE POLICY "System insert notifications" 
    ON public.community_notifications FOR INSERT 
    TO service_role 
    WITH CHECK (true);


-- 3. HOUSEKEEPING
-------------------------------------------------------
ANALYZE;

COMMIT;
