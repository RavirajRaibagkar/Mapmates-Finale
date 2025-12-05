# ⚡ INSTANT SETUP - Get MapMates Running in 60 Seconds

## 🎯 What This Does

This script will:
- ✅ Create all database tables
- ✅ Set up security policies
- ✅ Add 10 sample places in Pune
- ✅ Add 3 sample games
- ✅ Configure everything you need

## 🚀 Quick Setup (60 seconds)

### Step 1: Open Supabase SQL Editor (10 seconds)
Click this link: **https://supabase.com/dashboard/project/ofvvzoebexkmacfgmdlo/sql/new**

### Step 2: Copy & Paste SQL (20 seconds)
1. Open the file: **`mapmates/supabase-setup-with-data.sql`**
2. Select ALL content (Ctrl+A)
3. Copy (Ctrl+C)
4. Paste into Supabase SQL Editor (Ctrl+V)

### Step 3: Run the Script (10 seconds)
1. Click the **"Run"** button (or press Ctrl+Enter)
2. Wait for "Success" message
3. You should see a table showing row counts

### Step 4: Enable Realtime (10 seconds)
1. Go to: **https://supabase.com/dashboard/project/ofvvzoebexkmacfgmdlo/database/replication**
2. Toggle ON these tables:
   - ✅ `messages`
   - ✅ `connections`
   - ✅ `announcements`

### Step 5: Test Your App (10 seconds)
1. Open: **http://localhost:3001**
2. Click "Don't have an account? Sign up"
3. Create your account
4. You're in! 🎉

## 🎁 What You Get

After running this script, you'll have:

### 📍 10 Sample Places in Pune
1. **Shaniwar Wada** - Historic fort (Tourist Spot)
2. **Aga Khan Palace** - Historical palace (Tourist Spot)
3. **Sinhagad Fort** - Ancient hill fortress (Tourist Spot)
4. **Vaishali Restaurant** - South Indian food (Restaurant)
5. **German Bakery** - European bakery (Cafe)
6. **Kayani Bakery** - Famous Irani bakery (Cafe)
7. **Phoenix Marketcity** - Shopping mall (Shopping)
8. **Cafe Goodluck** - Legendary Irani cafe (Cafe)
9. **Malaka Spice** - Pan-Asian restaurant (Restaurant)
10. **Dagdusheth Halwai Ganpati Temple** - Famous temple (Tourist Spot)

### 🎮 3 Sample Games
1. **Math Challenge** - Solve math problems (20 Mapos)
2. **Memory Match** - Match card pairs (20 Mapos)
3. **Quick Quiz** - Travel trivia (20 Mapos)

### 💎 Your Starting Balance
- **100 Mapos** when you sign up
- Earn more by playing games or submitting places

## ✅ Verify Setup

After running the script, you should see this output:

```
table_name      | row_count
----------------|----------
profiles        | 0
places          | 10
games           | 3
reviews         | 0
connections     | 0
messages        | 0
transactions    | 0
achievements    | 0
saved_places    | 0
announcements   | 0
```

## 🎯 What to Do Next

### 1. Create Your Account
- Go to http://localhost:3001
- Sign up with email and password
- Choose your emoji avatar
- You'll get 100 Mapos to start!

### 2. Explore the Dashboard
- See the interactive map
- View the 10 sample places
- Check your Mapos balance

### 3. Make Yourself Admin (Optional)
- Go to Supabase → Database → Tables → `profiles`
- Find your user row
- Change `role` from `user` to `admin`
- Refresh the app
- You'll see the "Admin Panel" button

### 4. Test Features
- **Browse Places**: Click on any of the 10 places
- **Save Places**: Click the bookmark icon
- **Submit Place**: Add your own place (earn 50 Mapos when approved)
- **Play Games**: Earn 20 Mapos per game
- **View Wallet**: Check your transaction history

## 🐛 Troubleshooting

### "Success. No rows returned"
✅ **This is GOOD!** It means the script ran successfully.

### "relation already exists"
✅ **This is OK!** It means tables were already created. The script will skip them.

### "permission denied"
❌ Check that you're using the correct Supabase project and have admin access.

### Still seeing white screen?
1. Check http://localhost:3001/test to see diagnostic info
2. Make sure the SQL script ran successfully
3. Try refreshing your browser (Ctrl+F5)

## 💡 Pro Tips

1. **Location Access**: Allow location access when prompted to see yourself on the map
2. **First User**: The first user you create should be made admin
3. **Sample Data**: The 10 places are real locations in Pune with real coordinates
4. **Mapos**: Start with 100, earn more through games and contributions
5. **Admin Panel**: Make yourself admin to approve places and manage users

## 🎉 You're Done!

Once you run the SQL script, everything will work:
- ✅ Login and signup
- ✅ Interactive map
- ✅ 10 places to explore
- ✅ 3 games to play
- ✅ Full functionality

**Open http://localhost:3001 and start exploring!** 🚀

---

**Need help?** Check http://localhost:3001/test for diagnostic information.
