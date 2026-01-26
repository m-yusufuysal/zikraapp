-- ============================================
-- APP CONFIG TABLE - REMOTE CONFIGURATION
-- ============================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.app_config (
    key text PRIMARY KEY,
    value text NOT NULL,
    description text
);

-- 2. Insert default values (The "Remote Config")
INSERT INTO public.app_config (key, value, description)
VALUES 
    ('kaaba_stream_source', 'youtube', 'Stream source type: "youtube" or "hls"'),
    ('kaaba_video_id', 'UC8c5nZ_D8a_u5F5E4Q5r4_A', 'YouTube Channel ID for official KSA Quran TV (Auto Live)'),
    ('kaaba_hls_url', 'https://win.holol.com/live/quran/playlist.m3u8', 'Direct m3u8 stream URL (Holol CDN)')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value;

-- 3. Enables Row Level Security
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- 4. Create Policy: Allow public read access (Anonymous users can read config)
DROP POLICY IF EXISTS "Allow public read access" ON public.app_config;
CREATE POLICY "Allow public read access" ON public.app_config
    FOR SELECT 
    USING (true);

-- 5. Create Policy: Allow service role write access (Only admins/backend can update)
DROP POLICY IF EXISTS "Allow service role write access" ON public.app_config;
CREATE POLICY "Allow service role write access" ON public.app_config
    FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');
