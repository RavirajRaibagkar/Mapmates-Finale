# Setup Travel Plans - Quick Guide

## Error You're Seeing

```
GET https://...supabase.co/rest/v1/travel_plans?... 500 (Internal Server Error)
```

This means the `travel_plans` table doesn't exist in your database yet.

## Fix (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run Schema (Copy & Paste)

**First, run this to create the tables:**

```sql
-- Run travel-plans-schema.sql
-- Copy the ENTIRE content of travel-plans-schema.sql and paste here
-- Then click RUN
```

Open `travel-plans-schema.sql` file, copy ALL of it, paste in SQL Editor, and click RUN.

### Step 3: Run Helper Functions

```sql
-- Run plan-helper-functions.sql
-- Copy the ENTIRE content of plan-helper-functions.sql and paste here
-- Then click RUN
```

Open `plan-helper-functions.sql` file, copy ALL of it, paste in SQL Editor, and click RUN.

### Step 4: Verify Tables Created

Run this to check:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE 'plan%' OR table_name = 'travel_plans')
ORDER BY table_name;
```

You should see:
- plan_checkpoints
- plan_likes
- plan_ratings
- plan_saves
- travel_plans

### Step 5: Refresh Your App

1. Go back to your browser
2. Refresh the page (F5)
3. The error should be gone!

## Quick Test

After setup:
1. Go to `/plans` - Should show empty state
2. Click "Create Plan" - Should open form
3. Fill in details and add checkpoints
4. Submit - Should create plan successfully

## If Still Getting Errors

### Check 1: Tables Exist?
```sql
SELECT COUNT(*) FROM travel_plans;
```

If error "relation does not exist", run Step 2 again.

### Check 2: RLS Policies?
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'travel_plans';
```

Should show multiple policies. If empty, run Step 2 again.

### Check 3: Supabase Connection?
Check `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Common Issues

### Issue: "permission denied for table travel_plans"
**Fix**: RLS policies not created. Run Step 2 again.

### Issue: "function increment_plan_views does not exist"
**Fix**: Helper functions not created. Run Step 3.

### Issue: "column 'creator' does not exist"
**Fix**: This is a join, not a column. The schema is correct, might be a different error.

## Success Indicators

✅ No errors in browser console
✅ `/plans` page loads
✅ Can click "Create Plan"
✅ Can see form
✅ Can add checkpoints

## Need Help?

1. Check browser console (F12) for specific error
2. Check Supabase logs in dashboard
3. Verify all SQL scripts ran successfully
4. Make sure you're logged in to the app

## Files to Run (in order)

1. `travel-plans-schema.sql` - Creates tables and policies
2. `plan-helper-functions.sql` - Creates helper functions

That's it! The Travel Plans feature will work after running these 2 SQL files.
