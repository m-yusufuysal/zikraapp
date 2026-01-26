-- ============================================
-- Zikra App - Fix Community Notifications
-- This script fixes the type constraint mismatch
-- and ensures all triggers are properly set up
-- ============================================

-- 1. DROP AND RECREATE TYPE CONSTRAINT
-- The issue: 'prayed' type from community_interactions was not allowed in notifications
ALTER TABLE public.community_notifications 
DROP CONSTRAINT IF EXISTS community_notifications_type_check;

ALTER TABLE public.community_notifications 
ADD CONSTRAINT community_notifications_type_check 
CHECK (type IN ('amen', 'prayed', 'dhikr_count', 'hatim_slot_taken', 'hatim_completed', 'new_product', 'support'));


-- 2. RECREATE THE NOTIFICATION TRIGGER FUNCTION WITH BETTER LOGGING
CREATE OR REPLACE FUNCTION public.notify_on_community_interaction()
RETURNS trigger AS $$
DECLARE
    post_owner uuid;
    notification_type text;
BEGIN
    -- Get the post owner
    SELECT user_id INTO post_owner FROM public.community_posts WHERE id = NEW.post_id;
    
    -- Don't notify if the user is interacting with their own post
    IF post_owner IS NOT NULL AND post_owner != NEW.user_id THEN
        -- Map 'prayed' to the same category for display purposes or keep as-is
        notification_type := NEW.type;
        
        INSERT INTO public.community_notifications (user_id, sender_id, post_id, type)
        VALUES (post_owner, NEW.user_id, NEW.post_id, notification_type);
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the main transaction
    RAISE NOTICE 'Notification trigger error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. RECREATE THE TRIGGER
DROP TRIGGER IF EXISTS tr_notify_on_interaction ON public.community_interactions;
CREATE TRIGGER tr_notify_on_interaction
    AFTER INSERT ON public.community_interactions
    FOR EACH ROW EXECUTE PROCEDURE public.notify_on_community_interaction();


-- 4. RECREATE HATIM SLOT TRIGGER
CREATE OR REPLACE FUNCTION public.notify_on_hatim_slot_taken()
RETURNS trigger AS $$
DECLARE
    hatim_owner uuid;
BEGIN
    SELECT created_by INTO hatim_owner FROM public.hatim_groups WHERE id = NEW.hatim_id;
    
    -- Only notify if someone ELSE takes a slot
    IF NEW.user_id IS NOT NULL AND hatim_owner IS NOT NULL AND hatim_owner != NEW.user_id THEN
        INSERT INTO public.community_notifications (user_id, sender_id, hatim_id, type)
        VALUES (hatim_owner, NEW.user_id, NEW.hatim_id, 'hatim_slot_taken');
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Hatim slot notification error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_on_hatim_slot ON public.hatim_slots;
CREATE TRIGGER tr_notify_on_hatim_slot
    AFTER UPDATE OF user_id ON public.hatim_slots
    FOR EACH ROW
    WHEN (OLD.user_id IS NULL AND NEW.user_id IS NOT NULL)
    EXECUTE PROCEDURE public.notify_on_hatim_slot_taken();


-- 5. ALSO CREATE TRIGGER FOR INSERT (when creator takes slots initially)
DROP TRIGGER IF EXISTS tr_notify_on_hatim_slot_insert ON public.hatim_slots;
CREATE TRIGGER tr_notify_on_hatim_slot_insert
    AFTER INSERT ON public.hatim_slots
    FOR EACH ROW
    WHEN (NEW.user_id IS NOT NULL)
    EXECUTE PROCEDURE public.notify_on_hatim_slot_taken();


-- 6. HATIM COMPLETION TRIGGER
CREATE OR REPLACE FUNCTION public.notify_on_hatim_completed()
RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        INSERT INTO public.community_notifications (user_id, hatim_id, type)
        VALUES (NEW.created_by, NEW.id, 'hatim_completed');
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Hatim completion notification error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_on_hatim_completed ON public.hatim_groups;
CREATE TRIGGER tr_notify_on_hatim_completed
    AFTER UPDATE OF status ON public.hatim_groups
    FOR EACH ROW EXECUTE PROCEDURE public.notify_on_hatim_completed();


-- 7. VERIFY INDEXES EXIST
CREATE INDEX IF NOT EXISTS idx_community_notifications_user_id ON public.community_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_community_notifications_is_read ON public.community_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_community_notifications_created_at ON public.community_notifications(created_at DESC);


-- 8. VERIFY RLS POLICIES
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.community_notifications;
CREATE POLICY "Users can view their own notifications" 
    ON public.community_notifications FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Triggers can insert notifications" ON public.community_notifications;
CREATE POLICY "Triggers can insert notifications" 
    ON public.community_notifications FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.community_notifications;
CREATE POLICY "Users can update their own notifications" 
    ON public.community_notifications FOR UPDATE 
    USING (auth.uid() = user_id);


-- 9. TEST: Manual insert to verify table accepts 'prayed' type
-- (This is just a verification step, you can comment it out)
-- INSERT INTO public.community_notifications (user_id, type, is_read)
-- VALUES ('some-test-uuid', 'prayed', true);
