# Nesty: Supabase Auth → Clerk Migration Plan

**Date:** December 18, 2024
**Status:** Ready for Implementation
**Estimated Time:** 3-4 hours

---

## Executive Summary

This plan outlines the migration from Supabase Authentication to Clerk for the Nesty baby registry app. The migration involves updating 19 files, modifying database RLS policies, and establishing user synchronization between Clerk and the Supabase database.

**Key Benefits:**
- Better developer experience with pre-built UI components
- Simpler OAuth configuration
- Automatic localhost/production URL handling
- Superior user management dashboard
- Built-in features (passwordless, MFA, user impersonation)

---

## Pre-Migration Checklist

- [ ] Create Clerk account at https://clerk.com
- [ ] Create new Clerk application
- [ ] Configure Google OAuth in Clerk dashboard
- [ ] Note down Clerk Publishable Key and Secret Key
- [ ] Backup current database (especially `profiles` and `registries` tables)
- [ ] Commit current code to git

---

## Phase 1: Clerk Setup (30 minutes)

### 1.1 Create Clerk Application

1. Go to https://dashboard.clerk.com
2. Click "Add Application"
3. Name: `Nesty`
4. Choose authentication methods:
   - ✅ Google OAuth (primary)
   - ✅ Email (for future)
5. Click "Create Application"

### 1.2 Configure Google OAuth

1. In Clerk Dashboard → "SSO Connections" → "Google"
2. Choose "Use Clerk's development keys" for testing
3. For production:
   - Use your existing Google Cloud Console credentials
   - Client ID: (from your existing Google OAuth setup)
   - Client Secret: (from your existing Google OAuth setup)
4. Save settings

### 1.3 Configure URLs

1. In Clerk Dashboard → "Paths"
2. Set redirect URLs:
   - Sign-in URL: `/auth/signin`
   - Sign-up URL: `/auth/signup`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/onboarding`

### 1.4 Get API Keys

1. Go to "API Keys" in Clerk Dashboard
2. Copy:
   - **Publishable Key** (starts with `pk_test_...`)
   - **Secret Key** (starts with `sk_test_...`)

---

## Phase 2: Install Dependencies (5 minutes)

### 2.1 Install Clerk SDK

```bash
cd nesty-web
npm install @clerk/clerk-react
```

### 2.2 Update Environment Variables

**File:** `nesty-web/.env.local`

**Remove:**
```env
VITE_SUPABASE_URL=https://wopsrjfdaovlyibivijl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**Add:**
```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Supabase Database (keep these - still using Supabase for data)
VITE_SUPABASE_URL=https://wopsrjfdaovlyibivijl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**Note:** We keep Supabase for database, only auth changes to Clerk.

---

## Phase 3: Update Database Schema (20 minutes)

### 3.1 Update Profiles Table

**File:** Run in Supabase SQL Editor

```sql
-- Add Clerk user ID column
ALTER TABLE profiles
ADD COLUMN clerk_user_id TEXT UNIQUE;

-- Update constraint to allow NULL for id temporarily
ALTER TABLE profiles
ALTER COLUMN id DROP NOT NULL;

-- Create index for faster lookups
CREATE INDEX idx_profiles_clerk_user_id ON profiles(clerk_user_id);
```

### 3.2 Update RLS Policies

The current policies use `auth.uid()` which won't work with Clerk. We'll create a helper function:

```sql
-- Create helper function to get current Clerk user ID from JWT
CREATE OR REPLACE FUNCTION get_clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  -- Extract clerk_user_id from JWT claims
  RETURN current_setting('request.jwt.claims', true)::json->>'sub';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation on signup" ON profiles;
DROP POLICY IF EXISTS "Owners can manage their registry" ON registries;

-- Create new policies using Clerk user ID
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (clerk_user_id = get_clerk_user_id());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (clerk_user_id = get_clerk_user_id());

CREATE POLICY "Allow profile creation on signup"
  ON profiles FOR INSERT
  WITH CHECK (clerk_user_id = get_clerk_user_id());

CREATE POLICY "Owners can manage their registry"
  ON registries FOR ALL
  USING (
    owner_id IN (
      SELECT id FROM profiles WHERE clerk_user_id = get_clerk_user_id()
    )
  );

