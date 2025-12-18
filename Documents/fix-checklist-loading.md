# Fix Checklist Loading Issue - Quick Guide

## Problem
Checklist page stuck loading at http://localhost:5174/checklist

## Cause
Missing `checklist_preferences` table or RLS policies in Supabase

## Fix (5 minutes)

### Step 1: Go to Supabase
1. Go to https://supabase.com/dashboard
2. Select your "nesty" project
3. Click "SQL Editor" in left sidebar
4. Click "New query"

### Step 2: Copy & Run This SQL

```sql
-- Create table
CREATE TABLE IF NOT EXISTS checklist_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id TEXT NOT NULL CHECK (category_id IN (
    'strollers', 'car_safety', 'furniture', 'safety',
    'feeding', 'nursing', 'bath', 'clothing', 'bedding', 'toys'
  )),
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  is_checked BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  priority TEXT DEFAULT 'essential' CHECK (priority IN ('essential', 'nice_to_have')),
  UNIQUE(user_id, category_id, item_name),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_checklist_preferences_user ON checklist_preferences(user_id);

-- Enable RLS
ALTER TABLE checklist_preferences ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own checklist preferences"
  ON checklist_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist preferences"
  ON checklist_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist preferences"
  ON checklist_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist preferences"
  ON checklist_preferences FOR DELETE
  USING (auth.uid() = user_id);
```

### Step 3: Test
1. Click "Run" in Supabase SQL Editor
2. Wait for "Success" message
3. Go back to http://localhost:5174/checklist
4. Refresh page - should load now!

## Current State
- Dev server running on port 5174 (task id: b13ffbb)
- Login works ✅
- Dashboard works ✅
- Checklist needs this fix ⏳

## Next Session
When you return, tell Claude:
"Continue from checklist fix - I ran the SQL"
