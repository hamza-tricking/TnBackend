const express = require('express');
const router = express.Router();
const HomeContent = require('../models/HomeContent');
const { auth } = require('../middleware/auth');
const multer = require('multer');

// Check if Cloudinary is properly configured
const cloudinaryConfig = require('../config/cloudinary');
const cloudinary = cloudinaryConfig.cloudinary;
const isCloudinaryConfigured = cloudinaryConfig.isConfigured;

let CloudinaryStorage;
if (isCloudinaryConfigured) {
  try {
    const cloudinaryStorageModule = require('multer-storage-cloudinary');
    CloudinaryStorage = cloudinaryStorageModule.CloudinaryStorage || cloudinaryStorageModule.default;
    console.log('CloudinaryStorage module loaded successfully');
  } catch (error) {
    console.log('CloudinaryStorage module not available:', error.message);
    CloudinaryStorage = null;
  }
} else {
  console.log('Cloudinary not configured, using fallback');
  CloudinaryStorage = null;
}

// Configure storage based on Cloudinary availability
let upload;
if (isCloudinaryConfigured && CloudinaryStorage && cloudinary) {
  console.log('Using Cloudinary storage');
  try {
    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'tn-home-content',
        resource_type: 'auto',
        public_id: (req, file) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = file.originalname.split('.').pop();
          return `file-${uniqueSuffix}.${ext}`;
        }
      }
    });
    upload = multer({ storage: storage });
    console.log('Cloudinary storage configured successfully');
  } catch (error) {
    console.error('Error configuring Cloudinary storage:', error);
    console.log('Falling back to memory storage');
    upload = cloudinaryConfig.uploadFallback;
  }
} else {
  console.log('Cloudinary not configured, using fallback storage');
  upload = cloudinaryConfig.uploadFallback;
}

// Get all home content
router.get('/', async (req, res) => {
  try {
    let homeContent = await HomeContent.findOne();
    
    // If no content exists, create default content
    if (!homeContent) {
      homeContent = new HomeContent({
        heroSlides: [],
        aboutUs: {
          title: { ar: 'من نحن', fr: 'À propos de nous', en: 'About Us' },
          subtitle: { ar: 'TN Shopping هو الموقع الرسمي', fr: 'TN Shopping est le site officiel', en: 'TN Shopping is the official website' },
          description: { ar: 'وصف افتراضي', fr: 'Description par défaut', en: 'Default description' },
          features: {
            title: { ar: 'لماذا تختار TN؟', fr: 'Pourquoi choisir TN ?', en: 'Why Choose TN?' },
            items: {
              ar: ['ميزة 1', 'ميزة 2'],
              fr: ['Caractéristique 1', 'Caractéristique 2'],
              en: ['Feature 1', 'Feature 2']
            }
          },
          images: []
        },
        videos: [],
        suggestedProducts: [],
        reels: [],
        reviews: [],
        brazilian: {
          title: { ar: 'أصالة برازيلية', fr: 'Authenticité Brésilienne', en: 'Brazilian Authenticity' },
          subtitle: { ar: 'منتجات أصلية', fr: 'Produits authentiques', en: 'Authentic products' },
          description: { ar: 'وصف افتراضي', fr: 'Description par défaut', en: 'Default description' },
          features: {
            title: { ar: 'لماذا البرازيل؟', fr: 'Pourquoi le Brésil?', en: 'Why Brazil?' },
            items: {
              ar: ['ميزة 1', 'ميزة 2'],
              fr: ['Caractéristique 1', 'Caractéristique 2'],
              en: ['Feature 1', 'Feature 2']
            }
          },
          guarantee: { ar: 'ضمان الأصالة', fr: 'Garantie d\'authenticité', en: 'Authenticity guarantee' }
        }
      });
      await homeContent.save();
    }
    
    res.json(homeContent);
  } catch (error) {
    console.error('Error fetching home content:', error);
    res.status(500).json({ message: 'Error fetching home content', error: error.message });
  }
});

// Update home content
router.put('/', async (req, res) => {
  try {
    let homeContent = await HomeContent.findOne();
    
    if (!homeContent) {
      homeContent = new HomeContent();
    }
    
    // Update all fields from request body
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        homeContent[key] = req.body[key];
      }
    });
    
    await homeContent.save();
    res.json(homeContent);
  } catch (error) {
    console.error('Error updating home content:', error);
    res.status(500).json({ message: 'Error updating home content', error: error.message });
  }
});

