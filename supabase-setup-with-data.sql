-- ============================================
-- MapMates Complete Database Setup with Sample Data
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_emoji TEXT NOT NULL DEFAULT '😊',
  full_name TEXT,
  bio TEXT,
  location JSONB,
  mapos INTEGER NOT NULL DEFAULT 100,
  level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Places table
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location JSONB NOT NULL,
  address TEXT NOT NULL,
  budget TEXT NOT NULL,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  menu JSONB,
  pricing JSONB,
  likes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB NOT NULL,
  reward_mapos INTEGER NOT NULL DEFAULT 20,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved places table
CREATE TABLE IF NOT EXISTS saved_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_places_location ON places USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_places_status ON places(status);
CREATE INDEX IF NOT EXISTS idx_connections_users ON connections(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_connection ON messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (NOT is_banned);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Places policies
DROP POLICY IF EXISTS "Approved places are viewable by everyone" ON places;
CREATE POLICY "Approved places are viewable by everyone"
  ON places FOR SELECT
  USING (status = 'approved' OR submitted_by = auth.uid());

DROP POLICY IF EXISTS "Users can insert places" ON places;
CREATE POLICY "Users can insert places"
  ON places FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Admins can update places" ON places;
CREATE POLICY "Admins can update places"
  ON places FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Reviews policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert reviews" ON reviews;
CREATE POLICY "Users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Connections policies
DROP POLICY IF EXISTS "Users can view their connections" ON connections;
CREATE POLICY "Users can view their connections"
  ON connections FOR SELECT
  USING (user1_id = auth.uid() OR user2_id = auth.uid());

DROP POLICY IF EXISTS "Users can create connections" ON connections;
CREATE POLICY "Users can create connections"
  ON connections FOR INSERT
  WITH CHECK (user1_id = auth.uid());

-- Messages policies
DROP POLICY IF EXISTS "Users can view messages in their connections" ON messages;
CREATE POLICY "Users can view messages in their connections"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE id = connection_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert transactions" ON transactions;
CREATE POLICY "System can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

-- Achievements policies
DROP POLICY IF EXISTS "Users can view own achievements" ON achievements;
CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  USING (user_id = auth.uid());

-- Games policies
DROP POLICY IF EXISTS "Active games are viewable by everyone" ON games;
CREATE POLICY "Active games are viewable by everyone"
  ON games FOR SELECT
  USING (is_active = true);

-- Saved places policies
DROP POLICY IF EXISTS "Users can view own saved places" ON saved_places;
CREATE POLICY "Users can view own saved places"
  ON saved_places FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can save places" ON saved_places;
CREATE POLICY "Users can save places"
  ON saved_places FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own saved places" ON saved_places;
CREATE POLICY "Users can delete own saved places"
  ON saved_places FOR DELETE
  USING (user_id = auth.uid());

-- Announcements policies
DROP POLICY IF EXISTS "Announcements are viewable by everyone" ON announcements;
CREATE POLICY "Announcements are viewable by everyone"
  ON announcements FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can create announcements" ON announcements;
CREATE POLICY "Admins can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 5. CREATE TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_places_updated_at ON places;
CREATE TRIGGER update_places_updated_at
  BEFORE UPDATE ON places
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. INSERT SAMPLE DATA
-- ============================================

-- Insert sample places (Pune locations)
INSERT INTO places (name, description, category, location, address, budget, rating, images, likes, status, submitted_by) VALUES
('Shaniwar Wada', 'Historic fortification in the city of Pune. Built in 1732, it was the seat of the Peshwas of the Maratha Empire.', 'Tourist Spot', '{"lat": 18.5196, "lng": 73.8553}', 'Shaniwar Peth, Pune, Maharashtra 411030', '₹', 4.5, ARRAY['https://images.unsplash.com/photo-1582510003544-4d00b7f74220'], 245, 'approved', NULL),
('Aga Khan Palace', 'Historical palace built by Sultan Muhammed Shah Aga Khan III in Pune. It is one of the biggest landmarks in Indian history.', 'Tourist Spot', '{"lat": 18.5515, "lng": 73.9029}', 'Nagar Road, Pune, Maharashtra 411006', '₹', 4.7, ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24'], 312, 'approved', NULL),
('Sinhagad Fort', 'Ancient hill fortress located at around 35 km southwest of Pune. Previously called Kondhana, the fort has been the site of many battles.', 'Tourist Spot', '{"lat": 18.3664, "lng": 73.7553}', 'Sinhagad Ghat Road, Pune, Maharashtra 411025', '₹', 4.6, ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24'], 428, 'approved', NULL),
('Vaishali Restaurant', 'Famous South Indian restaurant chain known for authentic dosas, idlis, and filter coffee.', 'Restaurant', '{"lat": 18.5314, "lng": 73.8446}', 'FC Road, Deccan Gymkhana, Pune, Maharashtra 411004', '₹₹', 4.3, ARRAY['https://images.unsplash.com/photo-1630409346693-a6c8b0f0e6f3'], 567, 'approved', NULL),
('German Bakery', 'Iconic bakery and cafe in Koregaon Park, popular for its European-style baked goods and relaxed atmosphere.', 'Cafe', '{"lat": 18.5362, "lng": 73.8958}', 'North Main Road, Koregaon Park, Pune, Maharashtra 411001', '₹₹', 4.4, ARRAY['https://images.unsplash.com/photo-1517487881594-2787fef5ebf7'], 892, 'approved', NULL),
('Kayani Bakery', 'Historic Irani bakery famous for its Shrewsbury biscuits and mawa cakes since 1955.', 'Cafe', '{"lat": 18.5204, "lng": 73.8567}', 'East Street, Camp, Pune, Maharashtra 411001', '₹', 4.6, ARRAY['https://images.unsplash.com/photo-1509440159596-0249088772ff'], 1024, 'approved', NULL),
('Phoenix Marketcity', 'Large shopping mall with international and Indian brands, food court, and entertainment options.', 'Shopping', '{"lat": 18.5590, "lng": 73.7784}', 'Viman Nagar, Pune, Maharashtra 411014', '₹₹₹', 4.5, ARRAY['https://images.unsplash.com/photo-1519567241046-7f570eee3ce6'], 756, 'approved', NULL),
('Cafe Goodluck', 'Legendary Irani cafe serving bun maska, chai, and Parsi dishes since 1935.', 'Cafe', '{"lat": 18.5314, "lng": 73.8446}', 'FC Road, Deccan Gymkhana, Pune, Maharashtra 411004', '₹', 4.5, ARRAY['https://images.unsplash.com/photo-1554118811-1e0d58224f24'], 1156, 'approved', NULL),
('Malaka Spice', 'Pan-Asian restaurant known for its Thai, Malaysian, and Indonesian cuisine in a garden setting.', 'Restaurant', '{"lat": 18.5362, "lng": 73.8958}', 'Lane 5, Koregaon Park, Pune, Maharashtra 411001', '₹₹₹', 4.6, ARRAY['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'], 634, 'approved', NULL),
('Dagdusheth Halwai Ganpati Temple', 'Famous Hindu temple dedicated to Lord Ganesha, known for its beautiful idol and grand celebrations.', 'Tourist Spot', '{"lat": 18.5167, "lng": 73.8560}', 'Budhwar Peth, Pune, Maharashtra 411002', '₹', 4.8, ARRAY['https://images.unsplash.com/photo-1582510003544-4d00b7f74220'], 2145, 'approved', NULL);

-- Insert sample games
INSERT INTO games (title, description, type, config, reward_mapos, is_active) VALUES
('Math Challenge', 'Solve simple math problems to earn Mapos', 'math', '{"difficulty": "easy", "timeLimit": 30}', 20, true),
('Memory Match', 'Match pairs of cards to win Mapos', 'memory', '{"pairs": 6, "timeLimit": 60}', 20, true),
('Quick Quiz', 'Answer trivia questions about travel', 'quiz', '{"questions": 5, "timeLimit": 45}', 20, true);

-- ============================================
-- 7. ENABLE REALTIME
-- ============================================

-- Note: You still need to enable replication in Supabase Dashboard
-- Go to: Database → Replication
-- Enable for: messages, connections, announcements

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Verify tables were created
SELECT 
  'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'places', COUNT(*) FROM places
UNION ALL
SELECT 'games', COUNT(*) FROM games
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'connections', COUNT(*) FROM connections
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'achievements', COUNT(*) FROM achievements
UNION ALL
SELECT 'saved_places', COUNT(*) FROM saved_places
UNION ALL
SELECT 'announcements', COUNT(*) FROM announcements;