-- Update items policies
DROP POLICY IF EXISTS "Owners can manage items" ON items;
CREATE POLICY "Owners can manage items"
  ON items FOR ALL
  USING (
    registry_id IN (
      SELECT r.id FROM registries r
      JOIN profiles p ON r.owner_id = p.id
      WHERE p.clerk_user_id = get_clerk_user_id()
    )
  );

-- Update purchases policies
DROP POLICY IF EXISTS "Owners can view purchases" ON purchases;
CREATE POLICY "Owners can view purchases"
  ON purchases FOR SELECT
  USING (
    item_id IN (
      SELECT i.id FROM items i
      JOIN registries r ON i.registry_id = r.id
      JOIN profiles p ON r.owner_id = p.id
      WHERE p.clerk_user_id = get_clerk_user_id()
    )
  );

-- Update contributions policies
DROP POLICY IF EXISTS "Owners can view contributions" ON contributions;
CREATE POLICY "Owners can view contributions"
  ON contributions FOR SELECT
  USING (
    item_id IN (
      SELECT i.id FROM items i
      JOIN registries r ON i.registry_id = r.id
      JOIN profiles p ON r.owner_id = p.id
      WHERE p.clerk_user_id = get_clerk_user_id()
    )
  );

-- Update price alerts policies
DROP POLICY IF EXISTS "Owners can manage price alerts" ON price_alerts;
CREATE POLICY "Owners can manage price alerts"
  ON price_alerts FOR ALL
  USING (
    item_id IN (
      SELECT i.id FROM items i
      JOIN registries r ON i.registry_id = r.id
      JOIN profiles p ON r.owner_id = p.id
      WHERE p.clerk_user_id = get_clerk_user_id()
    )
  );
