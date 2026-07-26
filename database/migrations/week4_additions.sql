-- database/migrations/week4_additions.sql
-- Run this file against your PostgreSQL database before Week 4 testing begins
-- Command: psql -U farmconnect_user -d farmconnect -f week4_additions.sql

-- ─── Orders Table Additions ───────────────────────────────────────────────────
-- cancellation_reason: set when consumer or admin cancels an order
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(20),
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS packed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS out_for_delivery_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cod',
  ADD COLUMN IF NOT EXISTS consumer_notes TEXT,
  ADD COLUMN IF NOT EXISTS farmer_notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

COMMENT ON COLUMN orders.cancellation_reason IS
  'Reason provided when order is cancelled — stored for farmer/admin review';
COMMENT ON COLUMN orders.cancelled_by IS
  'Who cancelled: consumer (changed mind), farmer (unable to fulfill), admin (policy)';

-- ─── Farmers Table Additions ──────────────────────────────────────────────────
-- suspension fields for admin suspend/reinstate feature
ALTER TABLE farmers
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS suspended_by INTEGER REFERENCES admins(id),
  ADD COLUMN IF NOT EXISTS farm_size_acres DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS farming_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS farming_experience_years INTEGER,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN farmers.suspension_reason IS
  'Reason admin suspended this farmer account';

-- ─── Consumers Table Additions ───────────────────────────────────────────────
-- preferred_language for future Kannada support (Phase 2 placeholder)
ALTER TABLE consumers
  ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS preferred_delivery_time VARCHAR(50),
  ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(15),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- ─── Products Table Additions ────────────────────────────────────────────────
-- view_count tracks product popularity without separate analytics table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS order_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_organic BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS primary_image_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'kg',
  ADD COLUMN IF NOT EXISTS stock_available INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS origin_description TEXT,
  ADD COLUMN IF NOT EXISTS available_from DATE,
  ADD COLUMN IF NOT EXISTS available_until DATE,
  ADD COLUMN IF NOT EXISTS harvest_date DATE;

COMMENT ON COLUMN products.view_count IS
  'Incremented each time a consumer views product detail page';
COMMENT ON COLUMN products.order_count IS
  'Incremented each time this product is successfully ordered — used for popularity sorting';

-- ─── Notifications Table Additions ───────────────────────────────────────────
-- action_url: deep link for notification tap (e.g. /orders/123)
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS action_url VARCHAR(255);

-- Fix mismatches between Week 3 local schema and Week 5 production schema
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE notifications RENAME COLUMN type TO notification_type;
  EXCEPTION
    WHEN undefined_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE notifications RENAME COLUMN reference_id TO related_id;
  EXCEPTION
    WHEN undefined_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE notifications RENAME COLUMN reference_type TO related_type;
  EXCEPTION
    WHEN undefined_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;
END $$;

COMMENT ON COLUMN notifications.action_url IS
  'Frontend route to navigate to when notification is tapped';

-- ─── Verify All Columns Exist ────────────────────────────────────────────────
-- Run these SELECT statements to confirm additions succeeded
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name IN ('cancellation_reason', 'cancelled_at', 'cancelled_by')
ORDER BY column_name;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'farmers'
  AND column_name IN ('suspension_reason', 'suspended_at', 'suspended_by')
ORDER BY column_name;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('view_count', 'order_count')
ORDER BY column_name;
