# Fix Map Not Showing - Quick Guide

## Problem
Map is not displaying places or users - showing "No places or users nearby yet" message.

## Root Cause
The database likely has no approved places, or your location is far from existing places.

## Quick Fix (5 minutes)

### Step 1: Check Database
Open Supabase SQL Editor and run:

```sql
-- Check if you have approved places
SELECT COUNT(*) as total, 
       COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved
FROM places;
```

**If approved = 0**, continue to Step 2.
**If approved > 0**, skip to Step 3.

### Step 2: Add Test Data
Run this in Supabase SQL Editor:

```sql
-- Insert 10 test places near Pune, India
INSERT INTO places (name, description, category, address, budget, location, rating, images, likes, status, submitted_by)
VALUES 
  ('Vaishali Restaurant', 'Famous South Indian restaurant', 'Restaurant', 'FC Road, Pune', '₹₹', '{"lat": 18.5314, "lng": 73.8446}'::jsonb, 4.5, ARRAY[]::text[], 125, 'approved', (SELECT id FROM profiles LIMIT 1)),
  ('Cafe Goodluck', 'Iconic Irani cafe', 'Cafe', 'East Street, Pune', '₹', '{"lat": 18.5196, "lng": 73.8553}'::jsonb, 4.7, ARRAY[]::text[], 210, 'approved', (SELECT id FROM profiles LIMIT 1)),
  ('Shaniwar Wada', 'Historic fortification', 'Tourist Spot', 'Shaniwar Peth, Pune', '₹', '{"lat": 18.5195, "lng": 73.8553}'::jsonb, 4.3, ARRAY[]::text[], 450, 'approved', (SELECT id FROM profiles LIMIT 1)),
  ('Phoenix Marketcity', 'Large shopping mall', 'Shopping', 'Viman Nagar, Pune', '₹₹₹', '{"lat": 18.5679, "lng": 73.9143}'::jsonb, 4.4, ARRAY[]::text[], 380, 'approved', (SELECT id FROM profiles LIMIT 1)),
  ('Sinhagad Fort', 'Ancient hill fortress', 'Tourist Spot', 'Sinhagad, Pune', '₹', '{"lat": 18.3664, "lng": 73.7556}'::jsonb, 4.6, ARRAY[]::text[], 520, 'approved', (SELECT id FROM profiles LIMIT 1)),
  ('German Bakery', 'Popular organic cafe', 'Cafe', 'Koregaon Park, Pune', '₹₹', '{"lat": 18.5362, "lng": 73.8958}'::jsonb, 4.2, ARRAY[]::text[], 165, 'approved', (SELECT id FROM profiles LIMIT 1)),
  ('Aga Khan Palace', 'Historical palace', 'Tourist Spot', 'Nagar Road, Pune', '₹', '{"lat": 18.5525, "lng": 73.9021}'::jsonb, 4.5, ARRAY[]::text[], 290, 'approved', (SELECT id FROM profiles LIMIT 1)),
  ('Kayani Bakery', 'Historic Irani bakery', 'Cafe', 'East Street, Pune', '₹', '{"lat": 18.5189, "lng": 73.8567}'::jsonb, 4.6, ARRAY[]::text[], 340, 'approved', (SELECT id FROM profiles LIMIT 1)),
  ('Dagdusheth Ganpati', 'Famous Ganesha temple', 'Temple', 'Budhwar Peth, Pune', '₹', '{"lat": 18.5167, "lng": 73.8560}'::jsonb, 4.8, ARRAY[]::text[], 680, 'approved', (SELECT id FROM profiles LIMIT 1)),
  ('Pashan Lake', 'Scenic lake for walks', 'Park', 'Pashan, Pune', '₹', '{"lat": 18.5362, "lng": 73.7958}'::jsonb, 4.1, ARRAY[]::text[], 95, 'approved', (SELECT id FROM profiles LIMIT 1));
```

### Step 3: Update Your Location
Run this to set your location to Pune (where test data is):

```sql
-- Get your user ID first
SELECT id, username, location FROM profiles WHERE email = 'YOUR_EMAIL';

-- Update your location (replace YOUR_USER_ID)
UPDATE profiles 
SET location = '{"lat": 18.5204, "lng": 73.8567}'::jsonb
WHERE id = 'YOUR_USER_ID';
```

