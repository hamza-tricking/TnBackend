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
const { upload } = require('../config/storage');

// Image upload routes
router.post('/image/single', upload.single('image'), uploadSingleImage);
router.post('/image/multiple', upload.array('images', 10), uploadMultipleImages);

// Video upload routes
router.post('/video/single', upload.single('video'), uploadSingleVideo);
router.post('/video/multiple', upload.array('videos', 5), uploadMultipleVideos);

// Mixed files upload (both images and videos)
router.post('/mixed', upload.array('files', 15), uploadMixedFiles);

// Delete file
router.delete('/delete', deleteFile);

module.exports = router;
