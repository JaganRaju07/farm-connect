CREATE TABLE IF NOT EXISTS consumer_wishlist (
 id SERIAL PRIMARY KEY,
 consumer_id INTEGER NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
 product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(consumer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_consumer ON consumer_wishlist(consumer_id);

COMMENT ON TABLE consumer_wishlist IS
 'Products saved by consumers for later purchase';
