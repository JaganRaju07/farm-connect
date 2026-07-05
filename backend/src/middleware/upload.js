const multer = require('multer');

/**
 * STUDY NOTE — What is Multer?
 * Multer is Express middleware that handles multipart/form-data (file uploads).
 * When a form submits a file, HTTP sends it as multipart/form-data format.
 * Multer parses this format and gives you access to req.file or req.files.
 * 
 * Memory storage: stores file in RAM as Buffer (good for small images)
 * Disk storage: saves file to disk first (good for large files)
 * We use memory storage since we immediately upload to Cloudinary.
 */

const storage = multer.memoryStorage(); // Store in RAM, not disk

const fileFilter = (req, file, cb) => {
  // Only accept image files
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum
    files: 1                    // Only one file at a time
  }
});

// For multiple images (up to 4 product images)
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 4
  }
});

module.exports = { upload, uploadMultiple };
