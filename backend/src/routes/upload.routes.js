const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { uploadImage } = require('../services/cloudinary.service');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No image provided' } });
    }

    const folder = req.query.folder || 'misc';
    const url = await uploadImage(req.file.buffer, folder);

    res.json({
      success: true,
      data: { url }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
