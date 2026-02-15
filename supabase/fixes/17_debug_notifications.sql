-- ============================================
-- Islamvy App - DIAGNOSTIC & TEST SCRIPT
-- Run this to verify if the notification system is working
-- ============================================

-- 1. Check Constraint Definition (Verify my previous fix worked)
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.community_notifications'::regclass
AND contype = 'c'; -- Check constraints

-- 2. Check Permissions (Grants)
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'community_notifications';

-- 3. FORCE TEST: Manually Insert a Notification for the 5 most recent users
-- This bypasses triggers. If you see this notification in the app, 
-- then the problem is the TRIGGER. If you don't see this, the problem is RLS (Read/View).
INSERT INTO public.community_notifications (user_id, type, message, is_read)
SELECT id, 'amen', '🔔 SYSTEM TEST: This is a manual test notification.', false
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5
RETURNING id, user_id, type;

-- 4. Check Trigger Status
SELECT 
    event_object_table as table, 
    trigger_name, 
    action_timing as timing, 
    event_manipulation as event
FROM information_schema.triggers 
WHERE event_object_table IN ('community_interactions', 'community_notifications', 'hatim_slots');

-- 5. Count existing notifications
SELECT COUNT(*) as total_notifications FROM public.community_notifications;
