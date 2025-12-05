# MapMates - Troubleshooting Guide

## 🔍 Common Issues & Solutions

### Authentication Issues

#### Problem: "Invalid login credentials"
**Symptoms**: Cannot log in with correct email/password

**Solutions**:
1. Check if email is confirmed in Supabase dashboard
2. Verify password is correct (case-sensitive)
3. Check Supabase Auth logs for errors
4. Try password reset flow
5. Check if user exists in profiles table

```sql
-- Check if user exists
SELECT * FROM auth.users WHERE email = 'user@example.com';
SELECT * FROM profiles WHERE email = 'user@example.com';
```

#### Problem: "Session expired" or auto-logout
**Symptoms**: User logged out unexpectedly

**Solutions**:
1. Check session duration in Supabase settings
2. Verify JWT secret is correct
3. Check browser cookies are enabled
4. Clear browser cache and cookies
5. Check for CORS issues

```typescript
// Force session refresh
const { data: { session }, error } = await supabase.auth.refreshSession();
```

#### Problem: Cannot create account
**Symptoms**: Sign up fails with error

**Solutions**:
1. Check if email already exists
2. Verify password meets requirements (min 6 chars)
3. Check Supabase email settings
4. Verify email confirmation is disabled (or handle it)
5. Check database RLS policies

---

### Map Issues

#### Problem: Map not loading
**Symptoms**: Blank map area or error message

**Solutions**:
1. **Check API Key**
   ```bash
   # Verify in .env.local
   echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   ```

2. **Enable APIs in Google Cloud**
   - Maps JavaScript API
   - Geocoding API (optional)
   - Places API (optional)

3. **Check API Key Restrictions**
   - Remove restrictions for testing
   - Add your domain for production

4. **Check Console Errors**
   ```javascript
   // Open browser console (F12)
   // Look for Google Maps errors
   ```

5. **Verify Script Loading**
   ```typescript
   // Check if Google Maps loaded
   console.log('Google Maps:', window.google?.maps);
   ```

#### Problem: Location not detected
**Symptoms**: "Location not available" error

**Solutions**:
1. **Enable Location Services**
   - Browser settings → Privacy → Location
   - Allow location for your site

2. **Use HTTPS**
   - Geolocation requires HTTPS (except localhost)
   - Deploy to Vercel for automatic HTTPS

3. **Check Permissions**
   ```javascript
   navigator.permissions.query({ name: 'geolocation' })
     .then(result => console.log('Permission:', result.state));
   ```

4. **Fallback Location**
   ```typescript
   // Use default Pune coordinates
   const defaultLocation = { lat: 18.5204, lng: 73.8567 };
   ```

#### Problem: Nearby users not showing
**Symptoms**: Map loads but no users visible

**Solutions**:
1. Check if users have location data
2. Verify proximity calculation
3. Check database query
4. Verify RLS policies allow reading profiles

```sql
-- Check users with location
SELECT id, username, location 
FROM profiles 
WHERE location IS NOT NULL;

-- Test proximity query
SELECT * FROM profiles 
WHERE location IS NOT NULL 
AND is_banned = FALSE;
```

---

### Database Issues

#### Problem: "Row Level Security policy violation"
**Symptoms**: Cannot read/write data

**Solutions**:
1. **Check RLS Policies**
   ```sql
   -- View policies for a table
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

2. **Verify User Authentication**
   ```typescript
   const { data: { session } } = await supabase.auth.getSession();
   console.log('User ID:', session?.user?.id);
   ```

3. **Test with Service Role Key** (temporarily)
   ```typescript
   // Use service role key to bypass RLS (testing only!)
   const supabase = createClient(url, serviceRoleKey);
   ```

4. **Check Policy Conditions**
   - Ensure auth.uid() matches user ID
   - Verify role checks for admin actions

#### Problem: "Duplicate key value violates unique constraint"
**Symptoms**: Cannot insert data

**Solutions**:
1. Check for existing records
2. Use upsert instead of insert
3. Handle unique constraint errors

```typescript
// Use upsert
const { error } = await supabase
  .from('profiles')
  .upsert({ id: userId, username: 'newname' });

