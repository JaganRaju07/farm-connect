-- Run this migration on your existing Week 2 database
-- File: backend/src/database/migrations/003_profile_and_images.sql

-- Extend farmers table with profile completion fields
ALTER TABLE farmers 
  ADD COLUMN IF NOT EXISTS profile_photo_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS years_of_farming INTEGER,
  ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Add profile_completed flag to consumers
ALTER TABLE consumers 
  ADD COLUMN IF NOT EXISTS profile_photo_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Add index for profile completion check (used in auth middleware)
CREATE INDEX IF NOT EXISTS idx_farmers_profile_completed ON farmers(profile_completed);
CREATE INDEX IF NOT EXISTS idx_consumers_profile_completed ON consumers(profile_completed);

-- Products already have image_url from Week 2
-- Add additional_images column for multiple product photos

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Index for featured products (used in homepage)
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;

-- NOTIFICATIONS TABLE
-- Stores in-app notifications for farmers and consumers
-- Example: "Your order #FC1234 has been confirmed"

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('farmer', 'consumer', 'admin')),
    
    -- Notification content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL 
        CHECK (type IN ('order_placed', 'order_confirmed', 'order_packed', 
                        'order_delivered', 'order_cancelled', 'payment_received',
                        'profile_verified', 'profile_rejected', 'general')),
    
    -- Reference to related entity
    reference_id INTEGER,         -- e.g., order ID
    reference_type VARCHAR(50),   -- e.g., 'order'
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, user_type, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Week 2 had a basic admins table
-- Extend it to support the full admin panel

ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"verify_farmers": true, "view_analytics": true, "manage_products": false}';

-- Insert default super admin (change password in production)
INSERT INTO admins (name, email, phone, password_hash, role)
VALUES (
    'Platform Admin',
    'admin@farmconnect.in',
    '9000000000',
    -- This is bcrypt hash of 'FarmConnect@2026' — CHANGE IN PRODUCTION
    '$2b$10$placeholder_hash_change_this',
    'super_admin'
) ON CONFLICT (email) DO NOTHING;
