-- database/seed_week4.sql
-- Run this to ADD demo-quality data without wiping existing records
-- Only inserts if records do not already exist

-- Demo farmers with realistic Bengaluru GPS coordinates
INSERT INTO farmers (name, phone, latitude, longitude, address, city, pincode,
  is_verified, verification_status, phone_verified, profile_completed,
  farm_size_acres, farming_type, bio, farming_experience_years)
SELECT
  'Ravi Kumar Gowda', '9845012345', 12.79000, 77.47000,
  'Sy No. 45, Kanakapura Road, Uttarahalli', 'Bengaluru', '560061',
  TRUE, 'approved', TRUE, TRUE, 3.5, 'organic',
  'Third generation organic farmer. Specialise in leafy vegetables and tomatoes.',
  18
WHERE NOT EXISTS (SELECT 1 FROM farmers WHERE phone = '9845012345');

INSERT INTO farmers (name, phone, latitude, longitude, address, city, pincode,
  is_verified, verification_status, phone_verified, profile_completed,
  farm_size_acres, farming_type, bio, farming_experience_years)
SELECT
  'Lakshmi Devi Naidu', '9845012346', 12.93500, 77.53200,
  'Sy No. 12, Banashankari 6th Stage', 'Bengaluru', '560062',
  TRUE, 'approved', TRUE, TRUE, 1.2, 'mixed',
  'Urban farmer growing seasonal vegetables. Fresh produce delivered same day.',
  8
WHERE NOT EXISTS (SELECT 1 FROM farmers WHERE phone = '9845012346');

INSERT INTO farmers (name, phone, latitude, longitude, address, city, pincode,
  is_verified, verification_status, phone_verified, profile_completed,
  farm_size_acres, farming_type, bio, farming_experience_years)
SELECT
  'Suresh Reddy', '9845012347', 13.06200, 77.58900,
  'Devanahalli, near BIAL', 'Bengaluru Rural', '562110',
  FALSE, 'pending', TRUE, TRUE, 8.0, 'conventional',
  'Large scale vegetable and fruit cultivation near international airport zone.',
  25
WHERE NOT EXISTS (SELECT 1 FROM farmers WHERE phone = '9845012347');

-- Demo consumers
INSERT INTO consumers (name, phone, latitude, longitude, delivery_address,
  city, pincode, phone_verified, profile_completed, preferred_delivery_time)
SELECT
  'Arjun Mehta', '9900012345', 12.97160, 77.59460,
  'Flat 302, Prestige Apartments, Jayanagar 4th Block', 'Bengaluru', '560041',
  TRUE, TRUE, 'morning'
WHERE NOT EXISTS (SELECT 1 FROM consumers WHERE phone = '9900012345');

INSERT INTO consumers (name, phone, latitude, longitude, delivery_address,
  city, pincode, phone_verified, profile_completed, preferred_delivery_time)
SELECT
  'Priya Sharma', '9900012346', 12.93520, 77.62450,
  'No. 18, 3rd Cross, Koramangala 5th Block', 'Bengaluru', '560095',
  TRUE, TRUE, 'evening'
WHERE NOT EXISTS (SELECT 1 FROM consumers WHERE phone = '9900012346');

-- Demo products for each verified farmer
DO $$
DECLARE
  farmer1_id INTEGER;
  farmer2_id INTEGER;
BEGIN
  SELECT id INTO farmer1_id FROM farmers WHERE phone = '9845012345';
  SELECT id INTO farmer2_id FROM farmers WHERE phone = '9845012346';

  -- Farmer 1 products
  INSERT INTO products (farmer_id, name, category, description, price, unit, stock_available,
    is_organic, primary_image_url, is_active, order_count, view_count)
  SELECT farmer1_id, 'Organic Cherry Tomatoes', 'vegetables',
    'Sweet cherry tomatoes grown without pesticides. Harvested fresh every morning.',
    60, 'kg', 40, TRUE, NULL, TRUE, 12, 87
  WHERE farmer1_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM products WHERE farmer_id = farmer1_id AND name = 'Organic Cherry Tomatoes');

  INSERT INTO products (farmer_id, name, category, description, price, unit, stock_available,
    is_organic, primary_image_url, is_active, order_count, view_count)
  SELECT farmer1_id, 'Fresh Spinach', 'vegetables',
    'Tender spinach leaves rich in iron. Harvested twice weekly.',
    30, 'bunch', 60, TRUE, NULL, TRUE, 8, 45
  WHERE farmer1_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM products WHERE farmer_id = farmer1_id AND name = 'Fresh Spinach');

  -- Farmer 2 products
  INSERT INTO products (farmer_id, name, category, description, price, unit, stock_available,
    is_organic, primary_image_url, is_active, order_count, view_count)
  SELECT farmer2_id, 'Fresh Cow Milk', 'dairy',
    'Farm fresh A2 milk from our own cows. No preservatives. Morning delivery.',
    65, 'litre', 15, FALSE, NULL, TRUE, 20, 134
  WHERE farmer2_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM products WHERE farmer_id = farmer2_id AND name = 'Fresh Cow Milk');
END $$;

-- Verify seed data
SELECT 'Farmers' AS entity, COUNT(*) AS count FROM farmers
UNION ALL
SELECT 'Consumers', COUNT(*) FROM consumers
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders;