// Or check first
const { data: existing } = await supabase
  .from('profiles')
  .select('id')
  .eq('username', 'newname')
  .single();

if (!existing) {
  // Insert
}
```

#### Problem: Slow queries
**Symptoms**: Long load times, timeouts

**Solutions**:
1. **Add Indexes**
   ```sql
   -- Check existing indexes
   SELECT * FROM pg_indexes WHERE tablename = 'profiles';
   
   -- Add index if missing
   CREATE INDEX idx_profiles_location ON profiles USING GIN (location);
   ```

2. **Optimize Queries**
   ```typescript
   // Bad: Select all columns
   const { data } = await supabase.from('profiles').select('*');
   
   // Good: Select only needed columns
   const { data } = await supabase
     .from('profiles')
     .select('id, username, avatar_emoji');
   ```

3. **Use Pagination**
   ```typescript
   const { data } = await supabase
     .from('places')
     .select('*')
     .range(0, 9); // First 10 items
   ```

---

### Realtime Issues

#### Problem: Messages not appearing in real-time
**Symptoms**: Need to refresh to see new messages

**Solutions**:
1. **Enable Replication**
   - Supabase → Database → Replication
   - Enable for messages table

2. **Check Subscription**
   ```typescript
   const channel = supabase
     .channel('messages')
     .on('postgres_changes', {
       event: 'INSERT',
       schema: 'public',
       table: 'messages'
     }, (payload) => {
       console.log('New message:', payload);
     })
     .subscribe((status) => {
       console.log('Subscription status:', status);
     });
   ```

3. **Verify RLS Policies**
   - Ensure user can read messages
   - Check connection-based access

4. **Check Network**
   - WebSocket connection active
   - No firewall blocking

---

### Build & Deployment Issues

#### Problem: Build fails
**Symptoms**: `npm run build` errors

**Solutions**:
1. **Clear Cache**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Check TypeScript Errors**
   ```bash
   npm run type-check
   ```

3. **Check Environment Variables**
   ```bash
   # Verify all required vars are set
   cat .env.local
   ```

4. **Check Dependencies**
   ```bash
   npm audit
   npm update
   ```

#### Problem: Deployment fails on Vercel
**Symptoms**: Build succeeds locally but fails on Vercel

**Solutions**:
1. **Check Environment Variables**
   - All vars set in Vercel dashboard
   - No typos in variable names
   - Values are correct

2. **Check Build Logs**
   - Vercel dashboard → Deployments → View Logs
   - Look for specific error messages

3. **Check Node Version**
   ```json
   // package.json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

4. **Check Build Command**
   - Vercel settings → Build & Development Settings
   - Build Command: `npm run build`
   - Output Directory: `.next`

---

### Performance Issues

#### Problem: Slow page loads
**Symptoms**: Pages take > 3 seconds to load

**Solutions**:
1. **Optimize Images**
   ```typescript
   // Use Next.js Image component
   import Image from 'next/image';
   
   <Image
     src="/image.jpg"
     width={500}
     height={300}
     alt="Description"
   />
   ```

2. **Lazy Load Components**
   ```typescript
   import dynamic from 'next/dynamic';
   
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <div>Loading...</div>
   });
   ```

3. **Reduce Bundle Size**
   ```bash
   # Analyze bundle
   npm run build
   # Check .next/analyze
   ```

4. **Enable Caching**
   ```typescript
   // next.config.ts
   export default {
     headers: async () => [{
       source: '/:path*',
       headers: [{
         key: 'Cache-Control',
         value: 'public, max-age=3600'
       }]
     }]
   };
   ```

#### Problem: High database usage
**Symptoms**: Slow queries, connection limits

**Solutions**:
1. **Enable Connection Pooling**
   - Use Supabase pooled connection string
   - Set max connections appropriately

2. **Optimize Queries**
   - Add indexes
   - Use select specific columns
   - Implement pagination

