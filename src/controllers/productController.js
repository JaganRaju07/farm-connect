const db = require('../config/db'); // Adjust based on your db connection file

// GET /api/v1/products/search?lat=12.9716&lon=77.5946&radius=30
exports.searchNearbyProducts = async (req, res) => {
    try {
        const { lat, lon, radius } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: "Latitude and Longitude are required." });
        }

        const searchRadius = radius || 30; // default to 30km if not sent

        // This matches Query 3 from your seed.sql file exactly
        const query = `
            SELECT 
                p.id AS product_id, p.name, p.category, p.description, p.price, p.unit, 
                p.stock_available, p.is_organic, p.harvest_date,
                f.id AS farmer_id, f.name AS farmer_name, f.city AS farmer_city,
                calculate_distance_km($1, $2, f.latitude, f.longitude) AS distance_km
            FROM products p
            JOIN farmers f ON p.farmer_id = f.id
            WHERE p.is_active = TRUE 
              AND f.is_verified = TRUE
              AND calculate_distance_km($1, $2, f.latitude, f.longitude) <= $3
            ORDER BY distance_km ASC;
        `;

        const { rows } = await db.query(query, [lat, lon, searchRadius]);
        
        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/v1/products/category/:categoryName
exports.getProductsByCategory = async (req, res) => {
    try {
        const { categoryName } = req.params;
        const query = `
            SELECT p.*, f.name as farmer_name 
            FROM products p 
            JOIN farmers f ON p.farmer_id = f.id 
            WHERE p.category = $1 AND p.is_active = TRUE AND f.is_verified = TRUE
        `;
        const { rows } = await db.query(query, [categoryName]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};