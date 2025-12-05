# 🚀 Deploy MapMates - Step by Step Guide

## Complete Deployment in 20 Minutes

Follow these steps exactly to deploy your app to production.

---

## 📋 Pre-Deployment (5 minutes)

### Step 1: Complete Database Setup

Go to your Supabase project → SQL Editor and run these scripts:

#### 1.1 Contact Messages (NEW - REQUIRED)
```sql
-- Copy and paste entire content of: contact-us-schema.sql
-- Click "Run"
-- Should see: "Success. No rows returned"
```

#### 1.2 Quiz Games (NEW - REQUIRED)
```sql
-- Copy and paste entire content of: quiz-games-schema.sql
-- Click "Run"
-- Should see: "Success. 12 rows returned" (sample questions)
```

#### 1.3 Storage Buckets (NEW - REQUIRED)
```sql
-- Copy and paste entire content of: create-storage-buckets.sql
-- Click "Run"
-- Should see: "Success. 2 rows returned" (both buckets)
```

#### 1.4 Verify Everything
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should see: profiles, places, connections, messages, transactions,
-- travel_plans, plan_members, plan_places, contact_messages, 
-- quiz_questions, quiz_attempts, daily_quiz_stats

-- Check buckets exist
SELECT id, name, public FROM storage.buckets;

-- Should see: place-images (true), avatars (true)
```

✅ **Database is ready!**

---

## 🔧 Step 2: Build Test (2 minutes)

In your terminal:

```bash
# Make sure you're in the mapmates folder
cd mapmates

# Install dependencies (if not done)
npm install

# Build for production
npm run build
```

**Expected output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size
┌ ○ /                                    X kB
├ ○ /admin                               X kB
├ ○ /dashboard                           X kB
...

○  (Static)  prerendered as static content
```

✅ **Build successful!**

---

## 📦 Step 3: Push to GitHub (3 minutes)

### 3.1 Initialize Git (if not done)

```bash
# Check if git is initialized
git status

# If not initialized:
git init
git add .
git commit -m "Initial commit - MapMates ready for production"
```

### 3.2 Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click "+" → "New repository"
3. Name: `mapmates` (or your choice)
4. **Don't** initialize with README
5. Click "Create repository"

### 3.3 Push Code

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/mapmates.git

# Push code
git branch -M main
git push -u origin main
```

✅ **Code is on GitHub!**

---

## 🌐 Step 4: Deploy to Vercel (5 minutes)

### 4.1 Sign Up / Login

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"
4. Authorize Vercel

### 4.2 Import Project

1. Click "Add New..." → "Project"
2. Find your `mapmates` repository
3. Click "Import"

### 4.3 Configure Project

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (leave as is)

**Build Command:** `npm run build` (auto-filled)

**Output Directory:** `.next` (auto-filled)

**Install Command:** `npm install` (auto-filled)

### 4.4 Add Environment Variables

Click "Environment Variables" and add:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [Your Supabase URL from .env.local]

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Your Supabase Anon Key from .env.local]
```

**To find your values:**
- Open your `.env.local` file
- Copy the values (without quotes)

### 4.5 Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes
3. You'll see: "🎉 Congratulations!"

✅ **Your app is live!**

---

## 🎯 Step 5: Post-Deployment Setup (5 minutes)

### 5.1 Test Your Live Site

Click "Visit" or go to your Vercel URL (e.g., `mapmates.vercel.app`)

**Test these:**
- [ ] Homepage loads
- [ ] Can sign up with email
- [ ] Can login
- [ ] Map displays
- [ ] Can see places

### 5.2 Create Admin User

1. Sign up on your live site with your email
2. Go to Supabase → SQL Editor
3. Run:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

4. Refresh your site
5. You should see "👑 Admin" button

### 5.3 Test Admin Features

1. Click "👑 Admin"
2. Check all tabs work:
   - Dashboard (stats)
   - User Management
   - Place Approvals
   - Contact Messages
   - Quiz Questions

### 5.4 Add Sample Data (Optional)

In Supabase SQL Editor:

```sql
-- Run: quick-test-data.sql
-- This adds sample places and users
```

✅ **Everything is working!**

