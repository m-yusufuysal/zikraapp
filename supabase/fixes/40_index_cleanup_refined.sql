-- ============================================
-- Islamvy App - Index Cleanup & Scale Readiness
-- ============================================

-- 1. TRULY REDUNDANT INDEXES (Safe to remove)
-- These are covered by UNIQUE constraints or composite indexes.

-- covered by UNIQUE(date, language)
DROP INDEX IF EXISTS public.idx_daily_quotes_lang; 

-- 2. "FALSE POSITIVES" (KEEP THESE!)
-- These are marked as "unused" because the app is currently in development.
-- Removing them would cause major performance lag as soon as real users join.

/* 
KEEP: idx_profiles_expo_push_token
Reason: Essential for finding push tokens during notification bursts.

KEEP: idx_community_notifications_post_id
Reason: Essential for loading notification history for a specific post.

KEEP: idx_community_interactions_user_id
Reason: Essential for checking if a user already "Amen'd" a post.

KEEP: idx_hatim_groups_created_by
Reason: Essential for user's "My Hatims" screen.
*/

-- 3. Optimization: Add covering index for search_path fixes if not already done
-- (Already handled in previous security hardening)

-- 4. Cleanup of unfinished analytics columns if any
-- (Optional cleanup)
