# Dark Mode Implementation Guide

## Overview

Adding dark mode to MapMates requires:
1. Tailwind CSS dark mode configuration
2. Theme toggle component
3. Theme persistence (localStorage)
4. Update all pages with dark mode classes

## Quick Implementation (Recommended Approach)

### Step 1: Enable Dark Mode in Tailwind

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Your existing theme config
    },
  },
  plugins: [],
};
export default config;
```

### Step 2: Create Theme Provider

Create `lib/theme/ThemeProvider.tsx`:

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Step 3: Create Theme Toggle Button

Create `components/ui/ThemeToggle.tsx`:

```typescript
'use client';

import { useTheme } from '@/lib/theme/ThemeProvider';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-500" />
      )}
    </motion.button>
  );
}
```

### Step 4: Update Root Layout

Update `app/layout.tsx`:

```typescript
import { ThemeProvider } from '@/lib/theme/ThemeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 5: Add Toggle to Dashboard

Update `app/dashboard/page.tsx` header:

```typescript
// Add to imports
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Add to desktop navigation (before notification bell)
<ThemeToggle />

// Add to mobile menu
<div className="flex items-center justify-between mb-4">
  <span className="font-semibold">Theme</span>
  <ThemeToggle />
</div>
```

### Step 6: Update Color Classes

Add dark mode classes to key components:

#### Background Colors
```typescript
// Light backgrounds
className="bg-white"
// Change to:
className="bg-white dark:bg-gray-900"

// Gradient backgrounds
className="bg-gradient-to-br from-purple-50 via-blue-50 to-white"
// Change to:
className="bg-gradient-to-br from-purple-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
```

#### Text Colors
```typescript
// Dark text
className="text-gray-800"
// Change to:
className="text-gray-800 dark:text-gray-100"

// Medium text
className="text-gray-600"
// Change to:
className="text-gray-600 dark:text-gray-300"

// Light text
className="text-gray-500"
// Change to:
className="text-gray-500 dark:text-gray-400"
```

#### Borders
```typescript
className="border-gray-200"
// Change to:
className="border-gray-200 dark:border-gray-700"
```

#### Cards/Containers
```typescript
className="bg-white rounded-2xl shadow-lg"
// Change to:
className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50"
```

## Automated Approach (Faster)

### Option 1: Use next-themes Package

```bash
npm install next-themes
```

Then follow their documentation: https://github.com/pacocoursey/next-themes

### Option 2: Use Tailwind CSS Dark Mode Plugin

Already built into Tailwind, just need to add classes.

## Quick Dark Mode Classes Reference

### Common Patterns

```typescript
// Headers
"bg-white dark:bg-gray-900 shadow-lg"

// Cards
"bg-white dark:bg-gray-800 rounded-2xl shadow-lg"

// Text
"text-gray-800 dark:text-gray-100"  // Headings
"text-gray-600 dark:text-gray-300"  // Body
"text-gray-500 dark:text-gray-400"  // Muted

// Borders
"border-gray-200 dark:border-gray-700"

// Inputs
"bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"

// Buttons (keep brand colors)
"bg-purple-600 hover:bg-purple-700"  // No change needed

// Hover states
"hover:bg-gray-100 dark:hover:bg-gray-700"
```

## Pages to Update

1. ✅ Dashboard (`app/dashboard/page.tsx`)
2. ✅ Plans List (`app/plans/page.tsx`)
3. ✅ Create Plan (`app/plans/create/page.tsx`)
4. ✅ Plan Detail (`app/plans/[id]/page.tsx`)
5. ✅ Places (`app/places/page.tsx`)
6. ✅ Chat (`app/chat/page.tsx`)
7. ✅ Profile (`app/profile/page.tsx`)
8. ✅ Notifications (`app/notifications/page.tsx`)

## Testing Dark Mode

1. Add theme toggle to header
2. Click toggle
3. Check all pages look good
4. Verify localStorage persistence
5. Test on mobile

## Pro Tips

### 1. Use CSS Variables (Advanced)

Define colors in `globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    /* ... more variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    /* ... more variables */
  }
}
```

### 2. System Preference Detection

```typescript
useEffect(() => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (!localStorage.getItem('theme')) {
    setTheme(prefersDark ? 'dark' : 'light');
  }
}, []);
```

### 3. Smooth Transitions

Add to `globals.css`:

```css
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

## Minimal Implementation (Quick Start)

If you want dark mode quickly without updating every page:

1. Add `darkMode: 'class'` to tailwind.config.ts
2. Create ThemeToggle component
3. Add toggle to dashboard header
4. Update only the most used pages (dashboard, plans)
5. Gradually add dark mode to other pages

## Example: Dashboard with Dark Mode

```typescript
<div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  <header className="bg-white dark:bg-gray-900 shadow-lg">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        MapMates
      </h1>
      <ThemeToggle />
    </div>
  </header>
  
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
      Content
    </h2>
    <p className="text-gray-600 dark:text-gray-300">
      Description text
    </p>
  </div>
</div>
```

## Summary

**Quick Steps:**
1. Enable dark mode in Tailwind config
2. Create ThemeProvider and ThemeToggle
3. Add toggle to header
4. Update pages with dark: classes
5. Test and refine

**Time Estimate:**
- Basic setup: 30 minutes
- Update all pages: 2-3 hours
- Polish and testing: 1 hour

Dark mode is a great feature but requires systematic updates across all components. Start with the most visible pages first!
