# MapMates - Complete Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose a name (e.g., "mapmates")
   - Set a strong database password
   - Select a region close to you
   - Wait for project to be created (~2 minutes)

2. **Run Database Setup**
   - In your Supabase dashboard, go to "SQL Editor"
   - Click "New Query"
   - Copy the entire contents of `supabase-setup.sql`
   - Paste and click "Run"
   - You should see "Success. No rows returned"

3. **Enable Realtime**
   - Go to "Database" → "Replication"
   - Find these tables and enable replication:
     - `messages`
     - `connections`
     - `announcements`

4. **Get Your API Keys**
   - Go to "Settings" → "API"
   - Copy these values:
     - Project URL (NEXT_PUBLIC_SUPABASE_URL)
     - anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
     - service_role key (SUPABASE_SERVICE_ROLE_KEY)

### Step 2: Google Maps Setup

1. **Get Google Maps API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable "Maps JavaScript API"
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy the API key
   - (Optional) Restrict the key to your domain

### Step 3: Environment Configuration

1. **Update .env.local**
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key-here

   # App Config (optional - defaults are fine)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_PROXIMITY_RADIUS_KM=1
   NEXT_PUBLIC_MAPOS_FOR_CHAT=20
   NEXT_PUBLIC_MAPOS_FOR_PLACE_APPROVAL=50
   ```

### Step 4: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 First Time Usage

### Create Your First Account

1. Open the app
2. Click "Don't have an account? Sign up"
3. Choose an emoji avatar
4. Enter username, email, and password
5. Click "Create Account"
6. You'll be redirected to the dashboard

### Make Yourself an Admin

1. Go to your Supabase dashboard
2. Navigate to "Table Editor" → "profiles"
3. Find your user row
4. Change the `role` column from `user` to `admin`
5. Refresh your app
6. You'll now see the "Admin Panel" button

### Test the Features

1. **Location**: Allow location access when prompted
2. **Map**: You should see yourself on the map
3. **Places**: Click "Discover Places" to browse
4. **Submit Place**: Add a test place
5. **Admin Panel**: Approve your submitted place
6. **Wallet**: Check your Mapos balance

## 🔧 Troubleshooting

### Map Not Loading

**Problem**: Blank map or error message

**Solutions**:
- Check if Google Maps API key is correct
- Ensure Maps JavaScript API is enabled in Google Cloud
- Check browser console for specific errors
- Try allowing location access

### Location Not Detected

**Problem**: "Location not available" error

**Solutions**:
- Allow location access in browser settings
- Use HTTPS (required for geolocation)
- Try a different browser
- Check if location services are enabled on your device

### Supabase Connection Issues

**Problem**: "Failed to fetch" or authentication errors

**Solutions**:
- Verify all environment variables are set correctly
- Check if Supabase project is active
- Ensure RLS policies are created (run SQL setup)
- Check Supabase logs in dashboard

### Build Errors

**Problem**: TypeScript or build errors

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Realtime Not Working

**Problem**: Messages not appearing in real-time

**Solutions**:
- Enable replication for messages table in Supabase
- Check if realtime is enabled in project settings
- Verify RLS policies allow reading messages

## 📱 Testing on Mobile

### Local Network Testing

1. Find your computer's local IP:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Update NEXT_PUBLIC_APP_URL in .env.local:
   ```env
   NEXT_PUBLIC_APP_URL=http://192.168.1.x:3000
   ```

3. Access from mobile: `http://192.168.1.x:3000`

### HTTPS for Geolocation

Geolocation requires HTTPS. Options:

1. **Use ngrok** (easiest):
   ```bash
   npx ngrok http 3000
   ```

2. **Use Vercel Preview** (recommended):
   - Push to GitHub
   - Deploy to Vercel
   - Get HTTPS URL automatically

## 🚀 Production Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repo
   - Add environment variables (same as .env.local)
   - Click "Deploy"

3. **Update Supabase Settings**
   - Go to Supabase → Authentication → URL Configuration
   - Add your Vercel URL to "Site URL"
   - Add to "Redirect URLs"

### Environment Variables for Production

Make sure to add all these in Vercel:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- NEXT_PUBLIC_APP_URL (your Vercel URL)

## 🎨 Customization

### Change Color Scheme

Edit `app/globals.css`:
```css
/* Change from purple-blue to your colors */
.bg-gradient-to-r.from-purple-600.to-blue-600 {
  /* Your gradient here */
}
```

### Add More Emojis

Edit `components/auth/AuthForm.tsx`:
```typescript
const emojis = ['😊', '😎', '🤩', /* add more */];
```

### Modify Mapos Rewards

Edit `.env.local`:
```env
NEXT_PUBLIC_MAPOS_FOR_CHAT=20
NEXT_PUBLIC_MAPOS_FOR_PLACE_APPROVAL=50
```

### Change Proximity Radius

Edit `.env.local`:
```env
NEXT_PUBLIC_PROXIMITY_RADIUS_KM=1  # Change to 2, 5, etc.
```

## 📊 Database Management

### Backup Database

In Supabase dashboard:
1. Go to "Database" → "Backups"
2. Click "Create Backup"
3. Download when ready

### View Logs

1. Go to "Logs" in Supabase
2. Select log type (API, Database, etc.)
3. Filter by time range

### Monitor Usage

1. Go to "Settings" → "Usage"
2. Check database size, API requests, etc.
3. Upgrade plan if needed

## 🔐 Security Best Practices

1. **Never commit .env.local** (already in .gitignore)
2. **Rotate API keys** regularly
3. **Use service role key** only on server
4. **Enable RLS** on all tables (done in SQL setup)
5. **Validate user input** on both client and server
6. **Rate limit** API calls (implement as needed)

## 🆘 Getting Help

### Check Logs

1. **Browser Console**: F12 → Console
2. **Supabase Logs**: Dashboard → Logs
3. **Vercel Logs**: Dashboard → Deployments → View Logs

### Common Issues

- **CORS errors**: Check Supabase URL configuration
- **Auth errors**: Verify email confirmation settings
- **RLS errors**: Check policies in SQL setup
- **Build errors**: Clear cache and rebuild

### Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Google Maps API Docs](https://developers.google.com/maps/documentation)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## ✅ Verification Checklist

Before going live, verify:

- [ ] All environment variables are set
- [ ] Database schema is created
- [ ] RLS policies are enabled
- [ ] Realtime is configured
- [ ] Google Maps loads correctly
- [ ] Location detection works
- [ ] User registration works
- [ ] Admin panel is accessible
- [ ] Chat functionality works
- [ ] Place submission works
- [ ] Mapos transactions work
- [ ] Mobile responsive design works
- [ ] HTTPS is enabled (production)

## 🎉 You're All Set!

Your MapMates application is now ready to use. Enjoy building your social travel community!

For questions or issues, refer to the main README.md or check the documentation links above.
