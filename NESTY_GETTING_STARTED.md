# Nesty - Complete Getting Started Guide

## Step-by-Step Instructions for Building Nesty from Scratch

**For Claude Code AI Assistant**

---

## Important Notes for the AI Assistant

The user has minimal coding background. Please:
- Explain each step clearly
- Provide exact commands to copy and paste
- Show where to click in web interfaces
- Confirm success before moving to next step
- If something fails, help troubleshoot before continuing

This guide covers setting up:
1. Google OAuth credentials (for "Continue with Google" login)
2. Supabase project (database and authentication)
3. React + Vite project (frontend)
4. Connecting everything together

**Reference Documents:**
- `NESTY_PRD.md` - Complete product requirements
- `NESTY_DATABASE_SCHEMA.md` - Database structure and SQL

---

## Part 1: Google Cloud Console Setup (Google OAuth)

### Step 1.1: Create Google Cloud Project

1. **Open Google Cloud Console:**
   - Go to: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project:**
   - Click the project dropdown at the top (next to "Google Cloud")
   - Click "NEW PROJECT"
   - Project name: `Nesty`
   - Click "CREATE"
   - Wait for project to be created (30 seconds)

3. **Select Your Project:**
   - Click the project dropdown again
   - Select "Nesty"

### Step 1.2: Configure OAuth Consent Screen

1. **Navigate to OAuth Consent:**
   - In the left sidebar, click "APIs & Services"
   - Click "OAuth consent screen"

2. **Choose User Type:**
   - Select "External" (allows any Google user)
   - Click "CREATE"

3. **Fill App Information:**
   ```
   App name: Nesty
   User support email: [your email]
   App logo: (skip for now)
   ```

4. **App Domain (leave blank for now):**
   - Skip "App domain" section

5. **Developer Contact:**
   ```
   Developer contact information: [your email]
   ```
   - Click "SAVE AND CONTINUE"

6. **Scopes:**
   - Click "ADD OR REMOVE SCOPES"
   - Select:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click "UPDATE"
   - Click "SAVE AND CONTINUE"

7. **Test Users:**
   - Click "ADD USERS"
   - Add your email address
   - Click "ADD"
   - Click "SAVE AND CONTINUE"

8. **Summary:**
   - Review and click "BACK TO DASHBOARD"

### Step 1.3: Create OAuth Credentials

1. **Navigate to Credentials:**
   - In left sidebar: "APIs & Services" → "Credentials"

2. **Create Credentials:**
   - Click "+ CREATE CREDENTIALS"
   - Select "OAuth client ID"

3. **Configure OAuth Client:**
   ```
   Application type: Web application
   Name: Nesty Web Client
   ```

