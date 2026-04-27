const express = require('express');
const router = express.Router();
const HomeContent = require('../models/HomeContent');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure temporary storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

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

// Update home content (protected route)
router.put('/', auth, async (req, res) => {
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
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // For now, return placeholder URLs since Cloudinary is not configured
    // In production, you would upload to Cloudinary or another file service
    const uploadedFiles = req.files.map(file => {
      const isImage = file.mimetype.startsWith('image/');
      const isVideo = file.mimetype.startsWith('video/');
      
      // Generate a placeholder URL based on file type
      let placeholderUrl;
      if (isImage) {
        placeholderUrl = `/assets/placeholder-image.jpg`;
      } else if (isVideo) {
        placeholderUrl = `/assets/placeholder-video.mp4`;
      } else {
        placeholderUrl = `/assets/placeholder-file.jpg`;
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
      message: 'Files processed successfully (placeholder mode)', 
      files: uploadedFiles 
    });
  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).json({ message: 'Error processing files', error: error.message });
  }
});

// Update specific sections
router.put('/hero', auth, async (req, res) => {
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

router.put('/about', auth, async (req, res) => {
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

router.put('/videos', auth, async (req, res) => {
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

router.put('/suggested-products', auth, async (req, res) => {
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

router.put('/reels', auth, async (req, res) => {
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

router.put('/reviews', auth, async (req, res) => {
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

router.put('/brazilian', auth, async (req, res) => {
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
