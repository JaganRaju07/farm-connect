<<<<<<< HEAD

=======
>>>>>>> 9caa35a (Completed Week 1: 20 API endpoints and project structure)
-- FARM CONNECT - WEEK 2 DATABASE SCHEMA
-- Team P116 | Jagan Raju B (Database + Full Stack Developer)
-- Updated: Week 2 (Mentor feedback integration)

-- KEY CHANGES FROM WEEK 1:
--   1. Added latitude/longitude to farmers and consumers (GPS filtering)
--   2. Removed payments table (simplified to payment_status in orders)
--   3. Added delivery_distance_km to orders (calculated via Haversine)
--   4. Added calculate_distance_km() SQL function

-- CLEAN SLATE FOR WEEK 2
-- WHY: Re-running the schema must not fail because of leftover Week 1 tables.
-- CASCADE drops dependent objects (foreign keys, indexes) automatically.

DROP TABLE IF EXISTS otp_store   CASCADE;
DROP TABLE IF EXISTS orders      CASCADE;
DROP TABLE IF EXISTS products    CASCADE;
DROP TABLE IF EXISTS consumers   CASCADE;
DROP TABLE IF EXISTS farmers     CASCADE;
DROP TABLE IF EXISTS admins      CASCADE;
DROP FUNCTION IF EXISTS calculate_distance_km(DECIMAL, DECIMAL, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- TABLE 1: FARMERS
-- WHY latitude/longitude: City-based filtering (Week 1) meant a consumer
-- in South Bengaluru could see a farmer 40 km away in North Bengaluru just
-- because they share the same "city" label. GPS lets us draw an exact circle
-- (e.g., 10 km radius) around the consumer and only show farmers inside it.

-- DECIMAL(10, 8) means: 10 digits total, 8 after the decimal point.
-- This gives ~1-meter accuracy, which is more than sufficient.

CREATE TABLE farmers (
    id                   SERIAL PRIMARY KEY,

    -- Basic identification
    name                 VARCHAR(255) NOT NULL,
    phone                VARCHAR(15)  UNIQUE NOT NULL,
    email                VARCHAR(255) UNIQUE,

    -- GPS coordinates (CRITICAL Week 2 addition)
    -- Example Bengaluru coordinates: 12.97160000, 77.59460000
    latitude             DECIMAL(10, 8) NOT NULL,
    longitude            DECIMAL(11, 8) NOT NULL,

    -- Human-readable location (kept for display, not for filtering)
    address              TEXT         NOT NULL,
    city                 VARCHAR(100) NOT NULL,
    pincode              VARCHAR(10),

    -- Admin verification workflow
    is_verified          BOOLEAN      DEFAULT FALSE,
    verification_status  VARCHAR(20)  DEFAULT 'pending'
                         CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    aadhaar_number       VARCHAR(12),

    -- Farm metadata
    farm_size_acres      DECIMAL(10, 2),
    farming_type         VARCHAR(20)
                         CHECK (farming_type IN ('organic', 'conventional', 'mixed')),

    -- Account health flags
    is_active            BOOLEAN      DEFAULT TRUE,
    phone_verified       BOOLEAN      DEFAULT FALSE,
    created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- WHY these indexes:
-- idx_farmers_location → used by the Haversine query to scan lat/lon pairs efficiently
-- idx_farmers_phone → used on every OTP login lookup
-- idx_farmers_verification → used by admin dashboard to list pending/approved farmers
CREATE INDEX idx_farmers_location     ON farmers(latitude, longitude);
CREATE INDEX idx_farmers_phone        ON farmers(phone);
CREATE INDEX idx_farmers_verification ON farmers(verification_status);
CREATE INDEX idx_farmers_active       ON farmers(is_active, is_verified);


-- ============================================================
-- TABLE 2: CONSUMERS
-- ============================================================
CREATE TABLE consumers (
    id                SERIAL PRIMARY KEY,

    name              VARCHAR(255) NOT NULL,
    phone             VARCHAR(15)  UNIQUE NOT NULL,
    email             VARCHAR(255) UNIQUE,

    -- GPS coordinates used to find nearby farmers at browse time
    -- and stored as delivery location when an order is placed
    latitude          DECIMAL(10, 8) NOT NULL,
    longitude         DECIMAL(11, 8) NOT NULL,
    delivery_address  TEXT          NOT NULL,
    city              VARCHAR(100)  NOT NULL,
    pincode           VARCHAR(10),

    is_active         BOOLEAN   DEFAULT TRUE,
    phone_verified    BOOLEAN   DEFAULT FALSE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consumers_location ON consumers(latitude, longitude);
CREATE INDEX idx_consumers_phone    ON consumers(phone);


-- ============================================================
-- TABLE 3: PRODUCTS
-- ============================================================
-- WHY no location here: Products inherit location from their farmer.
-- When a consumer queries "products near me", we JOIN products → farmers
-- and filter by the farmer's GPS coordinates. This avoids duplicating
-- location data and keeps the schema normalized.
CREATE TABLE products (
    id                      SERIAL PRIMARY KEY,
    farmer_id               INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,

    name                    VARCHAR(255)   NOT NULL,
    category                VARCHAR(100)   NOT NULL,  -- vegetables, fruits, dairy, grains…
    description             TEXT,

    -- Price & inventory
    price                   DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    unit                    VARCHAR(20)    NOT NULL,  -- kg, bunch, dozen, litre
    stock_available         INTEGER        DEFAULT 0 CHECK (stock_available >= 0),
    minimum_order_quantity  INTEGER        DEFAULT 1,

    image_url               VARCHAR(500),
    is_organic              BOOLEAN   DEFAULT FALSE,
    harvest_date            DATE,

    is_active               BOOLEAN   DEFAULT TRUE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_farmer   ON products(farmer_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active   ON products(is_active);


-- ============================================================
-- TABLE 4: ORDERS
-- ============================================================
-- WHY no payments table: For Cash-on-Delivery MVP there are only three
-- payment states (cod_pending → paid → refunded). A separate table would
-- add an extra JOIN on every order query for no real benefit. When we
-- add Razorpay / UPI in future weeks we can revisit this decision.
--
-- WHY JSONB for items: An order can contain multiple products. Storing
-- them as JSON avoids a separate order_items table for the MVP. JSONB
-- is indexed and queryable in PostgreSQL, so we can still inspect items
-- if needed.
--
-- Example items value:
-- [{"product_id":1,"name":"Tomatoes","quantity":3,"unit":"kg","price":40.00}]
CREATE TABLE orders (
    id             SERIAL PRIMARY KEY,
    order_number   VARCHAR(50) UNIQUE NOT NULL,  -- human-readable: FC1714123456789

    consumer_id    INTEGER NOT NULL REFERENCES consumers(id),
    farmer_id      INTEGER NOT NULL REFERENCES farmers(id),

    -- Order contents stored as JSON for MVP flexibility
    items          JSONB NOT NULL,

    -- Financial summary
    subtotal       DECIMAL(10, 2) NOT NULL,
    delivery_fee   DECIMAL(10, 2) DEFAULT 30,
    total_amount   DECIMAL(10, 2) NOT NULL,

    -- Consumer's GPS at order time (the delivery destination)
    -- WHY store this separately: Consumer might update their profile location
    -- later. We want to remember exactly where they were when they ordered.
    delivery_latitude   DECIMAL(10, 8) NOT NULL,
    delivery_longitude  DECIMAL(11, 8) NOT NULL,
    delivery_address    TEXT          NOT NULL,
    delivery_city       VARCHAR(100)  NOT NULL,
    delivery_pincode    VARCHAR(10),

    -- Calculated at order placement using Haversine (stored so farmer can
    -- see delivery distance without re-calculating every time)
    delivery_distance_km DECIMAL(5, 2),

    -- Order lifecycle state machine
    -- Valid transitions (see order.service.js for enforcement):
    -- pending → confirmed → packed → out_for_delivery → delivered → completed
    -- any state → cancelled
    order_status   VARCHAR(25) DEFAULT 'pending'
                   CHECK (order_status IN (
                       'pending', 'confirmed', 'packed',
                       'out_for_delivery', 'delivered',
                       'cancelled', 'completed'
                   )),

    -- Payment tracking (replaces separate payments table)
    payment_status VARCHAR(20) DEFAULT 'cod_pending'
                   CHECK (payment_status IN ('cod_pending', 'paid', 'refunded')),
    payment_method VARCHAR(20) DEFAULT 'cod',

    -- Lifecycle timestamps – one per state so we can reconstruct the
    -- full timeline ("confirmed at 10:00, delivered at 14:30")
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at        TIMESTAMP,
    packed_at           TIMESTAMP,
    out_for_delivery_at TIMESTAMP,
    delivered_at        TIMESTAMP,
    completed_at        TIMESTAMP,

    -- Free-text notes from each party
    consumer_notes      TEXT,
    farmer_notes        TEXT,
    cancellation_reason TEXT
);

CREATE INDEX idx_orders_consumer ON orders(consumer_id);
CREATE INDEX idx_orders_farmer   ON orders(farmer_id);
CREATE INDEX idx_orders_status   ON orders(order_status);
CREATE INDEX idx_orders_created  ON orders(created_at DESC);


-- ============================================================
-- TABLE 5: ADMINS
-- ============================================================
-- Admin accounts use email+password (bcrypt hash), not OTP.
-- They exist to verify farmers and moderate the platform.
CREATE TABLE admins (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    phone         VARCHAR(15)  UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  DEFAULT 'moderator'
                  CHECK (role IN ('super_admin', 'moderator')),
    is_active     BOOLEAN   DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admins_email ON admins(email);


-- ============================================================
-- TABLE 6: OTP_STORE
-- ============================================================
-- Temporary table for phone OTP verification.
-- WHY phone as PRIMARY KEY: Only one active OTP per phone number at a time.
-- A new OTP request for the same number simply overwrites the old record
-- (PostgreSQL INSERT ... ON CONFLICT DO UPDATE handles this in the backend).
CREATE TABLE otp_store (
    phone      VARCHAR(15)  PRIMARY KEY,
    otp_code   VARCHAR(6)   NOT NULL,
    expires_at TIMESTAMP    NOT NULL,  -- 5 minutes from creation
    user_type  VARCHAR(20)  NOT NULL CHECK (user_type IN ('farmer', 'consumer')),
    action     VARCHAR(20)  NOT NULL CHECK (action IN ('register', 'login')),
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- WHY index on expires_at: A cleanup job (or cron) can efficiently DELETE
-- FROM otp_store WHERE expires_at < NOW() to purge expired codes.
CREATE INDEX idx_otp_expires ON otp_store(expires_at);


-- ============================================================
-- AUTO-UPDATE TRIGGER (updated_at columns)
-- ============================================================
-- WHY: Instead of manually setting updated_at = NOW() in every UPDATE
-- query, this trigger fires automatically before any row update and
-- sets the timestamp for us.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_farmers_updated_at
    BEFORE UPDATE ON farmers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consumers_updated_at
    BEFORE UPDATE ON consumers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- HAVERSINE DISTANCE FUNCTION
-- ============================================================
-- WHY we need this: Earth is a sphere, not a flat surface. Simple
-- subtraction of coordinates gives wrong distances. The Haversine
-- formula accounts for Earth's curvature and returns the shortest
-- path along the surface between two GPS points.
--
-- Inputs  : lat1/lon1 → consumer's coordinates
--           lat2/lon2 → farmer's coordinates
-- Output  : distance in kilometers (rounded to 2 decimal places)
--
-- Quick sanity check you can run after applying the schema:
--   SELECT calculate_distance_km(12.9716, 77.5946, 12.7900, 77.4700);
--   Expected ≈ 24.78 km  (Jayanagar → Kanakapura Road)
CREATE OR REPLACE FUNCTION calculate_distance_km(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    radius_earth DECIMAL := 6371;  -- Earth's mean radius in km
    dlat         DECIMAL;
    dlon         DECIMAL;
    a            DECIMAL;
    c            DECIMAL;
    distance     DECIMAL;
BEGIN
    -- Step 1: Convert coordinate differences to radians
    --   (trig functions in PostgreSQL expect radians, not degrees)
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);

    -- Step 2: Haversine formula
    --   a = square of half the chord length between the two points
    a := sin(dlat / 2) * sin(dlat / 2)
       + cos(radians(lat1)) * cos(radians(lat2))
       * sin(dlon / 2) * sin(dlon / 2);

    --   c = angular distance in radians
    c := 2 * atan2(sqrt(a), sqrt(1 - a));

    -- Step 3: Multiply by Earth's radius to get km
    distance := radius_earth * c;

    RETURN ROUND(distance, 2);
END;
$$ LANGUAGE plpgsql;

-- END OF SCHEMA
<<<<<<< HEAD
-- Next step: Run seed.sql to populate sample data

=======
-- Next step: Run seed.sql to populate sample data
>>>>>>> 9caa35a (Completed Week 1: 20 API endpoints and project structure)
