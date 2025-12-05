# 🔍 Check Database Status

## Quick Check

Run this SQL in Supabase to see if your database is set up:

```sql
-- Check if tables exist
SELECT 
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') as profiles_exists,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'places') as places_exists,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') as messages_exists;
```

### Expected Result:

If database IS set up:
```
profiles_exists | places_exists | messages_exists
----------------|---------------|----------------
true            | true          | true
```

If database is NOT set up:
```
profiles_exists | places_exists | messages_exists
----------------|---------------|----------------
false           | false         | false
```

## If Tables Don't Exist

You need to run the SQL setup script:

1. Open: https://supabase.com/dashboard/project/ofvvzoebexkmacfgmdlo/sql/new
2. Copy ALL content from: `mapmates/supabase-setup-with-data.sql`
3. Paste and click "Run"

## If Tables Exist But Login Fails

Your user was created before the tables existed. The app will now automatically create your profile when you login.

Just try logging in again!

## Current Status

Based on your error messages:
- ✅ Supabase connection works
- ✅ Authentication works (you can login)
- ❌ Tables don't exist OR profile is missing

## Solution

**Option 1: Run the SQL script** (if you haven't already)
- This creates all tables and sample data

**Option 2: Just login again** (if tables exist)
- The app will now auto-create your profile

## Test Your Setup

Go to: http://localhost:3001/test

This will show you exactly what's working and what's not.
