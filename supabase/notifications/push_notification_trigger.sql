-- ============================================
-- Islamvy App - Community Push Notification Trigger
-- Automatically sends push notifications when community_notifications are inserted
-- ============================================

-- IMPORTANT: This requires pg_net extension to be enabled in your Supabase project.
-- Go to Supabase Dashboard > Database > Extensions > Enable "pg_net"

-- Also requires setting the Edge Function URL as a secret or config.
-- Run this in SQL Editor to set the function URL:
-- SELECT set_config('app.edge_function_url', 'https://YOUR_PROJECT.supabase.co/functions/v1/send-push-notification', false);

-- 1. Create the trigger function that calls the Edge Function
CREATE OR REPLACE FUNCTION public.send_push_on_notification()
RETURNS trigger AS $$
DECLARE
    push_token text;
    notification_title text;
    notification_body text;
    edge_url text;
    supabase_key text;
BEGIN
    -- Get the recipient's push token
    SELECT expo_push_token INTO push_token
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Skip if no push token
    IF push_token IS NULL OR push_token = '' THEN
        RETURN NEW;
    END IF;

    -- Get Edge Function URL from environment (set via Dashboard > Project Settings > Secrets)
    edge_url := current_setting('app.settings.edge_function_base_url', true);
    supabase_key := current_setting('app.settings.service_role_key', true);

    -- If not configured, try to use the default format
    IF edge_url IS NULL OR edge_url = '' THEN
        -- Default Supabase Edge Function URL pattern
        edge_url := 'https://' || current_setting('app.settings.project_ref', true) || '.supabase.co/functions/v1';
    END IF;

    -- Prepare notification content based on type
    CASE NEW.type
        WHEN 'amen' THEN
            notification_title := '🤲 Amin';
            notification_body := 'Birisi duanıza amin dedi.';
        WHEN 'prayed' THEN
            notification_title := '📿 Dua';
            notification_body := 'Birisi sizin için dua etti.';
        WHEN 'support' THEN
            notification_title := '💚 Destek';
            notification_body := 'Birisi zikirinizi destekledi.';
        WHEN 'hatim_slot_taken' THEN
            notification_title := '📖 Hatim';
            notification_body := 'Birisi hatminizden bir cüz aldı.';
        WHEN 'hatim_completed' THEN
            notification_title := '📖 Hatim Tamamlandı';
            notification_body := 'Allah kabul etsin! Hatminiz tamamlandı. 🌟';
        WHEN 'dhikr_completed' THEN
            notification_title := '📿 Zikir Tamamlandı';
            notification_body := 'Allah kabul etsin! Zikriniz tamamlandı. ✨';
        WHEN 'new_product' THEN
            notification_title := '🛍️ Islamvy Shop';
            notification_body := 'Yeni ürünler mağazada!';
        ELSE
            RETURN NEW; -- Unknown type, skip
    END CASE;

    -- Send push notification via pg_net extension (async HTTP call)
    PERFORM net.http_post(
        url := edge_url || '/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || supabase_key
        ),
        body := jsonb_build_object(
            'user_ids', ARRAY[NEW.user_id],
            'title', notification_title,
            'body', notification_body,
            'data', jsonb_build_object('type', NEW.type, 'notification_id', NEW.id)
        )
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the main transaction
    RAISE NOTICE 'Push notification trigger error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS tr_send_push_on_notification ON public.community_notifications;
CREATE TRIGGER tr_send_push_on_notification
    AFTER INSERT ON public.community_notifications
    FOR EACH ROW EXECUTE PROCEDURE public.send_push_on_notification();

-- 3. Grant pg_net usage (if not already done)
-- Run this as superuser if you have access:
-- GRANT USAGE ON SCHEMA net TO postgres, authenticated, service_role;

-- ===========================================
-- ALTERNATIVE: Using Supabase Database Webhooks
-- ===========================================
-- If pg_net is not available, you can use Supabase Database Webhooks instead:
-- 1. Go to Database > Webhooks > Create a new webhook
-- 2. Set the Table to: community_notifications
-- 3. Set Events to: INSERT
-- 4. Set the URL to your Edge Function URL
-- 5. Set the HTTP Headers to include your service role key

COMMENT ON FUNCTION public.send_push_on_notification() IS 
'Sends push notifications via Edge Function when community_notifications are inserted. 
Requires pg_net extension to be enabled and app.settings configuration.';
