-- Optimizing Community Performance

-- 1. Create Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON public.community_posts(status);

CREATE INDEX IF NOT EXISTS idx_interactions_post_id ON public.community_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON public.community_interactions(type);
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON public.community_interactions(user_id);

CREATE INDEX IF NOT EXISTS idx_hatim_groups_status ON public.hatim_groups(status);
CREATE INDEX IF NOT EXISTS idx_hatim_groups_created_by ON public.hatim_groups(created_by);

-- 2. Validate function return type change by dropping first
DROP FUNCTION IF EXISTS get_weekly_leaderboard(integer);

-- 3. Optimized Leaderboard Function (Single Pass)
CREATE OR REPLACE FUNCTION get_weekly_leaderboard(p_limit integer DEFAULT 20)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text,
  city text,
  completed_dhikrs bigint,
  completed_hatims bigint,
  total_amens bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      cp.user_id,
      COUNT(*) as post_count, -- Count ALL posts
      -- Count completed Dhikrs
      COUNT(DISTINCT CASE WHEN cp.type = 'dhikr' AND cp.status = 'completed' THEN cp.id END) as completed_dhikrs,
      -- Count Amens on their posts
      COALESCE(SUM(
        (SELECT COUNT(*) FROM public.community_interactions ci 
         WHERE ci.post_id = cp.id AND ci.type = 'amen')
      ), 0)::bigint as amens_received
    FROM public.community_posts cp
    WHERE cp.created_at >= NOW() - INTERVAL '365 days'
      AND cp.status IN ('active', 'completed')
    GROUP BY cp.user_id
  ),
  hatim_stats AS (
    SELECT 
      hg.created_by as user_id,
      COUNT(*) as completed_hatims
    FROM public.hatim_groups hg
    WHERE hg.status = 'completed'
      AND hg.created_at >= NOW() - INTERVAL '365 days'
    GROUP BY hg.created_by
  )
  SELECT 
    p.id as user_id,
    -- Return raw full_name so frontend can handle it (no forced 'Islamvy Kullanıcısı')
    p.full_name,
    p.avatar_url,
    -- Prioritize City, fallback to Location, but return NULL if both empty
    COALESCE(NULLIF(p.city, ''), NULLIF(p.location, '')) as city,
    COALESCE(us.completed_dhikrs, 0)::bigint as completed_dhikrs,
    COALESCE(hs.completed_hatims, 0)::bigint as completed_hatims,
    COALESCE(us.amens_received, 0)::bigint as total_amens
  FROM public.profiles p
  LEFT JOIN user_stats us ON p.id = us.user_id
  LEFT JOIN hatim_stats hs ON p.id = hs.user_id
  -- Relaxed Filter: Show anyone who has at least posted something OR has achievements
  WHERE (COALESCE(us.post_count, 0) > 0 OR COALESCE(hs.completed_hatims, 0) > 0)
  ORDER BY 
    total_amens DESC, 
    -- Use explicit expressions to avoid ambiguity with return parameters
    (COALESCE(us.completed_dhikrs, 0) + COALESCE(hs.completed_hatims, 0))::bigint DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
