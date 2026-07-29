-- Add this at the TOP of seed_final_demo.sql before the DO blocks
-- to verify prerequisite data exists before inserting
DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM farmers WHERE phone = '9845000001') THEN
 RAISE EXCEPTION 'Farmer 9845000001 not found. Run seed.sql first.';
 END IF;
 IF NOT EXISTS (SELECT 1 FROM consumers WHERE phone = '9900000001') THEN
 RAISE EXCEPTION 'Consumer 9900000001 not found. Run seed.sql first.';
 END IF;
 RAISE NOTICE 'Prerequisites verified. Proceeding with demo seed.';
END $$;

-- ─── Clean slate for demo (local only, NEVER on production) ──────────────────
-- Uncomment these only when preparing a clean demo environment:
-- TRUNCATE product_reviews, consumer_wishlist, notifications,
-- orders, products, consumers, farmers RESTART IDENTITY CASCADE;
-- DELETE FROM otp_store;

-- ─── Demo Farmers ─────────────────────────────────────────────────────────────
INSERT INTO farmers (name, phone, latitude, longitude, address, city, pincode,
 is_verified, verification_status, phone_verified, profile_completed,
 farm_size_acres, farming_type, bio, farming_experience_years, is_active)
VALUES
 ('Ravi Kumar Gowda', '9845000001', 12.7900, 77.4700,
 'Sy No. 45, Kanakapura Road, Uttarahalli', 'Bengaluru', '560061',
 TRUE, 'approved', TRUE, TRUE, 3.5, 'organic',
 'Third generation farmer. Specialise in leafy vegetables and tomatoes grown without chemicals.', 18, TRUE),

 ('Lakshmi Devi', '9845000002', 12.9350, 77.5320,
 'Sy No. 12, Banashankari 6th Stage', 'Bengaluru', '560062',
 TRUE, 'approved', TRUE, TRUE, 1.2, 'mixed',
 'Urban farmer delivering farm-fresh vegetables same day. Located just 5km from HSR Layout.', 8, TRUE),

 ('Manjunath Reddy', '9845000003', 13.0620, 77.5890,
 'Devanahalli Village, Bangalore Rural', 'Bengaluru Rural', '562110',
 FALSE, 'pending', TRUE, TRUE, 8.0, 'conventional',
 'Large scale vegetable and fruit grower supplying North Bengaluru area.', 25, TRUE)
ON CONFLICT (phone) DO NOTHING;

-- ─── Demo Consumers ───────────────────────────────────────────────────────────
INSERT INTO consumers (name, phone, latitude, longitude, delivery_address,
 city, pincode, phone_verified, profile_completed, preferred_delivery_time, is_active)
VALUES
 ('Arjun Mehta', '9900000001', 12.9716, 77.5946,
 'Flat 302, Prestige Apartments, Jayanagar 4th Block', 'Bengaluru', '560041',
 TRUE, TRUE, 'morning', TRUE),

 ('Priya Sharma', '9900000002', 12.9352, 77.6245,
 'No. 18, 3rd Cross, Koramangala 5th Block', 'Bengaluru', '560095',
 TRUE, TRUE, 'evening', TRUE),

 ('Rahul Iyer', '9900000003', 12.9120, 77.6080,
 '5th Floor, Sobha Dream, HSR Layout Sector 4', 'Bengaluru', '560102',
 TRUE, TRUE, 'morning', TRUE)
ON CONFLICT (phone) DO NOTHING;

-- ─── Demo Products ────────────────────────────────────────────────────────────
DO $$
DECLARE
 f1 INTEGER; f2 INTEGER;
 p1 INTEGER; p2 INTEGER; p3 INTEGER; p4 INTEGER;
