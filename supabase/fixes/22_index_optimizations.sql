-- ============================================
-- Zikra App - Index Optimizations
-- Version 1.0
-- Addresses: unindexed_foreign_keys & unused_index
-- ============================================

BEGIN;

-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- These improve join performance and speed up cascaded deletes
-------------------------------------------------------

-- Table: public.community_interactions
CREATE INDEX IF NOT EXISTS idx_community_interactions_user_id ON public.community_interactions(user_id);

-- Table: public.community_notifications
CREATE INDEX IF NOT EXISTS idx_community_notifications_hatim_id ON public.community_notifications(hatim_id);
CREATE INDEX IF NOT EXISTS idx_community_notifications_post_id ON public.community_notifications(post_id);
CREATE INDEX IF NOT EXISTS idx_community_notifications_sender_id ON public.community_notifications(sender_id);

-- Table: public.community_reports
CREATE INDEX IF NOT EXISTS idx_community_reports_post_id ON public.community_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_reporter_id ON public.community_reports(reporter_id);

-- Table: public.hatim_groups
CREATE INDEX IF NOT EXISTS idx_hatim_groups_created_by ON public.hatim_groups(created_by);

-- Table: public.influencer_payouts
CREATE INDEX IF NOT EXISTS idx_influencer_payouts_influencer_id ON public.influencer_payouts(influencer_id);
CREATE INDEX IF NOT EXISTS idx_influencer_payouts_referral_id ON public.influencer_payouts(referral_id);


-- 2. REMOVE UNUSED OR REDUNDANT INDEXES
-- Redundant and unused indexes slow down INSERT/UPDATE/DELETE operations
-------------------------------------------------------

-- Redundant UNIQUE index (Postgres automatically creates an index for UNIQUE constraints)
DROP INDEX IF EXISTS public.idx_influencers_referral_code;

-- Unused indexes as identified by Supabase Linter
DROP INDEX IF EXISTS public.idx_analytics_logs_user_id;
DROP INDEX IF EXISTS public.idx_referrals_referred_user_id;
DROP INDEX IF EXISTS public.idx_community_notifications_created_at;
DROP INDEX IF EXISTS public.idx_hatim_slots_user_id;
DROP INDEX IF EXISTS public.idx_community_notifications_is_read;


-- 3. HOUSEKEEPING
-------------------------------------------------------
ANALYZE;

COMMIT;
