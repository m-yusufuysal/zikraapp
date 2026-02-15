-- Update get_weekly_leaderboard to look back 1 year instead of 7 days
-- This ensures the "Top" section isn't empty for new/low-volume communities.

CREATE OR REPLACE FUNCTION get_weekly_leaderboard(p_limit integer DEFAULT 20)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text,
  city text,
  post_count bigint,
  total_amens bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.user_id,
    p.full_name,
    p.avatar_url,
    p.city,
    COUNT(DISTINCT cp.id) as post_count,
    COALESCE(SUM(
      (SELECT COUNT(*) FROM public.community_interactions ci 
       WHERE ci.post_id = cp.id AND ci.type = 'amen')
    ), 0)::bigint as total_amens
  FROM public.community_posts cp
  LEFT JOIN public.profiles p ON cp.user_id = p.id
  WHERE cp.created_at >= NOW() - INTERVAL '365 days' -- Extended from 7 days to 1 year
    AND cp.status IN ('active', 'completed')
  GROUP BY cp.user_id, p.full_name, p.avatar_url, p.city
  ORDER BY post_count DESC, total_amens DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
