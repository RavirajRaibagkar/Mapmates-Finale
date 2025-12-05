# 🚀 MapMates - Quick Start Guide

## Get Running in 5 Minutes!

### 1️⃣ Database Setup (2 minutes)

1. Go to your Supabase project
2. Click "SQL Editor"
3. Copy and paste `contact-us-schema.sql`
4. Click "Run"

**That's it!** (If you haven't run the main setup, run `supabase-setup.sql` first)

### 2️⃣ Environment Check (30 seconds)

Make sure `.env.local` exists with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3️⃣ Install & Run (1 minute)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4️⃣ Test Features (2 minutes)

1. **Sign up** with your email
2. **Allow location** when prompted
3. **View the map** - You should see:
   - Your emoji marker
   - OpenStreetMap tiles
   - Zoom controls
4. **Click markers** - Popups should appear
5. **Test Contact** - Click "📧 Contact" in header
6. **Submit a message** - Should redirect to dashboard

### 5️⃣ Make Yourself Admin (30 seconds)

In Supabase SQL Editor:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Now you can access the Admin panel!

## ✅ What's Working

### Map Features
- ✅ Real OpenStreetMap tiles
- ✅ Emoji markers at GPS locations
- ✅ Zoom in = more places (like Google Maps)
- ✅ Zoom out = top places only
- ✅ Click markers = popup with details
- ✅ "View Details" button works
- ✅ "Connect" button works

### Contact System
- ✅ Contact form at `/contact`
- ✅ Messages saved to database
- ✅ Admin can view/manage messages
- ✅ Status tracking (new/in progress/resolved)

### All Other Features
- ✅ Travel plans
- ✅ Chat system
- ✅ Games & rewards
- ✅ Place submission
- ✅ User profiles
- ✅ Notifications

## 🐛 Troubleshooting

### Map not showing?
- Check browser console for errors
- Allow location permissions
- Refresh the page

### "Window function" errors?
- Fixed! Just refresh the page

### Contact form not working?
- Run `contact-us-schema.sql` in Supabase
- Check browser console

### No places showing?
- Add sample data: Run `quick-test-data.sql`
- Or submit places through the app

## 📱 Mobile Testing

Works perfectly on mobile! Just open on your phone and:
- Map is touch-friendly
- Zoom with pinch gestures
- Tap markers for details
- Responsive design

## 🚀 Deploy Now

Ready to deploy? See `DEPLOYMENT_READY.md` for full guide.

Quick deploy to Vercel:
```bash
git add .
git commit -m "Ready for production"
git push
```

Then import on [vercel.com](https://vercel.com)

## 🎉 You're Done!

Your MapMates app is fully functional and ready to use!

**Key URLs:**
- Dashboard: `/dashboard`
- Contact: `/contact`
- Admin: `/admin`
- Places: `/places`
- Profile: `/profile`

Enjoy! 🎊
