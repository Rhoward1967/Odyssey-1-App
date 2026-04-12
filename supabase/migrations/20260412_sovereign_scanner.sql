-- ============================================================
-- SOVEREIGN PROCUREMENT ENGINE — DATABASE SCHEMA
-- Odyssey-1 | Howard Jones Bloodline Ancestral Trust
-- ============================================================

-- Scan history — every barcode scanned
CREATE TABLE IF NOT EXISTS sovereign_scans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode         TEXT NOT NULL,
  product_name    TEXT,
  brand           TEXT,
  category        TEXT,   -- 'grocery' | 'pharmacy' | 'auto' | 'service' | 'other'
  store_price     NUMERIC(10,2),
  sovereign_price NUMERIC(10,2),
  savings_total   NUMERIC(10,2) GENERATED ALWAYS AS (COALESCE(store_price,0) - COALESCE(sovereign_price,0)) STORED,
  store_name      TEXT,
  scanned_at      TIMESTAMPTZ DEFAULT now(),
  discounts       JSONB DEFAULT '[]',   -- array of applied discount objects
  is_pharmacy     BOOLEAN DEFAULT false,
  tax_exempt      BOOLEAN DEFAULT false,
  created_by      UUID REFERENCES auth.users(id)
);

-- Running savings ledger — one row per day per user
CREATE TABLE IF NOT EXISTS sovereign_savings_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_date     DATE DEFAULT CURRENT_DATE,
  total_scans     INTEGER DEFAULT 0,
  total_saved     NUMERIC(10,2) DEFAULT 0,
  coupons_applied INTEGER DEFAULT 0,
  price_matches   INTEGER DEFAULT 0,
  tax_exempt_saved NUMERIC(10,2) DEFAULT 0,
  senior_savings  NUMERIC(10,2) DEFAULT 0,
  med_copay_saved NUMERIC(10,2) DEFAULT 0,
  created_by      UUID REFERENCES auth.users(id),
  UNIQUE(ledger_date, created_by)
);

-- Coupon cache — scraped/fetched coupon data
CREATE TABLE IF NOT EXISTS coupon_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode         TEXT,
  upc             TEXT,
  retailer        TEXT,
  coupon_type     TEXT,  -- 'manufacturer' | 'store' | 'cashback' | 'price_match' | 'senior' | 'copay'
  description     TEXT,
  discount_value  NUMERIC(10,2),
  discount_type   TEXT,  -- 'fixed' | 'percent' | 'bogo'
  min_purchase    NUMERIC(10,2),
  expiry_date     DATE,
  source          TEXT,  -- 'kroger_api' | 'openfoodfacts' | 'goodrx' | 'manufacturer'
  raw_data        JSONB,
  fetched_at      TIMESTAMPTZ DEFAULT now(),
  valid           BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_coupon_cache_barcode ON coupon_cache(barcode);
CREATE INDEX IF NOT EXISTS idx_coupon_cache_upc ON coupon_cache(upc);
CREATE INDEX IF NOT EXISTS idx_sovereign_scans_created ON sovereign_scans(scanned_at DESC);

-- RLS
ALTER TABLE sovereign_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sovereign_savings_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_scans" ON sovereign_scans
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "users_own_ledger" ON sovereign_savings_ledger
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "coupon_cache_read" ON coupon_cache
  FOR SELECT USING (true);

CREATE POLICY "coupon_cache_write" ON coupon_cache
  FOR INSERT WITH CHECK (true);
