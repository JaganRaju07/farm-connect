const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notification.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', notifController.getNotifications);
router.patch('/read', notifController.markAllRead);
router.patch('/:id/read', notifController.markOneRead);

module.exports = router;
