const express = require('express');
const router = express.Router();
const { getPlatformAnalytics } = require('../services/analytics.service');

router.get('/platform-analytics', async (req, res, next) => {
 try {
 const analytics = await getPlatformAnalytics();
 res.json({ success: true, data: analytics });
 } catch (error) {
 next(error);
 }
});

module.exports = router;
