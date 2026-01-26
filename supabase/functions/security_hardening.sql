-- ============================================
-- Zikra App - Security Hardening
-- Blocklist, Rate Limiting, Storage Limits & RLS
-- ============================================

-- 1. IP BLOCKLIST TABLE
CREATE TABLE IF NOT EXISTS public.blocked_ips (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address text NOT NULL UNIQUE,
    reason text,
    banned_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- Only service role can manage this
DROP POLICY IF EXISTS "Service role full access" ON public.blocked_ips;
CREATE POLICY "Service role full access" ON public.blocked_ips
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');


-- 2. RATE LIMITING TABLE (Sliding Window / Fixed Window)
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key text PRIMARY KEY, -- generic key: "ip:1.2.3.4" or "user:uuid"
    request_count integer DEFAULT 1,
    window_start timestamp with time zone DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON public.rate_limits;
CREATE POLICY "Service role full access" ON public.rate_limits
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');


-- 3. FUNCTION: IS IP BLOCKED?
CREATE OR REPLACE FUNCTION public.fn_is_ip_blocked(check_ip text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.blocked_ips WHERE ip_address = check_ip);
END;
$$;


-- 4. FUNCTION: CHECK & INCREMENT RATE LIMIT
-- Returns TRUE if request is allowed, FALSE if limit exceeded
CREATE OR REPLACE FUNCTION public.fn_check_rate_limit(
    identifier text,      -- e.g. IP address or User ID
    limit_count int,      -- e.g. 50
    window_seconds int    -- e.g. 60 for 1 minute
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count int;
    current_time timestamp with time zone := now();
    window_start_time timestamp with time zone;
    record_key text := identifier; 
BEGIN
    -- Check existing record
    SELECT request_count, window_start INTO current_count, window_start_time
    FROM public.rate_limits
    WHERE key = record_key;

    IF NOT FOUND THEN
        -- New record
        INSERT INTO public.rate_limits (key, request_count, window_start)
        VALUES (record_key, 1, current_time);
        RETURN TRUE;
    END IF;

    -- Check if window expired
    IF current_time > (window_start_time + (window_seconds || ' seconds')::interval) THEN
        -- Reset window
        UPDATE public.rate_limits
        SET request_count = 1, window_start = current_time
        WHERE key = record_key;
        RETURN TRUE;
    ELSE
        -- Within window, check limit
        IF current_count >= limit_count THEN
            RETURN FALSE; -- Blocked
        ELSE
            -- Increment
            UPDATE public.rate_limits
            SET request_count = request_count + 1
            WHERE key = record_key;
            RETURN TRUE;
        END IF;
    END IF;
END;
$$;


-- 5. STORAGE FILE SIZE LIMITS (If using Storage)
-- Note: This is a preventative policy for the 'avatars' bucket or general storage
-- Assuming a bucket 'avatars' exists or just general protection.
-- Supabase Storage policies are SQL based on the `storage.objects` table.

-- Policy: Max file size 5MB for uploads
DROP POLICY IF EXISTS "Max file size 5MB" ON storage.objects;
CREATE POLICY "Max file size 5MB"
ON storage.objects
FOR INSERT
WITH CHECK (
    (bucket_id = 'avatars' OR bucket_id = 'public') AND
    (metadata->>'size')::int <= 5242880 -- 5MB in bytes
);

-- Policy: Only allow images
DROP POLICY IF EXISTS "Only images allowed" ON storage.objects;
CREATE POLICY "Only images allowed"
ON storage.objects
FOR INSERT
WITH CHECK (
    (bucket_id = 'avatars' OR bucket_id = 'public') AND
    storage.extension(name) = ANY (ARRAY['jpg', 'jpeg', 'png', 'webp'])
);


-- ============================================
-- 6. PERFORMANCE INDEXES
-- ============================================

-- Index for Rate Limiting checks (speed up count queries)
CREATE INDEX IF NOT EXISTS idx_dhikr_sessions_user_created 
ON public.dhikr_sessions (user_id, created_at);

-- Index for Dream History checks
CREATE INDEX IF NOT EXISTS idx_dreams_user_created 
ON public.dream_interpretations (user_id, created_at);

-- Index for searching dreams (if full text search is used later, otherwise basic metadata)
CREATE INDEX IF NOT EXISTS idx_dreams_status 
ON public.dream_interpretations (status);


-- ============================================
-- 7. ROW LEVEL SECURITY (DATA PROTECTION)
-- ============================================

-- Dhikr Sessions: Users can only see/insert/update their own data
ALTER TABLE public.dhikr_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own dhikr sessions" ON public.dhikr_sessions;
CREATE POLICY "Users can view own dhikr sessions"
ON public.dhikr_sessions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own dhikr sessions" ON public.dhikr_sessions;
CREATE POLICY "Users can insert own dhikr sessions"
ON public.dhikr_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own dhikr sessions" ON public.dhikr_sessions;
CREATE POLICY "Users can update own dhikr sessions"
ON public.dhikr_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- Dream Interpretations: Users can only see/insert/update their own data
ALTER TABLE public.dream_interpretations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own dreams" ON public.dream_interpretations;
CREATE POLICY "Users can view own dreams"
ON public.dream_interpretations FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own dreams" ON public.dream_interpretations;
CREATE POLICY "Users can insert own dreams"
ON public.dream_interpretations FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own dreams" ON public.dream_interpretations;
CREATE POLICY "Users can update own dreams"
ON public.dream_interpretations FOR UPDATE
USING (auth.uid() = user_id);

-- Profiles: Users can view all (or own? usually app needs own), Users can update own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);
