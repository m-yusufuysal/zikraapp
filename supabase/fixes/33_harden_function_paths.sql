-- ============================================
-- ISLAMVY SECURITY HARDENING: FUNCTION SEARCH PATHS
-- Fixes: function_search_path_mutable (Supabase Lint 0011)
-- Purpose: Prevents search path hijacking by pinning functions to the 'public' schema.
-- ============================================

-- Hardening the functions identified by the Supabase Security Advisor:

ALTER FUNCTION public.check_hatim_completion() SET search_path = public;
ALTER FUNCTION public.notify_on_dhikr_completed() SET search_path = public;
ALTER FUNCTION public.handle_community_interaction() SET search_path = public;
ALTER FUNCTION public.check_post_completion() SET search_path = public;
ALTER FUNCTION public.notify_on_post_completed() SET search_path = public;
ALTER FUNCTION public.handle_community_interaction_cleanup() SET search_path = public;
ALTER FUNCTION public.handle_hatim_slot_user_deleted() SET search_path = public;
ALTER FUNCTION public.check_device_account_limit(TEXT) SET search_path = public;
ALTER FUNCTION public.fn_check_ai_limit(UUID, TEXT, TEXT) SET search_path = public;
ALTER FUNCTION public.fn_increment_ai_usage(UUID, TEXT, TEXT) SET search_path = public;
ALTER FUNCTION public.notify_on_hatim_completed() SET search_path = public;
ALTER FUNCTION public.fn_is_ip_blocked(TEXT) SET search_path = public;
ALTER FUNCTION public.fn_check_rate_limit(TEXT, INTEGER, INTEGER) SET search_path = public;

-- Also checking and hardening common trigger functions if they were missed in previous runs
-- (Safe to run multiple times)
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Maintenance
ANALYZE;

NOTIFY pgrst, 'reload config';

COMMENT ON TABLE public.profiles IS 'Functions hardened with fixed search_path to prevent hijacking.';
