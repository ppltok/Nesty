# Nesty - Product Requirements Document

## לבנות את הקן שלכם, חכם יותר

**Version 1.0 | December 2025**

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Tech Stack](#2-tech-stack)
3. [Design System & Color Palette](#3-design-system--color-palette)
4. [Project Structure](#4-project-structure)
5. [Database Schema (Supabase)](#5-database-schema-supabase)
6. [Authentication Setup](#6-authentication-setup)
7. [Application Flow](#7-application-flow)
8. [Landing Page](#8-landing-page)
9. [Authentication Pages](#9-authentication-pages)
10. [Onboarding Flow](#10-onboarding-flow)
11. [Dashboard](#11-dashboard)
12. [Registry Categories & Suggested Items](#12-registry-categories--suggested-items)
13. [Add Item Modal](#13-add-item-modal)
14. [Public Registry View](#14-public-registry-view)
15. [Purchase Flow & Notifications](#15-purchase-flow--notifications)
16. [Settings Sidebar](#16-settings-sidebar)
17. [Smart Price Comparison Engine](#17-smart-price-comparison-engine)
18. [Group Gifting (Chip-In)](#18-group-gifting-chip-in)
19. [Chrome Extension Integration](#19-chrome-extension-integration)
20. [Row Level Security Policies](#20-row-level-security-policies)
21. [Component Reference](#21-component-reference)

---

## 1. Product Vision

### 1.1 What is Nesty?

Nesty (כמו לבנות קן) is a Hebrew-first baby registry platform that allows expecting parents to:

- Create a centralized wish list from ANY online store
- Share with family and friends via a unique URL
- Track gift purchases in real-time
- Get notified when items are bought
- Find cheaper prices automatically (Smart Engine)
- Allow group contributions for expensive items

### 1.2 Core User Flow

```
Sign Up → Onboarding → Address Setup → Dashboard → Add Items → Share → Receive Gifts
```

### 1.3 Key Differentiators

| Feature | Description |
|---------|-------------|
| Universal Registry | Add items from ANY Israeli online store |
| Smart Price Comparison | Automatic alerts when same item is cheaper elsewhere |
| Chip-In | Group gifting for expensive items |
| Privacy Controls | Hide address, private items |
| Hebrew First | Complete RTL support, Hebrew UI |
| Trust-Based Purchase | No payment processing - gift givers confirm purchases |

### 1.4 Business Model

**MVP:** Redirect/Affiliate model
- Gift givers are redirected to original store URLs
- Trust-based purchase confirmation
- Future: Affiliate partnerships with Israeli stores

---

## 2. Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React 18 + Vite + TypeScript | SPA Framework |
| Styling | TailwindCSS + shadcn/ui | Design System |
| Backend | Supabase | Database + Auth + Edge Functions |
| Hosting | GitHub Pages / Vercel | Static hosting |
| Chrome Extension | Manifest V3 + React | Product scraping (separate repo) |
| Email | Supabase + Resend | Notifications |

### 2.1 Package.json Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@supabase/supabase-js": "^2.39.0",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

---

## 3. Design System & Color Palette

### 3.1 Brand Colors

```css
:root {
  /* Primary - Vintage Lavender */
  --primary: #86608e;
  --primary-dark: #6d4e74;
  --primary-light: #a891ad;

  /* Secondary - Lilac Ash */
  --secondary: #a891ad;
  --secondary-dark: #917a96;
  --secondary-light: #b9a4bd;

  /* Neutral - Pale Slate */
  --muted: #c9c2cb;
  --muted-dark: #b5adb8;
  --muted-light: #e8e4e9;

  /* Accent - Soft Rose */
  --accent-pink: #f4acb7;
  --accent-pink-light: #ffcad4;
  --accent-peach: #ffd8d7;

  /* Backgrounds */
  --background: #faf8fb;
  --card: #ffffff;
  --border: #e8e4e9;

  /* Text */
  --foreground: #1a1a1a;
  --muted-foreground: #6b6b6b;

  /* Status */
  --destructive: #ef4444;
  --success: #22c55e;
}
```

### 3.2 Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#86608e",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#a891ad",
          foreground: "#1a1a1a",
        },
        muted: {
          DEFAULT: "#c9c2cb",
          foreground: "#6b6b6b",
        },
        background: "#faf8fb",
        foreground: "#1a1a1a",
        card: "#ffffff",
        border: "#e8e4e9",
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["Assistant", "Heebo", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
};
```

### 3.3 Typography

- **Primary Font:** Assistant (Google Fonts) - Hebrew optimized
- **Fallback:** Heebo, sans-serif
- **Logo Font:** Bold, rounded sans-serif

### 3.4 RTL Support

**CRITICAL:** All UI must be RTL (Right-to-Left) for Hebrew.

```tsx
// App.tsx - Root RTL wrapper
function App() {
  return (
    <div dir="rtl" className="font-sans">
      {/* All content */}
    </div>
  );
}
```

---

## 4. Project Structure

```
nesty/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Router & providers
│   ├── index.css                   # Global styles + Tailwind
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── input.tsx
│   │   │
│   │   ├── layout/
│   │   │   └── Layout.tsx          # Main layout wrapper
│   │   │
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx  # Auth guard
│   │   │
│   │   ├── Header.tsx              # Landing page header
│   │   ├── Hero.tsx                # Landing hero section
│   │   ├── Features.tsx            # Landing features section
│   │   ├── CTASection.tsx          # Landing CTA section
│   │   ├── Footer.tsx              # Landing footer
│   │   │
│   │   ├── DashboardHeader.tsx     # Dashboard header with stats
│   │   ├── RegistryCategories.tsx  # Category cards with items
│   │   ├── AddItemModal.tsx        # Add item form
│   │   ├── ShareRegistry.tsx       # Share modal
│   │   ├── SettingsSidebar.tsx     # Settings panel
│   │   ├── AddressPopup.tsx        # Post-onboarding address form
│   │   └── PurchaseModal.tsx       # Gift giver purchase flow
│   │
│   ├── pages/
│   │   ├── Home.tsx                # Landing page
│   │   ├── Dashboard.tsx           # User dashboard
│   │   ├── PublicRegistry.tsx      # Public registry view
│   │   │
│   │   ├── auth/
│   │   │   ├── SignIn.tsx
│   │   │   ├── SignUp.tsx
│   │   │   └── AuthCallback.tsx    # OAuth callback
│   │   │
│   │   └── onboarding/
│   │       └── Onboarding.tsx      # 3-step onboarding
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx         # Auth state management
│   │
│   ├── hooks/
│   │   └── useRTL.ts               # RTL helper hook
│   │
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client
│   │   └── utils.ts                # Utility functions (cn)
│   │
│   └── types/
│       └── index.ts                # TypeScript types
│
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 5. Database Schema (Supabase)

### 5.1 Enable UUID Extension

```sql
-- Run first in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 5.2 Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT DEFAULT '',
  avatar_url TEXT,
  due_date DATE,
  is_first_time_parent BOOLEAN DEFAULT true,
  feeling TEXT CHECK (feeling IN ('excited', 'overwhelmed', 'exploring')),
  preferred_language TEXT DEFAULT 'he' CHECK (preferred_language IN ('en', 'he')),
  onboarding_completed BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 5.3 Registries Table

```sql
CREATE TABLE registries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES profiles(id),
  slug TEXT UNIQUE NOT NULL,
  title TEXT,

  -- Address fields (separate for Israeli format)
  address_city TEXT,
  address_street TEXT,
  address_apt TEXT,
  address_postal TEXT,
  address_phone TEXT,
  address_is_private BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_registries_updated_at
  BEFORE UPDATE ON registries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for fast slug lookups
CREATE INDEX idx_registries_slug ON registries(slug);
CREATE INDEX idx_registries_owner ON registries(owner_id);
```

### 5.4 Items Table

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registry_id UUID REFERENCES registries(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  original_url TEXT,
  store_name TEXT DEFAULT 'ידני',

  category TEXT NOT NULL CHECK (category IN (
    'strollers',      -- עגלות וטיולים
    'car_safety',     -- בטיחות ברכב
    'furniture',      -- ריהוט
    'safety',         -- מוצרי בטיחות
    'feeding',        -- האכלה
    'nursing',        -- הנקה
    'bath',           -- אמבט וטיפול
    'clothing',       -- ביגוד ראשוני
    'bedding',        -- מצעים ואקססוריז
    'toys'            -- צעצועים
  )),

  quantity INTEGER DEFAULT 1,
  quantity_received INTEGER DEFAULT 0,
  is_most_wanted BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  notes TEXT,

  -- Price comparison
  cheaper_alternative_url TEXT,
  cheaper_alternative_price DECIMAL(10,2),
  cheaper_alternative_store TEXT,
  price_alert_sent BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_items_registry ON items(registry_id);
CREATE INDEX idx_items_category ON items(category);
```

### 5.5 Purchases Table

```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,

  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  gift_message TEXT,
  is_surprise BOOLEAN DEFAULT false,

  -- Quantity for partial purchases (chip-in)
  quantity_purchased INTEGER DEFAULT 1,
  amount_contributed DECIMAL(10,2), -- For chip-in

  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Waiting for confirmation email
    'confirmed',    -- Buyer confirmed via email
    'cancelled',    -- Buyer said they didn't purchase
    'expired'       -- No response within 7 days
  )),

  confirmation_token UUID DEFAULT uuid_generate_v4(),
  confirmation_sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_purchases_item ON purchases(item_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_token ON purchases(confirmation_token);
```

### 5.6 Price Alerts Table

```sql
CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,

  original_price DECIMAL(10,2) NOT NULL,
  found_price DECIMAL(10,2) NOT NULL,
  found_url TEXT NOT NULL,
  found_store TEXT NOT NULL,

  savings_amount DECIMAL(10,2) GENERATED ALWAYS AS (original_price - found_price) STORED,
  savings_percent INTEGER GENERATED ALWAYS AS (
    CASE WHEN original_price > 0
    THEN ROUND(((original_price - found_price) / original_price) * 100)
    ELSE 0 END
  ) STORED,

  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_alerts_item ON price_alerts(item_id);
```

### 5.7 Chip-In Contributions Table

```sql
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,

  contributor_name TEXT NOT NULL,
  contributor_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,

  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'cancelled'
  )),

  confirmation_token UUID DEFAULT uuid_generate_v4(),
  confirmed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contributions_item ON contributions(item_id);
```

---

## 6. Authentication Setup

### 6.1 Supabase Project Setup

1. Create new project at supabase.com
2. Note down:
   - Project URL: `https://[PROJECT_ID].supabase.co`
   - Anon Key: `eyJ...` (public)
   - Service Role Key: `eyJ...` (secret - server only)

### 6.2 Environment Variables

```env
# .env.local
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 6.3 Supabase Client

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
```

### 6.4 Enable Google OAuth

In Supabase Dashboard → Authentication → Providers → Google:

1. Enable Google provider
2. Add Google OAuth credentials from Google Cloud Console
3. Set Redirect URL: `https://[PROJECT_ID].supabase.co/auth/v1/callback`
4. Add Site URL: `http://localhost:5173` (dev) and production URL

### 6.5 Auth Context

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url: string | null
  due_date: string | null
  is_first_time_parent: boolean
  feeling: 'excited' | 'overwhelmed' | 'exploring' | null
  preferred_language: 'en' | 'he'
  onboarding_completed: boolean
  email_notifications: boolean
  marketing_emails: boolean
  created_at: string
  updated_at: string
}

export interface Registry {
  id: string
  owner_id: string
  slug: string
  title: string | null
  address_city: string | null
  address_street: string | null
  address_apt: string | null
  address_postal: string | null
  address_is_private: boolean
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  registry: Registry | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [registry, setRegistry] = useState<Registry | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data
  }

  const fetchRegistry = async (userId: string) => {
    const { data, error } = await supabase
      .from('registries')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching registry:', error)
      return null
    }
    return data
  }

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
      const registryData = await fetchRegistry(user.id)
      setRegistry(registryData)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id)
        setProfile(profileData)
        const registryData = await fetchRegistry(session.user.id)
        setRegistry(registryData)
      }

      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
          const registryData = await fetchRegistry(session.user.id)
          setRegistry(registryData)
        } else {
          setProfile(null)
          setRegistry(null)
        }

        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      registry,
      session,
      isLoading,
      isAuthenticated: !!user,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### 6.6 Auto-create Profile on Sign Up

Create a Supabase trigger to auto-create profile:

```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 7. Application Flow

### 7.1 Route Structure

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Pages
import Home from './pages/Home'
import { SignIn } from './pages/auth/SignIn'
import { SignUp } from './pages/auth/SignUp'
import { AuthCallback } from './pages/auth/AuthCallback'
import { Onboarding } from './pages/onboarding/Onboarding'
import { Dashboard } from './pages/Dashboard'
import PublicRegistry from './pages/PublicRegistry'

// Layout
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

function AppRoutes() {
  const { isLoading, isAuthenticated, profile } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/auth/signin" element={<SignIn />} />
      <Route path="/auth/signup" element={<SignUp />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Public registry view */}
      <Route path="/registry/:slug" element={<PublicRegistry />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        {/* Redirect to onboarding if not completed */}
        <Route path="/onboarding" element={
          profile?.onboarding_completed
            ? <Navigate to="/dashboard" replace />
            : <Onboarding />
        } />

        {/* Dashboard - redirect to onboarding if not completed */}
        <Route path="/dashboard" element={
          !profile?.onboarding_completed
            ? <Navigate to="/onboarding" replace />
            : <Dashboard />
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div dir="rtl" className="font-sans min-h-screen bg-background">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

### 7.2 Protected Route Component

```typescript
// src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />
  }

  return <Outlet />
}
```

---

## 8. Landing Page

The landing page follows the marketing copy provided.

### 8.1 Header Component

```typescript
// src/components/Header.tsx
// Features:
// - Logo (Nesty with nest icon) - right aligned
// - Nav links: "איך זה עובד", "המנוע החכם"
// - Auth buttons: "כניסה" (outline), "יצירת רשימה חינם" (primary)
// - Sticky on scroll
```

### 8.2 Hero Section

```typescript
// src/components/Hero.tsx
// Content:
// - H1: "לבנות את הקן שלכם, חכם יותר."
// - Subtitle: "הרשימה היחידה שמאפשרת לכם לאסוף מוצרים מכל חנות בעולם..."
// - CTA: "מתחילים להתארגן" → /auth/signup
// - Visual: Illustrated stroller with store icons converging
```

### 8.3 How It Works Section

3 columns:

| Step | Icon | Title | Description |
|------|------|-------|-------------|
| 1 | רשימת V עם + | אוספים מכל מקום | השתמשו בצ'ק ליסט המובנה שלנו... |
| 2 | כוכב/לב | מסמנים את ה-Most Wanted | סמנו את הפריטים שאתם באמת חייבים... |
| 3 | מטוס נייר | נותנים להם לעזור | שתפו את הרשימה בוואטסאפ... |

### 8.4 Smart Engine Section

```
Background: #f9f9f9 (subtle separation)
Title: "המנוע החכם ששומר לכם על הכיס"
Description: Explains automatic price comparison
Visual: Dashboard showing price comparison (high price with X, low price with V)
```

### 8.5 Chip-In Section

```
Title: "חולמים על עגלה יקרה? תנו להם להשתתף."
Description: Group gifting explanation
Visual: Stroller with progress bar showing "נאספו 2,800 ₪ מתוך 4,000 ₪"
```

### 8.6 Privacy Section

```
Title: "הקן שלכם, החוקים שלכם."
Features:
- Eye with line: הסתרת מוצרים (private items)
- Lock on house: הסתרת כתובת (private address)
```

### 8.7 Footer CTA

```
Title: "מוכנים להתחיל לקנן?"
Subtitle: "הצטרפו לאלפי הורים שכבר בונים את הרשימה החכמה שלהם."
CTA: "יצירת הרשימה הראשונה שלי"
```

---

## 9. Authentication Pages

### 9.1 Sign Up Page

```typescript
// src/pages/auth/SignUp.tsx
// Fields:
// - שם פרטי (first_name)
// - שם משפחה (last_name)
// - אימייל (email)
// - סיסמה (password) - min 8 chars
// - OR: Continue with Google
// - Link to Sign In

const handleSignUp = async () => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

const handleGoogleSignUp = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}
```

### 9.2 Sign In Page

```typescript
// src/pages/auth/SignIn.tsx
// Fields:
// - אימייל
// - סיסמה
// - "שכחתי סיסמה" link
// - OR: Continue with Google
// - Link to Sign Up

const handleSignIn = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (!error) {
    navigate('/dashboard')
  }
}
```

### 9.3 Auth Callback

```typescript
// src/pages/auth/AuthCallback.tsx
// Handles OAuth redirect
// Redirects to /onboarding or /dashboard based on profile state

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      // Check if onboarding completed
      // Navigate accordingly
    }
  })
}, [])
```

---

## 10. Onboarding Flow

3-step onboarding after signup, before dashboard access.

### 10.1 Step 1: Name

```
Title: "בואו נכיר!"
Subtitle: "עוד כמה פרטים ואתם מוכנים להתחיל"
Fields:
- שם פרטי (first_name)
- שם משפחה (last_name)
Button: "המשך"
```

### 10.2 Step 2: Due Date

```
Title: "מתי התאריך המשוער?"
Subtitle: "זה יעזור לנו להתאים את החוויה עבורכם"
Fields:
- Date picker for due_date
- "אופציונלי - אפשר לדלג" note
Buttons: "חזור", "המשך", "דלג"
```

### 10.3 Step 3: Feeling

```
Title: "איך אתם מרגישים?"
Subtitle: "אין תשובה נכונה או לא נכונה"
Options (cards):
- 🎉 מתרגשים! - "אנחנו כל כך שמחים"
- ❓ קצת המומים - "יש כל כך הרבה לחשוב עליו"
- ❤️ סתם בודקים - "רוצים לראות מה יש פה"
Buttons: "חזור", "סיום", "דלג"
```

### 10.4 Onboarding Completion

On completion:
1. Update profile with `onboarding_completed: true`
2. Create registry with auto-generated slug: `{first_name}-registry-{timestamp}`
3. Show AddressPopup with confetti
4. Navigate to /dashboard

### 10.5 Address Popup (Post-Onboarding)

```typescript
// src/components/AddressPopup.tsx
// Appears after onboarding with confetti animation
// Title: "הכל מוכן לבנות את הקן שלך! 🎉"
// Subtitle: "הוסיפי כתובת כדי שהחברים והמשפחה ידעו לאן לשלוח"
//
// Fields:
// - עיר (city)
// - רחוב (street) + מספר (house_number)
// - דירה (apartment) + מיקוד (postal)
// - Toggle: "הסתר כתובת" (address_is_private)
//
// Buttons: "שמור כתובת", "אוסיף אחר כך"
```

### 10.6 Address Data Flow

```
AddressPopup → saves to → registries table

Fields mapping:
- עיר         → registries.address_city
- רחוב + מספר → registries.address_street
- דירה        → registries.address_apt
- מיקוד       → registries.address_postal
- הסתר כתובת  → registries.address_is_private (default: true)
```

**Privacy behavior:**
- If `address_is_private = true`: Gift givers see "צור קשר עם {name} לקבלת כתובת"
- If `address_is_private = false`: Gift givers see full address with copy button

---

## 11. Dashboard

Main control center for registry owners.

### 11.1 Dashboard Header

```typescript
// src/components/DashboardHeader.tsx
// Features:
// - Welcome: "היי, {first_name}!"
// - Due date countdown (if set)
// - Stats: X פריטים, Y נקנו
// - Progress bar
// - Action buttons: הוסף פריט, שתף, הגדרות, צפה כאורח
```

### 11.2 Dashboard Layout

```typescript
// src/pages/Dashboard.tsx
// Structure:
// 1. DashboardHeader
// 2. RegistryCategories (main content)
// 3. AddItemModal (popup)
// 4. ShareRegistry (popup)
// 5. SettingsSidebar (side panel)
```

### 11.3 Item State Management

```typescript
// Dashboard handles:
// - Loading items from database
// - Adding new items
// - Toggling purchased status
// - Deleting items
// - Auto-creating profile/registry if missing
```

---

## 12. Registry Categories & Suggested Items

### 12.1 Categories List

| ID | Hebrew Name | Icon |
|----|-------------|------|
| strollers | עגלות וטיולים | Car |
| car_safety | בטיחות ברכב | ShieldCheck |
| furniture | ריהוט | Home |
| safety | מוצרי בטיחות | ShieldAlert |
| feeding | האכלה | UtensilsCrossed |
| nursing | הנקה | Baby |
| bath | אמבט וטיפול בתינוק | Bath |
| clothing | ביגוד ראשוני | Shirt |
| bedding | מצעים ואקססוריז | Bed |
| toys | צעצועים | Gamepad2 |

### 12.2 Suggested Items Per Category

Each category includes Hebrew suggested items checklist:

```typescript
const CATEGORIES = [
  {
    id: "strollers",
    name: "עגלות וטיולים",
    icon: Car,
    color: "from-[#86608e] to-[#6d4e74]",
    suggestedItems: [
      "עגלה לתינוק מגיל לידה",
      "עגלות תאומים/אחים",
      "טיולון",
      "מנשא לתינוק",
      "תיק החתלה",
      "אביזרים לעגלות וטיולון",
      "צעצועים לעגלה",
      "טרמפיסט לעגלה"
    ]
  },
  {
    id: "car_safety",
    name: "בטיחות ברכב",
    icon: ShieldCheck,
    color: "from-[#7a5582] to-[#624469]",
    suggestedItems: [
      "כיסאות בטיחות",
      "כיסאות בטיחות מסתובבים",
      "סלקלים בטיחותיים ואיכותיים",
      "בסיסים לרכב",
      "בוסטרים לרכב",
      "מוצרים משלימים לרכב"
    ]
  },
  {
    id: "furniture",
    name: "ריהוט",
    icon: Home,
    color: "from-[#a891ad] to-[#917a96]",
    suggestedItems: [
      "חדרי תינוק",
      "מיטת תינוק",
      "מזרן לתינוק",
      "שידות אחסנה",
      "ארונות",
      "עריסה לתינוק",
      "לול וקמפינג",
      "אביזרים לעיצוב חדר ילדים"
    ]
  },
  {
    id: "safety",
    name: "מוצרי בטיחות",
    icon: ShieldAlert,
    color: "from-[#86608e] to-[#6d4e74]",
    suggestedItems: [
      "Nanit",
      "מוניטור ואינטרקום",
      "שערים ואביזרי בטיחות"
    ]
  },
  {
    id: "feeding",
    name: "האכלה",
    icon: UtensilsCrossed,
    color: "from-[#b9a4bd] to-[#a891ad]",
    suggestedItems: [
      "מוצצים ואביזריהם",
      "בקבוקים",
      "פטמות לבקבוקים",
      "מברשות בקבוקים",
      "מייבש בקבוקים",
      "סטריליזטורים",
      "מחמם בקבוקים",
      "תרמוסים",
      "מחלק מנות",
      "חיתולי בד לתינוקות",
      "כיסא אוכל",
      "סינרים לתינוק",
      "בוסטר האכלה"
    ]
  },
  {
    id: "nursing",
    name: "הנקה",
    icon: Baby,
    color: "from-[#a891ad] to-[#917a96]",
    suggestedItems: [
      "משאבות הנקה ואביזריהן",
      "כריות הנקה",
      "סינרי הנקה",
      "רפידות ומגיני פטמות",
      "כורסאות הנקה"
    ]
  },
  {
    id: "bath",
    name: "אמבט וטיפול בתינוק",
    icon: Bath,
    color: "from-[#c9c2cb] to-[#b5adb8]",
    suggestedItems: [
      "אמבטיות ומעמדים",
      "מושבי אמבטיה",
      "מגבות לתינוק",
      "מברשות וסט מניקור",
      "תכשירי טיפול בתינוק",
      "צעצועים לאמבטיה",
      "אביזרי אמבטיה נוספים",
      "טבעות אמבטיה"
    ]
  },
  {
    id: "clothing",
    name: "ביגוד ראשוני",
    icon: Shirt,
    color: "from-[#86608e] to-[#6d4e74]",
    suggestedItems: [
      "בגדי גוף לתינוק",
      "מכנסיים ורגליות לתינוק",
      "אוברולים לתינוקות",
      "סטים לתינוקות",
      "כובע לתינוק",
      "כפפות לתינוק",
      "גרביים לתינוקות"
    ]
  },
  {
    id: "bedding",
    name: "מצעים ואקססוריז",
    icon: Bed,
    color: "from-[#a891ad] to-[#917a96]",
    suggestedItems: [
      "סדינים",
      "שמיכות לתינוק",
      "סט מצעים",
      "משטחי החתלה",
      "נחשושים",
      "מגן ראש לתינוק",
      "כריות לתינוק"
    ]
  },
  {
    id: "toys",
    name: "צעצועים",
    icon: Gamepad2,
    color: "from-[#c9c2cb] to-[#b5adb8]",
    suggestedItems: [
      "מובייל לתינוק",
      "טרמפולינות",
      "נדנדות",
      "אוניברסיטה לתינוק",
      "שמיכות פעילות",
      "משטחי פעילות לתינוקות",
      "נשכנים ורעשנים",
      "שמיכי לתינוק",
      "בובות בד"
    ]
  }
]
```

### 12.3 Category Card Component

```typescript
// src/components/RegistryCategories.tsx
// Features:
// - Expandable cards
// - Progress bar per category
// - Item count: X/Y פריטים
// - Add button per category
// - Suggested items checklist with:
//   - Plus button to add item
//   - Trash button to remove suggestion (with confirmation)
```

### 12.4 Remove Suggestion Confirmation

```
Dialog:
Title: "הסרת המלצה"
Message: 'אני לא צריך/ה את "{item}", את/ה בטוח/ה?'
Buttons: "ביטול", "הסר"
```

---

## 13. Add Item Modal

### 13.1 Manual Add Form

```typescript
// src/components/AddItemModal.tsx
// Fields:
// - שם הפריט (name) - required
// - קטגוריה (category) - dropdown
// - מחיר (price) - optional
// - כמות (quantity) - default 1
// - קישור למוצר (url) - optional
// - תמונה (imageUrl) - optional
// - צבע/הערות (color) - optional
// - Toggles:
//   - Most Wanted (mostWanted)
//   - פריט פרטי (isPrivate)
```

### 13.2 Extension Add (Future)

The Chrome extension will send items directly to the database. The modal can show extension-added items for review.

---

## 14. Public Registry View

### 14.1 URL Structure

```
https://nesty.co.il/registry/{slug}
```

Slug examples: `maya-registry-abc123`, `{first_name}-registry-{timestamp}`

### 14.2 Public Registry Page

```typescript
// src/pages/PublicRegistry.tsx
// Features:
// - Registry owner name and due date
// - Filter by category
// - Sort by price/priority
// - Item cards with:
//   - Image
//   - Name
//   - Price
//   - Store name
//   - Most Wanted badge
//   - Available/Purchased status
//   - "קנה מתנה זו" button
// - Address section (if public)
// - "צור קשר" button (if private)
```

### 14.3 Item Card States

| State | Display | Button |
|-------|---------|--------|
| Available | Normal | "קנה מתנה זו" |
| Reserved (pending) | "בתהליך רכישה" badge | Disabled |
| Purchased | "נרכש ✓" badge, grayed out | Hidden |
| Private | Not shown to public | - |

---

## 15. Purchase Flow & Notifications

### 15.1 Purchase Flow Overview (Babylist-Style)

The purchase flow is trust-based with a reservation system to prevent double-gifting.

**Flow:**
1. Gift giver clicks "שריין מתנה זו" (Reserve This Gift)
2. Item becomes "reserved" for 48 hours
3. Gift giver is redirected to store
4. After purchase, they return and click "קניתי" (I've Purchased)
5. Confirmation email sent, reservation extended until confirmed

### 15.2 Step 1: Reserve Gift Modal

```typescript
// src/components/PurchaseModal.tsx
// First screen - "Record Your Purchase"

// Title: "מי נותן את המתנה?"
// Fields:
// - שם מלא (buyer_name) - required
// - אימייל (buyer_email) - required
// - הערה ידידותית (gift_message) - optional, placeholder: "מזל טוב!"
// - Toggle: "שמרו את זה בהפתעה" (is_surprise) - hides from owner until confirmed
//
// Button: "המשך" → goes to Step 2
```

### 15.3 Step 2: Redirect to Store

```typescript
// Second screen - "You're headed to {store_name}"

// Title: "בדרך ל-{store_name}"
// Subtitle: "אחרי הקנייה, חזרו ל-Nesty ולחצו 'קניתי את זה'"
//
// Show shipping address (if address_is_private = false):
// "כתובת למשלוח:"
// "{address_street}, {address_city}"
// Button: "העתק כתובת"
//
// If address is private:
// "הכתובת מוסתרת - צרו קשר עם {owner_name}"
//
// Buttons:
// - "המשך לחנות" (primary) → opens original_url in new tab, creates purchase record with status='pending'
// - "קניתי כבר" → marks as purchased immediately
```

### 15.4 Step 3: Confirmation

```typescript
// After returning from store

// Title: "תודה רבה! 🎉"
// Subtitle: "{owner_name} יקבל/תקבל הודעה על המתנה שלך"
//
// Purchase summary:
// - Item image + name
// - Your name
// - Note (if provided)
//
// Button: "סיום"
```

### 15.5 Item States

| State | Display | Action Available |
|-------|---------|------------------|
| available | Normal card | "שריין מתנה זו" |
| reserved | "שוריין" badge, subtle gray | Disabled (shows "שוריין ע"י {name}") |
| purchased | "נרכש ✓" badge, grayed out | None |
| private | Hidden from public | - |

### 15.6 Reservation Timeout

- Reservation expires after **48 hours** if not confirmed
- At 24 hours: Send reminder email to gift giver
- After expiry: Item becomes available again, purchase record marked as 'expired'

### 15.7 Email Notifications

| Email | Trigger | Recipient | Delay |
|-------|---------|-----------|-------|
| Welcome | Sign up | User | Immediate |
| Gift Reserved | Purchase recorded | Registry owner (unless is_surprise) | Immediate |
| Reminder | 24h after reservation | Gift giver | 24 hours |
| Gift Confirmed | Giver clicks "קניתי" | Registry owner | Immediate |
| Reservation Expired | 48h no confirmation | Gift giver | 48 hours |

---

## 16. Settings Sidebar

### 16.1 Settings Panel

```typescript
// src/components/SettingsSidebar.tsx
// Sections:
//
// 1. User Info Card
//    - Avatar/icon
//    - Name
//    - Email
//
// 2. כתובת למשלוח
//    - עיר, רחוב, מספר, דירה, מיקוד
//    - Toggle: "הסתר כתובת"
//
// 3. פרטי התחברות
//    - אימייל (editable)
//    - סיסמה חדשה (optional)
//    - אימות סיסמה (appears when typing new password)
//
// 4. Actions
//    - "שמור הגדרות" button
//    - "התנתק" button (destructive)
```

### 16.2 Password Validation

```typescript
if (password && password !== confirmPassword) {
  setPasswordError("הסיסמאות לא תואמות")
  return
}
```

---

## 17. Smart Price Comparison Engine

> **⚠️ DEFERRED TO PHASE 2**
>
> This feature requires web scraping infrastructure, product matching algorithms, and potentially
> legal considerations with stores. The database schema includes the `price_alerts` table for
> future implementation.

### 17.1 Future Vision

When an item is added, the system searches for the same product at lower prices elsewhere.

### 17.2 Future Flow

1. User adds item with name and price
2. Background job searches for same item name across Israeli stores
3. If cheaper found, create `price_alert` record
4. Show alert in dashboard with savings info
5. User can dismiss or update item URL

### 17.3 Future Price Alert UI

```
Card in Dashboard:
"מצאנו מחיר טוב יותר! 🎉"
"{item_name}"
"₪{original} → ₪{found} (חסכון של {percent}%)"
Buttons: "עבור לחלופה", "התעלם"
```

### 17.4 Technical Requirements (Phase 2)

- Web scraping infrastructure for Israeli baby stores
- Product name matching algorithm (Hebrew/English)
- Price monitoring cron jobs
- Store partnership considerations

---

## 18. Group Gifting (Chip-In)

> **⚠️ DEFERRED TO POST-MVP**
>
> This feature requires payment processing integration which is out of scope for MVP.
> The database schema includes placeholder tables (`contributions`) for future implementation.

### 18.1 Future Vision

For expensive items (e.g., 4,000₪ stroller), multiple people can contribute partial amounts.

### 18.2 Post-MVP Implementation Options

1. **Pledge System:** Track commitments only, owner collects via Bit/PayBox manually
2. **Payment Integration:** Integrate with Israeli payment providers (Bit, PayBox, PayPal)

### 18.3 MVP Alternative

For now, gift givers who want to split a gift should coordinate externally and one person reserves the item.

---

## 19. Chrome Extension Integration

**Note:** Extension is developed separately by co-founder. This documents the integration.

### 19.1 Extension Features

- Detects product pages on any site
- Extracts: name, price, image, URL, store
- Shows popup for confirmation
- Sends to Nesty database

### 19.2 Data Flow

```
Extension → Supabase items table → Dashboard refresh
```

### 19.3 Authentication

Extension uses same Supabase auth session. User must be logged in to Nesty website first.

### 19.4 API Endpoint

Extension calls Supabase directly:

```typescript
await supabase.from('items').insert({
  registry_id: userRegistry.id,
  name: extractedName,
  price: extractedPrice,
  image_url: extractedImage,
  original_url: window.location.href,
  store_name: extractDomain(window.location.href),
  category: suggestedCategory,
})
```

---

## 20. Row Level Security Policies

### 20.1 Profiles RLS

```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- System can insert profiles (for trigger)
CREATE POLICY "Enable insert for authenticated users"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 20.2 Registries RLS

```sql
-- Owners can do everything
CREATE POLICY "Owners have full access"
  ON registries FOR ALL
  USING (auth.uid() = owner_id);

-- Public can read registries (for public view)
CREATE POLICY "Anyone can view registries"
  ON registries FOR SELECT
  USING (true);
```

### 20.3 Items RLS

```sql
-- Registry owner has full access
CREATE POLICY "Owner has full access to items"
  ON items FOR ALL
  USING (
    registry_id IN (
      SELECT id FROM registries WHERE owner_id = auth.uid()
    )
  );

-- Public can view non-private items
CREATE POLICY "Public can view non-private items"
  ON items FOR SELECT
  USING (
    is_private = false
  );
```

### 20.4 Purchases RLS

```sql
-- Anyone can insert purchases (gift givers)
CREATE POLICY "Anyone can record purchases"
  ON purchases FOR INSERT
  WITH CHECK (true);

-- Registry owners can view purchases
CREATE POLICY "Owners can view purchases"
  ON purchases FOR SELECT
  USING (
    item_id IN (
      SELECT i.id FROM items i
      JOIN registries r ON i.registry_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Buyers can view and update their own purchases
CREATE POLICY "Buyers can manage own purchases"
  ON purchases FOR ALL
  USING (buyer_email = auth.jwt()->>'email');
```

---

## 21. Component Reference

### 21.1 UI Components (shadcn/ui)

| Component | File | Usage |
|-----------|------|-------|
| Button | ui/button.tsx | All buttons |
| Card | ui/card.tsx | Container cards |
| Input | ui/input.tsx | Form inputs |

### 21.2 Layout Components

| Component | Description |
|-----------|-------------|
| Layout | Main layout wrapper |
| Header | Landing page header |
| Footer | Landing page footer |
| ProtectedRoute | Auth guard |

### 21.3 Feature Components

| Component | Description |
|-----------|-------------|
| Hero | Landing hero section |
| Features | Landing features grid |
| CTASection | Landing call-to-action |
| DashboardHeader | Dashboard top section |
| RegistryCategories | Category cards with items |
| AddItemModal | Add/edit item form |
| ShareRegistry | Share link modal |
| SettingsSidebar | Settings panel |
| AddressPopup | Post-onboarding address |
| PurchaseModal | Gift giver purchase flow |

---

## Appendix A: TypeScript Types

```typescript
// src/types/index.ts

export interface RegistryItem {
  id: string
  name: string
  category: string
  url?: string
  imageUrl?: string
  price?: string
  color?: string
  quantity: number
  purchasedQuantity: number
  addedDate: string
  mostWanted?: boolean
  isPrivate?: boolean
  source?: 'manual' | 'extension' | 'checklist'
}

export function isPurchased(item: RegistryItem): boolean {
  return item.purchasedQuantity >= item.quantity
}

export function remainingQuantity(item: RegistryItem): number {
  return Math.max(0, item.quantity - item.purchasedQuantity)
}
```

---

## Appendix B: Utility Functions

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## Appendix C: Google Fonts Setup

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## Appendix D: Deployment

### GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Vite Config for GitHub Pages

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/nesty/', // Change to repo name
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

<p align="center">
  <strong>🪺 Nesty - לבנות את הקן שלכם, חכם יותר</strong><br>
  Build with love for Israeli parents
</p>
