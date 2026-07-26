-- database/migrations/week4_indexes.sql
-- Performance indexes for Week 4 query patterns
-- These do not change data — they create lookup structures PostgreSQL uses automatically

-- ─── Orders Indexes ───────────────────────────────────────────────────────────

-- Farmer dashboard: all queries filter WHERE farmer_id = $1
-- Without this, PostgreSQL scans ALL orders to find the farmer's orders
CREATE INDEX IF NOT EXISTS idx_orders_farmer_status
  ON orders(farmer_id, order_status);

COMMENT ON INDEX idx_orders_farmer_status IS
  'Composite index: farmer dashboard queries filter by both farmer_id AND status';

-- Consumer dashboard: all queries filter WHERE consumer_id = $1
CREATE INDEX IF NOT EXISTS idx_orders_consumer_status
  ON orders(consumer_id, order_status);

-- Earnings endpoint: filters by created_at date range
CREATE INDEX IF NOT EXISTS idx_orders_farmer_created
  ON orders(farmer_id, created_at DESC);

-- Payment status filtering: find all cod_pending for a farmer
CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON orders(farmer_id, payment_status);

-- ─── Products Indexes ─────────────────────────────────────────────────────────

-- GPS-based product search: the calculate_distance_km function filters by farmer location
-- This index helps when we join products to farmers and filter by farmer location
CREATE INDEX IF NOT EXISTS idx_products_farmer_active
  ON products(farmer_id, is_active);

-- Category filter: very common in marketplace browsing
CREATE INDEX IF NOT EXISTS idx_products_category_active
  ON products(category, is_active);

-- Price range filtering
CREATE INDEX IF NOT EXISTS idx_products_price
  ON products(price) WHERE is_active = TRUE;

-- Full-text search on product name (for keyword search endpoint)
-- to_tsvector converts text to searchable tokens
-- GIN index allows fast full-text lookups
CREATE INDEX IF NOT EXISTS idx_products_name_fts
  ON products USING GIN(to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_products_description_fts
  ON products USING GIN(to_tsvector('english', COALESCE(description, '')));

-- Tags array search (GIN index already created in Week 3, verify it exists)
CREATE INDEX IF NOT EXISTS idx_products_tags
  ON products USING GIN(tags);

-- ─── Notifications Indexes ────────────────────────────────────────────────────

-- NotificationBell polls for unread count: WHERE user_id = $1 AND is_read = FALSE
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(user_id, user_type, is_read)
  WHERE is_read = FALSE;

COMMENT ON INDEX idx_notifications_unread IS
  'Partial index: only indexes unread notifications, much smaller than full index';

-- ─── Farmers Indexes ──────────────────────────────────────────────────────────

-- Admin panel: list farmers by verification_status
CREATE INDEX IF NOT EXISTS idx_farmers_verification_active
  ON farmers(verification_status, is_active);

-- GPS search: when products query joins farmers and filters by location
CREATE INDEX IF NOT EXISTS idx_farmers_location
  ON farmers(latitude, longitude) WHERE is_active = TRUE AND is_verified = TRUE;

-- ─── Verify Indexes Created ───────────────────────────────────────────────────

SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'products', 'notifications', 'farmers')
ORDER BY tablename, indexname;
