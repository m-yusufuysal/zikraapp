-- ============================================
-- Zikra App - Fix Security Definer View
-- Version 1.0
-- Addresses: security_definer_view (ERROR)
-- ============================================

BEGIN;

-- 1. DROP AND RECREATE INFLUENCER DASHBOARD STATS VIEW
-- Recreating with security_invoker = true to ensure RLS is enforced
-------------------------------------------------------

DROP VIEW IF EXISTS public.influencer_dashboard_stats;

CREATE VIEW public.influencer_dashboard_stats 
WITH (security_invoker = true)
AS
SELECT 
    i.user_id as owner_id,
    i.id as influencer_id,
    i.referral_code,
    COUNT(r.id) FILTER (WHERE r.status = 'clicked') as click_count,
    COUNT(r.id) FILTER (WHERE r.status = 'registered') as registration_count,
    COUNT(r.id) FILTER (WHERE r.status = 'converted') as conversion_count,
    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'pending'), 0) as pending_payout,
    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'paid'), 0) as total_paid
FROM public.influencers i
LEFT JOIN public.referrals r ON i.id = r.influencer_id
LEFT JOIN public.influencer_payouts p ON i.id = p.influencer_id
GROUP BY i.id, i.user_id;

-- 2. HOUSEKEEPING
-------------------------------------------------------
ANALYZE;

COMMIT;
