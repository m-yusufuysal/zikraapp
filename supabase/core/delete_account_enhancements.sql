-- 1. Correcting Community Interaction Counts on Delete
CREATE OR REPLACE FUNCTION public.handle_community_interaction_cleanup()
RETURNS trigger AS $$
BEGIN
    UPDATE public.community_posts
    SET current_count = GREATEST(0, current_count - COALESCE(OLD.amount, 1))
    WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_community_interaction_delete ON public.community_interactions;
CREATE TRIGGER on_community_interaction_delete
    AFTER DELETE ON public.community_interactions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_community_interaction_cleanup();

-- 2. Correcting Hatim Slots on User Deletion
-- Since Hatim slots use ON DELETE SET NULL, we need a trigger to reset status to 'available'
CREATE OR REPLACE FUNCTION public.handle_hatim_slot_user_deleted()
RETURNS trigger AS $$
BEGIN
    IF NEW.user_id IS NULL AND OLD.user_id IS NOT NULL AND OLD.status = 'taken' THEN
        NEW.status := 'available';
        NEW.taken_at := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_hatim_slot_user_null ON public.hatim_slots;
CREATE TRIGGER on_hatim_slot_user_null
    BEFORE UPDATE OF user_id ON public.hatim_slots
    FOR EACH ROW
    WHEN (NEW.user_id IS NULL)
    EXECUTE PROCEDURE public.handle_hatim_slot_user_deleted();
