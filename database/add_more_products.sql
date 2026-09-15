DO $$
DECLARE
 f1 INTEGER; f2 INTEGER; f3 INTEGER;
BEGIN
 SELECT id INTO f1 FROM farmers WHERE phone = '9845000001';
 SELECT id INTO f2 FROM farmers WHERE phone = '9845000002';
 SELECT id INTO f3 FROM farmers WHERE phone = '9845000003';

 IF f1 IS NOT NULL THEN
   INSERT INTO products (farmer_id, name, category, description, price, unit, stock_available, is_organic, is_active, average_rating, review_count, harvest_date)
   VALUES
   (f1, 'Organic Carrots', 'vegetables', 'Crunchy, sweet, and freshly harvested organic carrots.', 60, 'kg', 30, TRUE, TRUE, 4.8, 10, NOW() - INTERVAL '1 day'),
   (f1, 'Fresh Coriander', 'vegetables', 'Aromatic fresh coriander leaves directly from the farm.', 20, 'bunch', 50, TRUE, TRUE, 4.9, 25, NOW())
   ON CONFLICT DO NOTHING;
 END IF;

 IF f2 IS NOT NULL THEN
   INSERT INTO products (farmer_id, name, category, description, price, unit, stock_available, is_organic, is_active, average_rating, review_count, harvest_date)
   VALUES
   (f2, 'Homemade Paneer', 'dairy', 'Soft, fresh paneer made from pure A2 cow milk.', 250, 'kg', 15, FALSE, TRUE, 4.7, 18, NOW()),
   (f2, 'Fresh Ghee', 'dairy', 'Traditional pure cow ghee with rich aroma.', 550, '500g', 10, FALSE, TRUE, 5.0, 30, NOW() - INTERVAL '2 days')
   ON CONFLICT DO NOTHING;
 END IF;

 IF f3 IS NOT NULL THEN
   INSERT INTO products (farmer_id, name, category, description, price, unit, stock_available, is_organic, is_active, average_rating, review_count, harvest_date)
   VALUES
   (f3, 'Yelakki Bananas', 'fruits', 'Sweet and delicious local Yelakki bananas.', 75, 'dozen', 40, FALSE, TRUE, 4.6, 22, NOW() - INTERVAL '1 day'),
   (f3, 'Raw Mangoes', 'fruits', 'Perfect tart raw mangoes for pickles and cooking.', 40, 'kg', 25, FALSE, TRUE, 4.4, 8, NOW() - INTERVAL '3 days'),
   (f3, 'Fresh Cabbage', 'vegetables', 'Crisp, tightly packed fresh green cabbage.', 35, 'kg', 20, FALSE, TRUE, 4.5, 12, NOW() - INTERVAL '1 day'),
   (f3, 'Sweet Potatoes', 'vegetables', 'Nutritious, naturally sweet local potatoes.', 45, 'kg', 35, FALSE, TRUE, 4.7, 14, NOW() - INTERVAL '2 days')
   ON CONFLICT DO NOTHING;
 END IF;
END $$;
