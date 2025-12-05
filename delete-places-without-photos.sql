-- Delete Places Without Photos
-- Run this in Supabase SQL Editor

-- First, check how many places will be deleted
SELECT 
  COUNT(*) as total_places,
  COUNT(CASE WHEN images IS NULL OR images = '{}' OR array_length(images, 1) IS NULL THEN 1 END) as places_without_images,
  COUNT(CASE WHEN images IS NOT NULL AND images != '{}' AND array_length(images, 1) > 0 THEN 1 END) as places_with_images
FROM places;

-- View places that will be deleted (for review)
SELECT id, name, category, status, images
FROM places
WHERE images IS NULL 
   OR images = '{}' 
   OR array_length(images, 1) IS NULL
   OR array_length(images, 1) = 0;

-- CAUTION: This will permanently delete places without images
-- Uncomment the line below to execute the deletion
-- DELETE FROM places 
-- WHERE images IS NULL 
--    OR images = '{}' 
--    OR array_length(images, 1) IS NULL
--    OR array_length(images, 1) = 0;

-- Alternative: Set status to 'rejected' instead of deleting
-- This keeps the data but hides it from the app
UPDATE places 
SET status = 'rejected'
WHERE (images IS NULL 
   OR images = '{}' 
   OR array_length(images, 1) IS NULL
   OR array_length(images, 1) = 0)
AND status != 'rejected';

-- Verify the update
SELECT 
  status,
  COUNT(*) as count
FROM places
GROUP BY status;

-- If you want to permanently delete rejected places later:
-- DELETE FROM places WHERE status = 'rejected';