Or use this to update the first user:
```sql
UPDATE profiles 
SET location = '{"lat": 18.5204, "lng": 73.8567}'::jsonb
WHERE id = (SELECT id FROM profiles ORDER BY created_at LIMIT 1);
```

### Step 4: Refresh Dashboard
1. Go back to your browser
2. Refresh the dashboard page (F5 or Ctrl+R)
3. Map should now show places!

## Verification

After refreshing, you should see:
- ✅ Your emoji in the center of the map
- ✅ Place emojis around you (🍽️, ☕, 🏛️, etc.)
- ✅ Stats showing "📍 10 places shown"
- ✅ Sidebar showing place cards
- ✅ Zoom controls (+/-) working

## Still Not Working?

### Check Browser Console
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for these messages:
   - "Fetched places: X" (should be > 0)
   - "Nearby places: X" (should be > 0)

### If "Fetched places: 0"
Database has no approved places. Run Step 2 again.

### If "Fetched places: 10" but "Nearby places: 0"
Your location is too far. Run Step 3 again.

### Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Refresh page
4. Look for requests to Supabase
5. Check if they return data

## Alternative: Use Your Own Location

If you want to use your actual location instead of Pune:

### Option 1: Get Your Coordinates
1. Go to https://www.latlong.net/
2. Enter your city
3. Copy the coordinates

### Option 2: Update Test Data
```sql
-- Update all places to your location (example: New York)
UPDATE places 
SET location = '{"lat": 40.7128, "lng": -74.0060}'::jsonb
WHERE status = 'approved';

-- Update your profile to same location
UPDATE profiles 
SET location = '{"lat": 40.7128, "lng": -74.0060}'::jsonb
WHERE id = 'YOUR_USER_ID';
```

## Understanding the Map

### How It Works
1. **Fetches approved places** from database
2. **Filters by distance** (within 50km of your location)
3. **Shows top 10** when zoomed out
4. **Shows all nearby** when zoomed in (zoom > 1.5x)

### Why Places Might Not Show
- ❌ No approved places in database
- ❌ Your location > 50km from places
- ❌ Places missing location data
- ❌ Places not approved (status != 'approved')

### Map Features
- **Zoom**: Use +/- buttons (0.5x to 3x)
- **Pan**: Click and drag to move around
- **Click**: Click on place emoji to see details
- **Stats**: Top-left shows counts
- **Help**: Bottom shows instructions

## Database Schema Check

Verify your places table structure:

```sql
-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'places';

-- Should have these columns:
-- - id (uuid)
-- - name (text)
-- - location (jsonb)
-- - status (text)
-- - category (text)
-- - rating (numeric)
-- - etc.
```

## Common Errors

### Error: "relation 'places' does not exist"
**Fix**: Run the full database setup script
```bash
# In Supabase SQL Editor
supabase-setup-with-data.sql
```

### Error: "RLS policy violation"
**Fix**: Run the RLS fix script
```bash
# In Supabase SQL Editor
fix-rls-policies.sql
```

### Error: "Failed to load resource: 406"
**Fix**: Check Supabase URL and keys in `.env.local`

## Testing Checklist

After fixes, verify:
- [ ] Map displays (not just loading spinner)
- [ ] Your emoji shows in center
- [ ] Place emojis visible on map
- [ ] Stats show correct counts
- [ ] Zoom buttons work
- [ ] Can drag to pan
- [ ] Clicking place opens modal
- [ ] Sidebar shows place cards
- [ ] No console errors

## Quick Debug Commands

Run these in browser console (F12):

```javascript
// Check if map component loaded
document.querySelector('[class*="InteractiveMap"]')

// Check current user
console.log('User:', user)

// Check places
console.log('Places:', places)

// Check Supabase connection
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

## Need More Help?

1. Check `MAP_TROUBLESHOOTING.md` for detailed debugging
2. Check browser console for specific errors
3. Verify Supabase connection in `.env.local`
4. Make sure dev server is running (`npm run dev`)

## Success!

Once working, you should see:
- Interactive map with your location
- Place markers with category emojis
- Clickable places showing details
- Smooth zoom and pan
- Real-time updates

Enjoy exploring MapMates! 🗺️✨