---

## 🎨 Step 6: Custom Domain (Optional - 10 minutes)

### 6.1 Add Domain in Vercel

1. Go to your project → Settings → Domains
2. Enter your domain (e.g., `mapmates.com`)
3. Click "Add"

### 6.2 Configure DNS

Vercel will show you DNS records to add:

**For root domain (mapmates.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 6.3 Wait for DNS

- DNS propagation takes 10-60 minutes
- Check status in Vercel
- Once verified, your domain is live!

✅ **Custom domain working!**

---

## 📊 Verification Checklist

After deployment, verify:

### User Features
- [ ] Sign up / Login works
- [ ] Map displays with markers
- [ ] Can zoom in/out
- [ ] Click sidebar place → Map focuses
- [ ] Can submit a place
- [ ] Can upload images
- [ ] Can play quiz games
- [ ] Can send contact message
- [ ] Can create travel plans
- [ ] Can connect with users
- [ ] Can chat with connections

### Admin Features
- [ ] Can access admin panel
- [ ] Can view dashboard stats
- [ ] Can manage users
- [ ] Can approve places
- [ ] Can view contact messages
- [ ] Can manage quiz questions

---

## 🐛 Troubleshooting

### Build Fails

**Error:** "Module not found"
```bash
# Solution: Install dependencies
npm install
npm run build
```

**Error:** "Type errors"
```bash
# Solution: Check diagnostics
# All files should have 0 errors
```

### Deployment Fails

**Error:** "Environment variables missing"
- Add them in Vercel → Settings → Environment Variables
- Redeploy

**Error:** "Build timeout"
- Increase timeout in Vercel settings
- Or optimize build

### Site Loads But Features Don't Work

**Map not showing:**
- Check browser console
- Verify Leaflet CSS loaded
- Allow location permissions

**Database errors:**
- Verify all SQL scripts ran
- Check RLS policies
- Verify environment variables

**Images not uploading:**
- Run `create-storage-buckets.sql`
- Check bucket exists in Supabase Storage

---

## 🎉 Success!

Your MapMates app is now live at:
- **Vercel URL:** `https://your-app.vercel.app`
- **Custom Domain:** `https://your-domain.com` (if configured)

### What's Working

✅ All 20+ features
✅ Real-time map
✅ Quiz games
✅ Contact form
✅ Admin panel
✅ Image uploads
✅ User connections
✅ Travel plans
✅ Chat system
✅ Wallet & rewards

### Share Your App

Share your URL with:
- Friends and family
- Social media
- Travel communities
- Beta testers

---

## 📈 Next Steps

### Monitor Performance

1. **Vercel Analytics**
   - Go to your project → Analytics
   - View real-time traffic
   - Check performance metrics

2. **Supabase Logs**
   - Go to Supabase → Logs
   - Monitor database queries
   - Check for errors

### Gather Feedback

1. Ask users to test
2. Collect feature requests
3. Note any bugs
4. Plan improvements

### Iterate

1. Add requested features
2. Fix reported bugs
3. Optimize performance
4. Improve UX

---

## 🆘 Need Help?

### Check These First

1. Browser console (F12)
2. Vercel deployment logs
3. Supabase logs
4. Environment variables
5. RLS policies

### Common Issues

**"Bucket not found"**
- Run `create-storage-buckets.sql`

**"Table doesn't exist"**
- Run missing SQL script
- Check table name spelling

**"Not authenticated"**
- Login again
- Check session
- Verify auth setup

---

## 🎊 Congratulations!

You've successfully deployed MapMates to production!

**Your Achievement:**
- ✅ Built a complete travel platform
- ✅ 20+ features implemented
- ✅ Zero errors
- ✅ Production deployed
- ✅ Live on the internet!

**Share your success!** 🎉

---

## 📞 Support

If you need help:
1. Check documentation files
2. Review error messages
3. Test in incognito mode
4. Check Supabase status
5. Verify all SQL scripts ran

---

**You did it! Your app is live! 🚀**

*MapMates - Discover Places, Connect with Travelers, Earn Rewards*
*Deployed with ❤️ using Next.js, TypeScript, and Supabase*
