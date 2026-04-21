const express = require('express');
const router = express.Router();
// 1. Import the new location service instead of the old database query
const { getProductsInRadius, validateCoordinates } = require('../services/location.service');

router.get('/', async (req, res) => {
  try {
    // 2. Extract lat, lon, and radius instead of city
    const { lat, lon, radius, category, minPrice, maxPrice, isOrganic } = req.query;

    // 3. Validate the GPS coordinates before hitting the database
    const validation = validateCoordinates(lat, lon);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    // 4. Bundle the optional filters
    const filters = {
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      isOrganic: isOrganic !== undefined ? isOrganic === 'true' : undefined,
    };

    // 5. Fetch products using the Haversine distance function
    // We default to a 10km radius if the frontend doesn't specify one
    const products = await getProductsInRadius(
      parseFloat(lat), 
      parseFloat(lon), 
      radius ? parseFloat(radius) : 10, 
      filters
    );

    res.json({ success: true, data: products });
  } catch (err) {
    console.error('Error fetching nearby products:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;