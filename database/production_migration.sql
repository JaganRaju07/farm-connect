-- database/production_migration.sql
-- This single file recreates the COMPLETE production schema from scratch.
-- Use when setting up a new production database instance.
-- Command: psql "$DATABASE_URL" -f database/production_migration.sql

-- ─── Extension ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Clean slate (only for fresh deployments) ────────────────────────────────
-- DROP SCHEMA public CASCADE; CREATE SCHEMA public; -- UNCOMMENT ONLY IF STARTING FRESH

-- ─── Core Tables ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(15),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'moderator'
    CHECK (role IN ('super_admin', 'moderator')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farmers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address TEXT,
  city VARCHAR(100),
  pincode VARCHAR(10),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(20) DEFAULT 'pending'
    CHECK (verification_status IN ('pending','approved','rejected')),
  aadhaar_number VARCHAR(12),
  farm_size_acres DECIMAL(10,2),
  farming_type VARCHAR(20)
    CHECK (farming_type IN ('organic','conventional','mixed')),
  farming_experience_years INTEGER,
  bio TEXT,
  profile_photo_url VARCHAR(500),
  verification_documents JSONB,
  verified_by INTEGER REFERENCES admins(id),
  verified_at TIMESTAMP,
  rejection_reason TEXT,
  suspension_reason TEXT,
  suspended_at TIMESTAMP,
  suspended_by INTEGER REFERENCES admins(id),
  is_active BOOLEAN DEFAULT TRUE,
  phone_verified BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consumers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  delivery_address TEXT,
  city VARCHAR(100),
  pincode VARCHAR(10),
  alternate_phone VARCHAR(15),
  preferred_delivery_time VARCHAR(50),
  preferred_language VARCHAR(10) DEFAULT 'en',
  profile_photo_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  phone_verified BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  unit VARCHAR(20) NOT NULL,
  stock_available INTEGER DEFAULT 0 CHECK (stock_available >= 0),
  minimum_order_quantity INTEGER DEFAULT 1,
  image_urls TEXT[] DEFAULT '{}',
  primary_image_url VARCHAR(500),
  tags TEXT[] DEFAULT '{}',
  origin_description TEXT,
  available_from DATE,
  available_until DATE,
  is_organic BOOLEAN DEFAULT FALSE,
  harvest_date DATE,
  view_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  consumer_id INTEGER NOT NULL REFERENCES consumers(id),
  farmer_id INTEGER NOT NULL REFERENCES farmers(id),
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 30,
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_latitude DECIMAL(10,8) NOT NULL,
  delivery_longitude DECIMAL(11,8) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city VARCHAR(100) NOT NULL,
  delivery_pincode VARCHAR(10),
  delivery_distance_km DECIMAL(5,2),
  order_status VARCHAR(25) DEFAULT 'pending'
    CHECK (order_status IN
      ('pending','confirmed','packed','out_for_delivery','delivered','cancelled','completed')),
  payment_status VARCHAR(20) DEFAULT 'cod_pending'
    CHECK (payment_status IN ('cod_pending','paid','refunded')),
  payment_method VARCHAR(20) DEFAULT 'cod',
  consumer_notes TEXT,
  farmer_notes TEXT,
  cancellation_reason TEXT,
  cancelled_by VARCHAR(20) CHECK (cancelled_by IN ('consumer','farmer','admin')),
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  packed_at TIMESTAMP,
  out_for_delivery_at TIMESTAMP,
  delivered_at TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_store (
  phone VARCHAR(15) PRIMARY KEY,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('farmer','consumer')),
  action VARCHAR(20) NOT NULL CHECK (action IN ('register','login')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('farmer','consumer','admin')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  related_id INTEGER,
  related_type VARCHAR(50),
  action_url VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Haversine Distance Function ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 DECIMAL, lon1 DECIMAL, lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  R DECIMAL := 6371;
  dlat DECIMAL := radians(lat2 - lat1);
  dlon DECIMAL := radians(lon2 - lon1);
  a DECIMAL;
BEGIN
  a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
  RETURN ROUND((R * 2 * atan2(sqrt(a), sqrt(1-a)))::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql;

-- ─── Auto-update triggers ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_farmers_updated BEFORE UPDATE ON farmers FOR EACH ROW EXECUTE
FUNCTION set_updated_at();

CREATE TRIGGER tr_consumers_updated BEFORE UPDATE ON consumers FOR EACH ROW EXECUTE
FUNCTION set_updated_at();

CREATE TRIGGER tr_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE
FUNCTION set_updated_at();

CREATE TRIGGER tr_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE
FUNCTION set_updated_at();

-- ─── Performance Indexes ──────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_farmers_location ON farmers(latitude, longitude) WHERE is_active=TRUE AND is_verified=TRUE;
CREATE INDEX IF NOT EXISTS idx_farmers_verification ON farmers(verification_status, is_active);
CREATE INDEX IF NOT EXISTS idx_products_farmer_active ON products(farmer_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category, is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price) WHERE is_active=TRUE;
CREATE INDEX IF NOT EXISTS idx_products_name_fts ON products USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_status ON orders(farmer_id, order_status);
CREATE INDEX IF NOT EXISTS idx_orders_consumer_status ON orders(consumer_id, order_status);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_created ON orders(farmer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, user_type, is_read) WHERE is_read=FALSE;
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_store(expires_at);

-- ─── Verify setup ─────────────────────────────────────────────────────────────

SELECT 'Schema created successfully' AS status;
SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;
SELECT routine_name FROM information_schema.routines WHERE routine_type='FUNCTION' AND routine_schema='public';
