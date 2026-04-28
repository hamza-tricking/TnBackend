const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { HomeContent, Draft } = require('../models/HomeContent');
const { auth } = require('../middleware/auth');

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
        folder: 'drafts', // ALWAYS use drafts folder for all uploads
        resource_type: 'auto',
        public_id: (req, file) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = file.originalname.split('.').pop();
          return `file-${uniqueSuffix}.${ext}`;
        }
      }
    });
    upload = multer({ storage: storage });
    console.log('Cloudinary storage configured successfully - using drafts folder');
  } catch (error) {
    console.error('Error configuring Cloudinary storage:', error);
    console.log('Falling back to memory storage');
    upload = cloudinaryConfig.uploadFallback;
  }
} else {
  console.log('Cloudinary not configured, using fallback storage');
  upload = cloudinaryConfig.uploadFallback;
}

// Fallback multer configuration for when Cloudinary is not available
const uploadFallback = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit (matching server.js)
  }
});

// Get all home content
router.get('/', async (req, res) => {
  try {
    let homeContent = await HomeContent.findOne();
    
    console.log('=== HOME CONTENT DATA ===');
    console.log('Found home content:', homeContent ? 'Yes' : 'No');
    
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
    
    // Log the complete home content data
    console.log('Hero Slides:', homeContent.heroSlides?.length || 0);
    console.log('About Us:', homeContent.aboutUs ? 'Present' : 'Missing');
    console.log('Videos:', homeContent.videos?.length || 0);
    console.log('Suggested Products:', homeContent.suggestedProducts?.length || 0);
    console.log('Reels:', homeContent.reels?.length || 0);
    console.log('Reviews:', homeContent.reviews?.length || 0);
    console.log('Brazilian Content:', homeContent.brazilian ? 'Present' : 'Missing');
    
    // Log detailed data for each section
    if (homeContent.heroSlides && homeContent.heroSlides.length > 0) {
      console.log('--- HERO SLIDES DETAIL ---');
      homeContent.heroSlides.forEach((slide, index) => {
        console.log(`Slide ${index + 1}:`, {
          id: slide.id,
          hasImage: !!slide.image,
          titles: slide.titles,
          showButtons: {
            certification: slide.showCertificationButton,
            explore: slide.showExploreButton,
            discover: slide.showDiscoverButton
          }
        });
      });
    }
    
    if (homeContent.suggestedProducts && homeContent.suggestedProducts.length > 0) {
      console.log('--- SUGGESTED PRODUCTS DETAIL ---');
      homeContent.suggestedProducts.forEach((product, index) => {
        console.log(`Product ${index + 1}:`, {
          id: product.id,
          name: product.name,
          price: product.price,
          hasImage: !!product.image,
          enabled: product.enabled
        });
      });
    }
    
    console.log('=== END HOME CONTENT DATA ===\n');
    
    res.json(homeContent);
  } catch (error) {
    console.error('Error fetching home content:', error);
    res.status(500).json({ message: 'Error fetching home content', error: error.message });
  }
});

// Update home content
router.put('/', async (req, res) => {
  try {
    console.log('=== UPDATE HOME CONTENT REQUEST ===');
    console.log('Request body keys:', Object.keys(req.body));
    
    let homeContent = await HomeContent.findOne();
    
    if (!homeContent) {
      homeContent = new HomeContent();
      console.log('Created new home content document');
    } else {
      console.log('Found existing home content document');
    }
    
    // Log what's being updated
    Object.keys(req.body).forEach(key => {
      const value = req.body[key];
      console.log(`Updating ${key}:`, {
        type: typeof value,
        isArray: Array.isArray(value),
        length: Array.isArray(value) ? value.length : 'N/A',
        sample: Array.isArray(value) && value.length > 0 ? value[0] : value
      });
      
      if (value !== undefined) {
        homeContent[key] = value;
      }
    });
    
    await homeContent.save();
    console.log('Home content saved successfully');
    console.log('=== END UPDATE HOME CONTENT ===\n');
    
    res.json(homeContent);
  } catch (error) {
    console.error('Error updating home content:', error);
    res.status(500).json({ message: 'Error updating home content', error: error.message });
  }
});

// Helper function to extract Cloudinary public_id from URL
function getPublicIdFromUrl(url) {
  if (!url || !url.includes('cloudinary')) return null;
  
  // Extract public_id from Cloudinary URL
  // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
  const matches = url.match(/\/upload\/v\d+\/(.+?)(?:\.[^.]+)?$/);
  return matches ? matches[1] : null;
}

// Helper function to delete Cloudinary resource
async function deleteFromCloudinary(publicId, resourceType = 'image') {
  if (!cloudinary || !publicId) return false;
  
  try {
    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: resourceType 
    });
    console.log(`Deleted ${resourceType}:`, publicId, result);
    return result.result === 'ok' || result.result === 'not found';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}

// Delete previous images/videos
router.post('/cleanup', async (req, res) => {
  try {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ message: 'Invalid URLs array' });
    }

    const results = [];
    for (const url of urls) {
      const publicId = getPublicIdFromUrl(url);
      if (publicId) {
        const resourceType = url.includes('/video/') ? 'video' : 'image';
        const deleted = await deleteFromCloudinary(publicId, resourceType);
        results.push({ url, publicId, deleted });
      }
    }

    res.json({ message: 'Cleanup completed', results });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ message: 'Cleanup failed', error: error.message });
  }
});

