-- Fix for community_posts status check constraint
-- The 'completed' status was missing from the constraint, causing errors when a post target is reached.

ALTER TABLE public.community_posts 
DROP CONSTRAINT IF EXISTS community_posts_status_check;

ALTER TABLE public.community_posts 
ADD CONSTRAINT community_posts_status_check 
CHECK (status IN ('active', 'completed', 'hidden', 'deleted'));
