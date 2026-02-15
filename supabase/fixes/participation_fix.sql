-- Add amount column to community_interactions if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_interactions' AND column_name='amount') THEN
        ALTER TABLE public.community_interactions ADD COLUMN amount INTEGER DEFAULT 1;
    END IF;
END $$;

-- Add city and show_full_name to profiles table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='city') THEN
        ALTER TABLE public.profiles ADD COLUMN city TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='show_full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN show_full_name BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update the handle_community_interaction function to use NEW.amount
CREATE OR REPLACE FUNCTION public.handle_community_interaction()
RETURNS trigger AS $$
BEGIN
    UPDATE public.community_posts
    SET current_count = current_count + COALESCE(NEW.amount, 1)
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
