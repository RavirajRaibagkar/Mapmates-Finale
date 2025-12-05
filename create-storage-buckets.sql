-- Create Storage Buckets for MapMates
-- Run this in Supabase SQL Editor

-- Create place-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'place-images',
  'place-images',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set RLS policies for place-images

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view place images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload place images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own place images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own place images" ON storage.objects;

-- Allow public to view images
CREATE POLICY "Public can view place images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'place-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload place images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'place-images');

-- Allow users to update their own images
CREATE POLICY "Users can update own place images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'place-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own place images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'place-images');

-- Set RLS policies for avatars

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

-- Allow public to view avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Verify buckets were created
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id IN ('place-images', 'avatars');

-- Should return:
-- place-images | place-images | true | 52428800
-- avatars      | avatars      | true | 5242880
