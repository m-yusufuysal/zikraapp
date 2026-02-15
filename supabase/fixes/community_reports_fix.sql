-- Fix for Community Reports Table and Policies
-- Ensures table exists and users can insert reports

-- 1. Create table if it doesn't exist (Backup safety)
CREATE TABLE IF NOT EXISTS public.community_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Changed to profiles for better FK, but auth.users is also fine
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status TEXT DEFAULT 'pending'
);

-- 2. Enable RLS
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can insert their own reports
DROP POLICY IF EXISTS "Users can create reports" ON public.community_reports;
CREATE POLICY "Users can create reports" 
ON public.community_reports FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

-- 4. Policy: Admins/System can view (for now, let's allow users to see their own if needed, but mainly for insert)
DROP POLICY IF EXISTS "Users can view their own reports" ON public.community_reports;
CREATE POLICY "Users can view their own reports" 
ON public.community_reports FOR SELECT 
USING (auth.uid() = reporter_id);
