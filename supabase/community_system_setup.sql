-- ============================================
-- Zikra App - Spiritual Community (Manevi Topluluk)
-- Version 1.0
-- ============================================

-- 1. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    type text DEFAULT 'dua' CHECK (type IN ('dua', 'dhikr', 'hatim')),
    target_count integer DEFAULT 0,
    current_count integer DEFAULT 0,
    status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'hidden')),
    is_premium_only boolean DEFAULT false,
    language_code text DEFAULT 'tr',
    city text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Everyone can view active posts
DROP POLICY IF EXISTS "Anyone can view active posts" ON public.community_posts;
CREATE POLICY "Anyone can view active posts" 
    ON public.community_posts FOR SELECT 
    USING (status = 'active');

-- Registered users can create posts (App will enforce Premium check)
DROP POLICY IF EXISTS "Users can create their own posts" ON public.community_posts;
CREATE POLICY "Users can create their own posts" 
    ON public.community_posts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can edit/hide their own posts
DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
CREATE POLICY "Users can update their own posts" 
    ON public.community_posts FOR UPDATE 
    USING (auth.uid() = user_id);


-- 2. COMMUNITY INTERACTIONS (Amen / Prayed)
CREATE TABLE IF NOT EXISTS public.community_interactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type text DEFAULT 'amen' CHECK (type IN ('amen', 'prayed')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id, type)
);

ALTER TABLE public.community_interactions ENABLE ROW LEVEL SECURITY;

-- Registered users can interact
DROP POLICY IF EXISTS "Users can view interactions" ON public.community_interactions;
CREATE POLICY "Users can view interactions" ON public.community_interactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert interactions" ON public.community_interactions;
CREATE POLICY "Users can insert interactions" ON public.community_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 3. HATIM GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.hatim_groups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    total_slots integer DEFAULT 30,
    status text DEFAULT 'open' CHECK (status IN ('open', 'completed', 'cancelled')),
    language_code text DEFAULT 'tr',
    city text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hatim_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view open hatims" ON public.hatim_groups;
CREATE POLICY "Anyone can view open hatims" ON public.hatim_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create hatims" ON public.hatim_groups;
CREATE POLICY "Users can create hatims" ON public.hatim_groups FOR INSERT WITH CHECK (auth.uid() = created_by);


-- 4. HATIM SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.hatim_slots (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    hatim_id uuid REFERENCES public.hatim_groups(id) ON DELETE CASCADE NOT NULL,
    slot_number integer NOT NULL CHECK (slot_number BETWEEN 1 AND 30),
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    status text DEFAULT 'available' CHECK (status IN ('available', 'taken', 'completed')),
    taken_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(hatim_id, slot_number)
);

ALTER TABLE public.hatim_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view slots" ON public.hatim_slots;
CREATE POLICY "Anyone can view slots" ON public.hatim_slots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert slots for their own hatims" ON public.hatim_slots;
CREATE POLICY "Users can insert slots for their own hatims" ON public.hatim_slots FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.hatim_groups WHERE id = hatim_id AND created_by = auth.uid()));

DROP POLICY IF EXISTS "Users can update assigned slots" ON public.hatim_slots;
CREATE POLICY "Users can update assigned slots" ON public.hatim_slots FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);


-- 5. FUNCTION TO AUTO-UPDATE POST COUNTERS
DROP TRIGGER IF EXISTS on_community_interaction ON public.community_interactions;
DROP FUNCTION IF EXISTS public.handle_community_interaction();

CREATE OR REPLACE FUNCTION public.handle_community_interaction()
RETURNS trigger AS $$
BEGIN
    UPDATE public.community_posts
    SET current_count = current_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_community_interaction
    AFTER INSERT ON public.community_interactions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_community_interaction();


-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON public.community_posts(status);
CREATE INDEX IF NOT EXISTS idx_hatim_slots_hatim_id ON public.hatim_slots(hatim_id);
CREATE INDEX IF NOT EXISTS idx_hatim_slots_user_id ON public.hatim_slots(user_id);


-- 7. COMMUNITY REPORTS
CREATE TABLE IF NOT EXISTS public.community_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES auth.users(id),
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status TEXT DEFAULT 'pending'
);

ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create reports" ON public.community_reports;
CREATE POLICY "Users can create reports" ON public.community_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Only admins can view reports" ON public.community_reports;
CREATE POLICY "Only admins can view reports" ON public.community_reports FOR SELECT USING (false);
