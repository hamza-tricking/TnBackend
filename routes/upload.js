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
const { uploadImage, uploadVideo, uploadMixed } = require('../config/cloudinary');

// Image upload routes
router.post('/image/single', uploadImage.single('image'), uploadSingleImage);
router.post('/image/multiple', uploadImage.array('images', 10), uploadMultipleImages);

// Video upload routes
router.post('/video/single', uploadVideo.single('video'), uploadSingleVideo);
router.post('/video/multiple', uploadVideo.array('videos', 5), uploadMultipleVideos);

// Mixed files upload (both images and videos)
router.post('/mixed', uploadMixed.array('files', 15), uploadMixedFiles);

// Delete file
router.delete('/delete', deleteFile);

module.exports = router;
