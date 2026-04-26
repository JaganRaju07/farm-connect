-- FARM CONNECT - WEEK 2 SEED DATA
-- Team P116 | Jagan Raju B
-- PURPOSE: Populate the database with realistic test data so the
-- team can develop and demo without needing real users.

-- HOW TO GET YOUR OWN GPS COORDINATES FOR TESTING:
--   1. Open maps.google.com
--   2. Navigate to any location in Karnataka
--   3. Right-click → first option shows "12.9716, 77.5946"
--   4. Use those numbers as latitude and longitude

-- Clear existing data in reverse dependency order
-- (child tables must be emptied before parent tables)
DELETE FROM otp_store;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM consumers;
DELETE FROM farmers;
DELETE FROM admins;

-- Reset auto-increment sequences so IDs start at 1 again
ALTER SEQUENCE farmers_id_seq   RESTART WITH 1;
ALTER SEQUENCE consumers_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq  RESTART WITH 1;
ALTER SEQUENCE orders_id_seq    RESTART WITH 1;
ALTER SEQUENCE admins_id_seq    RESTART WITH 1;

-- SAMPLE FARMERS (4 farmers across Karnataka)
-- NOTE ON COORDINATES:
--   Farmer 1 (Ravi Kumar) – Kanakapura Road, Bengaluru
--             lat 12.79, lon 77.47 → ~25 km south of city centre
--   Farmer 2 (Lakshmi Devi) – Mysuru outskirts
--             lat 12.30, lon 76.65 → ~140 km from Bengaluru centre
--   Farmer 3 (Suresh Reddy) – Hubli (pending verification, won't appear in searches)
--             lat 15.36, lon 75.12
--   Farmer 4 (Manjunath Gowda) – Nelamangala, Bengaluru Rural
--             lat 12.85, lon 77.52 → ~20 km north-west of city centre
--
-- Why this spread? It lets us test:
--   - Farmer 1 and 4 both appear for a Bengaluru consumer within 30 km
--   - Farmer 2 does NOT appear for a Bengaluru consumer within 10 km
--   - Farmer 3 never appears (is_verified = FALSE)

INSERT INTO farmers (
    name, phone, latitude, longitude,
    address, city, pincode,
    is_verified, verification_status, phone_verified,
    farm_size_acres, farming_type
) VALUES
(
    'Ravi Kumar',
    '9876543210',
    12.79000000, 77.47000000,
    'Survey No. 45, Kanakapura Road, Near Rajarajeshwari Nagar',
    'Bengaluru', '560098',
    TRUE, 'approved', TRUE,
    5.50, 'organic'
),
(
    'Lakshmi Devi',
    '9876543211',
    12.30000000, 76.65000000,
    'KRS Road, Alanahalli Village',
    'Mysuru', '571301',
    TRUE, 'approved', TRUE,
    8.00, 'conventional'
),
(
    'Suresh Reddy',
    '9876543212',
    15.36000000, 75.12000000,
    'Vidyanagar, Old Hubli',
    'Hubli', '580031',
    FALSE, 'pending', TRUE,  -- pending: will NOT appear in product searches
    3.00, 'mixed'
),
(
    'Manjunath Gowda',
    '9876543213',
    12.85000000, 77.52000000,
    'Nelamangala Main Road, Bangalore Rural District',
    'Bengaluru', '562123',
    TRUE, 'approved', TRUE,
    12.00, 'organic'
);


-- ============================================================
-- SAMPLE CONSUMERS (3 consumers in Bengaluru)
-- ============================================================
-- Arjun  – Jayanagar 4th Block (lat 12.9716, lon 77.5946)
-- Priya  – Koramangala 5th Block (lat 12.9352, lon 77.6245)
-- Rahul  – JP Nagar 7th Phase (lat 12.8250, lon 77.4850)
--
-- DISTANCE CONTEXT (approximate, use to verify your Haversine function):
--   Arjun  → Farmer Ravi (Kanakapura):  ~25 km
--   Arjun  → Farmer Manjunath (Nela):   ~15 km
--   Arjun  → Farmer Lakshmi (Mysuru):  ~90 km  ← outside any reasonable radius
--   Rahul  → Farmer Ravi (Kanakapura):  ~10 km  ← borderline for 10 km filter
--   Priya  → Farmer Manjunath (Nela):   ~20 km

INSERT INTO consumers (
    name, phone, latitude, longitude,
    delivery_address, city, pincode, phone_verified
) VALUES
(
    'Arjun Mehta',
    '9988776655',
    12.97160000, 77.59460000,
    '34, 18th Cross, Jayanagar 4th Block',
    'Bengaluru', '560041', TRUE
),
(
    'Priya Shah',
    '9988776656',
    12.93520000, 77.62450000,
    '201, Harmony Apartments, Koramangala 5th Block',
    'Bengaluru', '560095', TRUE
),
(
    'Rahul Iyer',
    '9988776657',
    12.82500000, 77.48500000,
    '12, 9th Main, JP Nagar 7th Phase',
    'Bengaluru', '560078', TRUE
);


-- ============================================================
-- SAMPLE PRODUCTS (6 products from verified farmers)
-- ============================================================
-- Note: No products for Farmer 3 (Suresh Reddy / Hubli) because
-- that farmer is unverified and should not appear in searches.

INSERT INTO products (
    farmer_id, name, category, description,
    price, unit, stock_available, minimum_order_quantity,
    is_organic, harvest_date, is_active
) VALUES
-- Farmer 1 (Ravi Kumar – Kanakapura Road)
(1, 'Organic Tomatoes',  'vegetables', 'Farm-fresh organic tomatoes, no pesticides used.',
    40.00, 'kg',    100, 1, TRUE,  CURRENT_DATE - 1, TRUE),
(1, 'Fresh Spinach',     'vegetables', 'Tender baby spinach leaves, harvested this morning.',
    25.00, 'bunch',  50, 1, TRUE,  CURRENT_DATE,     TRUE),

-- Farmer 2 (Lakshmi Devi – Mysuru)  ← far from Bengaluru consumers, useful for negative test
(2, 'Alphonso Mangoes',  'fruits',     'Premium Alphonso mangoes from Mysuru orchards.',
   150.00, 'dozen',  30, 1, FALSE, CURRENT_DATE - 2, TRUE),
(2, 'Organic Carrots',   'vegetables', 'Crunchy organic carrots, excellent sweetness.',
    35.00, 'kg',     75, 1, TRUE,  CURRENT_DATE - 1, TRUE),

-- Farmer 4 (Manjunath Gowda – Nelamangala)
(4, 'Farm Fresh Milk',   'dairy',      'A2 milk from desi cows, delivered same day.',
    50.00, 'litre',  20, 1, TRUE,  CURRENT_DATE,     TRUE),
(4, 'Green Beans',       'vegetables', 'Crisp green beans, freshly harvested.',
    60.00, 'kg',     40, 1, TRUE,  CURRENT_DATE,     TRUE);


-- ============================================================
-- SAMPLE ADMIN
-- ============================================================
-- Password stored as bcrypt hash. Plaintext = "Admin@123"
-- WHY bcrypt: Irreversible hash with salt; even if DB is breached
-- the real password cannot be recovered.
-- Use bcrypt.hash('Admin@123', 10) in Node.js to regenerate this.
INSERT INTO admins (name, email, phone, password_hash, role)
VALUES (
    'Platform Admin',
    'admin@farmconnect.in',
    '9000000001',
    '$2b$10$placeholder_bcrypt_hash_replace_with_real_hash',  -- replace this!
    'super_admin'
);

-- ============================================================
-- QUICK VERIFICATION QUERIES
-- ============================================================
-- Run these after seeding to confirm everything loaded correctly.

-- 1. Count check
SELECT 'farmers'   AS table_name, COUNT(*) AS rows FROM farmers
UNION ALL
SELECT 'consumers', COUNT(*) FROM consumers
UNION ALL
SELECT 'products',  COUNT(*) FROM products
UNION ALLm
SELECT 'admins',    COUNT(*) FROM admins;

-- 2. Distance sanity check  (should return ≈ 24.78 km)
SELECT calculate_distance_km(12.9716, 77.5946, 12.7900, 77.4700) AS jayanagar_to_kanakapura_km;

-- 3. GPS product query preview  (Arjun browsing – 30 km radius)
--    Should show Farmer Ravi's and Farmer Manjunath's products,
--    NOT Farmer Lakshmi's (Mysuru ~90 km away).
SELECT
    p.name,
    p.price,
    p.unit,
    f.name AS farmer_name,
    f.city AS farmer_city,
    ROUND(calculate_distance_km(12.9716, 77.5946, f.latitude, f.longitude), 2) AS distance_km
FROM products p
JOIN farmers f ON p.farmer_id = f.id
WHERE
    p.is_active = TRUE
    AND f.is_verified = TRUE
    AND calculate_distance_km(12.9716, 77.5946, f.latitude, f.longitude) <= 30
ORDER BY distance_km ASC;
