const db = require('../config/db');

// POST /api/v1/consumers/register
exports.registerConsumer = async (req, res) => {
    try {
        const { name, phone, email, latitude, longitude, delivery_address, city, pincode } = req.body;

        const query = `
            INSERT INTO consumers (name, phone, email, latitude, longitude, delivery_address, city, pincode)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, name, phone, city;
        `;

        const { rows } = await db.query(query, [name, phone, email, latitude, longitude, delivery_address, city, pincode]);
        res.status(201).json({ success: true, message: "Consumer registered successfully", data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/consumers/orders
exports.placeOrder = async (req, res) => {
    try {
        const { consumer_id, farmer_id, items, subtotal, delivery_fee, total_amount, consumer_notes } = req.body;

        // 1. Fetch consumer location
        const consumerCheck = await db.query('SELECT latitude, longitude, delivery_address, city, pincode FROM consumers WHERE id = $1', [consumer_id]);
        if (consumerCheck.rows.length === 0) return res.status(404).json({ success: false, message: "Consumer not found" });
        
        const cLoc = consumerCheck.rows[0];

        // 2. Fetch farmer location
        const farmerCheck = await db.query('SELECT latitude, longitude FROM farmers WHERE id = $1', [farmer_id]);
        if (farmerCheck.rows.length === 0) return res.status(404).json({ success: false, message: "Farmer not found" });
        
        const fLoc = farmerCheck.rows[0];

        // 3. Compute distance
        const distRes = await db.query('SELECT calculate_distance_km($1, $2, $3, $4) AS dist', [cLoc.latitude, cLoc.longitude, fLoc.latitude, fLoc.longitude]);
        const distanceKm = distRes.rows[0].dist;

        // 4. Generate order number
        const orderNumber = `FC${Date.now()}`;

        // 5. Insert order
        const orderQuery = `
            INSERT INTO orders (
                order_number, consumer_id, farmer_id, items, subtotal, delivery_fee, total_amount,
                delivery_latitude, delivery_longitude, delivery_address, delivery_city, delivery_pincode,
                delivery_distance_km, consumer_notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING id, order_number, order_status, total_amount;
        `;

        const { rows } = await db.query(orderQuery, [
            orderNumber, consumer_id, farmer_id, JSON.stringify(items), subtotal, delivery_fee, total_amount,
            cLoc.latitude, cLoc.longitude, cLoc.delivery_address, cLoc.city, cLoc.pincode,
            distanceKm, consumer_notes
        ]);

        res.status(201).json({ success: true, message: "Order placed successfully!", order: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/v1/consumers/orders
exports.getOrderHistory = async (req, res) => {
    try {
        const { consumer_id } = req.query;

        if (!consumer_id) {
            return res.status(400).json({ success: false, message: "Please provide a consumer_id parameter." });
        }

        const query = `
            SELECT id, order_number, total_amount, order_status, created_at, items 
            FROM orders 
            WHERE consumer_id = $1 
            ORDER BY created_at DESC;
        `;

        const { rows } = await db.query(query, [consumer_id]);

        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};