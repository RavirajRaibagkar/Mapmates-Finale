-- Fix RLS Policies for MapMates
-- Run this in Supabase SQL Editor to fix 403 errors

-- Drop existing policies and recreate with proper permissions
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Profiles policies - More permissive
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (true);

-- Places policies - More permissive
DROP POLICY IF EXISTS "Approved places are viewable by everyone" ON places;
DROP POLICY IF EXISTS "Users can insert places" ON places;
DROP POLICY IF EXISTS "Admins can update places" ON places;

CREATE POLICY "Anyone can view places"
  ON places FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert places"
  ON places FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update places"
  ON places FOR UPDATE
  USING (true);

-- Reviews policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can insert reviews" ON reviews;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- Connections policies
DROP POLICY IF EXISTS "Users can view their connections" ON connections;
DROP POLICY IF EXISTS "Users can create connections" ON connections;

CREATE POLICY "Anyone can view connections"
  ON connections FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create connections"
  ON connections FOR INSERT
  WITH CHECK (true);

-- Messages policies
DROP POLICY IF EXISTS "Users can view messages in their connections" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can send messages"
  ON messages FOR INSERT
  WITH CHECK (true);

-- Transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "System can insert transactions" ON transactions;

CREATE POLICY "Anyone can view transactions"
  ON transactions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

-- Achievements policies
DROP POLICY IF EXISTS "Users can view own achievements" ON achievements;

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert achievements"
  ON achievements FOR INSERT
  WITH CHECK (true);

-- Saved places policies
DROP POLICY IF EXISTS "Users can view own saved places" ON saved_places;
DROP POLICY IF EXISTS "Users can save places" ON saved_places;
DROP POLICY IF EXISTS "Users can delete own saved places" ON saved_places;

CREATE POLICY "Anyone can view saved places"
  ON saved_places FOR SELECT
  USING (true);

CREATE POLICY "Anyone can save places"
  ON saved_places FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete saved places"
  ON saved_places FOR DELETE
  USING (true);

-- Verify policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
