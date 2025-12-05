-- Create Sample Admin User for MapMates
-- Run this in Supabase SQL Editor

-- First, you need to create the user in Supabase Auth Dashboard
-- OR use this approach to update an existing user to admin

-- Method 1: Update your existing user to admin
-- Replace 'your-email@example.com' with your actual email
UPDATE profiles 
SET role = 'admin', is_verified = true
WHERE email = 'your-email@example.com';

-- Method 2: If you want to create a new admin user
-- You'll need to:
-- 1. Sign up normally at http://localhost:3001
-- 2. Then run this SQL to make that user an admin:

-- UPDATE profiles 
-- SET role = 'admin', is_verified = true
-- WHERE email = 'admin@mapmates.com';

-- Verify admin users
SELECT id, email, username, role, is_verified, mapos
FROM profiles
WHERE role = 'admin';
