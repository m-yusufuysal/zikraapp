-- ============================================
-- Zikra App - FORCE FIX Community Notifications
-- Uses advanced logic to find and remove ANY conflicting constraints
-- ============================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Find and Drop ALL CHECK constraints on the 'type' column of 'community_notifications'
    -- This handles cases where PostgreSQL generated random constraint names (e.g., community_notifications_type_check1)
    FOR r IN (
        SELECT con.conname
        FROM pg_catalog.pg_constraint con
        INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
        INNER JOIN pg_catalog.pg_namespace nsp ON nsp.oid = con.connamespace
        INNER JOIN pg_catalog.pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
        WHERE nsp.nspname = 'public'
          AND rel.relname = 'community_notifications'
          AND att.attname = 'type'
          AND con.contype = 'c' -- Check constraints
    ) LOOP
        EXECUTE 'ALTER TABLE public.community_notifications DROP CONSTRAINT ' || quote_ident(r.conname);
        RAISE NOTICE 'Dropped constraint: %', r.conname;
    END LOOP;
END $$;

-- 2. Add the Correct Constraint (Allowed Types)
ALTER TABLE public.community_notifications 
ADD CONSTRAINT community_notifications_type_check 
CHECK (type IN ('amen', 'prayed', 'support', 'dhikr_count', 'hatim_slot_taken', 'hatim_completed', 'new_product'));


-- 3. Enable Realtime for Notifications (Crucial for In-App Bell)
-- Checks if publication exists, then adds table.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
    END IF;
    
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_notifications;
EXCEPTION WHEN duplicate_object THEN
    -- Table might already be in publication, ignore
    NULL;
END $$;


-- 4. Re-Verify Permissions just in case
GRANT ALL ON public.community_notifications TO postgres;
GRANT ALL ON public.community_notifications TO authenticated;
GRANT ALL ON public.community_notifications TO service_role;


-- 5. Force Recreate Trigger (Safety)
CREATE OR REPLACE FUNCTION public.notify_on_community_interaction()
RETURNS trigger AS $$
DECLARE
    post_owner uuid;
BEGIN
    SELECT user_id INTO post_owner FROM public.community_posts WHERE id = NEW.post_id;
    
    IF post_owner IS NOT NULL AND post_owner != NEW.user_id THEN
        INSERT INTO public.community_notifications (user_id, sender_id, post_id, type)
        VALUES (post_owner, NEW.user_id, NEW.post_id, NEW.type);
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Catch errors to prevent interaction failures, but log them
    RAISE WARNING 'Notification Trigger Failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_on_interaction ON public.community_interactions;
CREATE TRIGGER tr_notify_on_interaction
    AFTER INSERT ON public.community_interactions
    FOR EACH ROW EXECUTE PROCEDURE public.notify_on_community_interaction();
