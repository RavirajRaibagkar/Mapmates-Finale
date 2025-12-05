# 👑 Admin Account Setup Guide

## 🎯 How to Create an Admin Account

### Method 1: Make Your Existing Account Admin (EASIEST)

1. **Login to your account** at http://localhost:3001
2. **Note your email address**
3. **Open Supabase SQL Editor**: https://supabase.com/dashboard/project/ofvvzoebexkmacfgmdlo/sql/new
4. **Run this SQL** (replace with your email):

```sql
UPDATE profiles 
SET role = 'admin', is_verified = true
WHERE email = 'your-email@example.com';
```

5. **Logout and login again**
6. **You're now an admin!** ✅

### Method 2: Create a New Admin Account

1. **Sign up** at http://localhost:3001 with:
   - Email: `admin@mapmates.com`
   - Password: `admin123456`
   - Username: `admin`
   - Choose any emoji

2. **Run this SQL** in Supabase:

```sql
UPDATE profiles 
SET role = 'admin', is_verified = true
WHERE email = 'admin@mapmates.com';
```

3. **Logout and login again**
4. **Access admin panel** at http://localhost:3001/admin

---

## 🔐 Sample Admin Credentials

### Option A: Create This Admin Account

**Email**: `admin@mapmates.com`  
**Password**: `Admin@123456`  
**Username**: `admin`  
**Role**: Admin

### Option B: Create This Super Admin

**Email**: `superadmin@mapmates.com`  
**Password**: `SuperAdmin@2024`  
**Username**: `superadmin`  
**Role**: Admin

---

## 📋 Step-by-Step Setup

### Step 1: Create the Account

1. Go to: http://localhost:3001
2. Click "Don't have an account? Sign up"
3. Fill in:
   - **Username**: `admin`
   - **Avatar**: 👑 (or any emoji)
   - **Email**: `admin@mapmates.com`
   - **Password**: `Admin@123456`
4. Click "Create Account"

### Step 2: Make It Admin

1. Open Supabase SQL Editor
2. Run this SQL:

```sql
UPDATE profiles 
SET role = 'admin', 
    is_verified = true,
    mapos = 10000
WHERE email = 'admin@mapmates.com';
```

### Step 3: Login as Admin

**Option A: Regular Login**
1. Go to: http://localhost:3001
2. Login with admin credentials
3. You'll see "👑 Admin" button in header

**Option B: Admin Portal**
1. Go to: http://localhost:3001/admin-login
2. Login with admin credentials
3. Direct access to admin dashboard

---

## 🎯 Admin Access Points

### From User Dashboard
1. Login at http://localhost:3001
2. Look for "👑 Admin" button in header
3. Click to access admin panel

### From Admin Portal
1. Go to http://localhost:3001/admin-login
2. Login with admin credentials
3. Automatically redirected to admin dashboard

---

## 🛠️ Admin Features

Once logged in as admin, you can:

### User Management
- ✅ View all users
- ✅ Ban/Unban users
- ✅ Verify users
- ✅ Promote to admin
- ✅ Search users

### Place Management
- ✅ Approve pending places
- ✅ Reject places
- ✅ Edit place details
- ✅ View all submissions

### Platform Control
- ✅ Send global rewards
- ✅ View analytics
- ✅ Manage games
- ✅ Create announcements

---

## 🔍 Verify Admin Status

Run this SQL to check admin users:

```sql
SELECT 
  id,
  email,
  username,
  role,
  is_verified,
  mapos,
  created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;
```

---

## 🚨 Troubleshooting

### "Access denied. Admin privileges required."
→ Your account is not set to admin role. Run the UPDATE SQL again.

### Can't see Admin button
→ Logout and login again after setting admin role.

### Admin panel shows "Not authorized"
→ Check your role in Supabase profiles table.

---

## 💡 Quick Commands

### Make any user admin:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
```

### Remove admin privileges:
```sql
UPDATE profiles SET role = 'user' WHERE email = 'admin@example.com';
```

### Give admin bonus Mapos:
```sql
UPDATE profiles SET mapos = 10000 WHERE role = 'admin';
```

### List all admins:
```sql
SELECT email, username, mapos FROM profiles WHERE role = 'admin';
```

---

## 🎉 You're All Set!

Once you've created your admin account:

1. ✅ Login at http://localhost:3001 or http://localhost:3001/admin-login
2. ✅ Click "👑 Admin" button
3. ✅ Access full admin dashboard
4. ✅ Manage users, places, and platform

**Enjoy your admin powers!** 👑

---

## 📝 Recommended Admin Accounts

For testing, create these accounts:

| Email | Password | Username | Purpose |
|-------|----------|----------|---------|
| admin@mapmates.com | Admin@123456 | admin | Main admin |
| test@mapmates.com | Test@123456 | testuser | Test user |
| demo@mapmates.com | Demo@123456 | demo | Demo account |

Then make the first one admin using the SQL above!
