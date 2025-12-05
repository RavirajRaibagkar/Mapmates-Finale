# 🔑 MapMates - Sample Credentials

## 👑 Admin Account

### Create This Admin User:

**Email**: `admin@mapmates.com`  
**Password**: `Admin@123456`  
**Username**: `admin`  
**Avatar**: 👑

### Steps:
1. Sign up at http://localhost:3001 with above credentials
2. Run this SQL in Supabase:
```sql
UPDATE profiles SET role = 'admin', is_verified = true WHERE email = 'admin@mapmates.com';
```
3. Login at http://localhost:3001/admin-login

---

## 👤 Test User Accounts

### User 1 (Regular User)
**Email**: `user1@mapmates.com`  
**Password**: `User@123456`  
**Username**: `user1`

### User 2 (Regular User)
**Email**: `user2@mapmates.com`  
**Password**: `User@123456`  
**Username**: `user2`

### Demo Account
**Email**: `demo@mapmates.com`  
**Password**: `Demo@123456`  
**Username**: `demo`

---

## 🚀 Quick Access

### User Portal
**URL**: http://localhost:3001  
**Use**: Regular user login/signup

### Admin Portal
**URL**: http://localhost:3001/admin-login  
**Use**: Admin-only access

### Dashboard
**URL**: http://localhost:3001/dashboard  
**Use**: Main app (after login)

### Admin Panel
**URL**: http://localhost:3001/admin  
**Use**: Admin controls (admin only)

---

## 🎯 Quick Setup

### Make ANY User Admin:
```sql
UPDATE profiles 
SET role = 'admin', is_verified = true 
WHERE email = 'YOUR_EMAIL_HERE';
```

### Check Admin Status:
```sql
SELECT email, username, role FROM profiles WHERE role = 'admin';
```

---

## 💡 Tips

- **First user?** Make yourself admin using the SQL above
- **Testing?** Create multiple accounts with different roles
- **Admin access?** Use http://localhost:3001/admin-login
- **Forgot which is admin?** Check Supabase profiles table

---

**All passwords follow format**: `Name@123456`  
**All usernames**: lowercase of email prefix

**Ready to go!** 🚀
