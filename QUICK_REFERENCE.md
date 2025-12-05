# MapMates - Quick Reference Guide

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint code
npm run lint
```

## 🔑 Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Optional (with defaults)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PROXIMITY_RADIUS_KM=1
NEXT_PUBLIC_MAPOS_FOR_CHAT=20
NEXT_PUBLIC_MAPOS_FOR_PLACE_APPROVAL=50
```

## 📁 Key Files & Locations

| File/Folder | Purpose |
|------------|---------|
| `app/` | Next.js pages and routes |
| `components/` | Reusable React components |
| `lib/` | Utilities and helpers |
| `types/` | TypeScript type definitions |
| `supabase-setup.sql` | Database schema |
| `.env.local` | Environment variables |
| `middleware.ts` | Route protection |

## 🎨 Component Library

### UI Components
```typescript
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Input
<Input label="Email" type="email" error="Error message" />

// Modal
<Modal isOpen={true} onClose={() => {}} title="Title" size="md">
  Content
</Modal>
```

### Feature Components
```typescript
// Map
import { InteractiveMap } from '@/components/map/InteractiveMap';
<InteractiveMap currentUser={user} onUserClick={handleClick} />

// Place Card
import { PlaceCard } from '@/components/places/PlaceCard';
<PlaceCard place={place} onClick={handleClick} />

// Leaderboard
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
<Leaderboard />
```

## 🗄️ Database Queries

### Supabase Client
```typescript
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

// Select
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Insert
const { error } = await supabase
  .from('places')
  .insert({ name: 'Place Name', ... });

// Update
const { error } = await supabase
  .from('profiles')
  .update({ mapos: 100 })
  .eq('id', userId);

// Delete
const { error } = await supabase
  .from('saved_places')
  .delete()
  .eq('id', placeId);

// Realtime subscription
const channel = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    console.log(payload);
  })
  .subscribe();
```

## 💎 Mapos System

### Add Mapos
```typescript
import { addMapos } from '@/lib/api/mapos';
await addMapos(userId, 20, 'Mini-game win');
```

### Spend Mapos
```typescript
import { spendMapos } from '@/lib/api/mapos';
await spendMapos(userId, 20, 'Skip game');
```

### Get Transaction History
```typescript
import { getTransactionHistory } from '@/lib/api/mapos';
const transactions = await getTransactionHistory(userId);
```

## 🎉 Animations

```typescript
import { celebrateWin, celebrateReward, boomEffect } from '@/lib/utils/animations';

// Simple celebration
celebrateWin();

// Reward celebration
celebrateReward(50);

// Boom effect
boomEffect();
```

## 📍 Geolocation

```typescript
import { getCurrentPosition, calculateDistance, isWithinRadius } from '@/lib/utils/geolocation';

// Get current position
const position = await getCurrentPosition();
const { latitude, longitude } = position.coords;

// Calculate distance
const distance = calculateDistance(lat1, lng1, lat2, lng2);

// Check if within radius
const isNearby = isWithinRadius(userLat, userLng, targetLat, targetLng, 1);
```

## 🔐 Authentication

### Check Auth Status
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  router.push('/');
}
```

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password
});
```

### Sign In
```typescript
const { error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

### Sign Out
```typescript
await supabase.auth.signOut();
```

## 🎯 Common Patterns

### Protected Page
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ProtectedPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/');
      return;
    }
    // Fetch user data
  };

  if (!user) return <div>Loading...</div>;
  return <div>Protected Content</div>;
}
```

### Modal with State
```typescript
const [isOpen, setIsOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
>
  {selectedItem && <div>{selectedItem.name}</div>}
</Modal>
```

### Form Handling
```typescript
const [formData, setFormData] = useState({
  name: '',
  email: ''
});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // Handle form submission
};

<form onSubmit={handleSubmit}>
  <Input
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
  />
</form>
```

## 🎨 Styling Patterns

### Gradient Text
```typescript
<h1 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
  Gradient Text
</h1>
```

### Card
```typescript
<div className="bg-white rounded-2xl shadow-lg p-6">
  Card Content
</div>
```

### Button with Icon
```typescript
import { Plus } from 'lucide-react';

<Button>
  <Plus className="w-5 h-5 mr-2" />
  Add Item
</Button>
```

### Grid Layout
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>
```

## 🐛 Debugging

### Check Supabase Connection
```typescript
const { data, error } = await supabase.from('profiles').select('count');
console.log('Connection test:', { data, error });
```

### Check Auth State
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

### Check Environment Variables
```typescript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Maps API Key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
```

## 📱 Responsive Classes

```typescript
// Mobile first approach
<div className="
  w-full          // Mobile
  md:w-1/2        // Tablet
  lg:w-1/3        // Desktop
  p-4             // Mobile
  md:p-6          // Tablet
  lg:p-8          // Desktop
">
```

## 🎯 Admin Actions

### Make User Admin
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'user@example.com';
```

### Send Global Reward
```typescript
const { data: users } = await supabase.from('profiles').select('id');
for (const user of users) {
  await addMapos(user.id, 50, 'Global reward');
}
```

### Approve Place
```typescript
await supabase
  .from('places')
  .update({ status: 'approved' })
  .eq('id', placeId);

await addMapos(submitterId, 50, 'Place approved');
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Map not loading | Check Google Maps API key |
| Auth not working | Verify Supabase credentials |
| RLS errors | Check policies in SQL setup |
| Build errors | Clear .next and node_modules |
| Type errors | Run `npm run type-check` |

## 📞 Quick Links

- [Supabase Dashboard](https://app.supabase.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)

## 💡 Pro Tips

1. **Use TypeScript** - Catch errors early
2. **Enable RLS** - Security first
3. **Index queries** - Performance matters
4. **Cache data** - Reduce API calls
5. **Test mobile** - Most users are mobile
6. **Monitor errors** - Use Sentry
7. **Optimize images** - Use Next.js Image
8. **Use environment variables** - Never hardcode secrets
9. **Write clean code** - Future you will thank you
10. **Document changes** - Help your team

---

**Need more help?** Check the full documentation in README.md, SETUP_GUIDE.md, and FEATURES.md
