# 🚀 MapMates - Setup Right Now (5 Minutes)

## ❌ Current Issue: 406 Error

You're seeing a **406 "Not Acceptable"** error because the database tables don't exist yet in Supabase.

## ✅ Fix It Now - Follow These Steps:

### Step 1: Open Supabase Dashboard (1 minute)

1. Go to: **https://supabase.com/dashboard**
2. Click on your project: **ofvvzoebexkmacfgmdlo**
3. You should see your project dashboard

### Step 2: Run the Database Setup (2 minutes)

1. **Click "SQL Editor"** in the left sidebar (it has a `</>` icon)
2. **Click "New Query"** button (top right)
3. **Open the file** `mapmates/supabase-setup.sql` in your code editor
4. **Copy ALL the contents** (Ctrl+A, Ctrl+C)
5. **Paste into the SQL Editor** in Supabase
6. **Click "Run"** button (or press Ctrl+Enter)
7. **Wait for success message** - should say "Success. No rows returned"

### Step 3: Enable Realtime (1 minute)

1. Click **"Database"** in the left sidebar
2. Click **"Replication"** tab
3. Find these tables and **toggle them ON**:
   - ✅ `messages`
   - ✅ `connections`
   - ✅ `announcements`

### Step 4: Verify Setup (1 minute)

1. Go back to your browser
2. Open: **http://localhost:3001/test**
3. You should see ✅ green checkmarks
4. If you see ❌ red X marks, check the error message

### Step 5: Use the App!

1. Go to: **http://localhost:3001**
2. Click **"Don't have an account? Sign up"**
3. Fill in:
   - Choose an emoji avatar
   - Enter username
   - Enter email
   - Enter password (min 6 characters)
4. Click **"Create Account"**
5. You should be redirected to the dashboard!

---

## 🐛 Still Having Issues?

### Issue: "relation 'profiles' does not exist"
**Solution**: You didn't run the SQL setup. Go back to Step 2.

### Issue: "new row violates row-level security policy"
**Solution**: The RLS policies weren't created. Run the SQL setup again.

### Issue: "Invalid API key"
**Solution**: Check your `.env.local` file has the correct Supabase keys.

### Issue: Map not loading
**Solution**: 
1. Check Google Maps API key in `.env.local`
2. Make sure it's just the key, not a URL
3. Current key: `AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao`

---

## 📋 Quick Checklist

Before using the app, make sure:

- [ ] Supabase SQL script has been run
- [ ] All tables are created (check in Supabase → Database → Tables)
- [ ] Realtime is enabled for messages, connections, announcements
- [ ] `.env.local` has correct Supabase URL and keys
- [ ] `.env.local` has correct Google Maps API key
- [ ] Dev server is running on http://localhost:3001

---

## 🎯 What You Should See After Setup

### On Login Page (/)
- Purple-blue gradient background
- MapMates logo
- Login/Signup form
- Emoji avatar selector (for signup)

### On Dashboard (/dashboard)
- Header with MapMates logo
- Your Mapos balance
- Interactive map showing your location
- Nearby users (if any)
- Places to discover sidebar

### On Test Page (/test)
- ✅ Connected to Supabase
- ✅ Authentication status
- ✅ Database tables exist

---

## 💡 Pro Tips

1. **First User = Admin**: After creating your first account, go to Supabase → Database → Tables → profiles, find your user, and change `role` from `user` to `admin`

2. **Test Location**: The app defaults to Pune, India (18.5204, 73.8567) if location access is denied

3. **Mapos**: You start with 100 Mapos. Use them to skip games or save them to unlock features

4. **Places**: Submit places to earn 50 Mapos when approved by admin

---

## 🆘 Need Help?

1. Check the browser console (F12) for errors
2. Check the terminal where `npm run dev` is running
3. Check Supabase logs in Dashboard → Logs
4. Review the TROUBLESHOOTING.md file

---

**Ready? Start with Step 1 above!** ⬆️