4. **Authorized JavaScript Origins:**
   - Click "ADD URI"
   - Add: `http://localhost:5173`
   - (We'll add production URL later)

5. **Authorized Redirect URIs:**
   - Click "ADD URI"
   - Add: `http://localhost:5173/auth/callback`
   - (We'll add Supabase URL after creating project)

6. **Click "CREATE"**

7. **SAVE YOUR CREDENTIALS:**
   - A popup shows your Client ID and Client Secret
   - **Copy and save these somewhere safe!**
   ```
   Client ID: xxxxxx.apps.googleusercontent.com
   Client Secret: GOCSPX-xxxxxxxx
   ```
   - Click "OK"

### Step 1.4: Keep This Tab Open
- We'll come back to add Supabase redirect URL later

---

## Part 2: Supabase Project Setup

### Step 2.1: Create Supabase Account & Project

1. **Go to Supabase:**
   - Open: https://supabase.com/
   - Click "Start your project" or "Sign In"
   - Sign up with GitHub or email

2. **Create New Project:**
   - Click "New Project"
   - Select your organization (or create one)

3. **Project Settings:**
   ```
   Name: nesty
   Database Password: [generate a strong password - SAVE IT!]
   Region: Choose closest to Israel (Frankfurt or similar)
   ```
   - Click "Create new project"
   - Wait 2-3 minutes for setup

### Step 2.2: Get Your Supabase Credentials

1. **Go to Settings:**
   - Click the gear icon (Settings) in left sidebar
   - Click "API"

2. **Copy These Values (SAVE THEM!):**
   ```
   Project URL: https://[YOUR_PROJECT_ID].supabase.co
   anon public: eyJhbGci... (this is your ANON KEY)
   ```

### Step 2.3: Add Google OAuth to Supabase

1. **Navigate to Auth Providers:**
   - Click "Authentication" in left sidebar
   - Click "Providers"
   - Find "Google" and click to expand

2. **Enable Google:**
   - Toggle "Enable Sign in with Google" ON

3. **Enter Google Credentials:**
   ```
   Client ID: [paste your Google Client ID from Step 1.3]
   Client Secret: [paste your Google Client Secret from Step 1.3]
   ```

4. **Copy Supabase Callback URL:**
   - You'll see a "Callback URL" field showing something like:
   ```
   https://[YOUR_PROJECT_ID].supabase.co/auth/v1/callback
   ```
   - **Copy this URL**

5. **Click "Save"**

### Step 2.4: Add Supabase Callback to Google

1. **Go back to Google Cloud Console:**
   - https://console.cloud.google.com/
   - APIs & Services → Credentials
   - Click on "Nesty Web Client" (your OAuth client)

2. **Add Authorized Redirect URI:**
   - Under "Authorized redirect URIs"
   - Click "ADD URI"
   - Paste: `https://[YOUR_PROJECT_ID].supabase.co/auth/v1/callback`
   - Click "SAVE"

### Step 2.5: Configure Supabase Auth Settings

1. **Go to Authentication → URL Configuration:**
   - Click "Authentication" in Supabase sidebar
   - Click "URL Configuration"

2. **Set Site URL:**
   ```
   Site URL: http://localhost:5173
   ```

3. **Add Redirect URLs:**
   - Click "Add URL"
   - Add: `http://localhost:5173/auth/callback`
   - Click "Save"

---

## Part 3: Create Database Tables

### Step 3.1: Open SQL Editor

1. **Navigate to SQL Editor:**
   - In Supabase left sidebar, click "SQL Editor"
   - Click "New query"

### Step 3.2: Run Database Setup Scripts

**IMPORTANT:** Run each script separately, in order. Wait for "Success" before running next one.

---

**Script 1: Enable Extensions**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```
- Click "Run" (or Cmd+Enter)
- Wait for "Success"

---

**Script 2: Create Profiles Table**
```sql
-- Profiles table
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
```
- Click "Run"
- Wait for "Success"

---

**Script 3: Create Registries Table**
```sql
-- Registries table
CREATE TABLE registries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES profiles(id),
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  address_city TEXT,
  address_street TEXT,
  address_apt TEXT,
  address_postal TEXT,
  address_phone TEXT,
  address_is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
- Click "Run"
- Wait for "Success"

---

**Script 4: Create Items Table**
```sql
-- Items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registry_id UUID REFERENCES registries(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  original_url TEXT,
  store_name TEXT DEFAULT 'ידני',
  category TEXT NOT NULL CHECK (category IN (
    'strollers', 'car_safety', 'furniture', 'safety',
    'feeding', 'nursing', 'bath', 'clothing', 'bedding', 'toys'
  )),
  quantity INTEGER DEFAULT 1,
  quantity_received INTEGER DEFAULT 0,
  is_most_wanted BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  notes TEXT,
  cheaper_alternative_url TEXT,
  cheaper_alternative_price DECIMAL(10,2),
  cheaper_alternative_store TEXT,
  price_alert_sent BOOLEAN DEFAULT false,
  enable_chip_in BOOLEAN DEFAULT false,
  chip_in_goal DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
- Click "Run"
- Wait for "Success"

---

**Script 5: Create Purchases Table**
```sql
-- Purchases table
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  gift_message TEXT,
  is_surprise BOOLEAN DEFAULT false,
  quantity_purchased INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'cancelled', 'expired'
  )),
  confirmation_token UUID DEFAULT uuid_generate_v4(),
  confirmation_sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
- Click "Run"
- Wait for "Success"

---

