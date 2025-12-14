# Nesty Database Schema & Data Flow

## Complete Supabase Database Architecture

---

## Table of Contents

1. [Overview & Entity Relationship](#1-overview--entity-relationship)
2. [Data Flow Diagrams](#2-data-flow-diagrams)
3. [Tables in Order of Creation](#3-tables-in-order-of-creation)
4. [Complete SQL Schema](#4-complete-sql-schema)
5. [Row Level Security Policies](#5-row-level-security-policies)
6. [Triggers & Functions](#6-triggers--functions)
7. [Indexes for Performance](#7-indexes-for-performance)
8. [Common Queries Reference](#8-common-queries-reference)

---

## 1. Overview & Entity Relationship

### 1.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NESTY DATABASE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  auth.users  │  ← Supabase managed (don't create manually)
│──────────────│
│ id (UUID) PK │
│ email        │
│ ...          │
└──────┬───────┘
       │
       │ 1:1 (auto-created via trigger)
       ▼
┌──────────────────────┐
│      profiles        │
│──────────────────────│
│ id (UUID) PK/FK ─────┼──→ auth.users.id
│ email                │
│ first_name           │
│ last_name            │
│ due_date             │
│ feeling              │
│ onboarding_completed │
│ ...                  │
└──────────┬───────────┘
           │
           │ 1:1 (one profile → one registry)
           ▼
┌─────────────────────────────┐
│         registries          │
│─────────────────────────────│
│ id (UUID) PK                │
│ owner_id (UUID) FK ─────────┼──→ profiles.id
│ slug (unique)               │
│ address_city                │
│ address_street              │
│ address_is_private          │
│ ...                         │
└──────────┬──────────────────┘
           │
           │ 1:N (one registry → many items)
           ▼
┌─────────────────────────────┐
│          items              │
│─────────────────────────────│
│ id (UUID) PK                │
│ registry_id (UUID) FK ──────┼──→ registries.id
│ name                        │
│ price                       │
│ category                    │
│ quantity                    │
│ quantity_received           │
│ is_most_wanted              │
│ is_private                  │
│ ...                         │
└──────────┬──────────────────┘
           │
           │ 1:N (one item → many purchases/contributions)
           ▼
┌─────────────────────────────┐     ┌─────────────────────────────┐
│        purchases            │     │       contributions         │
│─────────────────────────────│     │─────────────────────────────│
│ id (UUID) PK                │     │ id (UUID) PK                │
│ item_id (UUID) FK ──────────┼──→  │ item_id (UUID) FK ──────────┼──→ items.id
│ buyer_name                  │     │ contributor_name            │
│ buyer_email                 │     │ contributor_email           │
│ status                      │     │ amount                      │
│ ...                         │     │ ...                         │
└─────────────────────────────┘     └─────────────────────────────┘

           │
           │ 1:N (one item → many price alerts)
           ▼
┌─────────────────────────────┐
│       price_alerts          │
│─────────────────────────────│
│ id (UUID) PK                │
│ item_id (UUID) FK ──────────┼──→ items.id
│ original_price              │
│ found_price                 │
│ found_url                   │
│ ...                         │
└─────────────────────────────┘
```

### 1.2 Relationship Summary

| Parent | Child | Relationship | Description |
|--------|-------|--------------|-------------|
| auth.users | profiles | 1:1 | Every Supabase user has one profile |
| profiles | registries | 1:1 | Every user owns one registry |
| registries | items | 1:N | A registry contains many items |
| items | purchases | 1:N | An item can have multiple purchase records |
| items | contributions | 1:N | An item can have multiple chip-in contributions (Phase 2) |
| items | price_alerts | 1:N | An item can have multiple price alerts (Phase 2) |

> **MVP Note:** Partner support removed. Contributions and Price Alerts tables kept for future phases.

---

## 2. Data Flow Diagrams

### 2.1 User Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION FLOW                        │
└─────────────────────────────────────────────────────────────────┘

   User Signs Up (Email/Google)
            │
            ▼
   ┌────────────────────┐
   │   auth.users       │  ← Supabase creates automatically
   │   (new row)        │
   └─────────┬──────────┘
             │
             │  TRIGGER: on_auth_user_created
             ▼
   ┌────────────────────┐
   │   profiles         │  ← Auto-created with id = auth.users.id
   │   (new row)        │     email, first_name from metadata
   │   onboarding: false│
   └─────────┬──────────┘
             │
             │  User completes onboarding
             ▼
   ┌────────────────────┐
   │   profiles         │  ← Updated with due_date, feeling, etc.
   │   onboarding: true │
   └─────────┬──────────┘
             │
             │  After onboarding completion
             ▼
   ┌────────────────────┐
   │   registries       │  ← Created with owner_id = profile.id
   │   (new row)        │     slug = "{first_name}-registry-{timestamp}"
   └────────────────────┘
```

### 2.2 Adding Item Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADDING ITEM FLOW                              │
└─────────────────────────────────────────────────────────────────┘

   User clicks "Add Item" in Dashboard
            │
            ▼
   ┌────────────────────┐
   │ Get user's registry│  ← SELECT id FROM registries
   │                    │     WHERE owner_id = auth.uid()
   └─────────┬──────────┘
             │
             │  registry_id obtained
             ▼
   ┌────────────────────┐
   │   items            │  ← INSERT INTO items (
   │   (new row)        │       registry_id,
   │                    │       name,
   │                    │       category,
   │                    │       price,
   │                    │       quantity,
   │                    │       is_most_wanted,
   │                    │       is_private,
   │                    │       ...
   │                    │     )
   └─────────┬──────────┘
             │
             │  Optional: Smart Price Engine runs
             ▼
   ┌────────────────────┐
   │   price_alerts     │  ← If cheaper price found elsewhere
   │   (new row)        │     INSERT INTO price_alerts (
   │                    │       item_id,
   │                    │       original_price,
   │                    │       found_price,
   │                    │       found_url
   │                    │     )
   └────────────────────┘
```

### 2.3 Purchase Recording Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PURCHASE RECORDING FLOW                       │
└─────────────────────────────────────────────────────────────────┘

   Gift Giver views Public Registry
            │
            ▼
   ┌────────────────────┐
   │ Load registry by   │  ← SELECT * FROM registries WHERE slug = :slug
   │ slug               │
   └─────────┬──────────┘
             │
             ▼
   ┌────────────────────┐
   │ Load public items  │  ← SELECT * FROM items
   │                    │     WHERE registry_id = :id
   │                    │     AND is_private = false
   └─────────┬──────────┘
             │
             │  Gift giver clicks "Buy This Gift"
             │  → Redirected to store
             │  → Returns and clicks "I Purchased This"
             ▼
   ┌────────────────────┐
   │   purchases        │  ← INSERT INTO purchases (
   │   (new row)        │       item_id,
   │   status: pending  │       buyer_name,
   │                    │       buyer_email,
   │                    │       status: 'pending',
   │                    │       confirmation_token,
   │                    │       expires_at
   │                    │     )
   └─────────┬──────────┘
             │
             │  3 hours later: confirmation email sent
             │
             │  Gift giver clicks "Yes, I purchased"
             ▼
   ┌────────────────────┐
   │   purchases        │  ← UPDATE purchases
   │   status: confirmed│     SET status = 'confirmed',
   │                    │         confirmed_at = NOW()
   │                    │     WHERE confirmation_token = :token
   └─────────┬──────────┘
             │
             ▼
   ┌────────────────────┐
   │   items            │  ← UPDATE items
   │   quantity_received│     SET quantity_received = quantity_received + 1
   │   + 1              │     WHERE id = :item_id
   └────────────────────┘
```

### 2.4 Chip-In (Group Gifting) Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHIP-IN CONTRIBUTION FLOW                     │
└─────────────────────────────────────────────────────────────────┘

   Item has chip-in enabled (price > threshold)
            │
            ▼
   ┌────────────────────┐
   │ Display progress   │  ← SELECT SUM(amount) FROM contributions
   │ bar on public view │     WHERE item_id = :id
   │                    │     AND status = 'confirmed'
   └─────────┬──────────┘
             │
             │  Contributor clicks "Contribute"
             ▼
   ┌────────────────────┐
   │   contributions    │  ← INSERT INTO contributions (
   │   (new row)        │       item_id,
   │   status: pending  │       contributor_name,
   │                    │       contributor_email,
   │                    │       amount,
   │                    │       status: 'pending'
   │                    │     )
   └─────────┬──────────┘
             │
             │  Contributor confirms via email
             ▼
   ┌────────────────────┐
   │   contributions    │  ← UPDATE contributions
   │   status: confirmed│     SET status = 'confirmed'
   └─────────┬──────────┘
             │
             │  Check if total >= item price
             ▼
   ┌────────────────────┐
   │ If SUM(amount) >=  │  ← UPDATE items
   │ item.price:        │     SET quantity_received = quantity
   │ Mark as purchased  │     WHERE id = :item_id
   └────────────────────┘
```

---

## 3. Tables in Order of Creation

**IMPORTANT:** Create tables in this exact order to avoid foreign key errors.

```
1. profiles               ← References auth.users (Supabase managed)
2. registries             ← References profiles
3. checklist_preferences  ← References profiles (user checklist settings)
4. items                  ← References registries
5. purchases              ← References items
6. contributions          ← References items
7. price_alerts           ← References items
```

---

## 4. Complete SQL Schema

### 4.1 Enable Extensions

```sql
-- Run this FIRST in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 4.2 Profiles Table

```sql
-- ============================================
-- PROFILES TABLE
-- ============================================
-- Links to Supabase auth.users
-- Created automatically via trigger on user signup

CREATE TABLE profiles (
  -- Primary key matches auth.users.id
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  email TEXT NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT DEFAULT '',
  avatar_url TEXT,

  -- Onboarding data
  due_date DATE,
  is_first_time_parent BOOLEAN DEFAULT true,
  feeling TEXT CHECK (feeling IN ('excited', 'overwhelmed', 'exploring')),

  -- Settings
  preferred_language TEXT DEFAULT 'he' CHECK (preferred_language IN ('en', 'he')),
  onboarding_completed BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for documentation
COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth';
COMMENT ON COLUMN profiles.id IS 'Links to auth.users.id';
COMMENT ON COLUMN profiles.onboarding_completed IS 'True after user completes 3-step onboarding';
COMMENT ON COLUMN profiles.feeling IS 'User emotional state from onboarding';
```

### 4.3 Registries Table

```sql
-- ============================================
-- REGISTRIES TABLE
-- ============================================
-- Each user owns one registry
-- Created after onboarding completion

CREATE TABLE registries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Owner (required)
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- NOTE: partner_id removed from MVP - single owner per registry
  -- Partner support will be added in Phase 2

  -- Public URL slug (unique, used in /registry/{slug})
  slug TEXT UNIQUE NOT NULL,

  -- Display title (optional)
  title TEXT,

  -- ============================================
  -- Address fields (Israeli format)
  -- ============================================
  address_city TEXT,           -- עיר
  address_street TEXT,         -- רחוב + מספר בית
  address_apt TEXT,            -- דירה
  address_postal TEXT,         -- מיקוד
  address_phone TEXT,          -- טלפון

  -- Privacy: if true, address hidden from gift givers
  address_is_private BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE registries IS 'Baby registries owned by users';
COMMENT ON COLUMN registries.slug IS 'URL-safe unique identifier for public sharing';
COMMENT ON COLUMN registries.address_is_private IS 'If true, gift givers must contact owner for address';
```

### 4.4 Checklist Preferences Table

```sql
-- ============================================
-- CHECKLIST PREFERENCES TABLE
-- ============================================
-- Stores user preferences for suggested checklist items
-- Tracks what items users need, quantity, priority, and notes

CREATE TABLE checklist_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Parent user (required)
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- ============================================
  -- Category (Hebrew checklist categories)
  -- ============================================
  category_id TEXT NOT NULL CHECK (category_id IN (
    'nursery',     -- חדר תינוק ושינה
    'travel',      -- טיולים ונסיעות
    'clothing',    -- ביגוד ראשוני
    'bath',        -- אמבטיה והיגיינה
    'feeding'      -- הנקה והאכלה
  )),

  -- ============================================
  -- Item identification
  -- ============================================
  item_name TEXT NOT NULL,

  -- ============================================
  -- User preferences
  -- ============================================
  quantity INTEGER DEFAULT 1,
  is_checked BOOLEAN DEFAULT false,  -- User marked as "have it" or "done"
  is_hidden BOOLEAN DEFAULT false,   -- User doesn't need this item

  -- ============================================
  -- NEW: Notes and Priority
  -- ============================================
  notes TEXT DEFAULT '',             -- User notes (e.g., "להזמין מאמאזון", "שיהיה צבע צהוב")
  priority TEXT DEFAULT 'essential' CHECK (priority IN (
    'essential',    -- חובה - Must have item
    'nice_to_have'  -- פינוק - Nice to have but not critical
  )),

  -- ============================================
  -- Unique constraint: one preference per item per user
  -- ============================================
  UNIQUE(user_id, category_id, item_name),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE checklist_preferences IS 'User preferences for suggested checklist items';
COMMENT ON COLUMN checklist_preferences.is_checked IS 'True if user has this item or marked as done';
COMMENT ON COLUMN checklist_preferences.is_hidden IS 'True if user does not need this item';
COMMENT ON COLUMN checklist_preferences.notes IS 'User notes about the item (color, size, where to buy, etc.)';
COMMENT ON COLUMN checklist_preferences.priority IS 'essential = must have, nice_to_have = optional luxury';
```

### 4.5 Items Table

```sql
-- ============================================
-- ITEMS TABLE
-- ============================================
-- Products added to a registry
-- Can be added manually or via Chrome extension

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Parent registry (required)
  registry_id UUID REFERENCES registries(id) ON DELETE CASCADE NOT NULL,

  -- ============================================
  -- Core item data
  -- ============================================
  name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  original_url TEXT,              -- Link to product page
  store_name TEXT DEFAULT 'ידני', -- Store name or 'Manual'

  -- ============================================
  -- Category (Hebrew categories)
  -- ============================================
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

  -- ============================================
  -- Quantity tracking
  -- ============================================
  quantity INTEGER DEFAULT 1,           -- How many wanted
  quantity_received INTEGER DEFAULT 0,  -- How many purchased

  -- ============================================
  -- Flags
  -- ============================================
  is_most_wanted BOOLEAN DEFAULT false,  -- Highlight to gift givers
  is_private BOOLEAN DEFAULT false,      -- Hide from public view

  -- User notes (color preference, size, etc.)
  notes TEXT,

  -- ============================================
  -- Price comparison (Smart Engine)
  -- ============================================
  cheaper_alternative_url TEXT,
  cheaper_alternative_price DECIMAL(10,2),
  cheaper_alternative_store TEXT,
  price_alert_sent BOOLEAN DEFAULT false,

  -- ============================================
  -- Chip-in (Group Gifting)
  -- ============================================
  enable_chip_in BOOLEAN DEFAULT false,
  chip_in_goal DECIMAL(10,2),  -- Target amount (usually = price)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE items IS 'Products in a registry';
COMMENT ON COLUMN items.quantity IS 'Number of this item wanted';
COMMENT ON COLUMN items.quantity_received IS 'Number already purchased by gift givers';
COMMENT ON COLUMN items.is_most_wanted IS 'Displayed prominently to gift givers';
COMMENT ON COLUMN items.is_private IS 'Hidden from public view - for personal tracking';
```

### 4.5 Purchases Table

```sql
-- ============================================
-- PURCHASES TABLE
-- ============================================
-- Records when gift givers claim to have purchased an item
-- Trust-based system with email confirmation

CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Parent item (required)
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,

  -- ============================================
  -- Buyer info (gift giver)
  -- ============================================
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  gift_message TEXT,
  is_surprise BOOLEAN DEFAULT false,  -- Hide from registry owner initially

  -- How many of this item they're buying
  quantity_purchased INTEGER DEFAULT 1,

  -- ============================================
  -- Confirmation status
  -- ============================================
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Waiting for email confirmation
    'confirmed',    -- Buyer confirmed via email
    'cancelled',    -- Buyer said they didn't purchase
    'expired'       -- No response within 7 days
  )),

  -- Email confirmation token
  confirmation_token UUID DEFAULT uuid_generate_v4(),
  confirmation_sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,

  -- Auto-expire if not confirmed
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE purchases IS 'Gift giver purchase records (trust-based)';
COMMENT ON COLUMN purchases.status IS 'pending → confirmed/cancelled/expired';
COMMENT ON COLUMN purchases.confirmation_token IS 'Used in email link to confirm';
```

### 4.6 Contributions Table (Chip-In)

```sql
-- ============================================
-- CONTRIBUTIONS TABLE
-- ============================================
-- For chip-in (group gifting) on expensive items
-- Multiple people contribute toward one item

CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Parent item (must have enable_chip_in = true)
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,

  -- Contributor info
  contributor_name TEXT NOT NULL,
  contributor_email TEXT NOT NULL,

  -- Contribution amount
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),

  -- Optional message
  message TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'confirmed',
    'cancelled'
  )),

  -- Confirmation
  confirmation_token UUID DEFAULT uuid_generate_v4(),
  confirmed_at TIMESTAMPTZ,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE contributions IS 'Chip-in contributions for expensive items';
COMMENT ON COLUMN contributions.amount IS 'Amount in ₪ contributed';
```

### 4.7 Price Alerts Table

```sql
-- ============================================
-- PRICE ALERTS TABLE
-- ============================================
-- Generated by Smart Engine when cheaper price found

CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Parent item
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,

  -- Price comparison
  original_price DECIMAL(10,2) NOT NULL,
  found_price DECIMAL(10,2) NOT NULL,
  found_url TEXT NOT NULL,
  found_store TEXT NOT NULL,

  -- Calculated savings (stored for performance)
  savings_amount DECIMAL(10,2) GENERATED ALWAYS AS (original_price - found_price) STORED,
  savings_percent INTEGER GENERATED ALWAYS AS (
    CASE WHEN original_price > 0
    THEN ROUND(((original_price - found_price) / original_price) * 100)
    ELSE 0 END
  ) STORED,

  -- User interaction
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE price_alerts IS 'Price comparison alerts from Smart Engine';
COMMENT ON COLUMN price_alerts.savings_amount IS 'Auto-calculated: original - found';
COMMENT ON COLUMN price_alerts.savings_percent IS 'Auto-calculated: percentage saved';
```

---

## 5. Row Level Security Policies

### 5.1 Enable RLS on All Tables

```sql
-- Enable RLS (required for security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE registries ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
```

### 5.2 Profiles Policies

```sql
-- ============================================
-- PROFILES RLS
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow insert during signup (for trigger)
CREATE POLICY "Allow profile creation on signup"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 5.3 Registries Policies

```sql
-- ============================================
-- REGISTRIES RLS
-- ============================================

-- Owners have full access
CREATE POLICY "Owners can manage their registry"
  ON registries FOR ALL
  USING (auth.uid() = owner_id);

-- NOTE: Partner policies removed from MVP

-- Anyone can view registries (for public view)
CREATE POLICY "Anyone can view registries"
  ON registries FOR SELECT
  USING (true);
```

### 5.4 Checklist Preferences Policies

```sql
-- ============================================
-- CHECKLIST PREFERENCES RLS
-- ============================================

-- Users have full access to their own preferences
CREATE POLICY "Users can manage own checklist preferences"
  ON checklist_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own checklist preferences"
  ON checklist_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 5.5 Items Policies

```sql
-- ============================================
-- ITEMS RLS
-- ============================================

-- Registry owners have full access
CREATE POLICY "Owners can manage items"
  ON items FOR ALL
  USING (
    registry_id IN (
      SELECT id FROM registries WHERE owner_id = auth.uid()
    )
  );

-- NOTE: Partner policy removed from MVP

-- Public can view non-private items
CREATE POLICY "Public can view non-private items"
  ON items FOR SELECT
  USING (is_private = false);
```

### 5.5 Purchases Policies

```sql
-- ============================================
-- PURCHASES RLS
-- ============================================

-- Anyone can create purchases (gift givers)
CREATE POLICY "Anyone can record purchases"
  ON purchases FOR INSERT
  WITH CHECK (true);

-- Buyers can view/update their own purchases
CREATE POLICY "Buyers can manage own purchases"
  ON purchases FOR ALL
  USING (buyer_email = auth.jwt()->>'email');

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
```

### 5.6 Contributions Policies

> **Note:** Contributions table kept for future Chip-In feature (Phase 2)

```sql
-- ============================================
-- CONTRIBUTIONS RLS (Phase 2 - Chip-In)
-- ============================================

-- Anyone can contribute
CREATE POLICY "Anyone can contribute"
  ON contributions FOR INSERT
  WITH CHECK (true);

-- Contributors can view their own
CREATE POLICY "Contributors can view own"
  ON contributions FOR SELECT
  USING (contributor_email = auth.jwt()->>'email');

-- Registry owners can view all contributions
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

### 5.7 Price Alerts Policies

> **Note:** Price alerts table kept for future Smart Engine feature (Phase 2)

```sql
-- ============================================
-- PRICE ALERTS RLS (Phase 2 - Smart Engine)
-- ============================================

-- Registry owners can view and manage
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

---

## 6. Triggers & Functions

### 6.1 Auto-Update Timestamp

```sql
-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
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

### 6.2 Auto-Create Profile on Signup

```sql
-- ============================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================

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

### 6.3 Update Item Quantity on Purchase Confirmation

```sql
-- ============================================
-- UPDATE ITEM QUANTITY ON PURCHASE CONFIRM
-- ============================================

CREATE OR REPLACE FUNCTION update_item_quantity_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run when status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    UPDATE items
    SET quantity_received = quantity_received + NEW.quantity_purchased
    WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_purchase_confirmed
  AFTER UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_item_quantity_on_purchase();
```

### 6.4 Check Chip-In Completion

```sql
-- ============================================
-- CHECK CHIP-IN GOAL REACHED
-- ============================================

CREATE OR REPLACE FUNCTION check_chip_in_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_contributed DECIMAL(10,2);
  item_price DECIMAL(10,2);
  item_quantity INTEGER;
BEGIN
  -- Only run when status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Get total confirmed contributions for this item
    SELECT COALESCE(SUM(amount), 0) INTO total_contributed
    FROM contributions
    WHERE item_id = NEW.item_id AND status = 'confirmed';

    -- Get item price and quantity
    SELECT price, quantity INTO item_price, item_quantity
    FROM items
    WHERE id = NEW.item_id;

    -- If total >= price, mark item as fully purchased
    IF total_contributed >= item_price THEN
      UPDATE items
      SET quantity_received = item_quantity
      WHERE id = NEW.item_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_contribution_confirmed
  AFTER UPDATE ON contributions
  FOR EACH ROW
  EXECUTE FUNCTION check_chip_in_completion();
```

---

## 7. Indexes for Performance

```sql
-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);

-- Registries
CREATE INDEX idx_registries_slug ON registries(slug);
CREATE INDEX idx_registries_owner ON registries(owner_id);
-- NOTE: idx_registries_partner removed from MVP

-- Checklist Preferences
CREATE INDEX idx_checklist_prefs_user ON checklist_preferences(user_id);
CREATE INDEX idx_checklist_prefs_category ON checklist_preferences(category_id);
CREATE INDEX idx_checklist_prefs_priority ON checklist_preferences(priority);

-- Items
CREATE INDEX idx_items_registry ON items(registry_id);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_private ON items(is_private);
CREATE INDEX idx_items_most_wanted ON items(is_most_wanted);

-- Purchases
CREATE INDEX idx_purchases_item ON purchases(item_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_token ON purchases(confirmation_token);
CREATE INDEX idx_purchases_email ON purchases(buyer_email);

-- Contributions
CREATE INDEX idx_contributions_item ON contributions(item_id);
CREATE INDEX idx_contributions_status ON contributions(status);

-- Price Alerts
CREATE INDEX idx_price_alerts_item ON price_alerts(item_id);
CREATE INDEX idx_price_alerts_unread ON price_alerts(is_read) WHERE is_read = false;
```

---

## 8. Common Queries Reference

### 8.1 Get User's Registry with Items

```typescript
// Dashboard: Load registry and items
const { data: registry } = await supabase
  .from('registries')
  .select('*')
  .eq('owner_id', userId)
  .single()

const { data: items } = await supabase
  .from('items')
  .select('*')
  .eq('registry_id', registry.id)
  .order('created_at', { ascending: false })
```

### 8.2 Get Public Registry by Slug

```typescript
// Public view: Load registry by slug
const { data: registry } = await supabase
  .from('registries')
  .select(`
    *,
    profiles!owner_id (first_name, last_name, due_date)
  `)
  .eq('slug', slug)
  .single()

// Load non-private items
const { data: items } = await supabase
  .from('items')
  .select('*')
  .eq('registry_id', registry.id)
  .eq('is_private', false)
  .order('is_most_wanted', { ascending: false })
```

### 8.3 Add Item to Registry

```typescript
// Add new item
const { data, error } = await supabase
  .from('items')
  .insert({
    registry_id: registryId,
    name: itemName,
    category: category,
    price: price,
    quantity: quantity,
    is_most_wanted: isMostWanted,
    is_private: isPrivate,
    image_url: imageUrl,
    original_url: productUrl,
    store_name: storeName,
    notes: notes,
  })
  .select()
  .single()
```

### 8.4 Record Purchase

```typescript
// Gift giver records purchase
const { data, error } = await supabase
  .from('purchases')
  .insert({
    item_id: itemId,
    buyer_name: buyerName,
    buyer_email: buyerEmail,
    gift_message: message,
    is_surprise: isSurprise,
    quantity_purchased: 1,
    status: 'pending',
  })
  .select()
  .single()
```

### 8.5 Confirm Purchase

```typescript
// Confirm via email token
const { data, error } = await supabase
  .from('purchases')
  .update({
    status: 'confirmed',
    confirmed_at: new Date().toISOString(),
  })
  .eq('confirmation_token', token)
  .select()
  .single()
```

### 8.6 Get Category Progress

```typescript
// Get items grouped by category with counts
const { data: items } = await supabase
  .from('items')
  .select('category, quantity, quantity_received')
  .eq('registry_id', registryId)

// Calculate progress per category
const progress = items.reduce((acc, item) => {
  if (!acc[item.category]) {
    acc[item.category] = { total: 0, received: 0 }
  }
  acc[item.category].total += item.quantity
  acc[item.category].received += item.quantity_received
  return acc
}, {})
```

### 8.7 Get Chip-In Progress

```typescript
// Get total contributions for an item
const { data: contributions } = await supabase
  .from('contributions')
  .select('amount')
  .eq('item_id', itemId)
  .eq('status', 'confirmed')

const totalContributed = contributions.reduce(
  (sum, c) => sum + parseFloat(c.amount),
  0
)
```

### 8.8 Get Unread Price Alerts

```typescript
// Dashboard: Show price alerts
const { data: alerts } = await supabase
  .from('price_alerts')
  .select(`
    *,
    items (name, image_url)
  `)
  .eq('is_read', false)
  .eq('is_dismissed', false)
  .order('created_at', { ascending: false })
```

### 8.9 Get/Upsert Checklist Preferences

```typescript
// Get all user's checklist preferences
const { data: preferences } = await supabase
  .from('checklist_preferences')
  .select('*')
  .eq('user_id', userId)

// Upsert a preference (insert or update)
const { data, error } = await supabase
  .from('checklist_preferences')
  .upsert({
    user_id: userId,
    category_id: categoryId,
    item_name: itemName,
    quantity: quantity,
    is_checked: isChecked,
    is_hidden: isHidden,
    notes: notes,
    priority: priority, // 'essential' or 'nice_to_have'
  }, {
    onConflict: 'user_id,category_id,item_name'
  })
  .select()
  .single()
```

### 8.10 Calculate Nesting Score (Essential Items Progress)

```typescript
// Get essential items completion for "Nesting Score"
const { data: preferences } = await supabase
  .from('checklist_preferences')
  .select('is_checked, priority')
  .eq('user_id', userId)
  .eq('priority', 'essential')
  .eq('is_hidden', false)

const essentialTotal = preferences.length
const essentialChecked = preferences.filter(p => p.is_checked).length
const nestingScore = essentialTotal > 0
  ? Math.round((essentialChecked / essentialTotal) * 100)
  : 0
```

---

## Quick Reference: What Goes Where

| Action | Table | Key Fields |
|--------|-------|------------|
| User signs up | profiles | id, email, first_name |
| Complete onboarding | profiles | onboarding_completed, due_date, feeling |
| Create registry | registries | owner_id, slug |
| Set address | registries | address_city, address_street, address_is_private |
| Checklist: mark item | checklist_preferences | user_id, category_id, item_name, is_checked |
| Checklist: set priority | checklist_preferences | priority ('essential' / 'nice_to_have') |
| Checklist: add notes | checklist_preferences | notes |
| Add item to registry | items | registry_id, name, category, price |
| Mark most wanted | items | is_most_wanted = true |
| Hide item | items | is_private = true |
| Gift giver purchases | purchases | item_id, buyer_name, buyer_email |
| Confirm purchase | purchases | status = 'confirmed' |
| Chip-in contribution | contributions | item_id, amount |
| Price alert found | price_alerts | item_id, found_price, found_url |

---

<p align="center">
  <strong>🪺 Nesty Database Schema v1.1</strong><br>
  Complete reference for Supabase implementation<br>
  <em>v1.1: Added checklist_preferences table with notes & priority columns</em>
</p>
