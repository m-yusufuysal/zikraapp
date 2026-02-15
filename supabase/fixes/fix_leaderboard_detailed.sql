-- Detailed Leaderboard Logic
-- Returns separate counts for:
-- 1. Completed Dhikrs
-- 2. Completed Hatims
-- 3. Total Amens Received (Social Impact)
-- Ranking is based on a weighted "Impact Score" (Internal) but we display all stats.

DROP FUNCTION IF EXISTS get_weekly_leaderboard(integer);

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
      -- Count completed Dhikrs
      COUNT(DISTINCT CASE WHEN cp.type = 'dhikr' AND cp.status = 'completed' THEN cp.id END) as c_dhikrs,
      -- Count Amens on their posts
      COALESCE(SUM(
        (SELECT COUNT(*) FROM public.community_interactions ci 
         WHERE ci.post_id = cp.id AND ci.type = 'amen')
      ), 0)::bigint as amens_rec
    FROM public.community_posts cp
    WHERE cp.created_at >= NOW() - INTERVAL '365 days'
      AND cp.status IN ('active', 'completed')
    GROUP BY cp.user_id
  ),
  hatim_stats AS (
    SELECT 
      hg.created_by as user_id,
      COUNT(*) as c_hatims
    FROM public.hatim_groups hg
    WHERE hg.status = 'completed'
      AND hg.created_at >= NOW() - INTERVAL '365 days'
    GROUP BY hg.created_by
  )
  SELECT 
    p.id as user_id,
    p.full_name,
    p.avatar_url,
    p.city,
    COALESCE(us.c_dhikrs, 0)::bigint as completed_dhikrs,
    COALESCE(hs.c_hatims, 0)::bigint as completed_hatims,
    COALESCE(us.amens_rec, 0)::bigint as total_amens
  FROM public.profiles p
  LEFT JOIN user_stats us ON p.id = us.user_id
  LEFT JOIN hatim_stats hs ON p.id = hs.user_id
  WHERE (COALESCE(us.amens_rec, 0) > 0 OR COALESCE(us.c_dhikrs, 0) > 0 OR COALESCE(hs.c_hatims, 0) > 0)
  ORDER BY 
    -- Ranking Logic: 
    -- 1 Hatim = 50 points
    -- 1 Amen = 1 point
    -- 1 Dhikr = 1 point
    (COALESCE(hs.c_hatims, 0) * 50 + COALESCE(us.amens_rec, 0) + COALESCE(us.c_dhikrs, 0)) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
