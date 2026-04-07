-- ============================================================
-- Migration: Extraction Reports — Feedback loop for broken extractions
-- Date: 2026-04-07
-- ============================================================

CREATE TABLE extraction_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  hostname TEXT NOT NULL,
  error_type TEXT NOT NULL CHECK (error_type IN ('no_product_data', 'no_image', 'broken_image', 'manual_report', 'non_product_page')),
  extracted_data JSONB,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'fixed', 'wont_fix')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE extraction_reports ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_reports_hostname ON extraction_reports(hostname);
CREATE INDEX idx_reports_status ON extraction_reports(status);
CREATE INDEX idx_reports_created ON extraction_reports(created_at);

-- Anyone authenticated can create reports
CREATE POLICY "Authenticated users can create reports"
  ON extraction_reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON extraction_reports FOR SELECT
  USING (user_id = auth.uid());
