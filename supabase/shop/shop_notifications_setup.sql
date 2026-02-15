-- ============================================
-- Islamvy App - Expanded Notifications & Shop
-- ============================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name_tr text NOT NULL,
    name_en text,
    name_ar text,
    name_id text,
    image_url text NOT NULL,
    category text NOT NULL,
    sub_category text,
    rating decimal DEFAULT 5.0,
    product_url text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can view products
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view products" 
    ON public.products FOR SELECT 
    USING (true);

-- Only authenticated admins (if we had roles, but for now just prevent public write)
-- In a real app, this would be more restrictive.


-- 2. UPDATE NOTIFICATIONS CONSTRAINT
-- First, drop the old constraint if it exists
ALTER TABLE public.community_notifications 
DROP CONSTRAINT IF EXISTS community_notifications_type_check;

-- Add updated constraint with new types
ALTER TABLE public.community_notifications 
ADD CONSTRAINT community_notifications_type_check 
CHECK (type IN ('amen', 'prayed', 'support', 'dhikr_count', 'hatim_slot_taken', 'hatim_completed', 'new_product'));


-- 3. TRIGGER FOR ALL COMMUNITY INTERACTIONS
-- Update the existing function to handle 'prayed' and 'support' correctly
CREATE OR REPLACE FUNCTION public.notify_on_community_interaction()
RETURNS trigger AS $$
DECLARE
    post_owner uuid;
BEGIN
    SELECT user_id INTO post_owner FROM public.community_posts WHERE id = NEW.post_id;
    
    -- Don't notify if the user is interacting with their own post
    IF post_owner != NEW.user_id THEN
        INSERT INTO public.community_notifications (user_id, sender_id, post_id, type)
        VALUES (post_owner, NEW.user_id, NEW.post_id, NEW.type);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. TRIGGER FOR NEW PRODUCTS (Mass Notification)
CREATE OR REPLACE FUNCTION public.notify_on_new_product()
RETURNS trigger AS $$
BEGIN
    -- Create a notification for EVERY profile when a new product is added
    -- NOTE: In a massive scale app, this would be handled via Push Notifications (OneSignal/Firebase)
    -- But for our in-app notification center, we insert for all active profiles.
    INSERT INTO public.community_notifications (user_id, type)
    SELECT id, 'new_product'
    FROM public.profiles;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_on_new_product ON public.products;
CREATE TRIGGER tr_notify_on_new_product
    AFTER INSERT ON public.products
    FOR EACH STATEMENT -- Execute once per bulk insert
    EXECUTE PROCEDURE public.notify_on_new_product();