**Script 6: Create Contributions Table**
```sql
-- Contributions table (for chip-in)
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  contributor_name TEXT NOT NULL,
  contributor_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'cancelled'
  )),
  confirmation_token UUID DEFAULT uuid_generate_v4(),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
- Click "Run"
- Wait for "Success"

---

**Script 7: Create Price Alerts Table**
```sql
-- Price alerts table
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
```
- Click "Run"
- Wait for "Success"

---

**Script 8: Create Updated_at Trigger Function**
```sql
-- Auto-update updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registries_timestamp
  BEFORE UPDATE ON registries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_timestamp
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```
- Click "Run"
- Wait for "Success"

---

**Script 9: Auto-Create Profile on Signup**
```sql
-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name',
      split_part(NEW.email, '@', 1)
    )
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
- Click "Run"
- Wait for "Success"

---

**Script 10: Enable Row Level Security**
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE registries ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
```
- Click "Run"
- Wait for "Success"

---

**Script 11: Profiles RLS Policies**
```sql
-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow profile creation on signup"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```
- Click "Run"
- Wait for "Success"

---

**Script 12: Registries RLS Policies**
```sql
-- Registries policies
CREATE POLICY "Owners can manage their registry"
  ON registries FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view registries"
  ON registries FOR SELECT
  USING (true);
```
- Click "Run"
- Wait for "Success"

---

**Script 13: Items RLS Policies**
```sql
-- Items policies
CREATE POLICY "Owners can manage items"
  ON items FOR ALL
  USING (
    registry_id IN (
      SELECT id FROM registries WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view non-private items"
  ON items FOR SELECT
  USING (is_private = false);
```
- Click "Run"
- Wait for "Success"

---

**Script 14: Purchases RLS Policies**
```sql
-- Purchases policies
CREATE POLICY "Anyone can record purchases"
  ON purchases FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can view purchases"
  ON purchases FOR SELECT
  USING (
    item_id IN (
      SELECT i.id FROM items i
      JOIN registries r ON i.registry_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );
```
- Click "Run"
- Wait for "Success"

---

**Script 15: Contributions RLS Policies**
```sql
-- Contributions policies
CREATE POLICY "Anyone can contribute"
  ON contributions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can view contributions"
  ON contributions FOR SELECT
  USING (
    item_id IN (
      SELECT i.id FROM items i
      JOIN registries r ON i.registry_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );
```
- Click "Run"
- Wait for "Success"

---

**Script 16: Price Alerts RLS Policies**
```sql
-- Price alerts policies
CREATE POLICY "Owners can manage price alerts"
  ON price_alerts FOR ALL
  USING (
    item_id IN (
      SELECT i.id FROM items i
      JOIN registries r ON i.registry_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );
```
- Click "Run"
- Wait for "Success"

---

**Script 17: Create Indexes**
```sql
-- Performance indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_registries_slug ON registries(slug);
CREATE INDEX idx_registries_owner ON registries(owner_id);
CREATE INDEX idx_items_registry ON items(registry_id);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_purchases_item ON purchases(item_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_contributions_item ON contributions(item_id);
CREATE INDEX idx_price_alerts_item ON price_alerts(item_id);
```
- Click "Run"
- Wait for "Success"

---

### Step 3.3: Verify Tables Created

1. **Go to Table Editor:**
   - Click "Table Editor" in left sidebar
   - You should see 6 tables:
     - profiles
     - registries
     - items
     - purchases
     - contributions
     - price_alerts

If all 6 tables appear, database setup is complete!

---

## Part 4: Create React Project

### Step 4.1: Open Terminal

1. **Open your terminal/command line**
2. **Navigate to your project folder:**
   ```bash
   cd [path-to-your-project-folder]
   ```

### Step 4.2: Create Vite React Project

```bash
npm create vite@latest nesty-web -- --template react-ts
```

When prompted:
- Select "React"
- Select "TypeScript"

### Step 4.3: Install Dependencies

```bash
cd nesty-web
npm install
```

### Step 4.4: Install Additional Packages

```bash
npm install @supabase/supabase-js react-router-dom lucide-react class-variance-authority clsx tailwind-merge
```

### Step 4.5: Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 4.6: Create Environment File

Create a file called `.env.local` in the project root:

```bash
touch .env.local
```

Add these contents (replace with your actual values):

```env
VITE_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4.7: Configure Tailwind

Replace contents of `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
    },
  },
  plugins: [],
}
```

### Step 4.8: Configure CSS

Replace contents of `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  direction: rtl;
}

