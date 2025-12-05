# 🪣 Storage Bucket Setup - REQUIRED

## ⚠️ Error: "Bucket not found"

This error means the storage buckets haven't been created yet.

---

## ✅ Quick Fix (1 minute)

### Run This SQL Script

1. **Go to Supabase → SQL Editor**
2. **Copy and paste this:**

```sql
-- Create place-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'place-images',
  'place-images',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for place-images
DROP POLICY IF EXISTS "Public can view place images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload place images" ON storage.objects;

CREATE POLICY "Public can view place images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'place-images');

CREATE POLICY "Authenticated users can upload place images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'place-images');

-- RLS Policies for avatars
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');
```

3. **Click "Run"**
4. **Done!** ✅

---

## 🧪 Test It

1. Go to `/places/submit`
2. Upload an image
3. Submit place
4. Should see: "X images uploaded successfully!"
5. Check admin panel - images should appear

---

## 📁 What This Creates

### place-images Bucket
- **Purpose**: Store place photos
- **Size limit**: 50MB per file
- **Public**: Yes (anyone can view)
- **Allowed**: jpg, png, webp, gif

### avatars Bucket
- **Purpose**: Store user avatars
- **Size limit**: 5MB per file
- **Public**: Yes (anyone can view)
- **Allowed**: jpg, png, webp

---

## ✅ Verify Setup

Run this to check:

```sql
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id IN ('place-images', 'avatars');
```

Should return:
```
place-images | place-images | true | 52428800
avatars      | avatars      | true | 5242880
```

---

## 🎯 What Happens Now

### Before Setup
- ❌ Upload fails with "Bucket not found"
- ❌ No images in admin panel
- ❌ No images on map

### After Setup
- ✅ Images upload successfully
- ✅ Images appear in admin panel
- ✅ Images show on map popups
- ✅ Images display in place cards

---

## 🐛 Still Having Issues?

### Check Bucket Exists
```sql
SELECT * FROM storage.buckets WHERE id = 'place-images';
```

### Check Policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### Check Upload Permissions
- Make sure you're logged in
- Check browser console for errors
- Verify file size < 50MB
- Verify file type is image

---

## 📝 Alternative: Manual Setup

If SQL doesn't work, create manually:

1. **Supabase → Storage → New Bucket**
2. **Name**: `place-images`
3. **Public**: ✅ YES
4. **File size limit**: 50MB
5. **Create**

Then add policies in the Policies tab.

---

## ✅ Done!

Your storage is now set up and images will work! 🎉

**Next steps:**
1. Test image upload
2. Check admin panel
3. Approve a place
4. See images everywhere

---

**Files:**
- `create-storage-buckets.sql` - Complete SQL script
- `FIX_IMAGE_UPLOAD.md` - Detailed troubleshooting
- `STORAGE_BUCKET_SETUP.md` - This quick guide
