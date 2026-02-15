-- ============================================
-- Islamvy App - Optimized Community RPCs
-- Purpose: Support 50k DAU with cursor-based pagination and server-side filtering.
-- Date: 2026-02-03
-- ============================================

-- 1. Optimized Combined Feed (Dua & Dhikr)
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
  user_city text
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
    p.city as user_city
  FROM public.community_posts cp
  LEFT JOIN public.profiles p ON cp.user_id = p.id
  WHERE cp.status = 'active'
    AND (p_type = 'all' OR cp.type = p_type)
    AND (p_before IS NULL OR cp.created_at < p_before)
    AND NOT (cp.user_id = ANY(p_blocked_users))
  ORDER BY cp.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Optimized Hatim Feed
CREATE OR REPLACE FUNCTION get_optimized_hatim_feed(
  p_before timestamp with time zone,
  p_limit integer,
  p_blocked_users uuid[]
)
RETURNS TABLE (
  id uuid,
  created_by uuid,
  title text,
  description text,
  total_slots integer,
  status text,
  language_code text,
  city text,
  created_at timestamp with time zone,
  user_full_name text,
  user_avatar_url text,
  user_city text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hg.id,
    hg.created_by,
    hg.title,
    hg.description,
    hg.total_slots,
    hg.status,
    hg.language_code,
    hg.city,
    hg.created_at,
    p.full_name,
    p.avatar_url,
    p.city as user_city
  FROM public.hatim_groups hg
  LEFT JOIN public.profiles p ON hg.created_by = p.id
  WHERE hg.status IN ('open', 'completed')
    AND (p_before IS NULL OR hg.created_at < p_before)
    AND NOT (hg.created_by = ANY(p_blocked_users))
  ORDER BY hg.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
