-- ============================================
-- Islamvy App - Performance Optimizations (Fixing Lints)
-- ============================================

-- Fix 1: unindexed_foreign_keys (LINT 0001)
-- Adding index for user_id on shop_analytics to improve join performance.
CREATE INDEX IF NOT EXISTS idx_shop_analytics_user_id ON public.shop_analytics(user_id);

-- Fix 2: Redundant Unused Indexes (LINT 0005)
-- Some indexes are redundant because they are prefixes of existing UNIQUE constraints 
-- or multi-column indexes.

-- idx_daily_quotes_date is redundant because UNIQUE(date, language) already covers queries on 'date'.
DROP INDEX IF EXISTS public.idx_daily_quotes_date;

-- Note on other "Unused Indexes":
-- Many indexes (like idx_community_notifications_post_id, etc.) are marked as "unused" 
-- simply because the app hasn't been under heavy load yet. 
-- WE SHOULD KEEP THEM as they are critical for performance once users start interacting with communities.
-- Deleting them now would cause slow queries later.

-- Optional: Adding missing indices on other foreign keys that might have been missed in analytics tables
CREATE INDEX IF NOT EXISTS idx_analytics_logs_user_id ON public.analytics_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);

-- Cleanup recommendation for influencer payouts if needed
CREATE INDEX IF NOT EXISTS idx_influencer_payouts_influencer_id ON public.influencer_payouts(influencer_id);
