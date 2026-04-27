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

// Use fallback upload middleware since Cloudinary exports were changed
const uploadFallback = cloudinaryConfig.uploadFallback;

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
