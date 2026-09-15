const express = require('express');
const router = express.Router();
const db = require('../config/database');
const {
  adminLogin,
  getAnalytics,
  getFarmers,
  getConsumers,
  getOrders,
  suspendFarmer,
  reinstateFarmer,
  getPendingVerifications,
  approveFarmerVerification,
  rejectFarmerVerification,
  getPlatformAnalytics
} = require('../controllers/admin.controller');

const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Public
router.post('/login', adminLogin);

// All below require admin JWT
router.use(authenticateToken, roleAuth(['admin']));

// Analytics
router.get('/analytics', getAnalytics);
router.get('/platform-analytics', getPlatformAnalytics);

// Farmer management
router.get('/farmers', getFarmers);
router.patch('/farmers/:id/suspend', suspendFarmer);
router.patch('/farmers/:id/reinstate', reinstateFarmer);

// Verification workflow
router.get('/verifications/pending', getPendingVerifications);
router.post('/verifications/:farmerId/approve', approveFarmerVerification);
router.post('/verifications/:farmerId/reject', rejectFarmerVerification);

// Consumer management
router.get('/consumers', getConsumers);

// Orders
router.get('/orders', getOrders);

module.exports = router;
