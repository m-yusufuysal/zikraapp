-- ============================================
-- Zikra App - Collective Dhikr Pledges & Completion
-- 1. Support specific amounts in interactions
-- 2. Auto-complete community dhikrs
-- 3. Notify all participants on target reach
-- ============================================

BEGIN;

-- 1. ENHANCE INTERACTIONS TABLE
ALTER TABLE public.community_interactions 
ADD COLUMN IF NOT EXISTS amount integer DEFAULT 1;

-- 2. UPDATE PROGRESS TRIGGER
CREATE OR REPLACE FUNCTION public.handle_community_interaction()
RETURNS trigger AS $$
BEGIN
    UPDATE public.community_posts
    SET current_count = current_count + COALESCE(NEW.amount, 1),
        updated_at = now()
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. COMPLETION CHECK TRIGGER FOR POSTS
CREATE OR REPLACE FUNCTION public.check_post_completion()
RETURNS trigger AS $$
BEGIN
    -- Only for dhikr type with a target
    IF NEW.type = 'dhikr' AND NEW.target_count > 0 AND NEW.current_count >= NEW.target_count AND OLD.current_count < NEW.target_count THEN
        NEW.status := 'completed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_post_completion ON public.community_posts;
CREATE TRIGGER tr_check_post_completion
    BEFORE UPDATE OF current_count ON public.community_posts
    FOR EACH ROW EXECUTE PROCEDURE public.check_post_completion();


-- 4. NOTIFY PARTICIPANTS ON COMPLETION
CREATE OR REPLACE FUNCTION public.notify_on_post_completed()
RETURNS trigger AS $$
DECLARE
    participant_record RECORD;
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Notify all unique participants
        FOR participant_record IN (
            SELECT DISTINCT user_id FROM public.community_interactions 
            WHERE post_id = NEW.id
        ) LOOP
            INSERT INTO public.community_notifications (user_id, post_id, type)
            VALUES (participant_record.user_id, NEW.id, 'dhikr_completed');
        END LOOP;
        
        -- Also notify the owner (if not already in participants)
        INSERT INTO public.community_notifications (user_id, post_id, type)
        SELECT NEW.user_id, NEW.id, 'dhikr_completed'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.community_interactions 
            WHERE post_id = NEW.id AND user_id = NEW.user_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_on_post_completed ON public.community_posts;
CREATE TRIGGER tr_notify_on_post_completed
    AFTER UPDATE OF status ON public.community_posts
    FOR EACH ROW EXECUTE PROCEDURE public.notify_on_post_completed();

COMMIT;
