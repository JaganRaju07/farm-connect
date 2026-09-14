const express = require('express');
const router = express.Router();
const newAuthController = require('../controllers/auth.controller');
const oldAuthController = require('../../../src/controllers/authController');
const authenticateToken = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: errors.array()
      }
    });
  }
  next();
};

// ── Public routes using Jagan's existing logic
router.post('/send-otp',
  [
    body('phone').matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian mobile number'),
    body('userType').isIn(['farmer', 'consumer']).withMessage('userType must be farmer or consumer'),
    body('action').isIn(['register', 'login']).withMessage('action must be register or login'),
    validate
  ],
  oldAuthController.sendOTP
);

router.post('/verify-otp',
  [
    body('phone').matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian mobile number'),
    body('userType').isIn(['farmer', 'consumer']),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
    validate
  ],
  oldAuthController.verifyOTP
);

// ── Protected routes using the new Week 5 logic
router.post('/complete-registration',
  authenticateToken,
  [
    body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name is required'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
    body('city').trim().isLength({ min: 2 }).withMessage('City is required'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    validate
  ],
  newAuthController.completeRegistration
);

router.get('/me',
  authenticateToken,
  newAuthController.getCurrentUser
);

module.exports = router;
