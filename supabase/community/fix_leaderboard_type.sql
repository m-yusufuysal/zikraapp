-- Fix type mismatch for get_weekly_leaderboard
-- SUM() returns numeric, but we defined return type as bigint
-- We need to cast the result to bigint

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
    ), 0)::bigint as total_amens -- Cast to bigint here
  FROM public.community_posts cp
  LEFT JOIN public.profiles p ON cp.user_id = p.id
  WHERE cp.created_at >= NOW() - INTERVAL '7 days'
    AND cp.status IN ('active', 'completed')
  GROUP BY cp.user_id, p.full_name, p.avatar_url, p.city
  ORDER BY post_count DESC, total_amens DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
