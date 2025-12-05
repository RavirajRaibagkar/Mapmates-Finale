# 🚀 Production Setup Guide

## Complete Production Deployment

### 📋 Prerequisites

- ✅ Supabase project created
- ✅ GitHub repository ready
- ✅ Vercel account (or hosting platform)
- ✅ Domain name (optional)

---

## Step 1: Database Setup (5 minutes)

### 1.1 Run SQL Scripts

Go to Supabase → SQL Editor and run in order:

```sql
-- 1. Main schema (if not already done)
-- Copy from: supabase-setup.sql

-- 2. Travel plans
-- Copy from: travel-plans-schema.sql

-- 3. Contact messages
-- Copy from: contact-us-schema.sql

-- 4. Helper functions
-- Copy from: plan-helper-functions.sql
```

**Or use the combined script:**
```sql
-- Copy from: RUN_THIS_SQL.sql
```

### 1.2 Create Storage Buckets

1. Go to Supabase → Storage
2. Create buckets:
   - `place-images` (public)
   - `avatars` (public)

3. Set policies for each bucket:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'place-images');

CREATE POLICY "Public can view"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'place-images');

-- Repeat for avatars bucket
```

### 1.3 Verify Setup

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should see 10+ tables including contact_messages
```

---

## Step 2: Environment Configuration (2 minutes)

### 2.1 Get Supabase Credentials

1. Go to Supabase → Settings → API
2. Copy:
   - Project URL
   - Anon/Public key

### 2.2 Create `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2.3 Add to `.gitignore`

Ensure `.env.local` is in `.gitignore`:
```
.env.local
.env*.local
```

---

## Step 3: Build & Test Locally (3 minutes)

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build
npm start
```

**Test checklist:**
- [ ] App loads at http://localhost:3000
- [ ] Can sign up/login
- [ ] Map displays correctly
- [ ] Contact form works
- [ ] No console errors

---

## Step 4: Deploy to Vercel (5 minutes)

### 4.1 Push to GitHub

```bash
git add .
git commit -m "Production ready"
git push origin main
```

### 4.2 Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework: Next.js
   - Root Directory: `./` (or `mapmates` if in subfolder)
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 4.3 Add Environment Variables

In Vercel project settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
```

### 4.4 Deploy

Click "Deploy" and wait 2-3 minutes.

---

## Step 5: Post-Deployment Setup (5 minutes)

### 5.1 Test Production Site

Visit your Vercel URL (e.g., `your-app.vercel.app`)

Test:
- [ ] Homepage loads
- [ ] Sign up works
- [ ] Map displays
- [ ] Contact form submits
- [ ] All features functional

### 5.2 Create Admin User

1. Sign up through your production site
2. Go to Supabase → SQL Editor
3. Run:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

4. Refresh your site
5. You should now see "👑 Admin" button

### 5.3 Add Sample Data (Optional)

```sql
-- Run quick-test-data.sql for sample places
```

---

## Step 6: Custom Domain (Optional)

### 6.1 Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `mapmates.com`)
3. Follow DNS instructions

### 6.2 Update DNS

Add records as shown in Vercel:
- Type: A or CNAME
- Name: @ or www
- Value: (provided by Vercel)

Wait 10-60 minutes for DNS propagation.

### 6.3 Update Supabase

1. Go to Supabase → Authentication → URL Configuration
2. Add your domain to:
   - Site URL
   - Redirect URLs

---

## Step 7: Security Hardening

### 7.1 Enable Rate Limiting

In Supabase → Settings → API:
- Enable rate limiting
- Set appropriate limits

### 7.2 Review RLS Policies

```sql
-- Verify all tables have RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 7.3 Secure Storage

Ensure storage buckets have proper policies:
- Public read for images
- Authenticated write only
- Size limits enforced

---

## Step 8: Monitoring & Analytics

### 8.1 Vercel Analytics

1. Go to Project → Analytics
2. Enable Web Analytics
3. View real-time data

### 8.2 Supabase Monitoring

1. Go to Supabase → Reports
2. Monitor:
   - API requests
   - Database performance
   - Storage usage

### 8.3 Error Tracking (Optional)

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for user tracking

---

## Step 9: Performance Optimization

### 9.1 Enable Caching

Vercel automatically caches static assets.

### 9.2 Image Optimization

Already using Next.js Image component ✅

### 9.3 Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_places_status_rating 
ON places(status, rating DESC);

CREATE INDEX IF NOT EXISTS idx_messages_created 
ON messages(created_at DESC);
```

---

## Step 10: Backup Strategy

### 10.1 Database Backups

Supabase automatically backs up daily.

To create manual backup:
1. Go to Supabase → Database → Backups
2. Click "Create Backup"

### 10.2 Code Backups

GitHub automatically stores your code.

Tag releases:
```bash
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0
```

---

## 🎉 Production Checklist

Before announcing launch:

- [ ] All SQL scripts executed
- [ ] Environment variables set
- [ ] Build succeeds
- [ ] Production site loads
- [ ] Admin user created
- [ ] All features tested
- [ ] Mobile responsive
- [ ] No console errors
- [ ] RLS policies verified
- [ ] Storage configured
- [ ] Domain configured (if applicable)
- [ ] Analytics enabled
- [ ] Backups verified

---

## 🚨 Troubleshooting

### Build Fails
- Check for TypeScript errors
- Verify all dependencies installed
- Review build logs in Vercel

### Database Connection Issues
- Verify environment variables
- Check Supabase project status
- Review RLS policies

### Map Not Loading
- Check Leaflet CSS imported
- Verify location permissions
- Review browser console

### Contact Form Not Working
- Ensure `contact_messages` table exists
- Check RLS policies allow public insert
- Verify Supabase connection

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Leaflet Docs**: https://leafletjs.com/reference.html

---

## 🎊 You're Live!

Congratulations! Your MapMates app is now in production.

**Next Steps:**
1. Share with users
2. Gather feedback
3. Monitor performance
4. Iterate and improve

Good luck! 🚀
