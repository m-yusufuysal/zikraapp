-- ============================================
-- COMPREHENSIVE LEADERBOARD FIX (Participation-Based)
-- ============================================
-- Shows PARTICIPATION stats for each user:
-- 1. Zikir = Dhikr posts the user PARTICIPATED in (interacted with)
-- 2. Amin  = Amen interactions the user MADE on other users' dua posts
-- 3. Hatim = Hatim juz slots the user TOOK (taken/completed)
--
-- Also returns full_name, avatar_url, city from profiles.
-- Rankings based on weighted impact score.
-- ============================================

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
  WITH 
  -- Count dhikr posts this user INTERACTED with (participated in)
  dhikr_participation AS (
    SELECT 
      ci.user_id,
      COUNT(DISTINCT ci.post_id) as participated_dhikrs
    FROM public.community_interactions ci
    INNER JOIN public.community_posts cp ON ci.post_id = cp.id
    WHERE cp.type = 'dhikr'
    GROUP BY ci.user_id
  ),
  -- Count amen interactions this user MADE (on any post type)
  amen_participation AS (
    SELECT 
      ci.user_id,
      COUNT(*) as amens_given
    FROM public.community_interactions ci
    WHERE ci.type = 'amen'
    GROUP BY ci.user_id
  ),
  -- Count hatim juz slots this user TOOK
  hatim_participation AS (
    SELECT 
      hs.user_id,
      COUNT(*) as juz_taken
    FROM public.hatim_slots hs
    WHERE hs.user_id IS NOT NULL
      AND hs.status IN ('taken', 'completed')
    GROUP BY hs.user_id
  )
  SELECT 
    p.id as user_id,
    COALESCE(NULLIF(TRIM(p.full_name), ''), 'Islamvy Kullanıcısı') as full_name,
    p.avatar_url,
    COALESCE(NULLIF(TRIM(p.city), ''), NULLIF(TRIM(p.location), '')) as city,
    COALESCE(dp.participated_dhikrs, 0)::bigint as completed_dhikrs,
    COALESCE(hp.juz_taken, 0)::bigint as completed_hatims,
    COALESCE(ap.amens_given, 0)::bigint as total_amens
  FROM public.profiles p
  LEFT JOIN dhikr_participation dp ON p.id = dp.user_id
  LEFT JOIN amen_participation ap ON p.id = ap.user_id
  LEFT JOIN hatim_participation hp ON p.id = hp.user_id
  WHERE (
    COALESCE(dp.participated_dhikrs, 0) > 0 OR 
    COALESCE(ap.amens_given, 0) > 0 OR 
    COALESCE(hp.juz_taken, 0) > 0
  )
  ORDER BY 
    -- Weighted Impact Score: Hatim Juz=10pts, Dhikr=5pts, Amen=1pt
    (COALESCE(hp.juz_taken, 0) * 10 + COALESCE(dp.participated_dhikrs, 0) * 5 + COALESCE(ap.amens_given, 0)) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