```

### 3.3 Remove Supabase Auth Trigger

```sql
-- Drop the trigger that auto-creates profiles (we'll handle this in app)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

---

## Phase 4: Update Supabase Client (10 minutes)

### 4.1 Create Clerk-Aware Supabase Client

**File:** `nesty-web/src/lib/supabase.ts`

**Replace entire file with:**

```typescript
import { createClient } from '@supabase/supabase-js'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create base Supabase client (no auth)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Clerk handles sessions
  },
  global: {
    headers: {
      // We'll set this per-request using getClerkToken()
    }
  }
})

// Helper to get Supabase client with Clerk token
export async function getAuthedSupabase() {
  const { getToken } = useClerkAuth()
  const token = await getToken({ template: 'supabase' })

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })
}
```

---

## Phase 5: Update App Entry Point (10 minutes)

### 5.1 Wrap App with ClerkProvider

**File:** `nesty-web/src/App.tsx`

**Add imports at top:**

```typescript
import { ClerkProvider } from '@clerk/clerk-react'
```

**Update the export default function:**

```typescript
export default function App() {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  if (!clerkPubKey) {
    throw new Error('Missing Clerk Publishable Key')
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
    >
      <ErrorBoundary>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AuthProvider>
            <div dir="rtl" className="font-sans min-h-screen bg-background">
              <AppRoutes />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </ClerkProvider>
  )
}
```

---

## Phase 6: Rewrite AuthContext (45 minutes)

### 6.1 Update AuthContext to use Clerk

**File:** `nesty-web/src/contexts/AuthContext.tsx`

**Replace entire file with:**

```typescript
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react'
import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  clerk_user_id: string
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
  address_phone: string | null
  address_is_private: boolean
}

interface AuthContextType {
  clerkUser: any | null // Clerk user object
  profile: Profile | null
  registry: Registry | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, userId, signOut: clerkSignOut, getToken } = useClerkAuth()
  const { user: clerkUser } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [registry, setRegistry] = useState<Registry | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async (clerkUserId: string) => {
    try {
      // Get Clerk token for RLS
      const token = await getToken({ template: 'supabase' })

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  const fetchRegistry = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('registries')
        .select('*')
        .eq('owner_id', profileId)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching registry:', error)
      return null
    }
  }

  const createProfile = async (clerkUserId: string) => {
    try {
      const email = clerkUser?.primaryEmailAddress?.emailAddress || ''
      const firstName = clerkUser?.firstName || email.split('@')[0]
      const lastName = clerkUser?.lastName || ''
      const avatarUrl = clerkUser?.imageUrl || null

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          clerk_user_id: clerkUserId,
          email,
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating profile:', error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (!userId) return

    let profileData = await fetchProfile(userId)

    // If profile doesn't exist, create it (first-time user)
    if (!profileData) {
      profileData = await createProfile(userId)
    }

    setProfile(profileData)

    if (profileData) {
      const registryData = await fetchRegistry(profileData.id)
      setRegistry(registryData)
    }
  }

  const signOut = async () => {
    await clerkSignOut()
    setProfile(null)
    setRegistry(null)
  }

  useEffect(() => {
    if (!isLoaded) return

    const loadUserData = async () => {
      setIsLoading(true)

      if (userId) {
        await refreshProfile()
      } else {
        setProfile(null)
        setRegistry(null)
      }

      setIsLoading(false)
    }

    loadUserData()
  }, [isLoaded, userId])

  return (
    <AuthContext.Provider
      value={{
        clerkUser,
        profile,
        registry,
        isLoading,
        isAuthenticated: !!userId,
        refreshProfile,
        signOut,
      }}
    >
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

---

## Phase 7: Update Auth Pages (30 minutes)

### 7.1 Update SignIn Page

**File:** `nesty-web/src/pages/auth/SignIn.tsx`

**Replace entire file with:**

```typescript
import { SignIn as ClerkSignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { asset } from '../../lib/assets'

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffbff] px-4" dir="rtl">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#eaddff]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#ffd8e4]/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src={asset('Nesty_logo.png')} alt="Nesty" className="h-20 w-auto" />
        </Link>

        {/* Clerk Sign In Component */}
        <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[#e7e0ec] p-8">
          <ClerkSignIn
            routing="path"
            path="/auth/signin"
            signUpUrl="/auth/signup"
            afterSignInUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-transparent shadow-none',
              },
            }}
          />
        </div>

        {/* Don't have account */}
        <div className="mt-8 text-center">
          <p className="text-[#49454f]">
            אין לכם חשבון עדיין?{' '}
            <Link to="/auth/signup" className="text-[#6750a4] font-medium hover:underline">
              הירשמו בחינם
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center text-[#49454f] mt-4">
          <Link to="/" className="hover:text-[#6750a4] transition-colors">
            חזרה לדף הבית
          </Link>
        </p>
      </div>
    </div>
  )
}
```

### 7.2 Update SignUp Page

**File:** `nesty-web/src/pages/auth/SignUp.tsx`

**Replace entire file with:**

```typescript
import { SignUp as ClerkSignUp } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { asset } from '../../lib/assets'

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffbff] px-4" dir="rtl">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#eaddff]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#ffd8e4]/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src={asset('Nesty_logo.png')} alt="Nesty" className="h-20 w-auto" />
        </Link>

        {/* Clerk Sign Up Component */}
        <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[#e7e0ec] p-8">
          <ClerkSignUp
            routing="path"
            path="/auth/signup"
            signInUrl="/auth/signin"
            afterSignUpUrl="/onboarding"
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-transparent shadow-none',
              },
            }}
          />
        </div>

        {/* Already have account */}
        <div className="mt-8 text-center">
          <p className="text-[#49454f]">
            כבר יש לכם חשבון?{' '}
            <Link to="/auth/signin" className="text-[#6750a4] font-medium hover:underline">
              התחברו
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center text-[#49454f] mt-4">
          <Link to="/" className="hover:text-[#6750a4] transition-colors">
            חזרה לדף הבית
          </Link>
        </p>
      </div>
    </div>
  )
}
```

### 7.3 Remove AuthCallback Page

**File:** `nesty-web/src/pages/auth/AuthCallback.tsx`

**Action:** Delete this file (Clerk handles callbacks automatically)

**File:** `nesty-web/src/App.tsx`

**Remove the AuthCallback route:**

```typescript
// DELETE THIS LINE:
<Route path="/auth/callback" element={<AuthCallback />} />
```

---

## Phase 8: Update ProtectedRoute (10 minutes)

### 8.1 Use Clerk's Built-in Protection

**File:** `nesty-web/src/components/auth/ProtectedRoute.tsx`

**Replace entire file with:**

```typescript
import { useAuth } from '@clerk/clerk-react'
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
  const { isLoaded, userId } = useAuth()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    )
  }

  if (!userId) {
    return <Navigate to="/auth/signin" replace />
  }

  return <Outlet />
}
```

---

## Phase 9: Update Components Using Auth (30 minutes)

### 9.1 Update Header Component

**File:** `nesty-web/src/components/Header.tsx`

**Find and replace:**

```typescript
// OLD:
import { useAuth } from '../contexts/AuthContext'
const { isAuthenticated } = useAuth()