// Upload files to draft folder (not saved to database yet)
router.post('/upload-draft', upload.array('files'), async (req, res) => {
  try {
    console.log('=== DRAFT UPLOAD REQUEST ===');
    console.log('Files received:', req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = [];
    
    // Files are already uploaded to Cloudinary by multer storage
    // Just return the file information
    for (const file of req.files) {
      console.log('File uploaded to Cloudinary:', file.path);
      
      uploadedFiles.push({
        url: file.path, // Cloudinary URL from multer storage
        publicId: file.filename, // Cloudinary public_id from multer storage
        originalName: file.originalname,
        isDraft: true,
        uploadedAt: new Date().toISOString()
      });
    }
    
    console.log('Draft upload completed:', uploadedFiles.length, 'files');
    res.json({ files: uploadedFiles });
  } catch (error) {
    console.error('Error in draft upload:', error);
    res.status(500).json({ message: 'Error uploading files', error: error.message });
  }
});

// Save draft content
router.post('/save-draft', async (req, res) => {
  try {
    console.log('=== SAVE DRAFT ===');
    const { type, data, files } = req.body;
    
    if (!type || !data) {
      return res.status(400).json({ message: 'Type and data are required' });
    }
    
    // Create or update draft
    const draft = await Draft.findOneAndUpdate(
      { type },
      { 
        type, 
        data, 
        files: files || [],
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log('Draft saved successfully:', draft._id);
    res.json({ 
      message: 'Draft saved successfully',
      draft: draft
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ message: 'Error saving draft', error: error.message });
  }
});

// Get draft content
router.get('/draft/:type', async (req, res) => {
  try {
    console.log('=== GET DRAFT ===');
    const { type } = req.params;
    
    const draft = await Draft.findOne({ type });
    
    if (!draft) {
      return res.json({ draft: null });
    }
    
    console.log('Draft found:', draft._id);
    res.json({ draft });
  } catch (error) {
    console.error('Error getting draft:', error);
    res.status(500).json({ message: 'Error getting draft', error: error.message });
  }
});

// Get all draft files (for management)
router.get('/drafts', async (req, res) => {
  try {
    console.log('=== GET ALL DRAFTS ===');
    
    const drafts = await Draft.find().sort({ updatedAt: -1 });
    
    res.json({ 
      message: 'Draft files retrieved',
      drafts: drafts
    });
  } catch (error) {
    console.error('Error getting drafts:', error);
    res.status(500).json({ message: 'Error getting drafts', error: error.message });
  }
});

// Cleanup old draft files (older than 7 days)
router.post('/cleanup-old-drafts', async (req, res) => {
  try {
    console.log('=== CLEANUP OLD DRAFTS ===');
    
    // In a real implementation, you would:
    // 1. Query database for drafts older than 7 days
    // 2. Delete them from Cloudinary
    // 3. Remove from database
    
    // For now, we'll implement a basic Cloudinary cleanup
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // This would need to be implemented with Cloudinary API to list and delete old files
    console.log('Cleanup old drafts older than:', sevenDaysAgo);
    
    res.json({ 
      message: 'Old drafts cleanup completed',
      deletedCount: 0,
      note: 'Implement with Cloudinary API for file listing'
    });
  } catch (error) {
    console.error('Error cleaning up old drafts:', error);
    res.status(500).json({ message: 'Error cleaning up drafts', error: error.message });
  }
});

// Finalize uploads (move from temp to permanent)
router.post('/finalize-uploads', async (req, res) => {
  try {
    console.log('=== FINALIZE UPLOADS REQUEST ===');
    const { tempUrls } = req.body;
    
    if (!tempUrls || !Array.isArray(tempUrls)) {
      return res.status(400).json({ message: 'Invalid temp URLs' });
    }
    
    const finalizedFiles = [];
    
    for (const tempUrl of tempUrls) {
      if (tempUrl.includes('cloudinary')) {
        // Extract public_id from temp URL
        const publicId = tempUrl.split('/').pop().split('.')[0];
        
        try {
          // Move from temp_uploads to permanent folder
          const result = await cloudinary.uploader.rename(
            `temp_uploads/${publicId}`,
            `home_content/${publicId}`
          );
          
          finalizedFiles.push({
            originalUrl: tempUrl,
            finalUrl: result.secure_url,
            publicId: result.public_id
          });
          
          console.log('File finalized:', publicId);
        } catch (error) {
          console.error('Error finalizing file:', error);
        }
      } else {
        // Handle local files
        finalizedFiles.push({
          originalUrl: tempUrl,
          finalUrl: tempUrl.replace('/temp-uploads/', '/uploads/')
        });
      }
    }
    
    res.json({ finalizedFiles });
  } catch (error) {
    console.error('Error finalizing uploads:', error);
    res.status(500).json({ message: 'Error finalizing uploads', error: error.message });
  }
});

// Cleanup temporary files
router.post('/cleanup-temp', async (req, res) => {
  try {
    console.log('=== CLEANUP TEMP FILES REQUEST ===');
    const { tempUrls } = req.body;
    
    if (!tempUrls || !Array.isArray(tempUrls)) {
      return res.status(400).json({ message: 'Invalid temp URLs' });
    }
    
    let deletedCount = 0;
    
    for (const tempUrl of tempUrls) {
      if (tempUrl.includes('cloudinary')) {
        try {
          const publicId = getPublicIdFromUrl(tempUrl);
          if (publicId && publicId.includes('temp_uploads/')) {
            await cloudinary.uploader.destroy(publicId);
            deletedCount++;
            console.log('Deleted temp file:', publicId);
          }
        } catch (error) {
          console.error('Error deleting temp file:', error);
        }
      }
    }
    
    console.log('Cleanup completed. Deleted files:', deletedCount);
    res.json({ deletedCount });
  } catch (error) {
    console.error('Error in cleanup:', error);
    res.status(500).json({ message: 'Error cleaning up files', error: error.message });
  }
});

// Upload files for home content (legacy - for backwards compatibility)
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
