const express = require('express');
const router = express.Router();
const { getProductsByCity } = require('../services/database.service');

router.get('/', async (req, res) => {
  try {
    const { city, category, minPrice, maxPrice, isOrganic } = req.query;

    if (!city) {
      return res.status(400).json({ success: false, message: 'city query parameter is required' });
    }

    const products = await getProductsByCity({
      city, category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      isOrganic: isOrganic !== undefined ? isOrganic === 'true' : undefined,
    });

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;