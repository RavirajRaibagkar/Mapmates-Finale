# Supabase Storage Setup for Photo Uploads

## Quick Setup Guide

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Enter bucket name: `place-images`
5. Set **Public bucket**: ✅ Yes (checked)
6. Click **"Create bucket"**

### Step 2: Set Up Storage Policies

After creating the bucket, you need to add policies:

1. Click on the `place-images` bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**

#### Policy 1: Allow Authenticated Users to Upload

```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'place-images');
```

#### Policy 2: Allow Public Read Access

```sql
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'place-images');
```

#### Policy 3: Allow Users to Delete Their Own Uploads

```sql
CREATE POLICY "Allow users to delete their uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'place-images' AND auth.uid()::text = owner);
```

### Step 3: Verify Setup

1. Go to **Storage** → `place-images`
2. You should see the bucket listed
3. Check that policies are active (green checkmark)

### Alternative: Quick SQL Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Create storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('place-images', 'place-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'place-images');

-- Allow public read access
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'place-images');

-- Allow users to delete their uploads
CREATE POLICY "Allow users to delete their uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'place-images' AND auth.uid()::text = owner);
```

## Testing Photo Upload

1. Go to `/places/submit` in your app
2. Fill in place details
3. Click "Choose File" under Photos section
4. Select 1-5 images
5. You should see previews appear
6. Submit the form
7. Check Supabase Storage → `place-images` to see uploaded files

## Troubleshooting

### Error: "new row violates row-level security policy"
- Make sure you're logged in
- Check that storage policies are created
- Verify bucket is set to public

### Error: "Bucket not found"
- Create the bucket named exactly `place-images`
- Refresh your app

### Photos not displaying
- Check that bucket is set to **public**
- Verify the public URL is correct
- Check browser console for errors

## File Naming Convention

Photos are automatically named with timestamp:
```
{timestamp}-{original-filename}
Example: 1701234567890-restaurant-photo.jpg
```

This prevents naming conflicts and makes files easy to track.

## Storage Limits

- **Free tier**: 1 GB storage
- **Pro tier**: 100 GB storage
- Recommended max file size: 5 MB per image
- Max 5 images per place submission

## Security Notes

- Only authenticated users can upload
- Anyone can view (public bucket)
- Users can only delete their own uploads
- File size limits enforced client-side
- Consider adding server-side validation for production
