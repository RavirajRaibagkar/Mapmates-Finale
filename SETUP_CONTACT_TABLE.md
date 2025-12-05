# 📧 Contact Messages Table Setup

## Error: "Error fetching messages"

If you see this error in the console, it means the `contact_messages` table hasn't been created yet.

## Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run the SQL Script
Copy and paste the entire contents of `contact-us-schema.sql` and click "Run"

**Or copy this:**

```sql
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
```

### Step 3: Verify
Run this to check if the table was created:

```sql
SELECT * FROM contact_messages;
```

You should see an empty table (no error).

### Step 4: Refresh Your App
Refresh your browser and the error should be gone!

## What This Table Does

- **Stores contact form submissions** from `/contact` page
- **Tracks status** (new, in progress, resolved)
- **Allows public submissions** (anyone can contact you)
- **Admin-only viewing** (only admins can see messages)
- **Automatic timestamps** (created, updated, resolved)

## Features Enabled

Once the table is created:
- ✅ Contact form at `/contact` works
- ✅ Admin can view messages at `/admin` → "Contact Messages" tab
- ✅ Admin can update message status
- ✅ Dashboard shows new message count
- ✅ No more console errors

## Optional: Add Test Data

```sql
INSERT INTO contact_messages (name, email, subject, message, status)
VALUES 
  ('John Doe', 'john@example.com', 'Feature Request', 'Love the app! Can you add dark mode?', 'new'),
  ('Jane Smith', 'jane@example.com', 'Bug Report', 'Map not loading on mobile', 'in_progress'),
  ('Bob Wilson', 'bob@example.com', 'General Inquiry', 'How do I earn more Mapos?', 'resolved');
```

## Troubleshooting

### Still seeing errors?
1. Check if you're logged in as admin
2. Verify RLS policies were created
3. Check browser console for specific error
4. Try logging out and back in

### Table exists but can't see messages?
Make sure you're an admin:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## Done! ✅

Your contact system is now fully functional!
