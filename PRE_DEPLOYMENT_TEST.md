# ✅ Pre-Deployment Testing Checklist

## Run These Tests Before Deploying

### 🔧 Build Test
```bash
npm run build
```
**Expected**: Build completes with no errors

---

## 🧪 Feature Testing

### 1. Authentication ✅
- [ ] Sign up with new email
- [ ] Receive confirmation email
- [ ] Login with credentials
- [ ] Logout works
- [ ] Session persists on refresh

### 2. Map Features ✅
- [ ] Map loads with OpenStreetMap tiles
- [ ] Your emoji marker appears at center
- [ ] Location permission requested
- [ ] Zoom controls work
- [ ] Zoom OUT (< 14): Shows only top 10 places
- [ ] Zoom IN (≥ 14): Shows all nearby places
- [ ] Click your marker: Popup shows your stats
- [ ] Click user marker: Popup shows user info
- [ ] Click place marker: Popup shows place details
- [ ] "Connect" button in user popup works
- [ ] "View Details" button in place popup navigates to places page

### 3. Contact Form ✅
- [ ] Navigate to `/contact`
- [ ] Form displays correctly
- [ ] Fill all fields
- [ ] Submit form
- [ ] Success message appears
- [ ] Redirects to dashboard after 2 seconds
- [ ] Message saved in database

### 4. Admin Panel ✅
- [ ] Make yourself admin (run SQL)
- [ ] Navigate to `/admin`
- [ ] Dashboard shows stats
- [ ] "New Messages" card shows count
- [ ] Click "Contact Messages" tab
- [ ] See submitted message
- [ ] Filter by status works
- [ ] Update message status
- [ ] Status changes reflected

### 5. Places ✅
- [ ] Navigate to `/places`
- [ ] Places list displays
- [ ] Click "Submit Place"
- [ ] Fill form with valid data
- [ ] Upload image
- [ ] Submit place
- [ ] Place appears in admin approval queue
- [ ] Admin can approve/reject
- [ ] Approved place appears on map

### 6. Travel Plans ✅
- [ ] Navigate to `/plans`
- [ ] Click "Create Plan"
- [ ] Fill plan details
- [ ] Add places to plan
- [ ] Save plan
- [ ] Plan appears in list
- [ ] Click plan to view details
- [ ] Can edit/delete plan

### 7. Chat ✅
- [ ] Navigate to `/chat`
- [ ] See connections list
- [ ] Click connection
- [ ] Send message
- [ ] Message appears
- [ ] Real-time updates work

### 8. Games ✅
- [ ] Navigate to `/games`
- [ ] Play mini-game
- [ ] Earn Mapos
- [ ] Balance updates

### 9. Profile ✅
- [ ] Navigate to `/profile`
- [ ] View stats
- [ ] Edit profile
- [ ] Change avatar emoji
- [ ] Save changes
- [ ] Changes persist

### 10. Wallet ✅
- [ ] Navigate to `/wallet`
- [ ] See Mapos balance
- [ ] View transaction history
- [ ] Transactions display correctly

---

## 🔒 Security Tests

### RLS Policies
- [ ] Non-admin cannot access admin routes
- [ ] Users can only edit their own profile
- [ ] Users can only see approved places
- [ ] Contact form allows anonymous submission
- [ ] Only admins can view contact messages

### Authentication
- [ ] Unauthenticated users redirected to login
- [ ] Protected routes require authentication
- [ ] Session expires appropriately
- [ ] Logout clears session

---

## 📱 Mobile Testing

### Responsive Design
- [ ] Test on mobile device or Chrome DevTools
- [ ] Map is touch-friendly
- [ ] Pinch to zoom works
- [ ] Buttons are large enough
- [ ] Mobile menu works
- [ ] Forms are usable
- [ ] No horizontal scroll

### Performance
- [ ] Page loads in < 3 seconds
- [ ] Map renders smoothly
- [ ] No lag when zooming
- [ ] Images load quickly

---

## 🌐 Browser Testing

Test in:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## 🐛 Error Handling

### Test Error Cases
- [ ] Submit empty contact form → Shows validation
- [ ] Submit place without image → Shows error
- [ ] Try to access admin as non-admin → Redirected
- [ ] Network error → Shows error message
- [ ] Invalid location → Handles gracefully

---

## 📊 Database Verification

Run in Supabase SQL Editor:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should see:
-- - profiles
-- - places
-- - connections
-- - messages
-- - transactions
-- - travel_plans
-- - plan_members
-- - plan_places
-- - contact_messages
-- - notifications

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All should have rowsecurity = true

-- Check sample data
SELECT COUNT(*) as profile_count FROM profiles;
SELECT COUNT(*) as place_count FROM places;
SELECT COUNT(*) as message_count FROM contact_messages;
```

---

## 🚀 Final Checks

### Environment Variables
- [ ] `.env.local` has correct Supabase URL
- [ ] `.env.local` has correct Supabase anon key
- [ ] No sensitive data in git
- [ ] `.env.local` in `.gitignore`

### Code Quality
- [ ] No console.errors in production
- [ ] No TODO comments left
- [ ] All TypeScript errors resolved
- [ ] All diagnostics clean

### Performance
- [ ] Images optimized
- [ ] No memory leaks
- [ ] Efficient database queries
- [ ] Proper loading states

### Documentation
- [ ] README.md updated
- [ ] Deployment guide complete
- [ ] API documentation (if needed)
- [ ] User guide (optional)

---

## ✅ All Tests Passed?

If all tests pass, you're ready to deploy! 🚀

### Deploy Command
```bash
# Commit everything
git add .
git commit -m "Production ready - all tests passed"
git push origin main

# Deploy to Vercel
vercel --prod
```

### Post-Deployment
1. Test on production URL
2. Create admin user in production database
3. Add sample data if needed
4. Monitor logs for errors
5. Set up analytics

---

## 🆘 If Tests Fail

1. Check browser console for errors
2. Review Supabase logs
3. Verify SQL scripts ran successfully
4. Check environment variables
5. Test in incognito mode
6. Clear cache and try again

---

## 📞 Support Checklist

Before asking for help, verify:
- [ ] All SQL scripts executed
- [ ] Environment variables set
- [ ] Node modules installed
- [ ] Database tables exist
- [ ] RLS policies enabled
- [ ] Storage buckets created
- [ ] Browser console checked

---

Good luck with deployment! 🎉
