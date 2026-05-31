// backend/src/services/cloudinary.service.js

const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

/**
 * Configure Cloudinary with credentials from .env
 * 
 * STUDY NOTE — Environment Variables:
 * Never hardcode API keys in source code.
 * Use process.env to read from .env file.
 * .env file is listed in .gitignore so it is never pushed to GitHub.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image buffer to Cloudinary
 * 
 * STUDY NOTE — Why Buffer instead of File Path?
 * Multer (the file upload middleware) reads the uploaded file into memory
 * as a Buffer (raw bytes). We stream this buffer to Cloudinary directly
 * without saving a temporary file on disk. This is faster and cleaner.
 * 
 * @param {Buffer} buffer - Raw image bytes from multer
 * @param {string} folder - Cloudinary folder name ('products', 'profiles')
 * @param {string} publicId - Optional custom filename
 * @returns {Promise<string>} Secure URL of the uploaded image
 */
async function uploadImage(buffer, folder = 'products', publicId = null) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: `farmconnect/${folder}`,
      resource_type: 'image',
      // Auto-format and quality for compression
      transformation: [
        { width: 800, height: 600, crop: 'limit' }, // Max 800x600
        { quality: 'auto:good' },                    // Auto compress
        { fetch_format: 'auto' }                     // WebP for modern browsers
      ]
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    // Create a readable stream from buffer and pipe to Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Image upload failed'));
        } else {
          resolve(result.secure_url); // HTTPS URL
        }
      }
    );

    // Convert buffer to readable stream
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
}

/**
 * Delete image from Cloudinary (used when product is deleted)
 * 
 * @param {string} imageUrl - The Cloudinary URL to delete
 */
async function deleteImage(imageUrl) {
  try {
    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/cloud/image/upload/v123/farmconnect/folder/filename.jpg
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return;
    
    // Join everything after version number
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remove extension
    
    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Deleted image: ${publicId}`);
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error.message);
    // Non-critical — don't throw, just log
  }
}

module.exports = { uploadImage, deleteImage };
