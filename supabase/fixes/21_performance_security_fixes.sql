-- ============================================
-- Islamvy App - Performance & Security RLS Fixes
-- Version 1.0
-- Addresses: auth_rls_initplan & multiple_permissive_policies
-- ============================================

BEGIN;

-- 1. FIX: multiple_permissive_policies
-- Consolidation of redundant policies for community_notifications and hatim_groups
-------------------------------------------------------

-- Table: public.community_notifications
-- Merge "System insert notifications" and "Triggers can insert notifications"
DROP POLICY IF EXISTS "System insert notifications" ON public.community_notifications;
DROP POLICY IF EXISTS "Triggers can insert notifications" ON public.community_notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.community_notifications;

CREATE POLICY "System insert notifications" 
    ON public.community_notifications FOR INSERT 
    WITH CHECK (true);

-- Table: public.hatim_groups
-- Merge "Anyone can view open groups" and "Anyone can view open hatims"
DROP POLICY IF EXISTS "Anyone can view open groups" ON public.hatim_groups;
DROP POLICY IF EXISTS "Anyone can view open hatims" ON public.hatim_groups;

CREATE POLICY "Anyone can view open groups"
    ON public.hatim_groups FOR SELECT
    USING (status = 'open' OR status = 'completed' OR (SELECT auth.uid()) = created_by);


-- 2. FIX: auth_rls_initplan (Subquery Optimization)
-- Wrapping auth.uid() and auth.role() in subqueries to prevent per-row evaluation
-------------------------------------------------------

-- PROFILES
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    TO authenticated 
    USING ((SELECT auth.uid()) = id) 
    WITH CHECK ((SELECT auth.uid()) = id);

-- COMMUNITY POSTS
DROP POLICY IF EXISTS "Users can create their own posts" ON public.community_posts;
CREATE POLICY "Users can create their own posts" 
    ON public.community_posts FOR INSERT 
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
CREATE POLICY "Users can update their own posts" 
    ON public.community_posts FOR UPDATE 
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;
CREATE POLICY "Users can delete their own posts" 
    ON public.community_posts FOR DELETE 
    USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Anyone can view active posts" ON public.community_posts;
CREATE POLICY "Anyone can view active posts"
    ON public.community_posts FOR SELECT
    USING (status = 'active' OR (SELECT auth.uid()) = user_id);


-- INFLUENCERS & REFERRALS
DROP POLICY IF EXISTS "Influencers can view own data" ON public.influencers;
CREATE POLICY "Influencers can view own data" 
    ON public.influencers FOR SELECT 
    USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Influencers can view own referrals" ON public.referrals;
CREATE POLICY "Influencers can view own referrals" 
    ON public.referrals FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.influencers 
            WHERE influencers.id = referrals.influencer_id 
            AND influencers.user_id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "Influencers can view own payouts" ON public.influencer_payouts;
CREATE POLICY "Influencers can view own payouts" 
    ON public.influencer_payouts FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.influencers 
            WHERE influencers.id = influencer_payouts.influencer_id 
            AND influencers.user_id = (SELECT auth.uid())
        )
    );


-- COMMUNITY INTERACTIONS
DROP POLICY IF EXISTS "Users can insert interactions" ON public.community_interactions;
CREATE POLICY "Users can insert interactions" 
    ON public.community_interactions FOR INSERT 
    WITH CHECK ((SELECT auth.uid()) = user_id);


-- HATIM GROUPS (Non-Select)
DROP POLICY IF EXISTS "Users can create hatims" ON public.hatim_groups;
CREATE POLICY "Users can create hatims" 
    ON public.hatim_groups FOR INSERT 
    WITH CHECK ((SELECT auth.uid()) = created_by);

DROP POLICY IF EXISTS "Creators can update their own groups" ON public.hatim_groups;
CREATE POLICY "Creators can update their own groups"
    ON public.hatim_groups FOR UPDATE
    USING ((SELECT auth.uid()) = created_by)
    WITH CHECK ((SELECT auth.uid()) = created_by);

DROP POLICY IF EXISTS "Creators can delete their own groups" ON public.hatim_groups;
CREATE POLICY "Creators can delete their own groups"
    ON public.hatim_groups FOR DELETE
    USING ((SELECT auth.uid()) = created_by);


-- HATIM SLOTS
DROP POLICY IF EXISTS "Users can insert slots for their own hatims" ON public.hatim_slots;
CREATE POLICY "Users can insert slots for their own hatims" 
    ON public.hatim_slots FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.hatim_groups WHERE id = hatim_id AND created_by = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can update assigned slots" ON public.hatim_slots;
CREATE POLICY "Users can update assigned slots" 
    ON public.hatim_slots FOR UPDATE 
    USING ((SELECT auth.uid()) = user_id OR user_id IS NULL);


-- COMMUNITY REPORTS
DROP POLICY IF EXISTS "Users can create reports" ON public.community_reports;
CREATE POLICY "Users can create reports" 
    ON public.community_reports FOR INSERT 
    WITH CHECK ((SELECT auth.uid()) = reporter_id);


-- COMMUNITY NOTIFICATIONS (Non-Insert)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.community_notifications;
CREATE POLICY "Users can view their own notifications" 
    ON public.community_notifications FOR SELECT 
    USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.community_notifications;
CREATE POLICY "Users can update their own notifications" 
    ON public.community_notifications FOR UPDATE 
    USING ((SELECT auth.uid()) = user_id);


-- 3. SCHEMA CACHE RELOAD & ANALYZE
-------------------------------------------------------
NOTIFY pgrst, 'reload config';
ANALYZE;

COMMIT;