// NEW:
import { useAuth } from '@clerk/clerk-react'
const { isSignedIn } = useAuth()

// Then replace all instances of:
isAuthenticated → isSignedIn
```

### 9.2 Update SideNav Component

**File:** `nesty-web/src/components/layout/SideNav.tsx`

**Find and replace:**

```typescript
// OLD:
import { useAuth } from '../../contexts/AuthContext'
const { signOut, profile } = useAuth()

// NEW:
import { useClerk } from '@clerk/clerk-react'
import { useAuth as useNestyAuth } from '../../contexts/AuthContext'

const { signOut } = useClerk()
const { profile } = useNestyAuth()
```

### 9.3 Update All Other Components

Apply similar pattern to these files:
- `src/pages/Dashboard.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Gifts.tsx`
- `src/pages/Checklist.tsx`
- `src/pages/onboarding/Onboarding.tsx`

**Pattern:**
- Import `useAuth` from `@clerk/clerk-react` for auth state
- Import custom `useAuth` as `useNestyAuth` from `../../contexts/AuthContext` for profile/registry data
- Use `isSignedIn` instead of `isAuthenticated`

---

## Phase 10: Configure Clerk JWT Template (15 minutes)

This is critical for RLS policies to work!

### 10.1 Create Supabase JWT Template in Clerk

1. Go to Clerk Dashboard → "JWT Templates"
2. Click "New Template"
3. Name: `supabase`
4. Template:

```json
{
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "user_metadata": {
    "first_name": "{{user.first_name}}",
    "last_name": "{{user.last_name}}",
    "avatar_url": "{{user.image_url}}"
  }
}
```

5. Save template

### 10.2 Update Supabase to Accept Clerk JWTs

1. Go to Supabase Dashboard → Settings → API
2. Scroll to "JWT Settings"
3. Add Clerk's public key (get from Clerk Dashboard → "JWT Templates" → "supabase" → "JWKS Endpoint")
4. Save changes

---

## Phase 11: Handle Account Deletion (20 minutes)

### 11.1 Create Clerk Webhook

Since we can't use Supabase Edge Functions with Clerk, we'll use Clerk webhooks.

1. **In Clerk Dashboard:**
   - Go to "Webhooks"
   - Click "Add Endpoint"
   - URL: Your backend API endpoint (you'll need to create this)
   - Subscribe to: `user.deleted`

2. **Create API endpoint** (example using Express):

```typescript
// api/webhooks/clerk.ts
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin access
)

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!
  const svix = new Webhook(webhookSecret)

  const payload = await req.text()
  const headers = req.headers

  let evt
  try {
    evt = svix.verify(payload, {
      'svix-id': headers.get('svix-id')!,
      'svix-timestamp': headers.get('svix-timestamp')!,
      'svix-signature': headers.get('svix-signature')!,
    })
  } catch (err) {
    return new Response('Invalid signature', { status: 400 })
  }

  if (evt.type === 'user.deleted') {
    const clerkUserId = evt.data.id

    // Delete user's profile (cascades to registries, items, etc.)
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('clerk_user_id', clerkUserId)
  }

  return new Response('OK', { status: 200 })
}
```

### 11.2 Update Settings Page Delete Account Button

**File:** `nesty-web/src/pages/Settings.tsx`

**Replace delete account function:**

```typescript
import { useUser } from '@clerk/clerk-react'

const { user } = useUser()

