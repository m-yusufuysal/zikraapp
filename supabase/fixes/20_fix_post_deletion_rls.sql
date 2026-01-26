-- ============================================
-- Zikra App - Fix Post Deletion RLS
-- Allows users to soft-delete their own posts
-- ============================================

-- 1. FIX STATUS CONSTRAINTS
-- For Community Posts
ALTER TABLE public.community_posts 
DROP CONSTRAINT IF EXISTS community_posts_status_check;

ALTER TABLE public.community_posts 
ADD CONSTRAINT community_posts_status_check 
CHECK (status IN ('active', 'hidden', 'deleted'));

-- For Hatim Groups
ALTER TABLE public.hatim_groups 
DROP CONSTRAINT IF EXISTS hatim_groups_status_check;

ALTER TABLE public.hatim_groups 
ADD CONSTRAINT hatim_groups_status_check 
CHECK (status IN ('open', 'completed', 'deleted'));


-- 2. COMMUNITY POSTS POLICIES
DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
CREATE POLICY "Users can update their own posts"
    ON public.community_posts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Also ensure they can delete (if we ever do hard delete, but for soft delete UPDATE is enough)
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;
CREATE POLICY "Users can delete their own posts"
    ON public.community_posts FOR DELETE
    USING (auth.uid() = user_id);

-- 3. HATIM GROUPS POLICIES
DROP POLICY IF EXISTS "Creators can update their own groups" ON public.hatim_groups;
CREATE POLICY "Creators can update their own groups"
    ON public.hatim_groups FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Also ensure they can delete
DROP POLICY IF EXISTS "Creators can delete their own groups" ON public.hatim_groups;
CREATE POLICY "Creators can delete their own groups"
    ON public.hatim_groups FOR DELETE
    USING (auth.uid() = created_by);

-- 4. UPDATE VIEW FILTERING
-- Any updates to status must be reflected in the SELECT policies too
-- If select policy has "status = 'active'", then soft-deleted items will vanish correctly.
-- Let's ensure the SELECT policy is inclusive enough for the owner but filtered for others.

-- For Community Posts
DROP POLICY IF EXISTS "Anyone can view active posts" ON public.community_posts;
CREATE POLICY "Anyone can view active posts"
    ON public.community_posts FOR SELECT
    USING (status = 'active' OR auth.uid() = user_id);

-- For Hatim Groups
DROP POLICY IF EXISTS "Anyone can view open groups" ON public.hatim_groups;
CREATE POLICY "Anyone can view open groups"
    ON public.hatim_groups FOR SELECT
    USING (status = 'open' OR status = 'completed' OR auth.uid() = created_by);
