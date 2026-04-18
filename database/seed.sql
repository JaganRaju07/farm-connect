-- FARM CONNECT - SEED DATA
-- PostgreSQL 15+

INSERT INTO admins (name, email, phone, password_hash, role, permissions) VALUES
('Manas Choksi', 'manas@farmconnect.in', '9000000001', '$2b$12$KIX8HRhiERANBbFP1MrLq.dkQk9.EHNiX5vSbmS0RKHbCGwZ7RkSa', 'super_admin', '{"verify_farmers": true, "manage_orders": true, "manage_admins": true, "view_reports": true}'),
('Preethi Admin', 'preethi@farmconnect.in', '9000000002', '$2b$12$KIX8HRhiERANBbFP1MrLq.dkQk9.EHNiX5vSbmS0RKHbCGwZ7RkSa', 'moderator', '{"verify_farmers": true, "manage_orders": true, "manage_admins": false, "view_reports": true}'),
('Vikram Ops', 'vikram@farmconnect.in', '9000000003', '$2b$12$KIX8HRhiERANBbFP1MrLq.dkQk9.EHNiX5vSbmS0RKHbCGwZ7RkSa', 'moderator', '{"verify_farmers": false, "manage_orders": true, "manage_admins": false, "view_reports": false}');

INSERT INTO farmers (name, phone, email, city, area, pincode, is_verified, verification_status, phone_verified, aadhaar_number, farm_size_acres, farming_type) VALUES
('Ravi Kumar', '9876543210', 'ravi@example.com', 'bengaluru', 'Kanakapura Road', '560062', TRUE, 'approved', TRUE, '123456789012', 5.50, 'organic'),
('Lakshmi Devi', '9876543211', 'lakshmi@example.com', 'mysuru', 'KRS Road', '570016', TRUE, 'approved', TRUE, '234567890123', 8.00, 'conventional'),
('Suresh Reddy', '9876543212', 'suresh@example.com', 'hubli', 'Vidyanagar', '580031', FALSE, 'pending', TRUE, '345678901234', 3.25, 'mixed'),
('Annapurna Bai', '9876543213', 'anna@example.com', 'bengaluru', 'Attibele', '562107', TRUE, 'approved', TRUE, '456789012345', 12.00, 'organic'),
('Mahesh Patil', '9876543214', 'mahesh@example.com', 'belagavi', 'Tilakwadi', '590006', FALSE, 'rejected', TRUE, '567890123456', 2.00, 'conventional'),
('Geetha Nair', '9876543215', NULL, 'mangaluru', 'Kadri', '575002', TRUE, 'approved', TRUE, '678901234567', 6.75, 'organic');

INSERT INTO consumers (name, phone, email, city, delivery_address, pincode, phone_verified) VALUES
('Arjun Mehta', '9988776655', 'arjun@example.com', 'bengaluru', '123, Jayanagar 4th Block, Bengaluru', '560041', TRUE),
('Priya Shah', '9988776656', 'priya@example.com', 'bengaluru', '45, Koramangala 5th Block, Bengaluru', '560095', TRUE),
('Rohan Shetty', '9988776657', 'rohan@example.com', 'mysuru', '8, Lakshmipuram Main Road, Mysuru', '570004', TRUE),
('Divya Hegde', '9988776658', 'divya@example.com', 'mangaluru', '22, Hampankatta, Mangaluru', '575001', TRUE),
('Kiran Rao', '9988776659', 'kiran@example.com', 'bengaluru', '77, HSR Layout Sector 4, Bengaluru', '560102', FALSE),
('Sneha Kulkarni', '9988776660', NULL, 'hubli', '12, Vidyanagar Cross, Hubli', '580021', TRUE);

INSERT INTO products (farmer_id, name, category, description, price, unit, stock_available, minimum_order_quantity, low_stock_threshold, is_organic, harvest_date, is_active) VALUES
(1, 'Organic Tomatoes', 'vegetables', 'Vine-ripened organic tomatoes, rich in lycopene', 40.00, 'kg', 120, 1, 15, TRUE, '2026-04-10', TRUE),
(1, 'Fresh Spinach', 'vegetables', 'Tender baby spinach, pesticide-free', 25.00, 'bunch', 60, 1, 10, TRUE, '2026-04-12', TRUE),
(2, 'Alphonso Mangoes', 'fruits', 'Premium GI-tagged Alphonso mangoes', 150.00, 'dozen', 30, 1, 5, FALSE, '2026-04-08', TRUE),
(2, 'Organic Carrots', 'vegetables', 'Crunchy orange carrots with high beta-carotene', 35.00, 'kg', 75, 1, 12, TRUE, '2026-04-09', TRUE),
(4, 'Rose Onions', 'vegetables', 'Small Bangalore rose onions — sweeter and less pungent', 45.00, 'kg', 60, 1, 10, FALSE, '2026-04-05', TRUE),
(6, 'Coconuts', 'fruits', 'Large, water-filled tender coconuts from coastal farm', 30.00, 'piece', 150, 2, 20, TRUE, '2026-04-08', TRUE);

INSERT INTO orders (order_number, consumer_id, farmer_id, items, subtotal, delivery_fee, total_amount, delivery_address, delivery_city, delivery_pincode, order_status, payment_status, payment_method, confirmed_at, delivered_at) VALUES
('ORD-20260401-001', 1, 1, '[{"productId": 1, "name": "Organic Tomatoes", "quantity": 3, "price": 40.00, "unit": "kg"}]'::jsonb, 170.00, 30.00, 200.00, '123, Jayanagar 4th Block, Bengaluru', 'bengaluru', '560041', 'delivered', 'paid', 'cod', '2026-04-01 11:00:00', '2026-04-02 14:30:00');

INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_id, completed_at) VALUES
(1, 200.00, 'cod', 'success', NULL, '2026-04-02 14:30:00');

INSERT INTO otp_store (phone, otp_code, expires_at, user_type, action) VALUES
('9876543216', '472819', NOW() + INTERVAL '5 minutes', 'farmer', 'register'),
('9988776661', '315940', NOW() + INTERVAL '5 minutes', 'consumer', 'login');