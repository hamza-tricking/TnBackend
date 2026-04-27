const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Check if Cloudinary environment variables are available
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary only if environment variables are available
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary configured successfully');
} else {
  console.log('Cloudinary environment variables not found');
}

// Fallback multer configuration for when Cloudinary is not available
const uploadFallback = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

module.exports = {
  cloudinary: isCloudinaryConfigured ? cloudinary : null,
  isConfigured: isCloudinaryConfigured,
  uploadFallback
};