body {
  font-family: 'Assistant', 'Heebo', sans-serif;
  background-color: #faf8fb;
  color: #1a1a1a;
  min-height: 100vh;
}
```

### Step 4.9: Update index.html

Replace contents of `index.html`:

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&display=swap" rel="stylesheet">
    <title>Nesty - לבנות את הקן שלכם, חכם יותר</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Part 5: Create Project Structure

### Step 5.1: Create Folder Structure

Run these commands from the project root:

```bash
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/auth
mkdir -p src/pages/auth
mkdir -p src/pages/onboarding
mkdir -p src/contexts
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/types
```

### Step 5.2: Create Supabase Client

Create file `src/lib/supabase.ts`:

```typescript
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

### Step 5.3: Create Utility Functions

Create file `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Step 5.4: Create Types

Create file `src/types/index.ts`:

```typescript
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

### Step 5.5: Create Auth Context

Create file `src/contexts/AuthContext.tsx`:

```typescript
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

### Step 5.6: Create Protected Route

Create file `src/components/auth/ProtectedRoute.tsx`:

```typescript
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />
  }

  return <Outlet />
}
```

### Step 5.7: Create Main App

Replace contents of `src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Placeholder pages - we'll create these next
function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Nesty</h1>
        <p className="text-xl text-muted-foreground mb-8">לבנות את הקן שלכם, חכם יותר</p>
        <a href="/auth/signin" className="bg-primary text-white px-6 py-3 rounded-xl">
          התחברות
        </a>
      </div>
    </div>
  )
}

function SignIn() {
  const { supabase } = useAuth()

  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-card p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">התחברות</h1>
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          התחברות עם Google
        </button>
      </div>
    </div>
  )
}

function AuthCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  )
}

function Dashboard() {
  const { user, profile, registry } = useAuth()

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">
        שלום, {profile?.first_name || 'משתמש'}!
      </h1>
      <p>ברוכים הבאים לדשבורד</p>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  )
}

function AppRoutes() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/signin" element={<SignIn />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

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

### Step 5.8: Update main.tsx

Replace contents of `src/main.tsx`:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## Part 6: Test Your Setup

### Step 6.1: Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 6.2: Test Google Sign In

1. Open http://localhost:5173
2. Click "התחברות"
3. Click "התחברות עם Google"
4. Complete Google sign-in
5. You should be redirected back to the app

### Step 6.3: Verify Database Entry

1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Click "profiles"
4. You should see your new user profile!

---

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution:** Make sure `.env.local` file exists and contains correct values. Restart dev server after changes.

### Issue: Google Sign-In redirects but nothing happens
**Solution:** Check that Supabase callback URL is added to Google Cloud credentials.

### Issue: "Invalid Redirect URI"
**Solution:** Make sure `http://localhost:5173/auth/callback` is added to both:
- Google Cloud Console (Authorized redirect URIs)
- Supabase (URL Configuration → Redirect URLs)

### Issue: Profile not created after sign-in
**Solution:** Check that the `on_auth_user_created` trigger was created successfully in Supabase.

---

## Next Steps

After completing this setup, refer to `NESTY_PRD.md` for:
- Complete component implementations
- Onboarding flow
- Dashboard features
- Public registry view
- Purchase flow

And `NESTY_DATABASE_SCHEMA.md` for:
- Data flow diagrams
- Query examples
- Additional features

---

## Credentials Summary (Save This!)

```
=== GOOGLE CLOUD ===
Project Name: Nesty
Project ID: nesty-481110
Client ID: [your client id - keep private]
Client Secret: [keep private - already in Supabase]

=== SUPABASE ===
Project ID: wopsrjfdaovlyibivijl
Project URL: https://wopsrjfdaovlyibivijl.supabase.co
Callback URL: https://wopsrjfdaovlyibivijl.supabase.co/auth/v1/callback
Anon Key: [your anon key]
Database Password: [your db password]

=== LOCAL DEV ===
URL: http://localhost:5173
Callback: http://localhost:5173/auth/callback
```

---

<p align="center">
  <strong>Good luck building Nesty!</strong><br>
  If you get stuck, share the error message and I'll help troubleshoot.
</p>
