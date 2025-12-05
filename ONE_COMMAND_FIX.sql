-- ONE COMMAND FIX FOR MAP
-- Copy and paste this ENTIRE script into Supabase SQL Editor and click RUN

-- Step 1: Add test places
INSERT INTO places (name, description, category, address, budget, location, rating, images, likes, status, submitted_by)
SELECT 
  name, description, category, address, budget, location::jsonb, rating, images, likes, status, 
  (SELECT id FROM profiles ORDER BY created_at LIMIT 1) as submitted_by
FROM (VALUES
  ('Vaishali Restaurant', 'Famous South Indian restaurant', 'Restaurant', 'FC Road, Pune', '₹₹', '{"lat": 18.5314, "lng": 73.8446}', 4.5, ARRAY[]::text[], 125, 'approved'),
  ('Cafe Goodluck', 'Iconic Irani cafe', 'Cafe', 'East Street, Pune', '₹', '{"lat": 18.5196, "lng": 73.8553}', 4.7, ARRAY[]::text[], 210, 'approved'),
  ('Shaniwar Wada', 'Historic fortification', 'Tourist Spot', 'Shaniwar Peth, Pune', '₹', '{"lat": 18.5195, "lng": 73.8553}', 4.3, ARRAY[]::text[], 450, 'approved'),
  ('Phoenix Marketcity', 'Large shopping mall', 'Shopping', 'Viman Nagar, Pune', '₹₹₹', '{"lat": 18.5679, "lng": 73.9143}', 4.4, ARRAY[]::text[], 380, 'approved'),
  ('Sinhagad Fort', 'Ancient hill fortress', 'Tourist Spot', 'Sinhagad, Pune', '₹', '{"lat": 18.3664, "lng": 73.7556}', 4.6, ARRAY[]::text[], 520, 'approved'),
  ('German Bakery', 'Popular organic cafe', 'Cafe', 'Koregaon Park, Pune', '₹₹', '{"lat": 18.5362, "lng": 73.8958}', 4.2, ARRAY[]::text[], 165, 'approved'),
  ('Aga Khan Palace', 'Historical palace', 'Tourist Spot', 'Nagar Road, Pune', '₹', '{"lat": 18.5525, "lng": 73.9021}', 4.5, ARRAY[]::text[], 290, 'approved'),
  ('Kayani Bakery', 'Historic Irani bakery', 'Cafe', 'East Street, Pune', '₹', '{"lat": 18.5189, "lng": 73.8567}', 4.6, ARRAY[]::text[], 340, 'approved'),
  ('Dagdusheth Ganpati', 'Famous Ganesha temple', 'Temple', 'Budhwar Peth, Pune', '₹', '{"lat": 18.5167, "lng": 73.8560}', 4.8, ARRAY[]::text[], 680, 'approved'),
  ('Pashan Lake', 'Scenic lake for walks', 'Park', 'Pashan, Pune', '₹', '{"lat": 18.5362, "lng": 73.7958}', 4.1, ARRAY[]::text[], 95, 'approved')
) AS t(name, description, category, address, budget, location, rating, images, likes, status)
WHERE NOT EXISTS (SELECT 1 FROM places WHERE name = t.name);

-- Step 2: Update your location to Pune
UPDATE profiles 
SET location = '{"lat": 18.5204, "lng": 73.8567}'::jsonb
WHERE id = (SELECT id FROM profiles ORDER BY created_at LIMIT 1);

-- Step 3: Verify
SELECT 
  'Places added:' as info, 
  COUNT(*)::text as result 
FROM places 
WHERE status = 'approved'
UNION ALL
SELECT 
  'Your location:' as info,
  location::text as result
FROM profiles 
WHERE id = (SELECT id FROM profiles ORDER BY created_at LIMIT 1);

-- Done! Now refresh your dashboard (F5) and the map should work!
