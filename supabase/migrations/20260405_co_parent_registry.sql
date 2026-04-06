-- ============================================================
-- Migration: Co-Parent Registry Management
-- Date: 2026-04-05
-- Description: Add partner_id to registries, create registry_invitations table,
--              update ALL RLS policies to support co-parent access
-- ============================================================
-- IMPORTANT: Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wopsrjfdaovlyibivijl/sql
-- ============================================================

-- ─── 1. ADD partner_id TO registries ───────────────────────

ALTER TABLE registries
  ADD COLUMN partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN registries.partner_id IS
  'Co-parent with full management access. ON DELETE SET NULL preserves registry when partner leaves.';

-- ─── 2. CREATE registry_invitations TABLE ──────────────────

CREATE TABLE registry_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_id UUID NOT NULL REFERENCES registries(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  invitation_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE registry_invitations ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE registry_invitations IS
  'Co-parent invitation records. Token-based invite flow with 7-day expiry.';

-- ─── 3. INDEXES ────────────────────────────────────────────

CREATE INDEX idx_registries_partner_id ON registries(partner_id);
CREATE INDEX idx_invitations_token ON registry_invitations(invitation_token);
CREATE INDEX idx_invitations_email ON registry_invitations(invited_email);
CREATE INDEX idx_invitations_registry ON registry_invitations(registry_id);

-- ─── 4. UPDATE RLS POLICIES — registries ───────────────────
-- Existing policies (from Supabase dashboard):
--   "Anyone can view registries" (SELECT, anon+authenticated)
--   "Users can delete own registry" (DELETE, public)
--   "Users can insert own registry" (INSERT, public)
--   "Users can update own registry" (UPDATE, public)
--   "Users can view own registry" (SELECT, public)

-- Drop owner-only policies that need partner access
DROP POLICY IF EXISTS "Users can view own registry" ON registries;
DROP POLICY IF EXISTS "Users can update own registry" ON registries;
DROP POLICY IF EXISTS "Users can delete own registry" ON registries;
-- Keep "Anyone can view registries" — public/gift-giver read access
-- Keep "Users can insert own registry" — only owner creates registries

-- SELECT: owner OR partner can view their registry (private data)
CREATE POLICY "Owner or partner can view registry"
  ON registries FOR SELECT
  USING (owner_id = auth.uid() OR partner_id = auth.uid());

-- UPDATE: owner OR partner can update registry settings
CREATE POLICY "Owner or partner can update registry"
  ON registries FOR UPDATE
  USING (owner_id = auth.uid() OR partner_id = auth.uid());

-- DELETE: owner only (partner cannot delete the registry)
CREATE POLICY "Only owner can delete registry"
  ON registries FOR DELETE
  USING (owner_id = auth.uid());

-- ─── 5. UPDATE RLS POLICIES — items ───────────────────────
-- Existing policies:
--   "Owners can manage items" (ALL)
--   "Public can update item quantity" (UPDATE, anon+authenticated)
--   "Public can view non-private items from public registries" (SELECT)

-- Drop owner-only management policy
DROP POLICY IF EXISTS "Owners can manage items" ON items;
-- Keep "Public can update item quantity" — gift givers marking purchases
-- Keep "Public can view non-private items from public registries" — public registry view

-- Owner or partner: full item management (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Owner or partner can view all items"
  ON items FOR SELECT
  USING (
    registry_id IN (
      SELECT id FROM registries
      WHERE owner_id = auth.uid() OR partner_id = auth.uid()
    )
  );

CREATE POLICY "Owner or partner can add items"
  ON items FOR INSERT
  WITH CHECK (
    registry_id IN (
      SELECT id FROM registries
      WHERE owner_id = auth.uid() OR partner_id = auth.uid()
    )
  );

CREATE POLICY "Owner or partner can update items"
  ON items FOR UPDATE
  USING (
    registry_id IN (
      SELECT id FROM registries
      WHERE owner_id = auth.uid() OR partner_id = auth.uid()
    )
  );

CREATE POLICY "Owner or partner can delete items"
  ON items FOR DELETE
  USING (
    registry_id IN (
      SELECT id FROM registries
      WHERE owner_id = auth.uid() OR partner_id = auth.uid()
    )
  );

-- ─── 6. UPDATE RLS POLICIES — purchases ───────────────────
-- Existing policies:
--   "Anyone can record purchases" (INSERT, anon+authenticated)
--   "Anyone can view purchases" (SELECT, anon+authenticated)
--   "Owners can update purchases" (UPDATE, public)
--   "Owners can view purchases" (SELECT, public)

-- Drop owner-only policies
DROP POLICY IF EXISTS "Owners can view purchases" ON purchases;
DROP POLICY IF EXISTS "Owners can update purchases" ON purchases;
-- Keep "Anyone can record purchases" — gift givers creating purchase records
-- Keep "Anyone can view purchases" — public purchase visibility

-- Owner or partner can view all purchases on their registry items
CREATE POLICY "Owner or partner can view purchases"
  ON purchases FOR SELECT
  USING (
    item_id IN (
      SELECT i.id FROM items i
      JOIN registries r ON r.id = i.registry_id
      WHERE r.owner_id = auth.uid() OR r.partner_id = auth.uid()
    )
  );

-- Owner or partner can update purchases (mark received, etc.)
CREATE POLICY "Owner or partner can update purchases"
  ON purchases FOR UPDATE
  USING (
    item_id IN (
      SELECT i.id FROM items i
      JOIN registries r ON r.id = i.registry_id
      WHERE r.owner_id = auth.uid() OR r.partner_id = auth.uid()
    )
  );

-- ─── 7. UPDATE RLS POLICIES — checklist_preferences ────────
-- Existing: "Users can manage their own checklist preferences" (ALL)

DROP POLICY IF EXISTS "Users can manage their own checklist preferences" ON checklist_preferences;

-- Owner's checklist data is accessible to both owner and partner
CREATE POLICY "User or partner can view checklist"
  ON checklist_preferences FOR SELECT
  USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT owner_id FROM registries WHERE partner_id = auth.uid()
      UNION
      SELECT partner_id FROM registries WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "User or partner can insert checklist"
  ON checklist_preferences FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR user_id IN (
      SELECT owner_id FROM registries WHERE partner_id = auth.uid()
      UNION
      SELECT partner_id FROM registries WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "User or partner can update checklist"
  ON checklist_preferences FOR UPDATE
  USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT owner_id FROM registries WHERE partner_id = auth.uid()
      UNION
      SELECT partner_id FROM registries WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "User or partner can delete checklist"
  ON checklist_preferences FOR DELETE
  USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT owner_id FROM registries WHERE partner_id = auth.uid()
      UNION
      SELECT partner_id FROM registries WHERE owner_id = auth.uid()
    )
  );

-- ─── 8. UPDATE RLS POLICIES — contributions ────────────────
-- Existing: "Anyone can contribute" (INSERT), "Owners can view contributions" (SELECT)

DROP POLICY IF EXISTS "Owners can view contributions" ON contributions;
-- Keep "Anyone can contribute" — gift givers can chip in

CREATE POLICY "Owner or partner can view contributions"
  ON contributions FOR SELECT
  USING (
    item_id IN (
      SELECT i.id FROM items i
      JOIN registries r ON r.id = i.registry_id
      WHERE r.owner_id = auth.uid() OR r.partner_id = auth.uid()
    )
  );

-- ─── 9. UPDATE RLS POLICIES — price_alerts ─────────────────
-- Existing: "Owners can manage price alerts" (ALL)

DROP POLICY IF EXISTS "Owners can manage price alerts" ON price_alerts;

CREATE POLICY "Owner or partner can view price alerts"
  ON price_alerts FOR SELECT
  USING (
    item_id IN (
      SELECT i.id FROM items i
      JOIN registries r ON r.id = i.registry_id
      WHERE r.owner_id = auth.uid() OR r.partner_id = auth.uid()
    )
  );

CREATE POLICY "Owner or partner can update price alerts"
  ON price_alerts FOR UPDATE
  USING (
    item_id IN (
      SELECT i.id FROM items i
      JOIN registries r ON r.id = i.registry_id
      WHERE r.owner_id = auth.uid() OR r.partner_id = auth.uid()
    )
  );

CREATE POLICY "Owner or partner can delete price alerts"
  ON price_alerts FOR DELETE
  USING (
    item_id IN (
      SELECT i.id FROM items i
      JOIN registries r ON r.id = i.registry_id
      WHERE r.owner_id = auth.uid() OR r.partner_id = auth.uid()
    )
  );

-- ─── 10. RLS POLICIES — registry_invitations (new table) ───

-- Registry owner can manage invitations
CREATE POLICY "Owner can view invitations"
  ON registry_invitations FOR SELECT
  USING (
    invited_by = auth.uid()
    OR invited_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Owner can create invitations"
  ON registry_invitations FOR INSERT
  WITH CHECK (
    invited_by = auth.uid()
    AND registry_id IN (
      SELECT id FROM registries WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner can update invitations"
  ON registry_invitations FOR UPDATE
  USING (
    invited_by = auth.uid()
    AND registry_id IN (
      SELECT id FROM registries WHERE owner_id = auth.uid()
    )
  );

-- Note: The accept-invitation Edge Function uses service_role key
-- to bypass RLS when looking up invitations by token (pre-auth).

-- ─── 11. VERIFY ────────────────────────────────────────────

-- Uncomment to verify after running:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename IN ('registries', 'items', 'purchases', 'checklist_preferences',
--                      'contributions', 'price_alerts', 'registry_invitations')
-- ORDER BY tablename, policyname;
