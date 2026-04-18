-- =============================================================
-- FARM CONNECT - DATABASE SCHEMA
-- PostgreSQL 15+
-- Author: Jagan Raju B (Team Leader, Database Developer)
-- IEEE Internship - IamPro 2026 | Team P116
-- Week 1 Deliverable
-- =============================================================

-- Drop existing tables in reverse dependency order to avoid FK conflicts
DROP TABLE IF EXISTS payments   CASCADE;
DROP TABLE IF EXISTS orders     CASCADE;
DROP TABLE IF EXISTS products   CASCADE;
DROP TABLE IF EXISTS consumers  CASCADE;
DROP TABLE IF EXISTS farmers    CASCADE;
DROP TABLE IF EXISTS admins     CASCADE;
DROP TABLE IF EXISTS otp_store  CASCADE;

-- ---------------------------------------------------------------
-- UTILITY: auto-update updated_at on any UPDATE operation
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';


-- =============================================================
-- TABLE 1: FARMERS
-- Stores registered farmers who list and sell produce.
-- =============================================================
CREATE TABLE farmers (
    id                   SERIAL PRIMARY KEY,
    name                 VARCHAR(255) NOT NULL,
    phone                VARCHAR(15)  UNIQUE NOT NULL,
    email                VARCHAR(255) UNIQUE,
    city                 VARCHAR(100) NOT NULL,
    area                 VARCHAR(255),
    pincode              VARCHAR(10),
    is_verified          BOOLEAN      DEFAULT FALSE,
    verification_status  VARCHAR(20)  DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    aadhaar_number       VARCHAR(12),
    land_ownership_proof VARCHAR(500),
    farm_size_acres      DECIMAL(10, 2),
    farming_type         VARCHAR(20)
        CHECK (farming_type IN ('organic', 'conventional', 'mixed')),
    is_active            BOOLEAN      DEFAULT TRUE,
    phone_verified       BOOLEAN      DEFAULT FALSE,
    created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_farmers_city         ON farmers(city);
CREATE INDEX idx_farmers_phone        ON farmers(phone);
CREATE INDEX idx_farmers_verification ON farmers(verification_status);

CREATE TRIGGER update_farmers_updated_at
    BEFORE UPDATE ON farmers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =============================================================
-- TABLE 2: CONSUMERS
-- Stores buyers who browse products and place orders.
-- =============================================================
CREATE TABLE consumers (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    phone            VARCHAR(15)  UNIQUE NOT NULL,
    email            VARCHAR(255) UNIQUE,
    city             VARCHAR(100) NOT NULL,
    delivery_address TEXT,
    pincode          VARCHAR(10),
    is_active        BOOLEAN   DEFAULT TRUE,
    phone_verified   BOOLEAN   DEFAULT FALSE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consumers_city  ON consumers(city);
CREATE INDEX idx_consumers_phone ON consumers(phone);

CREATE TRIGGER update_consumers_updated_at
    BEFORE UPDATE ON consumers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =============================================================
-- TABLE 3: PRODUCTS
-- Each product is listed by a specific farmer.
-- =============================================================
CREATE TABLE products (
    id                    SERIAL PRIMARY KEY,
    farmer_id             INTEGER       NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    name                  VARCHAR(255)  NOT NULL,
    category              VARCHAR(100)  NOT NULL,
    description           TEXT,
    price                 DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    unit                  VARCHAR(20)   NOT NULL,
    stock_available       INTEGER       DEFAULT 0 CHECK (stock_available >= 0),
    minimum_order_quantity INTEGER      DEFAULT 1,
    low_stock_threshold   INTEGER       DEFAULT 10,
    image_url             VARCHAR(500),
    is_organic            BOOLEAN       DEFAULT FALSE,
    harvest_date          DATE,
    is_active             BOOLEAN       DEFAULT TRUE,
    created_at            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_farmer   ON products(farmer_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active   ON products(is_active);
CREATE INDEX idx_products_stock    ON products(stock_available);

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =============================================================
-- TABLE 4: ORDERS
-- Central table linking consumers to farmers.
-- =============================================================
CREATE TABLE orders (
    id               SERIAL PRIMARY KEY,
    order_number     VARCHAR(50) UNIQUE NOT NULL,
    consumer_id      INTEGER NOT NULL REFERENCES consumers(id),
    farmer_id        INTEGER NOT NULL REFERENCES farmers(id),
    items            JSONB   NOT NULL,
    subtotal         DECIMAL(10, 2) NOT NULL,
    delivery_fee     DECIMAL(10, 2) DEFAULT 30,
    total_amount     DECIMAL(10, 2) NOT NULL,
    delivery_address TEXT          NOT NULL,
    delivery_city    VARCHAR(100)  NOT NULL,
    delivery_pincode VARCHAR(10),
    order_status     VARCHAR(20)   DEFAULT 'pending'
        CHECK (order_status IN ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned')),
    payment_status   VARCHAR(20)   DEFAULT 'cod_pending'
        CHECK (payment_status IN ('cod_pending', 'paid', 'refunded', 'failed')),
    payment_method   VARCHAR(20)   DEFAULT 'cod'
        CHECK (payment_method IN ('cod', 'online', 'wallet')),
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    confirmed_at     TIMESTAMP,
    delivered_at     TIMESTAMP,
    consumer_notes   TEXT,
    farmer_notes     TEXT
);

CREATE INDEX idx_orders_consumer ON orders(consumer_id);
CREATE INDEX idx_orders_farmer   ON orders(farmer_id);
CREATE INDEX idx_orders_status   ON orders(order_status);
CREATE INDEX idx_orders_created  ON orders(created_at DESC);


-- =============================================================
-- TABLE 5: PAYMENTS
-- Tracks one payment record per order.
-- =============================================================
CREATE TABLE payments (
    id               SERIAL PRIMARY KEY,
    order_id         INTEGER       NOT NULL REFERENCES orders(id),
    amount           DECIMAL(10, 2) NOT NULL,
    payment_method   VARCHAR(20)   NOT NULL,
    payment_status   VARCHAR(20)   DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded')),
    transaction_id   VARCHAR(255),
    gateway_response JSONB,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    completed_at     TIMESTAMP
);

CREATE INDEX idx_payments_order  ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(payment_status);


-- =============================================================
-- TABLE 6: ADMINS
-- Internal users for platform moderation.
-- =============================================================
CREATE TABLE admins (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    phone         VARCHAR(15)  UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  DEFAULT 'moderator'
        CHECK (role IN ('super_admin', 'moderator')),
    permissions   JSONB,
    is_active     BOOLEAN      DEFAULT TRUE,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admins_email ON admins(email);


-- =============================================================
-- TABLE 7: OTP_STORE
-- Temporary table for phone-based authentication.
-- =============================================================
CREATE TABLE otp_store (
    phone      VARCHAR(15) PRIMARY KEY,
    otp_code   VARCHAR(6)  NOT NULL,
    expires_at TIMESTAMP   NOT NULL,
    user_type  VARCHAR(20) NOT NULL CHECK (user_type IN ('farmer', 'consumer')),
    action     VARCHAR(20) NOT NULL CHECK (action   IN ('register', 'login')),
    created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_expires ON otp_store(expires_at);