# 🎯 START HERE - MapMates Quick Start

## ✅ Current Status

Your MapMates application is **READY TO RUN** but needs **ONE FINAL STEP**: Database setup.

## 🚀 What's Working

- ✅ Next.js app is running on http://localhost:3001
- ✅ All code is compiled and error-free
- ✅ Supabase connection is configured
- ✅ Google Maps API is configured
- ✅ All dependencies are installed

## ❌ What's Missing

- ❌ **Database tables** - You need to run the SQL setup script

## 🎬 Quick Start (Choose One Method)

### Method 1: Automatic Setup Page (EASIEST)

1. Open your browser to: **http://localhost:3001**
2. You'll be automatically redirected to: **http://localhost:3001/setup**
3. Follow the 5 steps on that page
4. Done! ✨

### Method 2: Manual Setup (2 MINUTES)

1. **Open Supabase**: https://supabase.com/dashboard/project/ofvvzoebexkmacfgmdlo/sql/new

2. **Copy SQL**: Open `mapmates/supabase-setup.sql` in your editor, copy ALL content (Ctrl+A, Ctrl+C)

3. **Paste & Run**: Paste into Supabase SQL Editor, click "Run"

4. **Enable Realtime**: 
   - Go to Database → Replication
   - Enable: `messages`, `connections`, `announcements`

5. **Test**: Go to http://localhost:3001/test

6. **Use App**: Go to http://localhost:3001

## 🎉 After Setup

Once the database is set up, you can:

### 1. Create Your Account
- Go to http://localhost:3001
- Click "Don't have an account? Sign up"
- Choose an emoji avatar
- Enter username, email, password
- Click "Create Account"

### 2. Become Admin (Optional)
- Go to Supabase → Database → Tables → profiles
- Find your user row
- Change `role` from `user` to `admin`
- Refresh the app
- You'll see "Admin Panel" button

### 3. Explore Features
- **Dashboard**: See the interactive map
- **Places**: Discover places in Pune
- **Wallet**: Check your Mapos balance (starts with 100)
- **Profile**: View your stats and achievements
- **Admin Panel**: Manage users and places (if admin)

## 🔍 Verify Everything Works

Visit these URLs to test:

- **http://localhost:3001** - Login page (should show form)
- **http://localhost:3001/setup** - Setup guide
- **http://localhost:3001/test** - Diagnostic page
- **http://localhost:3001/dashboard** - Main app (after login)

## 🐛 Troubleshooting

### "White screen" or "406 error"
→ Database not set up. Go to http://localhost:3001/setup

### "Map not loading"
→ Check Google Maps API key in `.env.local`

### "Can't sign up"
→ Check browser console (F12) for errors

### "Tables don't exist"
→ Run the SQL setup script in Supabase

## 📁 Important Files

- **`.env.local`** - Your configuration (Supabase + Google Maps keys)
- **`supabase-setup.sql`** - Database setup script (run this in Supabase)
- **`SETUP_NOW.md`** - Detailed setup instructions
- **`BUILD_FIXES.md`** - What was fixed in the code
- **`TROUBLESHOOTING.md`** - Common issues and solutions

## 🎯 Your Next Steps

1. **Right now**: Open http://localhost:3001 in your browser
2. **Follow the setup wizard** that appears
3. **Create your account** once setup is complete
4. **Start exploring** MapMates!

## 💡 Pro Tips

- **Location**: Allow location access for the map to work properly
- **Mapos**: You start with 100 Mapos - use them wisely!
- **Places**: Submit places to earn 50 Mapos when approved
- **Games**: Play mini-games to earn 20 Mapos
- **Admin**: Make yourself admin to access the control panel

## 🆘 Need Help?

1. Check http://localhost:3001/test for diagnostic info
2. Check browser console (F12) for errors
3. Check terminal where `npm run dev` is running
4. Review TROUBLESHOOTING.md
5. Check Supabase logs in dashboard

## ✨ That's It!

The app is ready. Just run the SQL setup and you're good to go!

**Open http://localhost:3001 now!** 🚀

---

**Note**: The dev server is already running on port 3001. If you need to restart it:
```bash
npm run dev
```
