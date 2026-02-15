-- Improved Leaderboard Logic V2
-- Ranks users by Total Amens Received (Primary) and Completed Dhikrs/Hatims (Secondary)
-- Removes 365-day limit to show "All Time" stats for better engagement "Real Numbers"
-- Enhances name/city fallback logic

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
      -- Count completed Dhikrs (All Time)
      COUNT(DISTINCT CASE WHEN cp.type = 'dhikr' AND cp.status = 'completed' THEN cp.id END) as completed_dhikrs,
      -- Count Amens on their posts (All Time)
      COALESCE(SUM(
        (SELECT COUNT(*) FROM public.community_interactions ci 
         WHERE ci.post_id = cp.id AND ci.type = 'amen')
      ), 0)::bigint as amens_received
    FROM public.community_posts cp
    WHERE cp.status IN ('active', 'completed')
    GROUP BY cp.user_id
  ),
  hatim_stats AS (
    SELECT 
      hg.created_by as user_id,
      COUNT(*) as completed_hatims
    FROM public.hatim_groups hg
    WHERE hg.status = 'completed'
    GROUP BY hg.created_by
  )
  SELECT 
    p.id as user_id,
    COALESCE(NULLIF(TRIM(p.full_name), ''), 'Islamvy User') as full_name,
    p.avatar_url,
    COALESCE(NULLIF(TRIM(p.city), ''), NULLIF(TRIM(p.location), ''), 'Unknown Location') as city,
    -- Return distinct counts
    COALESCE(us.completed_dhikrs, 0)::bigint as completed_dhikrs,
    COALESCE(hs.completed_hatims, 0)::bigint as completed_hatims,
    COALESCE(us.amens_received, 0)::bigint as total_amens
  FROM public.profiles p
  LEFT JOIN user_stats us ON p.id = us.user_id
  LEFT JOIN hatim_stats hs ON p.id = hs.user_id
  -- Rank by Amens first, then Total Activity
  WHERE (COALESCE(us.amens_received, 0) > 0 OR COALESCE(us.completed_dhikrs, 0) > 0 OR COALESCE(hs.completed_hatims, 0) > 0)
  ORDER BY 
    total_amens DESC, 
    (COALESCE(us.completed_dhikrs, 0) + COALESCE(hs.completed_hatims, 0))::bigint DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
