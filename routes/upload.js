const express = require('express');
const router = express.Router();
const {
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleVideo,
  uploadMultipleVideos,
  uploadMixedFiles,
  deleteFile
} = require('../controllers/uploadController');
const cloudinaryConfig = require('../config/cloudinary');
const multer = require('multer');

// Use fallback upload middleware since Cloudinary exports were changed
let uploadFallback;
if (cloudinaryConfig && cloudinaryConfig.uploadFallback) {
  uploadFallback = cloudinaryConfig.uploadFallback;
  console.log('Using uploadFallback from cloudinary config');
} else {
  console.log('uploadFallback not found, creating new one');
  uploadFallback = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 200 * 1024 * 1024 // 200MB limit
    }
  });
}

// Image upload routes
router.post('/image/single', uploadFallback.single('image'), uploadSingleImage);
router.post('/image/multiple', uploadFallback.array('images', 10), uploadMultipleImages);

// Video upload routes
router.post('/video/single', uploadFallback.single('video'), uploadSingleVideo);
router.post('/video/multiple', uploadFallback.array('videos', 5), uploadMultipleVideos);

// Mixed files upload (both images and videos)
router.post('/mixed', uploadFallback.array('files', 15), uploadMixedFiles);

// Delete file
router.delete('/delete', deleteFile);

module.exports = router;
