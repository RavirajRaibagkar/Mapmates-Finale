# Fix CORS Error - Quick Guide

## The Error You're Seeing

```
Access to fetch at 'https://...supabase.co/rest/v1/...' has been blocked by CORS policy
```

## Root Cause

This error typically means:
1. ❌ **Tables don't exist in database** (Most Common)
2. ❌ **RLS policies are blocking access**
3. ❌ **Supabase project is paused/inactive**
4. ❌ **Network/firewall issue**

## Quick Fixes (Try in Order)

### Fix 1: Create Database Tables (MOST LIKELY FIX)

The app is trying to query tables that don't exist yet.

**Step 1: Run Main Setup**
```sql
-- In Supabase SQL Editor, run:
supabase-setup-with-data.sql
```

**Step 2: Run Travel Plans Setup**
```sql
-- In Supabase SQL Editor, run:
travel-plans-schema.sql
```

**Step 3: Run Helper Functions**
```sql
-- In Supabase SQL Editor, run:
plan-helper-functions.sql
```

**Step 4: Verify Tables**
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Should show: places, profiles, connections, messages, travel_plans, plan_checkpoints, etc.

### Fix 2: Check Supabase Project Status

1. Go to Supabase Dashboard
2. Check if project shows "Active" (green)
3. If "Paused", click "Resume Project"
4. Wait 2-3 minutes for project to wake up

### Fix 3: Verify RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

If no policies, run:
```sql
-- Run fix-rls-policies.sql
```

### Fix 4: Test Supabase Connection

**In Browser Console (F12):**
```javascript
// Test if Supabase is accessible
fetch('https://oewzosbnuvqqgeqqcvra.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
}).then(r => console.log('Status:', r.status))
```

Should return: `Status: 200`

### Fix 5: Restart Dev Server

Sometimes the issue is just a stale connection:

```bash
# Stop the dev server (Ctrl+C)
# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

### Fix 6: Check Environment Variables

Verify `.env.local` has correct values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://oewzosbnuvqqgeqqcvra.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**: After changing `.env.local`, restart dev server!

## Detailed Diagnosis

### Check 1: Which Table is Failing?

Look at the error URL:
- `.../travel_plans?...` → Travel plans table missing
- `.../places?...` → Places table missing
- `.../profiles?...` → Profiles table missing

### Check 2: Run Table-Specific Check

```sql
-- For travel_plans error:
SELECT COUNT(*) FROM travel_plans;

-- For places error:
SELECT COUNT(*) FROM places;

-- For profiles error:
SELECT COUNT(*) FROM profiles;
```

If you get "relation does not exist", that table needs to be created.

## Complete Setup Sequence

If nothing works, run this complete setup:

### 1. Main Database Setup
```sql
-- Run in Supabase SQL Editor
-- File: supabase-setup-with-data.sql
-- This creates: profiles, places, connections, messages, etc.
```

### 2. Travel Plans Setup
```sql
-- Run in Supabase SQL Editor
-- File: travel-plans-schema.sql
-- This creates: travel_plans, plan_checkpoints, etc.
```

### 3. Helper Functions
```sql
-- Run in Supabase SQL Editor
-- File: plan-helper-functions.sql
-- This creates: increment_plan_views function
```

### 4. Fix RLS Policies
```sql
-- Run in Supabase SQL Editor
-- File: fix-rls-policies.sql
-- This fixes any RLS issues
```

### 5. Add Test Data
```sql
-- Run in Supabase SQL Editor
-- File: ONE_COMMAND_FIX.sql
-- This adds sample places
```

### 6. Restart Everything
```bash
# Stop dev server
# Clear cache
rm -rf .next

# Restart
npm run dev
```

## Still Not Working?

### Advanced Debugging

**1. Check Supabase Logs**
- Go to Supabase Dashboard
- Click "Logs" in sidebar
- Look for errors

**2. Check Network Tab**
- Open Browser DevTools (F12)
- Go to Network tab
- Refresh page
- Click on failed request
- Check Response tab for error details

**3. Test Direct API Call**

In Supabase Dashboard:
- Go to API Docs
- Try a simple query
- If it works there but not in app, it's a client issue

**4. Check Firewall/Antivirus**
- Temporarily disable firewall
- Try again
- If it works, add exception for localhost:3000

## Common Scenarios

### Scenario 1: Fresh Project
**Problem**: No tables exist
**Fix**: Run all SQL setup files (1-5 above)

### Scenario 2: Paused Project
**Problem**: Supabase project auto-paused
**Fix**: Resume project in dashboard, wait 2-3 minutes

### Scenario 3: Wrong Environment
**Problem**: Using wrong Supabase project
**Fix**: Check `.env.local` has correct URL and key

### Scenario 4: RLS Blocking
**Problem**: Row Level Security denying access
**Fix**: Run `fix-rls-policies.sql`

## Success Indicators

✅ No CORS errors in console
✅ Pages load without errors
✅ Can see data in app
✅ Can create/edit data
✅ Supabase shows "Active"

## Prevention

To avoid this in future:

1. **Always run SQL setup first** before using new features
2. **Keep Supabase project active** (use it regularly)
3. **Backup your database** regularly
4. **Document custom changes** to schema

## Quick Test

After fixes, test with:

```javascript
// In browser console
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Has Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

Should show your URL and `true`.

## Need More Help?

1. Check which specific table is failing
2. Verify that table exists in Supabase
3. Check RLS policies for that table
4. Look at Supabase logs for details
5. Try the table query directly in Supabase

The most common fix is simply running the SQL setup files! 🎯
