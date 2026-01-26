-- Add expo_push_token to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expo_push_token text;

-- Create an index for faster lookup when sending notifications
CREATE INDEX IF NOT EXISTS idx_profiles_expo_push_token ON public.profiles(expo_push_token);

-- Update RLS if needed (already broad enough for service role)
