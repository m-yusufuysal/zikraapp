-- 1. FIX: Missing columns in dream_interpretations (causing crash)
ALTER TABLE public.dream_interpretations 
ADD COLUMN IF NOT EXISTS interpretation TEXT,
ADD COLUMN IF NOT EXISTS personal_message TEXT,
ADD COLUMN IF NOT EXISTS warning TEXT,
ADD COLUMN IF NOT EXISTS symbols JSONB,
ADD COLUMN IF NOT EXISTS recommended_action TEXT; -- Added for Zikir AI recommended action in dreams if needed

-- 2. FEATURE: Columns for Zikir AI (dhikr_sessions)
ALTER TABLE public.dhikr_sessions
ADD COLUMN IF NOT EXISTS prescription_title TEXT,
ADD COLUMN IF NOT EXISTS numerology_analysis TEXT,
ADD COLUMN IF NOT EXISTS personal_warning TEXT,
ADD COLUMN IF NOT EXISTS esma TEXT,
ADD COLUMN IF NOT EXISTS daily_dua TEXT,
ADD COLUMN IF NOT EXISTS closing_dua TEXT,
ADD COLUMN IF NOT EXISTS recommended_action TEXT,
ADD COLUMN IF NOT EXISTS dhikr_list JSONB,
ADD COLUMN IF NOT EXISTS target_count INTEGER,
ADD COLUMN IF NOT EXISTS request_hash TEXT;

-- 3. FEATURE: Columns for Daily Quotes (daily_quotes)
CREATE TABLE IF NOT EXISTS public.daily_quotes (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date DATE NOT NULL,
    language TEXT NOT NULL,
    title TEXT,
    body TEXT,
    citation TEXT,
    type TEXT DEFAULT 'verse',
    UNIQUE(date, language)
);

-- Ensure RLS is enabled for security
ALTER TABLE public.daily_quotes ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
DROP POLICY IF EXISTS "Public quotes are viewable by everyone" ON public.daily_quotes;
CREATE POLICY "Public quotes are viewable by everyone" 
ON public.daily_quotes FOR SELECT 
USING (true);

-- Allow limits to be updated (if you have a limits table, otherwise ignore)
-- Also ensuring dhikr_sessions RLS allows users to see their own sessions
DROP POLICY IF EXISTS "Users can see their own dhikr sessions" ON public.dhikr_sessions;
CREATE POLICY "Users can see their own dhikr sessions" 
ON public.dhikr_sessions FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own dhikr sessions" ON public.dhikr_sessions;
CREATE POLICY "Users can insert their own dhikr sessions" 
ON public.dhikr_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own dhikr sessions" ON public.dhikr_sessions;
CREATE POLICY "Users can update their own dhikr sessions" 
ON public.dhikr_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. FIX: Status Constraint Violations (community_posts & hatim_groups)
-- The app logic uses 'completed', 'hidden', and 'deleted' statuses which were missing from the constraints.
ALTER TABLE public.community_posts DROP CONSTRAINT IF EXISTS community_posts_status_check;
ALTER TABLE public.community_posts ADD CONSTRAINT community_posts_status_check 
    CHECK (status IN ('active', 'completed', 'hidden', 'deleted')); -- Added completed, hidden, deleted

ALTER TABLE public.hatim_groups DROP CONSTRAINT IF EXISTS hatim_groups_status_check;
ALTER TABLE public.hatim_groups ADD CONSTRAINT hatim_groups_status_check 
    CHECK (status IN ('open', 'completed', 'cancelled', 'hidden', 'deleted')); -- Added hidden, deleted
