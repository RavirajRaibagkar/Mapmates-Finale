# 🖼️ Fix Image Upload Issue

## Problem
Images uploaded during place submission don't show in admin panel or anywhere else.

## Root Cause
The `place-images` storage bucket either:
1. Doesn't exist
2. Has incorrect permissions
3. Has wrong RLS policies

---

## ✅ Solution (2 minutes)

### Quick Fix: Run SQL Script

**Easiest method - Just run this SQL:**

1. Go to Supabase → SQL Editor
2. Copy and paste `create-storage-buckets.sql`
3. Click "Run"
4. Done! ✅

This creates both buckets with all policies automatically.

---

### Alternative: Manual Setup

If you prefer manual setup:

1. Go to Supabase → Storage
2. Click "New Bucket"
3. Name: `place-images`
4. **Public bucket**: ✅ YES (check this!)
5. Click "Create Bucket"

### Step 2: Set RLS Policies

Click on `place-images` bucket → Policies → New Policy

**Policy 1: Allow Public Read**
```sql
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'place-images');
```

**Policy 2: Allow Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'place-images');
```

**Policy 3: Allow Users to Update Their Own**
```sql
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'place-images');
```

**Policy 4: Allow Users to Delete Their Own**
```sql
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'place-images');
```

### Step 3: Verify Bucket Settings

In Supabase → Storage → place-images:
- ✅ Public: YES
- ✅ File size limit: 50MB (or higher)
- ✅ Allowed MIME types: image/* (or leave empty for all)

---

## 🧪 Test Upload

### 1. Submit a Test Place

1. Go to `/places/submit`
2. Fill form
3. Upload 1-2 images
4. Click Submit
5. Check browser console for:
   - "Uploading X images..."
   - "Uploaded image URL: ..."
   - "X images uploaded successfully!"

### 2. Check Admin Panel

1. Go to `/admin`
2. Click "Place Approvals"
3. You should see:
   - Image displayed
   - "X image(s) uploaded" text
   - Image preview thumbnails

### 3. Check Supabase Storage

1. Go to Supabase → Storage → place-images
2. You should see uploaded files
3. Click file → Copy URL
4. Paste URL in browser - image should load

---

## 🐛 Troubleshooting

### Images Not Uploading

**Check Console Errors:**
```
Failed to upload: [error message]
```

**Common Issues:**
1. **Bucket doesn't exist** → Create it
2. **Not authenticated** → Login first
3. **File too large** → Reduce image size
4. **Wrong bucket name** → Check spelling

### Images Upload But Don't Display

**Check:**
1. **Public bucket?** → Must be public
2. **RLS policies?** → Must allow public read
3. **Image URL format?** → Should be `https://...supabase.co/storage/v1/object/public/place-images/...`

**Test URL:**
```javascript
// In browser console
console.log(place.images);
// Should show array of URLs
```

### Images Show in Console But Not in UI

**Check:**
1. **CORS errors?** → Check browser console
2. **Image format?** → Should be jpg, png, webp
3. **URL accessible?** → Paste URL in new tab

---

## 📊 Expected Behavior

### During Upload
```
✅ "Uploading 2 images..."
✅ "Uploaded image URL: https://..."
✅ "2 images uploaded successfully!"
✅ "Place submitted for review! 2 images uploaded."
```

### In Admin Panel
```
✅ Main image displayed (large)
✅ "+X more" badge if multiple images
✅ Thumbnail grid for additional images
✅ "X image(s) uploaded" info text
```

### In Database
```sql
SELECT images FROM places WHERE id = 'place-id';
-- Should return: ["https://...", "https://..."]
```

---

## 🔧 Quick Fix SQL

If you need to reset everything:

```sql
-- Delete all policies
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Recreate policies
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'place-images');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'place-images');

CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'place-images');

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'place-images');
```

---

## ✅ Verification Checklist

After setup:
- [ ] Bucket `place-images` exists
- [ ] Bucket is marked as PUBLIC
- [ ] RLS policies allow public read
- [ ] RLS policies allow authenticated upload
- [ ] Can upload image via form
- [ ] Console shows upload success
- [ ] Image appears in admin panel
- [ ] Image appears on map popup
- [ ] Image appears in place cards
- [ ] Image URL is accessible in browser

---

## 🎯 Alternative: Use Cloudinary/Imgur

If Supabase storage is problematic, you can use external services:

### Cloudinary Setup
1. Sign up at cloudinary.com
2. Get upload preset
3. Update upload code to use Cloudinary API
4. Store Cloudinary URLs in database

### Imgur Setup
1. Sign up at imgur.com
2. Get API key
3. Update upload code to use Imgur API
4. Store Imgur URLs in database

---

## 📝 Updated Code

The code has been updated with:
- ✅ Better error handling
- ✅ Upload progress toast
- ✅ Console logging for debugging
- ✅ Image load error handling
- ✅ Debug info in admin panel

---

## 🚀 After Fix

Once images work:
1. Test with different image formats (jpg, png, webp)
2. Test with multiple images (up to 5)
3. Test with large images (resize if needed)
4. Verify images show everywhere:
   - Admin approval panel
   - Place cards
   - Map popups
   - Place details page

---

## 💡 Pro Tips

1. **Optimize images before upload**
   - Resize to max 1920x1080
   - Compress to reduce file size
   - Use WebP format for better compression

2. **Add image validation**
   - Check file size (< 5MB)
   - Check file type (jpg, png, webp)
   - Check dimensions (not too small)

3. **Add loading states**
   - Show spinner during upload
   - Show progress bar
   - Disable submit during upload

---

## ✅ Done!

Your image upload should now work perfectly!

**Test it:**
1. Submit a place with images
2. Check admin panel
3. Approve the place
4. See images on map and cards

🎉 Images working!