// Upload images/videos for home content
router.post('/upload', upload.array('files'), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Files:', req.files);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Check if we're using Cloudinary or fallback storage
    const isCloudinaryConfigured = cloudinary && 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET;

    if (isCloudinaryConfigured) {
      console.log('Using Cloudinary storage');
      
      // Process uploaded files and return their Cloudinary URLs
      const uploadedFiles = req.files.map(file => {
        console.log('Processing file:', file.originalname, 'Path:', file.path);
        return {
          url: file.path, // Cloudinary URL is stored in file.path
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype
        };
      });

      console.log('Files processed:', uploadedFiles);

      res.json({ 
        message: 'Files uploaded successfully to Cloudinary', 
        files: uploadedFiles 
      });
    } else {
      console.log('Using fallback storage (Cloudinary not configured)');
      
      // Fallback to local storage URLs
      const uploadedFiles = req.files.map(file => {
        const isImage = file.mimetype.startsWith('image/');
        let placeholderUrl;
        if (isImage) {
          placeholderUrl = `/assets/ssss.jpg`; // Use existing hero image as fallback
        } else {
          placeholderUrl = `/media/Green Black and Brown Simple Ayurveda Hair Oil Mobile Video.mp4`;
        }
        
        return {
          url: placeholderUrl,
          filename: file.originalname,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype
        };
      });

      res.json({ 
        message: 'Files processed (Cloudinary not configured - using fallback)', 
        files: uploadedFiles 
      });
    }
    
  } catch (error) {
    console.error('Error uploading files:', error);
    console.error('Error details:', error.stack);
    
    // Fallback to local storage on error
    const uploadedFiles = req.files.map(file => {
      const isImage = file.mimetype.startsWith('image/');
      let placeholderUrl;
      if (isImage) {
        placeholderUrl = `/assets/ssss.jpg`;
      } else {
        placeholderUrl = `/media/Green Black and Brown Simple Ayurveda Hair Oil Mobile Video.mp4`;
      }
      
      return {
        url: placeholderUrl,
        filename: file.originalname,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      };
    });

    res.status(500).json({ 
      message: 'Upload error - using fallback', 
      error: error.message,
      files: uploadedFiles 
    });
  }
});

// Update specific sections
router.put('/hero', async (req, res) => {
  try {
    const homeContent = await HomeContent.findOne();
    if (!homeContent) {
      return res.status(404).json({ message: 'Home content not found' });
    }
    
    homeContent.heroSlides = req.body.heroSlides;
    await homeContent.save();
    
    res.json(homeContent.heroSlides);
  } catch (error) {
    console.error('Error updating hero section:', error);
    res.status(500).json({ message: 'Error updating hero section', error: error.message });
  }
});

router.put('/about', async (req, res) => {
  try {
    const homeContent = await HomeContent.findOne();
    if (!homeContent) {
      return res.status(404).json({ message: 'Home content not found' });
    }
    
    homeContent.aboutUs = req.body.aboutUs;
    await homeContent.save();
    
    res.json(homeContent.aboutUs);
  } catch (error) {
    console.error('Error updating about section:', error);
    res.status(500).json({ message: 'Error updating about section', error: error.message });
  }
});

router.put('/videos', async (req, res) => {
  try {
    const homeContent = await HomeContent.findOne();
    if (!homeContent) {
      return res.status(404).json({ message: 'Home content not found' });
    }
    
    homeContent.videos = req.body.videos;
    await homeContent.save();
    
    res.json(homeContent.videos);
  } catch (error) {
    console.error('Error updating videos:', error);
    res.status(500).json({ message: 'Error updating videos', error: error.message });
  }
});

router.put('/suggested-products', async (req, res) => {
  try {
    const homeContent = await HomeContent.findOne();
    if (!homeContent) {
      return res.status(404).json({ message: 'Home content not found' });
    }
    
    homeContent.suggestedProducts = req.body.suggestedProducts;
    await homeContent.save();
    
    res.json(homeContent.suggestedProducts);
  } catch (error) {
    console.error('Error updating suggested products:', error);
    res.status(500).json({ message: 'Error updating suggested products', error: error.message });
  }
});

router.put('/reels', async (req, res) => {
  try {
    const homeContent = await HomeContent.findOne();
    if (!homeContent) {
      return res.status(404).json({ message: 'Home content not found' });
    }
    
    homeContent.reels = req.body.reels;
    await homeContent.save();
    
    res.json(homeContent.reels);
  } catch (error) {
    console.error('Error updating reels:', error);
    res.status(500).json({ message: 'Error updating reels', error: error.message });
  }
});

router.put('/reviews', async (req, res) => {
  try {
    const homeContent = await HomeContent.findOne();
    if (!homeContent) {
      return res.status(404).json({ message: 'Home content not found' });
    }
    
    homeContent.reviews = req.body.reviews;
    await homeContent.save();
    
    res.json(homeContent.reviews);
  } catch (error) {
    console.error('Error updating reviews:', error);
    res.status(500).json({ message: 'Error updating reviews', error: error.message });
  }
});

router.put('/brazilian', async (req, res) => {
  try {
    const homeContent = await HomeContent.findOne();
    if (!homeContent) {
      return res.status(404).json({ message: 'Home content not found' });
    }
    
    homeContent.brazilian = req.body.brazilian;
    await homeContent.save();
    
    res.json(homeContent.brazilian);
  } catch (error) {
    console.error('Error updating brazilian section:', error);
    res.status(500).json({ message: 'Error updating brazilian section', error: error.message });
  }
});

module.exports = router;
