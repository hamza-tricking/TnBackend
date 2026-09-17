const fs = require('fs');
const path = require('path');
const { getFileUrl, uploadsRootDir } = require('../config/storage');

// Upload single image
const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const url = getFileUrl(req.file);
    console.log('✅ Image uploaded locally:', url);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url,
        filename: req.file.filename,
        original_name: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

// Upload multiple images
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const uploadedImages = req.files.map(file => ({
      url: getFileUrl(file),
      filename: file.filename,
      original_name: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));

    console.log('✅ Successfully uploaded images:', uploadedImages.length);

    res.status(200).json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
};

// Upload single video
const uploadSingleVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const url = getFileUrl(req.file);
    console.log('✅ Video uploaded locally:', url);

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        url,
        filename: req.file.filename,
        original_name: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading video',
      error: error.message
    });
  }
};

// Upload multiple videos
const uploadMultipleVideos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No video files provided'
      });
    }

    const uploadedVideos = req.files.map(file => ({
      url: getFileUrl(file),
      filename: file.filename,
      original_name: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.status(200).json({
      success: true,
      message: `${uploadedVideos.length} videos uploaded successfully`,
      data: uploadedVideos
    });
  } catch (error) {
    console.error('Error uploading videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading videos',
      error: error.message
    });
  }
};

// Upload mixed files (images and videos)
const uploadMixedFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      url: getFileUrl(file),
      filename: file.filename,
      original_name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image'
    }));

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
};

// Delete file from local uploads
const deleteFile = async (req, res) => {
  try {
    const { url, filename } = req.body;

    let targetPath = null;
    if (filename) {
      targetPath = path.join(uploadsRootDir, filename);
    } else if (url) {
      const match = url.match(/\/uploads\/(.+)$/);
      if (match) {
        targetPath = path.join(uploadsRootDir, match[1]);
      }
    }

    if (targetPath && fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      return res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    }

    res.status(404).json({
      success: false,
      message: 'File not found on server'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleVideo,
  uploadMultipleVideos,
  uploadMixedFiles,
  deleteFile
};
