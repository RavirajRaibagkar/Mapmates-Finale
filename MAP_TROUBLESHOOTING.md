# Map Troubleshooting Guide

## Issue: Map Not Showing Data

### Symptoms
- Map displays but shows "No places or users nearby yet"
- Console shows "No approved places found in database"
- Only your emoji is visible in the center

### Solutions

#### 1. Check Database Has Data

Run this SQL in Supabase SQL Editor:

```sql
-- Check if places exist
SELECT COUNT(*) as total_places, 
       COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_places
FROM places;

-- Check if places have locations
SELECT id, name, status, location 
FROM places 
WHERE status = 'approved' 
LIMIT 5;
```

**Expected Result**: Should show approved places with location data

#### 2. Verify Sample Data Was Inserted

If you see 0 approved places, run the sample data script:

```sql
-- Insert sample places (from supabase-setup-with-data.sql)
-- Make sure to run the full setup script
```

Or manually insert a test place:

```sql
INSERT INTO places (
  name, 
  description, 
  category, 
  address, 
  budget, 
  location, 
  rating, 
  images, 
  likes, 
  status, 
  submitted_by
) VALUES (
  'Test Restaurant',
  'A test restaurant for debugging',
  'Restaurant',
  'Test Address, Pune',
  '₹₹',
  '{"lat": 18.5204, "lng": 73.8567}'::jsonb,
  4.5,
  ARRAY[]::text[],
  10,
  'approved',
  (SELECT id FROM profiles LIMIT 1)
);
```

#### 3. Check User Location

Open browser console and check:
- Does it show "Fetched places: X" where X > 0?
- Does it show "Nearby places: X" where X > 0?

If fetched > 0 but nearby = 0, your location might be far from sample data.

**Fix**: Update your profile location to match sample data:

```sql
-- Update your location to Pune (where sample data is)
UPDATE profiles 
SET location = '{"lat": 18.5204, "lng": 73.8567}'::jsonb
WHERE id = 'YOUR_USER_ID';
```

#### 4. Check Location Permissions

The app needs browser location permission:
1. Click the lock icon in address bar
2. Allow location access
3. Refresh the page

If denied, manually set location in database (see step 3).

#### 5. Increase Search Radius

If still no places, temporarily increase the radius:

In `components/map/InteractiveMap.tsx`, change:
```typescript
// From:
return isWithinRadius(userLat, userLng, loc.lat, loc.lng, 50);

// To:
return isWithinRadius(userLat, userLng, loc.lat, loc.lng, 500); // 500km
```

This will show places within 500km instead of 50km.

## Issue: Placeholder Image Errors

### Symptoms
- Console shows "Failed to load resource: placeholder.jpg 404"

### Solution
This is now fixed with inline SVG placeholder. If you still see errors:

1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check that PlaceCard.tsx has the `placeholderImage` constant

## Issue: Scroll Behavior Warning

### Symptoms
- Console shows warning about `scroll-behavior: smooth`

### Solution
Already fixed in `app/layout.tsx` with:
```html
<html data-scroll-behavior="smooth">
```

If still showing, clear cache and refresh.

## Issue: Map Shows But Nothing Clickable

### Symptoms
- Map renders with your emoji
- Stats show "0 users nearby, 0 places shown"

### Debugging Steps

1. **Open Browser Console** (F12)
2. **Check for errors** - any red messages?
3. **Look for these logs**:
   - "Fetched places: X"
   - "Nearby places: X"
   - "Error fetching places: ..."

4. **Check Network Tab**:
   - Look for requests to Supabase
   - Check if they return 200 OK
   - Look at response data

### Common Issues

#### Issue: "relation 'places' does not exist"
**Solution**: Run the database setup script
```bash
# In Supabase SQL Editor, run:
supabase-setup-with-data.sql
```

#### Issue: "RLS policy violation"
**Solution**: Run the RLS fix script
```bash
# In Supabase SQL Editor, run:
fix-rls-policies.sql
```

#### Issue: Places exist but not showing
**Possible causes**:
1. Places not approved (status != 'approved')
2. Places too far from your location
3. Places missing location data

**Check with SQL**:
```sql
-- See all places and their status
SELECT name, status, location, 
       CASE 
         WHEN location IS NULL THEN 'NO LOCATION'
         ELSE 'HAS LOCATION'
       END as location_status
FROM places;
```

## Issue: Map Performance Slow

### Symptoms
- Lag when dragging
- Slow zoom
- Choppy animations

### Solutions

1. **Reduce number of places shown**:
```typescript
// In InteractiveMap.tsx
setTopPlaces(nearby.slice(0, 5)); // Show only 5 instead of 10
```

2. **Disable animations temporarily**:
```typescript
// Remove motion.div animations for testing
<div> instead of <motion.div>
```

3. **Check browser performance**:
- Close other tabs
- Disable browser extensions
- Try in incognito mode

## Verification Checklist

After fixes, verify:

- [ ] Map displays with your emoji in center
- [ ] Stats panel shows count > 0
- [ ] Place emojis visible on map
- [ ] Clicking place opens modal
- [ ] Zoom buttons work
- [ ] Drag to pan works
- [ ] Sidebar shows place cards
- [ ] No console errors
- [ ] No 404 errors for images

## Still Not Working?

1. **Check Supabase Connection**:
```typescript
// Add to dashboard page
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

2. **Verify .env.local**:
```
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

3. **Restart Dev Server**:
```bash
# Stop server (Ctrl+C)
# Clear Next.js cache
rm -rf .next
# Restart
npm run dev
```

4. **Check Browser Console** for specific errors and search this guide for solutions.

## Quick Test

Run this in browser console on dashboard:
```javascript
// Should show your user data
console.log('Current user:', user);

// Should show places array
console.log('Places:', places);

// Check if map component mounted
console.log('Map mounted:', document.querySelector('[class*="InteractiveMap"]'));
```

## Contact Support

If none of these solutions work:
1. Take screenshot of browser console
2. Copy any error messages
3. Note what you've tried
4. Check the GitHub issues or documentation
