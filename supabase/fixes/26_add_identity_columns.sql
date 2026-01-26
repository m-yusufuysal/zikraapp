-- Add identity control columns to community tables
-- This allows users to choose whether to display their full name on posts

ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS show_full_name BOOLEAN DEFAULT false;

ALTER TABLE hatim_groups 
ADD COLUMN IF NOT EXISTS show_full_name BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN community_posts.show_full_name IS 'Whether to show the creators full name instead of a masked version';
COMMENT ON COLUMN hatim_groups.show_full_name IS 'Whether to show the creators full name instead of a masked version';
