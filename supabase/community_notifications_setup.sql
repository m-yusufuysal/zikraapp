-- ============================================
-- Zikra App - Community Notifications System
-- ============================================

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.community_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- Recipient
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE, -- Actor
    post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
    hatim_id uuid REFERENCES public.hatim_groups(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('amen', 'prayed', 'dhikr_count', 'hatim_slot_taken', 'hatim_completed', 'new_product', 'support')),
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.community_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.community_notifications;
CREATE POLICY "Users can view their own notifications" 
    ON public.community_notifications FOR SELECT 
    USING (auth.uid() = user_id);

-- SYSTEM can insert (via triggers) - actually since triggers run as superuser, we don't need a specific policy for that, but for app-side tests:
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.community_notifications;
CREATE POLICY "Anyone can insert notifications" 
    ON public.community_notifications FOR INSERT 
    WITH CHECK (true);

-- Users can update their own notifications (to mark as read)
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.community_notifications;
CREATE POLICY "Users can update their own notifications" 
    ON public.community_notifications FOR UPDATE 
    USING (auth.uid() = user_id);


-- 2. TRIGGER FOR COMMUNITY INTERACTIONS (Amen)
CREATE OR REPLACE FUNCTION public.notify_on_community_interaction()
RETURNS trigger AS $$
DECLARE
    post_owner uuid;
BEGIN
    SELECT user_id INTO post_owner FROM public.community_posts WHERE id = NEW.post_id;
    
    -- Don't notify if the user is interacting with their own post or if post not found
    IF post_owner IS NOT NULL AND post_owner != NEW.user_id THEN
        INSERT INTO public.community_notifications (user_id, sender_id, post_id, type)
        VALUES (post_owner, NEW.user_id, NEW.post_id, NEW.type);
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the main transaction
    RAISE NOTICE 'Notification trigger error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_on_interaction ON public.community_interactions;
CREATE TRIGGER tr_notify_on_interaction
    AFTER INSERT ON public.community_interactions
    FOR EACH ROW EXECUTE PROCEDURE public.notify_on_community_interaction();


-- 3. TRIGGER FOR HATIM SLOTS
CREATE OR REPLACE FUNCTION public.notify_on_hatim_slot_taken()
RETURNS trigger AS $$
DECLARE
    hatim_owner uuid;
BEGIN
    SELECT created_by INTO hatim_owner FROM public.hatim_groups WHERE id = NEW.hatim_id;
    
    -- Only notify if someone ELSE takes a slot
    IF NEW.user_id IS NOT NULL AND hatim_owner != NEW.user_id THEN
        INSERT INTO public.community_notifications (user_id, sender_id, hatim_id, type)
        VALUES (hatim_owner, NEW.user_id, NEW.hatim_id, 'hatim_slot_taken');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_on_hatim_slot ON public.hatim_slots;
CREATE TRIGGER tr_notify_on_hatim_slot
    AFTER UPDATE OF user_id ON public.hatim_slots
    FOR EACH ROW
    WHEN (OLD.user_id IS NULL AND NEW.user_id IS NOT NULL)
    EXECUTE PROCEDURE public.notify_on_hatim_slot_taken();


-- 4. TRIGGER FOR HATIM COMPLETION
CREATE OR REPLACE FUNCTION public.notify_on_hatim_completed()
RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO public.community_notifications (user_id, hatim_id, type)
        VALUES (NEW.created_by, NEW.id, 'hatim_completed');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_on_hatim_completed ON public.hatim_groups;
CREATE TRIGGER tr_notify_on_hatim_completed
    AFTER UPDATE OF status ON public.hatim_groups
    FOR EACH ROW EXECUTE PROCEDURE public.notify_on_hatim_completed();


-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_community_notifications_user_id ON public.community_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_community_notifications_is_read ON public.community_notifications(is_read);