const handleDeleteAccount = async () => {
  if (!confirm('האם אתם בטוחים? פעולה זו בלתי הפיכה.')) return

  try {
    // Clerk handles the deletion, webhook cleans up database
    await user?.delete()
    // User will be automatically signed out
  } catch (error) {
    console.error('Error deleting account:', error)
    alert('שגיאה במחיקת החשבון')
  }
}
```

---

## Phase 12: Testing Plan (30 minutes)

### 12.1 Test New User Sign Up

1. Open incognito window
2. Go to http://localhost:5173/auth/signup
3. Sign up with Google
4. Verify:
   - [ ] Redirects to /onboarding
   - [ ] Profile created in Supabase `profiles` table with `clerk_user_id`
   - [ ] Can see user in Clerk dashboard

### 12.2 Test Existing User Sign In

1. Sign out
2. Go to http://localhost:5173/auth/signin
3. Sign in with same account
4. Verify:
   - [ ] Redirects to /dashboard
   - [ ] Profile loads correctly
   - [ ] Registry loads if exists

### 12.3 Test Protected Routes

1. Sign out
2. Try to access http://localhost:5173/dashboard
3. Verify:
   - [ ] Redirects to /auth/signin

### 12.4 Test RLS Policies

1. Sign in
2. Create a new registry item
3. Verify:
   - [ ] Item saves to database
   - [ ] Can read item back
   - [ ] Other users cannot see your private items

### 12.5 Test Account Deletion

1. Go to Settings
2. Click "Delete Account"
3. Verify:
   - [ ] Account deleted in Clerk
   - [ ] Profile deleted from Supabase (via webhook)
   - [ ] Cascaded deletions work (registries, items, etc.)

---

## Phase 13: Production Deployment

### 13.1 Update Production Environment Variables

In your deployment platform (Vercel, Netlify, etc.):

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
VITE_SUPABASE_URL=https://wopsrjfdaovlyibivijl.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### 13.2 Update Clerk Production Settings

1. In Clerk Dashboard → Production instance
2. Configure OAuth with production Google credentials
3. Set production domains in "Domains"
4. Update JWT template if needed

### 13.3 Update Supabase Production Settings

1. Add Clerk production JWT public key to Supabase
2. Test RLS policies in production

---

## Rollback Plan

If migration fails, here's how to rollback:

1. Restore `.env.local` to use Supabase keys
2. Git revert all code changes
3. Restore database from backup
4. Run old RLS policies and triggers

---

## Post-Migration Cleanup

After successful migration:

- [ ] Remove `@supabase/auth-helpers` if installed
- [ ] Remove old `AuthCallback.tsx` file
- [ ] Update documentation
- [ ] Remove Supabase auth-related comments
- [ ] Archive old Google OAuth credentials (keep for reference)

---

## Known Issues & Solutions

### Issue: RLS Policies Not Working

**Solution:** Verify JWT template is correct and Clerk public key is added to Supabase.

### Issue: Profile Not Created on First Login

**Solution:** Check AuthContext `createProfile()` function is being called. Add logging.

### Issue: Sign Out Not Working

**Solution:** Make sure using `useClerk().signOut()` not old Supabase signOut.

---

## Support Resources

- **Clerk Docs:** https://clerk.com/docs
- **Clerk + Supabase Guide:** https://clerk.com/docs/integrations/databases/supabase
- **Clerk Discord:** https://clerk.com/discord

---

## Estimated Timeline

| Phase | Time |
|-------|------|
| Clerk Setup | 30 min |
| Install Dependencies | 5 min |
| Database Schema Updates | 20 min |
| Update Supabase Client | 10 min |
| Update App Entry Point | 10 min |
| Rewrite AuthContext | 45 min |
| Update Auth Pages | 30 min |
| Update ProtectedRoute | 10 min |
| Update Components | 30 min |
| Configure JWT Template | 15 min |
| Handle Account Deletion | 20 min |
| Testing | 30 min |
| **Total** | **3-4 hours** |

---

## Ready to Start?

Once you're ready to begin implementation, start with Phase 1 (Clerk Setup) and work through each phase sequentially. Take breaks between phases and test as you go!

Good luck! 🚀
