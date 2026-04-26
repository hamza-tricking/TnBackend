const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tn-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `image-${uniqueSuffix}`;
    }
  }
});

// Configure storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tn-videos',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    resource_type: 'video',
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `video-${uniqueSuffix}`;
    }
  }
});

// Multer upload middleware
const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for images
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
  }
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, MOV, AVI, MKV, and WebM videos are allowed.'), false);
    }
  }
});

// Upload multiple files (both images and videos)
const uploadMixed = multer({
  storage: multer.diskStorage({}),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

module.exports = {
  cloudinary,
  uploadImage,
  uploadVideo,
  uploadMixed
};
