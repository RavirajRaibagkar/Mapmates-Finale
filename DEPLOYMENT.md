# MapMates - Production Deployment Guide

## 🚀 Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured
- [ ] Supabase database is set up with SQL schema
- [ ] RLS policies are enabled
- [ ] Google Maps API key is configured
- [ ] Domain name is ready (optional)
- [ ] SSL certificate is configured
- [ ] Error tracking is set up (optional)
- [ ] Analytics are configured (optional)

## 📦 Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Built for Next.js
- Automatic HTTPS
- Global CDN
- Zero configuration
- Free tier available
- Automatic deployments from Git

**Steps:**

1. **Prepare Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/mapmates.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: .next

3. **Add Environment Variables**
   
   In Vercel dashboard → Settings → Environment Variables:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NEXT_PUBLIC_PROXIMITY_RADIUS_KM=1
   NEXT_PUBLIC_MAPOS_FOR_CHAT=20
   NEXT_PUBLIC_MAPOS_FOR_PLACE_APPROVAL=50
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app is live!

5. **Configure Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed
   - Wait for SSL certificate (automatic)

### Option 2: Netlify

**Steps:**

1. **Build Configuration**
   
   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to Git repository
   - Add environment variables
   - Deploy

### Option 3: Self-Hosted (VPS)

**Requirements:**
- Ubuntu 20.04+ or similar
- Node.js 18+
- Nginx
- PM2
- SSL certificate (Let's Encrypt)

**Steps:**

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install -y nginx
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/mapmates.git
   cd mapmates

   # Install dependencies
   npm install

   # Create .env.local with production values
   nano .env.local

   # Build application
   npm run build

   # Start with PM2
   pm2 start npm --name "mapmates" -- start
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## 🔧 Post-Deployment Configuration

### 1. Supabase Configuration

**Update Authentication URLs:**
- Go to Supabase Dashboard → Authentication → URL Configuration
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: Add your production URL

**Enable Email Templates:**
- Customize confirmation email
- Customize password reset email
- Add your branding

### 2. Google Maps Configuration

**Restrict API Key:**
- Go to Google Cloud Console
- Select your API key
- Add HTTP referrer restrictions:
  - `https://your-app.vercel.app/*`
  - `https://www.your-domain.com/*`

### 3. Database Optimization

**Create Indexes:**
```sql
-- Already included in supabase-setup.sql
-- Verify they exist:
SELECT * FROM pg_indexes WHERE tablename IN (
  'profiles', 'places', 'connections', 'messages'
);
```

**Enable Connection Pooling:**
- Go to Supabase → Database → Connection Pooling
- Use pooled connection string for high traffic

### 4. Performance Optimization

**Enable Caching:**
```typescript
// next.config.ts
export default {
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, must-revalidate',
        },
      ],
    },
  ],
};
```

**Image Optimization:**
- Use Next.js Image component
- Compress images before upload
- Use WebP format
- Implement lazy loading

### 5. Monitoring & Analytics

**Error Tracking (Sentry):**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Analytics (Google Analytics):**
```typescript
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## 🔒 Security Hardening

### 1. Environment Variables

**Never commit:**
- `.env.local`
- `.env.production`
- Any file with secrets

**Use secrets management:**
- Vercel: Built-in environment variables
- AWS: AWS Secrets Manager
- Self-hosted: HashiCorp Vault

### 2. Rate Limiting

**Implement API rate limiting:**
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  return NextResponse.next();
}
```

### 3. Security Headers

**Add security headers:**
```typescript
// next.config.ts
export default {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        }
      ]
    }
  ]
};
```

## 📊 Monitoring

### 1. Uptime Monitoring

**Use services like:**
- UptimeRobot (free)
- Pingdom
- StatusCake
- Better Uptime

### 2. Performance Monitoring

**Vercel Analytics:**
- Automatically enabled on Vercel
- Real User Monitoring (RUM)
- Web Vitals tracking

**Custom Monitoring:**
```typescript
// lib/analytics.ts
export const trackEvent = (name: string, properties?: any) => {
  if (typeof window !== 'undefined') {
    // Google Analytics
    window.gtag?.('event', name, properties);
    
    // Custom analytics
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ name, properties })
    });
  }
};
```

### 3. Database Monitoring

**Supabase Dashboard:**
- Monitor query performance
- Check connection pool usage
- Review slow queries
- Set up alerts

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🐛 Troubleshooting

### Build Failures

**Check:**
- Node.js version (18+)
- All dependencies installed
- Environment variables set
- TypeScript errors resolved

**Fix:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Runtime Errors

**Check:**
- Browser console
- Vercel logs
- Supabase logs
- Network tab

### Database Issues

**Check:**
- RLS policies
- Connection limits
- Query performance
- Index usage

## 📈 Scaling

### Database Scaling

**Supabase:**
- Upgrade to Pro plan for more resources
- Enable connection pooling
- Optimize queries
- Add read replicas

### Application Scaling

**Vercel:**
- Automatic scaling included
- Edge functions for global performance
- ISR for static content

**Self-hosted:**
- Use load balancer (Nginx)
- Multiple app instances with PM2
- Redis for session storage
- CDN for static assets

## 🎉 Launch Checklist

- [ ] All features tested
- [ ] Mobile responsive verified
- [ ] Cross-browser tested
- [ ] Performance optimized
- [ ] SEO configured
- [ ] Analytics set up
- [ ] Error tracking enabled
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team trained
- [ ] Support channels ready

## 📞 Support

For deployment issues:
1. Check Vercel/Netlify logs
2. Review Supabase logs
3. Check browser console
4. Review this guide
5. Check Next.js documentation

---

Your MapMates application is now ready for production! 🚀
