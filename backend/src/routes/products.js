const express = require('express');
const router = express.Router();
// 1. Import the new location service instead of the old database query
const { getProductsInRadius, validateCoordinates } = require('../services/location.service');

router.get('/', async (req, res) => {
  try {
    // 2. Extract lat, lon, and radius instead of city
    const { lat, lon, radius, category, minPrice, maxPrice, isOrganic, search } = req.query;

    // 3. Validate the GPS coordinates if provided
    let parsedLat = null;
    let parsedLon = null;
    if (lat && lat !== 'null' && lat !== 'undefined') {
      const validation = validateCoordinates(lat, lon);
      if (!validation.valid) {
        return res.status(400).json({ success: false, message: validation.error });
      }
      parsedLat = parseFloat(lat);
      parsedLon = parseFloat(lon);
    }

    // 4. Bundle the optional filters
    const filters = {
      category,
      search,
      minPrice: (minPrice && !isNaN(Number(minPrice))) ? Number(minPrice) : undefined,
      maxPrice: (maxPrice && !isNaN(Number(maxPrice))) ? Number(maxPrice) : undefined,
      isOrganic: isOrganic !== undefined ? String(isOrganic) === 'true' : undefined,
    };

    // 5. Fetch products using the Haversine distance function (or all if no location)
    const dbProducts = await getProductsInRadius(
      parsedLat, 
      parsedLon, 
      radius ? parseFloat(radius) : 10, 
      filters
    );

    // Map snake_case database fields to camelCase for the frontend
    const products = dbProducts.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      price: p.price,
      unit: p.unit,
      stockAvailable: p.stock_available,
      minimumOrderQuantity: p.minimum_order_quantity,
      imageUrl: p.image_url,
      isOrganic: p.is_organic,
      isActive: true,
      farmerId: p.farmer_id,
      farmerName: p.farmer_name,
      farmerCity: p.farmer_city,
      farmerLat: p.farmer_latitude,
      farmerLon: p.farmer_longitude,
      distance_km: p.distance_km,
      rating: p.rating,
      reviews_count: p.reviews_count,
      harvestDate: p.harvest_date,
      createdAt: p.created_at
    }));

    res.json({ success: true, data: products });
  } catch (err) {
    require('fs').writeFileSync('C:\\Users\\Lenovo\\farm-connect\\backend\\error.log', String(err.stack || err.message));
    console.error('Error fetching nearby products:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = require('../config/database');
    const result = await db.query(
      `SELECT p.*, 
              f.name as farmer_name, 
              f.city as farmer_city, 
              f.latitude as farmer_latitude, 
              f.longitude as farmer_longitude 
       FROM products p 
       JOIN farmers f ON p.farmer_id = f.id 
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const p = result.rows[0];
    const product = {
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      price: p.price,
      unit: p.unit,
      stockAvailable: p.stock_available,
      minimumOrderQuantity: p.minimum_order_quantity,
      imageUrl: p.primary_image_url || p.image_url,
      isOrganic: p.is_organic,
      isActive: p.is_active,
      farmerId: p.farmer_id,
      farmerName: p.farmer_name,
      farmerCity: p.farmer_city,
      farmerLat: p.farmer_latitude,
      farmerLon: p.farmer_longitude,
      rating: p.rating,
      reviews_count: p.reviews_count,
      harvestDate: p.harvest_date,
      createdAt: p.created_at
    };

    res.json({ success: true, data: product });
  } catch (err) {
    console.error('Error fetching product by id:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;