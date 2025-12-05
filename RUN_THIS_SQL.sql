-- ============================================
-- MapMates - Complete Database Setup
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- This combines all necessary SQL scripts for deployment
-- Copy and paste this entire file into Supabase SQL Editor and run

-- ============================================
-- STEP 1: Main Database Schema
-- ============================================
-- (Your existing supabase-setup.sql content should be here)
-- If you already ran supabase-setup.sql, skip to STEP 2

-- ============================================
-- STEP 2: Travel Plans Schema
-- ============================================
-- (Your existing travel-plans-schema.sql content)
-- If you already ran travel-plans-schema.sql, skip to STEP 3

-- ============================================
-- STEP 3: Contact Messages Schema
-- ============================================

-- Contact Us Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  admin_notes TEXT
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- RLS Policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view all contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON contact_messages;

-- Anyone can insert (submit contact form)
CREATE POLICY "Anyone can submit contact form"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can view all messages
CREATE POLICY "Admins can view all contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update messages
CREATE POLICY "Admins can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_message_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating timestamp
DROP TRIGGER IF EXISTS update_contact_message_timestamp ON contact_messages;
CREATE TRIGGER update_contact_message_timestamp
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_message_timestamp();

-- ============================================
-- STEP 4: Verify Setup
-- ============================================

-- Check if all tables exist
SELECT 
  'profiles' as table_name, 
  COUNT(*) as row_count 
FROM profiles
UNION ALL
SELECT 'places', COUNT(*) FROM places
UNION ALL
SELECT 'connections', COUNT(*) FROM connections
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'travel_plans', COUNT(*) FROM travel_plans
UNION ALL
SELECT 'plan_members', COUNT(*) FROM plan_members
UNION ALL
SELECT 'plan_places', COUNT(*) FROM plan_places
UNION ALL
SELECT 'contact_messages', COUNT(*) FROM contact_messages;

-- ============================================
-- STEP 5: Create Your Admin User
-- ============================================

-- Replace 'your-email@example.com' with your actual email
-- Run this AFTER you've signed up through the app

-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com';

-- ============================================
-- Setup Complete! ✅
-- ============================================

-- Next steps:
-- 1. Sign up through your app
-- 2. Uncomment and run the admin user update above
-- 3. Start using MapMates!
