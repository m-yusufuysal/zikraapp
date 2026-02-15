-- ============================================
-- Islamvy App - Community Features Boost
-- 1. Weekly Leaderboard RPC
-- 2. Badge Tier RPC
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. WEEKLY LEADERBOARD
-- Returns top 20 users who posted the most in the last 7 days
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
    ), 0) as total_amens
  FROM public.community_posts cp
  LEFT JOIN public.profiles p ON cp.user_id = p.id
  WHERE cp.created_at >= NOW() - INTERVAL '7 days'
    AND cp.status IN ('active', 'completed')
  GROUP BY cp.user_id, p.full_name, p.avatar_url, p.city
  ORDER BY post_count DESC, total_amens DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 2. BADGE TIER CALCULATION
-- Returns badge info for a single user based on total amens received
CREATE OR REPLACE FUNCTION get_user_badge_tier(p_user_id uuid)
RETURNS TABLE (
  total_amens bigint,
  badge_level integer,
  badge_name text
) AS $$
DECLARE
  v_total bigint;
BEGIN
  SELECT COALESCE(COUNT(*), 0) INTO v_total
  FROM public.community_interactions ci
  JOIN public.community_posts cp ON ci.post_id = cp.id
  WHERE cp.user_id = p_user_id AND ci.type = 'amen';

  RETURN QUERY SELECT 
    v_total,
    CASE 
      WHEN v_total >= 500 THEN 5
      WHEN v_total >= 100 THEN 4
      WHEN v_total >= 50 THEN 3
      WHEN v_total >= 10 THEN 2
      ELSE 1
    END,
    CASE 
      WHEN v_total >= 500 THEN 'leader'
      WHEN v_total >= 100 THEN 'guide'
      WHEN v_total >= 50 THEN 'star'
      WHEN v_total >= 10 THEN 'friend'
      ELSE 'newcomer'
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 3. OPTIMIZED: Add badge info directly to feed query
-- This avoids N+1 queries by calculating badge inline
-- Must DROP first because return type changed (added user_badge_emoji)
DROP FUNCTION IF EXISTS get_optimized_community_feed(text, timestamp with time zone, integer, uuid[]);

CREATE OR REPLACE FUNCTION get_optimized_community_feed(
  p_type text,
  p_before timestamp with time zone,
  p_limit integer,
  p_blocked_users uuid[]
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  content text,
  type text,
  target_count integer,
  current_count integer,
  status text,
  language_code text,
  city text,
  created_at timestamp with time zone,
  user_full_name text,
  user_avatar_url text,
  user_city text,
  user_badge_emoji text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id,
    cp.user_id,
    cp.title,
    cp.content,
    cp.type,
    cp.target_count,
    cp.current_count,
    cp.status,
    cp.language_code,
    cp.city,
    cp.created_at,
    p.full_name,
    p.avatar_url,
    p.city as user_city,
    -- Inline badge calculation
    CASE 
      WHEN (SELECT COUNT(*) FROM public.community_interactions ci2 
            JOIN public.community_posts cp2 ON ci2.post_id = cp2.id 
            WHERE cp2.user_id = cp.user_id AND ci2.type = 'amen') >= 500 THEN '👑'
      WHEN (SELECT COUNT(*) FROM public.community_interactions ci2 
            JOIN public.community_posts cp2 ON ci2.post_id = cp2.id 
            WHERE cp2.user_id = cp.user_id AND ci2.type = 'amen') >= 100 THEN '💎'
      WHEN (SELECT COUNT(*) FROM public.community_interactions ci2 
            JOIN public.community_posts cp2 ON ci2.post_id = cp2.id 
            WHERE cp2.user_id = cp.user_id AND ci2.type = 'amen') >= 50 THEN '🌟'
      WHEN (SELECT COUNT(*) FROM public.community_interactions ci2 
            JOIN public.community_posts cp2 ON ci2.post_id = cp2.id 
            WHERE cp2.user_id = cp.user_id AND ci2.type = 'amen') >= 10 THEN '⭐'
      ELSE '🌱'
    END as user_badge_emoji
  FROM public.community_posts cp
  LEFT JOIN public.profiles p ON cp.user_id = p.id
  WHERE cp.status IN ('active', 'completed')
    AND (p_type = 'all' OR cp.type = p_type)
    AND (p_before IS NULL OR cp.created_at < p_before)
    AND NOT (cp.user_id = ANY(p_blocked_users))
  ORDER BY cp.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
