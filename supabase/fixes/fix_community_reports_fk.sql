-- Drop the foreign key constraint on post_id
-- This is necessary because we report items from multiple tables (community_posts, hatim_groups)
-- and a single column cannot reference multiple tables with a simple FK.

ALTER TABLE public.community_reports 
DROP CONSTRAINT IF EXISTS community_reports_post_id_fkey;
