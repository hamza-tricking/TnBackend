const mongoose = require('mongoose');

// Draft Schema for unsaved content
const draftSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['heroSlide', 'video', 'product', 'reel', 'review'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  files: [{
    url: String,
    publicId: String,
    originalName: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Auto-cleanup drafts older than 7 days
draftSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

// Hero Slide Schema
const heroSlideSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  titles: {
    ar: { type: String, required: true },
    fr: { type: String, required: true },
    en: { type: String, required: true }
  },
  subtitles: {
    ar: { type: String, required: true },
    fr: { type: String, required: true },
    en: { type: String, required: true }
  },
  descriptions: {
    ar: { type: String, required: true },
    fr: { type: String, required: true },
    en: { type: String, required: true }
  },
  buttonTexts: {
    ar: String,
    fr: String,
    en: String
  },
  buttonLink: String,
  showCertificationButton: { type: Boolean, default: false },
  showExploreButton: { type: Boolean, default: false },
  showDiscoverButton: { type: Boolean, default: false }
}, { _id: false });

// About Us Image Schema
const aboutImageSchema = new mongoose.Schema({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  title: {
    ar: { type: String, required: true },
    fr: { type: String, required: true },
    en: { type: String, required: true }
  },
  description: {
    ar: { type: String, required: true },
    fr: { type: String, required: true },
    en: { type: String, required: true }
  }
}, { _id: false });

// Video Content Schema
const videoContentSchema = new mongoose.Schema({
  src: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

// Suggested Product Schema
const suggestedProductSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  badge: { type: String, required: true },
  badgeColor: { type: String, required: true },
  enabled: { type: Boolean, default: true }
}, { _id: false });

// Reel Schema
const reelSchema = new mongoose.Schema({
  src: { type: String, required: true },
  thumbnail: { type: String, required: true },
  title: { type: String, required: true },
  customer: { type: String, required: true },
  enabled: { type: Boolean, default: true }
}, { _id: false });

// Review Schema
const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  image: { type: String, required: true },
  date: { type: String, required: true },
  enabled: { type: Boolean, default: true }
}, { _id: false });

// Main Home Content Schema
const homeContentSchema = new mongoose.Schema({
  // Hero Section
  heroSlides: [heroSlideSchema],
  
  // About Us Section
  aboutUs: {
    title: {
      ar: { type: String, required: true },
      fr: { type: String, required: true },
      en: { type: String, required: true }
    },
    subtitle: {
      ar: { type: String, required: true },
      fr: { type: String, required: true },
      en: { type: String, required: true }
    },
    description: {
      ar: { type: String, required: true },
      fr: { type: String, required: true },
      en: { type: String, required: true }
    },
    features: {
      title: {
        ar: { type: String, required: true },
        fr: { type: String, required: true },
        en: { type: String, required: true }
      },
      items: {
        ar: [String],
        fr: [String],
        en: [String]
      }
    },
    images: [aboutImageSchema]
  },
  
  // Video Showcase
  videos: [videoContentSchema],
  
  // Suggested Products
  suggestedProducts: [suggestedProductSchema],
  
  // Featured Reels
  reels: [reelSchema],
  
  // Community Reviews
  reviews: [reviewSchema],
  
  // Brazilian Authenticity
  brazilian: {
    title: {
      ar: { type: String, required: true },
      fr: { type: String, required: true },
      en: { type: String, required: true }
    },
    subtitle: {
      ar: { type: String, required: true },
      fr: { type: String, required: true },
      en: { type: String, required: true }
    },
    description: {
      ar: { type: String, required: true },
      fr: { type: String, required: true },
      en: { type: String, required: true }
    },
    features: {
      title: {
        ar: { type: String, required: true },
        fr: { type: String, required: true },
        en: { type: String, required: true }
      },
      items: {
        ar: [String],
        fr: [String],
        en: [String]
      }
    },
    guarantee: {
      ar: { type: String, required: true },
      fr: { type: String, required: true },
      en: { type: String, required: true }
    }
  }
}, {
  timestamps: true
});

// Create and export the models
const HomeContent = mongoose.model('HomeContent', homeContentSchema);
const Draft = mongoose.model('Draft', draftSchema);

module.exports = { HomeContent, Draft };
