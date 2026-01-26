-- ============================================
-- Zikra App - Final Index Optimizations
-- Version 1.0
-- Addresses: Remaining unindexed_foreign_keys
-- ============================================

BEGIN;

-- 1. ADD REMAINING MISSING INDEXES FOR FOREIGN KEYS
-------------------------------------------------------

-- Table: public.analytics_logs
CREATE INDEX IF NOT EXISTS idx_analytics_logs_user_id ON public.analytics_logs(user_id);

-- Table: public.hatim_slots
CREATE INDEX IF NOT EXISTS idx_hatim_slots_user_id ON public.hatim_slots(user_id);

-- Table: public.referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);


-- 2. HOUSEKEEPING
-------------------------------------------------------
ANALYZE;

COMMIT;
