-- Supabase Storage Setup for Islamvy App Avatars

-- 1. Create the 'avatars' bucket
-- This will store user profile photos. We set it to public so images can be viewed via URL.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable Row Level Security (RLS) policies for the 'avatars' bucket

-- A. Allow Public Access to view photos
-- Anyone (even unauthenticated users) can view profile photos if they have the URL.
CREATE POLICY "Avatar Public View"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- B. Allow Authenticated users to upload their own photo
-- The filename must start with the user's UUID (e.g., "uid/photo.jpg")
CREATE POLICY "Avatar User Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- C. Allow Authenticated users to update their own photo
CREATE POLICY "Avatar User Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- D. Allow Authenticated users to delete their own photo
CREATE POLICY "Avatar User Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
