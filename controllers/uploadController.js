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

    console.log('📤 Received single file for upload:', req.file.originalname);
    console.log('📋 File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? 'Buffer present' : 'No buffer'
    });

    let result;
    
    // For memory storage, we need to upload to Cloudinary
    if (cloudinary && cloudinary.uploader) {
      console.log('☁️ Cloudinary available - Uploading single image to Cloudinary:', req.file.originalname);
      
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'tn-shopping/products',
            public_id: `product_${Date.now()}_${req.file.originalname.split('.')[0]}`
          },
          (error, result) => {
            if (error) {
              console.log('❌ Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('✅ Cloudinary upload success:', result.secure_url);
              resolve(result);
            }
          }
        ).end(req.file.buffer);
      });
    } else {
      // Fallback: create a data URL for memory storage
      console.log('⚠️ Cloudinary not available - Creating data URL for single image:', req.file.originalname);
      const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      result = {
        secure_url: dataUrl,
        public_id: `temp_${Date.now()}_${req.file.originalname.split('.')[0]}`,
        format: req.file.mimetype.split('/')[1]
      };
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        original_name: req.file.originalname,
        size: req.file.size,
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

    console.log('📤 Received files for upload:', req.files.length);

    const uploadedImages = [];
    
    for (const file of req.files) {
      try {
        // For memory storage, we need to upload to Cloudinary
        if (cloudinary && cloudinary.uploader) {
          console.log('☁️ Uploading to Cloudinary:', file.originalname);
          
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                resource_type: 'image',
                folder: 'tn-shopping/products',
                public_id: `product_${Date.now()}_${file.originalname.split('.')[0]}`
              },
              (error, result) => {
                if (error) {
                  console.log('❌ Cloudinary upload error:', error);
                  reject(error);
                } else {
                  console.log('✅ Cloudinary upload success:', result.secure_url);
                  resolve(result);
                }
              }
            ).end(file.buffer);
          });

          uploadedImages.push({
            url: result.secure_url,
            public_id: result.public_id,
            original_name: file.originalname,
            size: file.size,
            format: result.format
          });
        } else {
          // Fallback: create a data URL for memory storage
          console.log('📦 Creating data URL for:', file.originalname);
          const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
          
          uploadedImages.push({
            url: dataUrl,
            public_id: `temp_${Date.now()}_${file.originalname.split('.')[0]}`,
            original_name: file.originalname,
            size: file.size,
            format: file.mimetype.split('/')[1]
          });
        }
      } catch (error) {
        console.error('❌ Error uploading single image:', error);
        // Continue with other images even if one fails
      }
    }

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
