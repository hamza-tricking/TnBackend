const { cloudinary } = require('../config/cloudinary');

// Upload single image
const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    const result = req.file; // File is already uploaded by Cloudinary middleware

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.path,
        public_id: result.filename,
        original_name: result.originalname,
        size: result.size,
        format: result.format
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
      url: file.path,
      public_id: file.filename,
      original_name: file.originalname,
      size: file.size,
      format: file.format
    }));

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

    const result = req.file; // File is already uploaded by Cloudinary middleware

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        url: result.path,
        public_id: result.filename,
        original_name: result.originalname,
        size: result.size,
        format: result.format,
        duration: result.duration || null
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
      url: file.path,
      public_id: file.filename,
      original_name: file.originalname,
      size: file.size,
      format: file.format,
      duration: file.duration || null
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

    const uploadPromises = req.files.map(async (file) => {
      const isVideo = file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';
      const folder = isVideo ? 'tn-videos' : 'tn-images';

      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: folder,
            public_id: `${resourceType}-${Date.now()}-${Math.round(Math.random() * 1E9)}`
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
                original_name: file.originalname,
                size: file.size,
                format: result.format,
                type: resourceType,
                duration: result.duration || null
              });
            }
          }
        ).end(file.buffer);
      });
    });

    const uploadedFiles = await Promise.all(uploadPromises);

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

// Delete file from Cloudinary
const deleteFile = async (req, res) => {
  try {
    const { public_id, resource_type = 'image' } = req.body;

    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type
    });

    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found or already deleted'
      });
    }
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
