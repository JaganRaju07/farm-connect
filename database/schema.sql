-- schema.sql
DROP TABLE IF EXISTS payments CASCADE; [cite: 27]
DROP TABLE IF EXISTS orders CASCADE; [cite: 28]
DROP TABLE IF EXISTS products CASCADE; [cite: 28]
DROP TABLE IF EXISTS consumers CASCADE; [cite: 28]
DROP TABLE IF EXISTS farmers CASCADE; [cite: 29]
DROP TABLE IF EXISTS admins CASCADE; [cite: 29]
DROP TABLE IF EXISTS otp_store CASCADE; [cite: 29]

CREATE TABLE farmers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    city VARCHAR(100) NOT NULL, [cite: 5, 6]
    area VARCHAR(255),
    pincode VARCHAR(10),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(20) DEFAULT 'pending' 
        CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    aadhaar_number VARCHAR(12),
    land_ownership_proof VARCHAR(500),
    farm_size_acres DECIMAL(10, 2),
    farming_type VARCHAR(20) CHECK (farming_type IN ('organic', 'conventional', 'mixed')),
    is_active BOOLEAN DEFAULT TRUE, [cite: 6, 7]
    phone_verified BOOLEAN DEFAULT FALSE, [cite: 7]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, [cite: 7]
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP [cite: 7]
);
CREATE INDEX idx_farmers_city ON farmers(city); [cite: 8]
CREATE INDEX idx_farmers_phone ON farmers(phone); [cite: 8]
CREATE INDEX idx_farmers_verification ON farmers(verification_status); [cite: 8]

CREATE TABLE consumers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    city VARCHAR(100) NOT NULL,
    delivery_address TEXT,
    pincode VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, [cite: 9, 10]
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP [cite: 10]
);
CREATE INDEX idx_consumers_city ON consumers(city); [cite: 10]
CREATE INDEX idx_consumers_phone ON consumers(phone); [cite: 10]

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    unit VARCHAR(20) NOT NULL,
    stock_available INTEGER DEFAULT 0 CHECK (stock_available >= 0),
    minimum_order_quantity INTEGER DEFAULT 1, [cite: 11, 12]
    low_stock_threshold INTEGER DEFAULT 10, [cite: 12]
    image_url VARCHAR(500), [cite: 12]
    is_organic BOOLEAN DEFAULT FALSE, [cite: 12]
    harvest_date DATE, [cite: 12]
    is_active BOOLEAN DEFAULT TRUE, [cite: 12]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, [cite: 12]
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP [cite: 12]
);
CREATE INDEX idx_products_farmer ON products(farmer_id); [cite: 13]
CREATE INDEX idx_products_category ON products(category); [cite: 13]
CREATE INDEX idx_products_active ON products(is_active); [cite: 13]
CREATE INDEX idx_products_stock ON products(stock_available); [cite: 13]

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    consumer_id INTEGER NOT NULL REFERENCES consumers(id),
    farmer_id INTEGER NOT NULL REFERENCES farmers(id),
    items JSONB NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 30,
    total_amount DECIMAL(10, 2) NOT NULL, [cite: 14, 15]
    delivery_address TEXT NOT NULL, [cite: 15]
    delivery_city VARCHAR(100) NOT NULL, [cite: 15]
    delivery_pincode VARCHAR(10), [cite: 15]
    order_status VARCHAR(20) DEFAULT 'pending'
        CHECK (order_status IN ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned')), [cite: 15]
    payment_status VARCHAR(20) DEFAULT 'cod_pending'
        CHECK (payment_status IN ('cod_pending', 'paid', 'refunded', 'failed')), [cite: 15]
    payment_method VARCHAR(20) DEFAULT 'cod'
        CHECK (payment_method IN ('cod', 'online', 'wallet')), [cite: 15, 16]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, [cite: 16]
    confirmed_at TIMESTAMP, [cite: 16]
    delivered_at TIMESTAMP, [cite: 16]
    consumer_notes TEXT, [cite: 16]
    farmer_notes TEXT [cite: 16]
);
CREATE INDEX idx_orders_consumer ON orders(consumer_id); [cite: 17]
CREATE INDEX idx_orders_farmer ON orders(farmer_id); [cite: 17]
CREATE INDEX idx_orders_status ON orders(order_status); [cite: 17]
CREATE INDEX idx_orders_created ON orders(created_at DESC); [cite: 18]

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded')),
    transaction_id VARCHAR(255),
    gateway_response JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, [cite: 18, 19]
    completed_at TIMESTAMP [cite: 19]
);
CREATE INDEX idx_payments_order ON payments(order_id); [cite: 20]
CREATE INDEX idx_payments_status ON payments(payment_status); [cite: 20]

CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'moderator'
        CHECK (role IN ('super_admin', 'moderator')),
    permissions JSONB,
    is_active BOOLEAN DEFAULT TRUE, [cite: 21, 22]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP [cite: 22]
);
CREATE INDEX idx_admins_email ON admins(email); [cite: 22]

CREATE TABLE otp_store (
    phone VARCHAR(15) PRIMARY KEY,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('farmer', 'consumer')),
    action VARCHAR(20) NOT NULL CHECK (action IN ('register', 'login')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_otp_expires ON otp_store(expires_at); [cite: 23, 24]

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP; [cite: 30]
    RETURN NEW; [cite: 30, 31]
END;
$$ language 'plpgsql'; [cite: 31]

CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON farmers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); [cite: 31]
CREATE TRIGGER update_consumers_updated_at BEFORE UPDATE ON consumers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); [cite: 32]
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); [cite: 33]