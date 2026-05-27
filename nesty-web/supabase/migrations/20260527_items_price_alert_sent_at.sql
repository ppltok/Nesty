-- Add price_alert_sent_at timestamp to items
-- Replaces the boolean-only price_alert_sent with a timestamp so we can
-- measure before/after activity for price-alert email campaigns.
-- The boolean is kept for backwards compatibility with check-prices function.

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS price_alert_sent_at timestamptz;

-- Backfill: mark already-alerted items with a sentinel past date so they
-- don't get re-targeted. Use epoch 0 (1970) to distinguish "old, unknown date"
-- from a real send timestamp.
UPDATE items
  SET price_alert_sent_at = '1970-01-01T00:00:00Z'
  WHERE price_alert_sent = true
    AND price_alert_sent_at IS NULL;
