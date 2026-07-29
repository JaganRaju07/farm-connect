CREATE TABLE IF NOT EXISTS product_reviews (
 id SERIAL PRIMARY KEY,
 product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 consumer_id INTEGER NOT NULL REFERENCES consumers(id),
 order_id INTEGER NOT NULL REFERENCES orders(id),
 -- Rating: 1 to 5 stars only
 rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
 review_text TEXT,
 review_images TEXT[] DEFAULT '{}',
 -- Admin moderation
 is_approved BOOLEAN DEFAULT TRUE,
 is_flagged BOOLEAN DEFAULT FALSE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 -- One review per consumer per product per order
 UNIQUE(product_id, consumer_id, order_id)
);

-- Index for fetching reviews of a product
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id, is_approved);

-- Index for checking if consumer already reviewed
CREATE INDEX IF NOT EXISTS idx_reviews_consumer ON product_reviews(consumer_id, order_id);

COMMENT ON TABLE product_reviews IS
 'Consumer reviews for products. One review allowed per order per product.';

-- Add rating summary columns to products table for fast reads
-- Instead of calculating AVG every time, store it as a column
ALTER TABLE products
 ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
 ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Function to update product rating summary after every review
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
 UPDATE products
 SET
 average_rating = (
 SELECT ROUND(AVG(rating)::NUMERIC, 2)
 FROM product_reviews
 WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
 AND is_approved = TRUE
 ),
 review_count = (
 SELECT COUNT(*)
 FROM product_reviews
 WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
 AND is_approved = TRUE
 ),
 updated_at = CURRENT_TIMESTAMP
 WHERE id = COALESCE(NEW.product_id, OLD.product_id);
 RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger fires after any insert, update, or delete on reviews
DROP TRIGGER IF EXISTS tr_update_product_rating ON product_reviews;
CREATE TRIGGER tr_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON product_reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Verify table created correctly
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'product_reviews'
ORDER BY ordinal_position;
