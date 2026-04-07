-- ============================================
-- PRICE MONITORING: Database Migration
-- ============================================
-- Adds currency tracking, price check metadata, and logging table
-- for the daily Price Monitor Agent (check-prices Edge Function).

-- 1. Add source currency tracking to items
ALTER TABLE items ADD COLUMN IF NOT EXISTS source_currency TEXT DEFAULT 'ILS';
ALTER TABLE items ADD COLUMN IF NOT EXISTS source_price DECIMAL(10,2);

-- 2. Add price check tracking to items
ALTER TABLE items ADD COLUMN IF NOT EXISTS last_price_check TIMESTAMPTZ;
ALTER TABLE items ADD COLUMN IF NOT EXISTS last_checked_price DECIMAL(10,2);
ALTER TABLE items ADD COLUMN IF NOT EXISTS last_checked_source_price DECIMAL(10,2);
ALTER TABLE items ADD COLUMN IF NOT EXISTS price_check_failures INTEGER DEFAULT 0;

-- 3. Add notified_at to price_alerts (track when user was emailed)
ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

-- 4. Create price_check_logs table for observability
CREATE TABLE IF NOT EXISTS price_check_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('success', 'fetch_error', 'parse_error', 'no_change', 'price_drop', 'price_increase', 'cooldown_skip', 'failure_skip', 'currency_mismatch')),
  extracted_price DECIMAL(10,2),
  extracted_currency TEXT,
  stored_price DECIMAL(10,2),
  stored_source_price DECIMAL(10,2),
  error_message TEXT,
  response_status INTEGER
);

-- 5. Indexes for price_check_logs
CREATE INDEX IF NOT EXISTS idx_price_check_logs_item ON price_check_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_price_check_logs_status ON price_check_logs(status);
CREATE INDEX IF NOT EXISTS idx_price_check_logs_checked_at ON price_check_logs(checked_at);

-- 6. Index for efficient price check queries
CREATE INDEX IF NOT EXISTS idx_items_price_check ON items(original_url, quantity_received, quantity)
  WHERE original_url IS NOT NULL;

-- 7. Comments
COMMENT ON COLUMN items.source_currency IS 'ISO 4217 currency code of the original product page (e.g., ILS, USD, EUR)';
COMMENT ON COLUMN items.source_price IS 'Price in original currency before ILS conversion';
COMMENT ON COLUMN items.last_price_check IS 'Timestamp of last successful price check';
COMMENT ON COLUMN items.last_checked_price IS 'Last live price in ILS';
COMMENT ON COLUMN items.last_checked_source_price IS 'Last live price in source currency';
COMMENT ON COLUMN items.price_check_failures IS 'Consecutive fetch/parse failures (reset on success)';
COMMENT ON TABLE price_check_logs IS 'Audit log for daily price monitoring agent runs';
