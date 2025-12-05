-- Quick Test Data for MapMates
-- Run this in Supabase SQL Editor to add test places

-- First, check if you have any approved places
SELECT COUNT(*) as approved_places FROM places WHERE status = 'approved';

-- If count is 0, run the following inserts:

-- Get a user ID to use as submitted_by (use your own user ID)
-- Replace 'YOUR_USER_ID' with your actual user ID from profiles table

-- Insert test places near Pune, India (18.5204, 73.8567)
INSERT INTO places (name, description, category, address, budget, location, rating, images, likes, status, submitted_by)
VALUES 
  (
    'Vaishali Restaurant',
    'Famous South Indian restaurant known for delicious dosas and filter coffee',
    'Restaurant',
    'FC Road, Pune, Maharashtra',
    '₹₹',
    '{"lat": 18.5314, "lng": 73.8446}'::jsonb,
    4.5,
    ARRAY[]::text[],
    125,
    'approved',
    (SELECT id FROM profiles LIMIT 1)
  ),
  (
    'Cafe Goodluck',
    'Iconic Irani cafe serving bun maska, chai, and Parsi dishes since 1935',
    'Cafe',
    'East Street, Camp, Pune',
    '₹',
    '{"lat": 18.5196, "lng": 73.8553}'::jsonb,
    4.7,
    ARRAY[]::text[],
    210,
    'approved',
    (SELECT id FROM profiles LIMIT 1)
  ),
  (
    'Shaniwar Wada',
    'Historic fortification and palace, former seat of the Peshwas',
    'Tourist Spot',
    'Shaniwar Peth, Pune',
    '₹',
    '{"lat": 18.5195, "lng": 73.8553}'::jsonb,
    4.3,
    ARRAY[]::text[],
    450,
    'approved',
    (SELECT id FROM profiles LIMIT 1)
  ),
  (
    'Phoenix Marketcity',
    'Large shopping mall with retail stores, food court, and entertainment',
    'Shopping',
    'Viman Nagar, Pune',
    '₹₹₹',
    '{"lat": 18.5679, "lng": 73.9143}'::jsonb,
    4.4,
    ARRAY[]::text[],
    380,
    'approved',
    (SELECT id FROM profiles LIMIT 1)
  ),
  (
    'Sinhagad Fort',
    'Ancient hill fortress with panoramic views and historical significance',
    'Tourist Spot',
    'Sinhagad Ghat Road, Pune',
    '₹',
    '{"lat": 18.3664, "lng": 73.7556}'::jsonb,
    4.6,
    ARRAY[]::text[],
    520,
    'approved',
    (SELECT id FROM profiles LIMIT 1)
  ),
  (
    'German Bakery',
    'Popular bakery and cafe in Koregaon Park serving organic food',
    'Cafe',
    'Koregaon Park, Pune',
    '₹₹',
    '{"lat": 18.5362, "lng": 73.8958}'::jsonb,
    4.2,
    ARRAY[]::text[],
    165,
    'approved',
    (SELECT id FROM profiles LIMIT 1)
  ),
  (
    'Aga Khan Palace',
    'Historical palace and memorial to Mahatma Gandhi',
    'Tourist Spot',
    'Nagar Road, Pune',
    '₹',
    '{"lat": 18.5525, "lng": 73.9021}'::jsonb,
    4.5,
    ARRAY[]::text[],
    290,
    'approved',
    (SELECT id FROM profiles LIMIT 1)
  ),
  (
    'Kayani Bakery',
    'Historic Irani bakery famous for Shrewsbury biscuits and mawa cakes',
    'Cafe',
    'East Street, Camp, Pune',
    '₹',
    '{"lat": 18.5189, "lng": 73.8567}'::jsonb,
    4.6,
    ARRAY[]::text[],
    340,
    'approved',
    (SELECT id FROM profiles LIMIT 1)
  ),
  (
    'Dagdusheth Halwai Ganpati Temple',
    'Famous Hindu temple dedicated to Lord Ganesha',
    'Temple',
    'Budhwar Peth, Pune',
    '₹',
    '{"lat": 18.5167, "lng": 73.8560}'::jsonb,
    4.8,
    ARRAY[]::text[],
    680,
    'approved',
    (SELECT id FROM profiles LIMIT 1)
  ),
  (
    'Pashan Lake',
    'Scenic lake perfect for morning walks and bird watching',
    'Park',
    'Pashan, Pune',
    '₹',
    '{"lat": 18.5362, "lng": 73.7958}'::jsonb,
    4.1,
    ARRAY[]::text[],
    95,
    'approved',
    (SELECT id FROM profiles LIMIT 1)
  );

-- Verify the inserts
SELECT name, category, status, location FROM places WHERE status = 'approved';

-- Update your profile location to Pune so you can see these places
-- Replace 'YOUR_USER_ID' with your actual user ID
UPDATE profiles 
SET location = '{"lat": 18.5204, "lng": 73.8567}'::jsonb
WHERE id = (SELECT id FROM profiles LIMIT 1);

-- Check your location
SELECT username, location FROM profiles WHERE id = (SELECT id FROM profiles LIMIT 1);