BEGIN
 SELECT id INTO f1 FROM farmers WHERE phone = '9845000001';
 SELECT id INTO f2 FROM farmers WHERE phone = '9845000002';

 IF f1 IS NOT NULL THEN
 INSERT INTO products (farmer_id, name, category, description, price, unit,
 stock_available, is_organic, is_active, low_stock_threshold,
 average_rating, review_count, order_count, view_count)
 VALUES
 (f1, 'Organic Tomatoes', 'vegetables',
 'Farm fresh organic tomatoes, no pesticides. Harvested every morning.', 50, 'kg', 25, TRUE, TRUE, 5, 4.5, 
12, 34, 156),
 (f1, 'Fresh Spinach', 'vegetables',
 'Tender baby spinach leaves, rich in iron. Harvested twice weekly.', 30, 'bunch', 40, TRUE, TRUE, 8, 4.2, 8, 
22, 89)
 ON CONFLICT DO NOTHING
 RETURNING id INTO p1;

 SELECT id INTO p1 FROM products WHERE farmer_id = f1 AND name = 'Organic Tomatoes';
 SELECT id INTO p2 FROM products WHERE farmer_id = f1 AND name = 'Fresh Spinach';
 END IF;

 IF f2 IS NOT NULL THEN
 INSERT INTO products (farmer_id, name, category, description, price, unit,
 stock_available, is_organic, is_active, low_stock_threshold,
 average_rating, review_count, order_count, view_count)
 VALUES
 (f2, 'Farm Fresh Milk', 'dairy',
 'A2 cow milk, no preservatives. Morning delivery only. Order before 8 PM.', 65, 'litre', 12, FALSE, TRUE, 
3, 4.8, 20, 67, 234),
 (f2, 'Country Eggs', 'other',
 'Free range country eggs. Hens fed natural grain feed only.', 90, 'dozen', 30, FALSE, TRUE, 5, 4.6, 15, 45, 
178)
 ON CONFLICT DO NOTHING;
 END IF;
END $$;

-- ─── Demo Orders in Different Stages ──────────────────────────────────────────
DO $$
DECLARE
 f1_id INTEGER; c1_id INTEGER; c2_id INTEGER; c3_id INTEGER;
 p1_id INTEGER; p2_id INTEGER; p3_id INTEGER;