3. **Cache Data**
   ```typescript
   // Use React Query or SWR
   import useSWR from 'swr';
   
   const { data } = useSWR('/api/places', fetcher, {
     revalidateOnFocus: false,
     revalidateOnReconnect: false
   });
   ```

---

### Mobile Issues

#### Problem: Layout broken on mobile
**Symptoms**: Elements overflow, buttons too small

**Solutions**:
1. **Check Responsive Classes**
   ```typescript
   // Use mobile-first approach
   <div className="w-full md:w-1/2 lg:w-1/3">
   ```

2. **Test on Real Devices**
   - Use Chrome DevTools device emulation
   - Test on actual phones/tablets

3. **Check Touch Targets**
   ```css
   /* Minimum 44x44px for touch targets */
   button {
     min-width: 44px;
     min-height: 44px;
   }
   ```

#### Problem: Map not working on mobile
**Symptoms**: Map blank or unresponsive on mobile

**Solutions**:
1. **Enable Touch Events**
   ```typescript
   // Google Maps config
   gestureHandling: 'greedy'
   ```

2. **Check Viewport**
   ```html
   <!-- In layout.tsx -->
   <meta name="viewport" content="width=device-width, initial-scale=1" />
   ```

3. **Test Location on Device**
   - Use real device, not emulator
   - Enable location services
   - Use HTTPS

---

### Error Messages

#### "Failed to fetch"
**Cause**: Network error or CORS issue

**Solutions**:
1. Check internet connection
2. Verify Supabase URL is correct
3. Check CORS settings in Supabase
4. Check browser console for details

#### "Invalid API key"
**Cause**: Google Maps API key issue

**Solutions**:
1. Verify API key is correct
2. Check API is enabled
3. Remove restrictions temporarily
4. Generate new API key

#### "Insufficient permissions"
**Cause**: RLS policy blocking access

**Solutions**:
1. Check user is authenticated
2. Verify RLS policies
3. Check user role for admin actions
4. Review Supabase logs

#### "Transaction failed"
**Cause**: Mapos transaction error

**Solutions**:
1. Check user has sufficient Mapos
2. Verify transaction logic
3. Check database constraints
4. Review error logs

---

## 🛠️ Debugging Tools

### Browser DevTools
```javascript
// Console commands for debugging

// Check auth state
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Check environment
console.log('Env:', {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasGoogleKey: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
});

// Test database connection
const { data, error } = await supabase.from('profiles').select('count');
console.log('DB Test:', { data, error });

// Check location
navigator.geolocation.getCurrentPosition(
  pos => console.log('Location:', pos.coords),
  err => console.error('Location error:', err)
);
```

### Supabase Dashboard
1. **SQL Editor**: Run test queries
2. **Table Editor**: View/edit data
3. **Auth**: Check users
4. **Logs**: View errors
5. **API**: Test endpoints

### Network Tab
1. Check API calls
2. Verify response codes
3. Check request/response data
4. Monitor load times

---

## 📞 Getting Help

### Before Asking for Help

1. **Check Documentation**
   - README.md
   - SETUP_GUIDE.md
   - FEATURES.md

2. **Check Logs**
   - Browser console
   - Supabase logs
   - Vercel logs

3. **Search Issues**
   - GitHub issues
   - Stack Overflow
   - Supabase discussions

### When Asking for Help

Include:
1. **Error message** (full text)
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Environment** (OS, browser, Node version)
6. **Code snippet** (if relevant)
7. **Screenshots** (if helpful)

### Support Channels

- **Documentation**: Check all .md files
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Google Maps**: [developers.google.com/maps](https://developers.google.com/maps)

---

## ✅ Prevention Tips

1. **Always use TypeScript** - Catch errors early
2. **Test locally first** - Before deploying
3. **Check logs regularly** - Catch issues early
4. **Monitor performance** - Use analytics
5. **Keep dependencies updated** - Security & features
6. **Backup database** - Regular backups
7. **Document changes** - Help future you
8. **Use version control** - Git commits
9. **Test on real devices** - Not just emulators
10. **Read error messages** - They usually tell you what's wrong

---

**Still stuck?** Review the code, check the documentation, and don't hesitate to ask for help!
