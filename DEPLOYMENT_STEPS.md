# 🚀 Quick Deployment Steps

## Follow These 5 Steps

### ✅ Step 1: Database (5 min)

**Supabase → SQL Editor → Run these 3 scripts:**

1. `contact-us-schema.sql` ✓
2. `quiz-games-schema.sql` ✓
3. `create-storage-buckets.sql` ✓

---

### ✅ Step 2: Build Test (2 min)

```bash
npm run build
```

Should complete with no errors ✓

---

### ✅ Step 3: GitHub (3 min)

```bash
git add .
git commit -m "Production ready"
git push origin main
```

Code on GitHub ✓

---

### ✅ Step 4: Vercel (5 min)

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click Deploy

Live in 2-3 minutes ✓

---

### ✅ Step 5: Make Admin (1 min)

**Supabase → SQL Editor:**

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Admin access ✓

---

## 🎉 Done!

Your app is live at: `https://your-app.vercel.app`

**Test it:**
- Sign up ✓
- View map ✓
- Submit place ✓
- Play quiz ✓
- Access admin ✓

---

## 📚 Detailed Guide

See `DEPLOY_NOW.md` for complete step-by-step instructions with screenshots and troubleshooting.

---

**Total Time: ~15 minutes**

**You're ready to launch! 🚀**
