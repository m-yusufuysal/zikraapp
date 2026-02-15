-- ============================================
-- Islamvy App - MASTER RESET & FIX for Notifications
-- Version: FINAL
-- Run this script to completely repair the notification system.
-- ============================================

BEGIN;

-- 1. ENSURE PROFILES HAS LOCATION & IS PUBLICLY READABLE
-------------------------------------------------------
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE public.profiles ADD COLUMN location text;
    END IF;
END $$;

-- Reset Profile Policies (Allow reading names/locations)
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
DROP POLICY IF EXISTS "Service role key access" ON public.profiles;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Service role key access" ON public.profiles FOR ALL TO service_role USING (true);


-- 2. RESET NOTIFICATIONS TABLE & CONSTRAINTS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
    hatim_id uuid REFERENCES public.hatim_groups(id) ON DELETE CASCADE,
    type text NOT NULL,
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- FORCE DELETE ALL CONSTRAINTS ON 'type' to avoid conflicts
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT conname FROM pg_catalog.pg_constraint con 
              INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid 
              INNER JOIN pg_catalog.pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
              WHERE rel.relname = 'community_notifications' AND att.attname = 'type' AND con.contype = 'c') 
    LOOP
        EXECUTE 'ALTER TABLE public.community_notifications DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Add Correct Constraint
ALTER TABLE public.community_notifications 
ADD CONSTRAINT community_notifications_type_check 
CHECK (type IN ('amen', 'prayed', 'support', 'dhikr_count', 'hatim_slot_taken', 'hatim_completed', 'new_product'));

-- Reset Notification Policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.community_notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.community_notifications;
DROP POLICY IF EXISTS "System insert notifications" ON public.community_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.community_notifications;

CREATE POLICY "Users can view their own notifications" ON public.community_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System insert notifications" ON public.community_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON public.community_notifications FOR UPDATE USING (auth.uid() = user_id);


-- 3. ENABLE REALTIME
-------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'community_notifications') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.community_notifications;
    END IF;
END $$;


-- 4. RECREATE TRIGGERS (THE ENGINE)
-------------------------------------------------------

-- A. Interaction Trigger (Amen / Prayed)
CREATE OR REPLACE FUNCTION public.notify_on_community_interaction()
RETURNS trigger AS $$
DECLARE
    post_owner uuid;
BEGIN
    SELECT user_id INTO post_owner FROM public.community_posts WHERE id = NEW.post_id;
    
    -- Only notify if owner exists and is not self
    IF post_owner IS NOT NULL AND post_owner != NEW.user_id THEN
        INSERT INTO public.community_notifications (user_id, sender_id, post_id, type)
        VALUES (post_owner, NEW.user_id, NEW.post_id, NEW.type);
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW; -- Fail silently to not block the user interaction
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_on_interaction ON public.community_interactions;
CREATE TRIGGER tr_notify_on_interaction
    AFTER INSERT ON public.community_interactions
    FOR EACH ROW EXECUTE PROCEDURE public.notify_on_community_interaction();


-- B. Hatim Slot Trigger
CREATE OR REPLACE FUNCTION public.notify_on_hatim_slot_taken()
RETURNS trigger AS $$
DECLARE
    hatim_owner uuid;
BEGIN
    SELECT created_by INTO hatim_owner FROM public.hatim_groups WHERE id = NEW.hatim_id;
    
    IF NEW.user_id IS NOT NULL AND hatim_owner IS NOT NULL AND hatim_owner != NEW.user_id THEN
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


-- C. Hatim Completion Trigger
CREATE OR REPLACE FUNCTION public.notify_on_hatim_completed()
RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
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


-- 5. RELOAD SCHEMA CACHE
-------------------------------------------------------
NOTIFY pgrst, 'reload config';

COMMIT;