BEGIN
 SELECT id INTO c1_id FROM consumers WHERE phone = '9900000001';
 SELECT id INTO c2_id FROM consumers WHERE phone = '9900000002';
 SELECT id INTO c3_id FROM consumers WHERE phone = '9900000003';
 SELECT id INTO p1_id FROM products WHERE name = 'Organic Tomatoes';
 SELECT id INTO p2_id FROM products WHERE name = 'Fresh Spinach';
 SELECT id INTO p3_id FROM products WHERE name = 'Farm Fresh Milk';
 SELECT id INTO f1_id FROM farmers WHERE phone = '9845000001';

 -- Order 1: Completed (good for showing full lifecycle in demo)
 INSERT INTO orders (order_number, consumer_id, farmer_id, items, subtotal,
 delivery_fee, total_amount, delivery_latitude, delivery_longitude,
 delivery_address, delivery_city, delivery_pincode, delivery_distance_km,
 order_status, payment_status, created_at, confirmed_at, packed_at,
 out_for_delivery_at, delivered_at, completed_at)
 SELECT
 'FC2026001', c1_id, f1_id,
 json_build_array(
 json_build_object('productId', p1_id, 'name', 'Organic Tomatoes',
 'quantity', 3, 'unit', 'kg', 'price', 50, 'farmerId', f1_id)
 )::text::jsonb,
 150, 55, 205,
 12.9716, 77.5946, 'Jayanagar 4th Block', 'Bengaluru', '560041', 21.4,
 'completed', 'paid',
 NOW() - INTERVAL '5 days',
 NOW() - INTERVAL '5 days' + INTERVAL '2 hours',
 NOW() - INTERVAL '4 days',
 NOW() - INTERVAL '4 days' + INTERVAL '3 hours',
 NOW() - INTERVAL '4 days' + INTERVAL '5 hours',
 NOW() - INTERVAL '4 days' + INTERVAL '6 hours'
 WHERE c1_id IS NOT NULL AND f1_id IS NOT NULL AND p1_id IS NOT NULL
 AND NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'FC2026001');

 -- Order 2: Currently out for delivery (shows live tracking in demo)
 INSERT INTO orders (order_number, consumer_id, farmer_id, items, subtotal,
 delivery_fee, total_amount, delivery_latitude, delivery_longitude,
 delivery_address, delivery_city, delivery_pincode, delivery_distance_km,
 order_status, payment_status, created_at, confirmed_at, packed_at, out_for_delivery_at)
 SELECT
 'FC2026002', c2_id, f1_id,
 json_build_array(
 json_build_object('productId', p2_id, 'name', 'Fresh Spinach',
 'quantity', 2, 'unit', 'bunch', 'price', 30, 'farmerId', f1_id)
 )::text::jsonb,
 60, 35, 95,
 12.9352, 77.6245, 'Koramangala 5th Block', 'Bengaluru', '560095', 12.7,
 'out_for_delivery', 'cod_pending',
 NOW() - INTERVAL '6 hours',
 NOW() - INTERVAL '5 hours',
 NOW() - INTERVAL '3 hours',
 NOW() - INTERVAL '1 hour'
 WHERE c2_id IS NOT NULL AND f1_id IS NOT NULL AND p2_id IS NOT NULL
 AND NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'FC2026002');

 -- Order 3: Pending (farmer needs to confirm in demo)
 INSERT INTO orders (order_number, consumer_id, farmer_id, items, subtotal,
 delivery_fee, total_amount, delivery_latitude, delivery_longitude,
 delivery_address, delivery_city, delivery_pincode, delivery_distance_km,
 order_status, payment_status, created_at)
 SELECT
 'FC2026003', c3_id, f1_id,
 json_build_array(
 json_build_object('productId', p1_id, 'name', 'Organic Tomatoes',
 'quantity', 5, 'unit', 'kg', 'price', 50, 'farmerId', f1_id)
 )::text::jsonb,
 250, 75, 325,
 12.9120, 77.6080, 'HSR Layout Sector 4', 'Bengaluru', '560102', 16.2,
 'pending', 'cod_pending',
 NOW() - INTERVAL '30 minutes'
 WHERE c3_id IS NOT NULL AND f1_id IS NOT NULL AND p1_id IS NOT NULL
 AND NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'FC2026003');

END $$;

-- ─── Demo Reviews (shows reviews working on product page) ─────────────────────
DO $$
DECLARE
 c1_id INTEGER; c2_id INTEGER; c3_id INTEGER;
 p1_id INTEGER; o1_id INTEGER;
BEGIN
 SELECT id INTO c1_id FROM consumers WHERE phone = '9900000001';
 SELECT id INTO c2_id FROM consumers WHERE phone = '9900000002';
 SELECT id INTO p1_id FROM products WHERE name = 'Organic Tomatoes';
 SELECT id INTO o1_id FROM orders WHERE order_number = 'FC2026001';

 IF p1_id IS NOT NULL AND c1_id IS NOT NULL AND o1_id IS NOT NULL THEN
 INSERT INTO product_reviews (product_id, consumer_id, order_id, rating, review_text)
 VALUES
 (p1_id, c1_id, o1_id, 5,
 'Excellent quality tomatoes! Very fresh and organic. Ravi delivered exactly on time. Will order again.')
 ON CONFLICT (product_id, consumer_id, order_id) DO NOTHING;
 END IF;
END $$;

-- ─── Verify demo data ──────────────────────────────────────────────────────────
SELECT 'farmers' AS entity, COUNT(*) AS count FROM farmers
UNION ALL SELECT 'consumers', COUNT(*) FROM consumers
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'reviews', COUNT(*) FROM product_reviews
UNION ALL SELECT 'wishlist', COUNT(*) FROM consumer_wishlist
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications;
