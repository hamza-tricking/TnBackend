const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  // Multilingual descriptions
  description_ar: {
    type: String,
    required: [true, 'Arabic description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  description_fr: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  description_en: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  // Multilingual short descriptions
  shortDescription_ar: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  shortDescription_fr: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  shortDescription_en: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  // Multilingual usage instructions
  usage_ar: {
    type: String,
    maxlength: [1000, 'Usage instructions cannot exceed 1000 characters']
  },
  usage_fr: {
    type: String,
    maxlength: [1000, 'Usage instructions cannot exceed 1000 characters']
  },
  usage_en: {
    type: String,
    maxlength: [1000, 'Usage instructions cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  old_price: {
    type: Number,
    min: [0, 'Old price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['hair-care', 'skin-care', 'makeup', 'fragrance', 'health', 'other'],
    default: 'hair-care'
  },
  brand: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  // Long image for product page banner
  longImage: {
    url: String,
    alt: String,
    caption: String
  },
  // Product gallery images (WordPress images array)
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  tags: [String],
  type: {
    type: String,
    enum: ['simple', 'variable'],
    default: 'simple'
  },
  // For variable products
  variations: [{
    id: Number,
    price: Number,
    regular_price: Number,
    sale_price: Number,
    attributes: [{
      name: String,
      value: String
    }],
    description: String,
    sku: String,
    stock: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  // Simple rating (WordPress compatible)
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  // Detailed rating (for internal use)
  ratingDetails: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  // SEO fields
  meta_title: String,
  meta_description: String,
  meta_keywords: [String],
  // Additional fields for TN Shopping
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  shipping_cost: Number,
  tax_rate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
productSchema.index({ 
  name: 'text', 
  description_ar: 'text', 
  description_fr: 'text', 
  description_en: 'text', 
  usage_ar: 'text', 
  usage_fr: 'text', 
  usage_en: 'text', 
  tags: 'text',
  brand: 'text',
  sku: 'text'
});

// Method to check if product is in stock
productSchema.methods.isInStock = function() {
  return this.stock > 0;
};

// Method to update stock
productSchema.methods.updateStock = function(quantity) {
  this.stock -= quantity;
  return this.save();
};

// Static method to convert WordPress product to backend format
productSchema.statics.fromWordPressProduct = function(wpProduct) {
  const extractText = (richTextArray) => {
    if (richTextArray && richTextArray.length > 0 && richTextArray[0].plain_text) {
      return richTextArray[0].plain_text;
    }
    return '';
  };

  const extractTitle = (titleArray) => {
    if (titleArray && titleArray.length > 0 && titleArray[0].plain_text) {
      return titleArray[0].plain_text;
    }
    return '';
  };

  return {
    name: extractTitle(wpProduct.name?.title || []),
    description_ar: extractText(wpProduct.properties?.['Description-ar']?.rich_text || []),
    description_fr: extractText(wpProduct.properties?.['Description-fr']?.rich_text || []),
    description_en: extractText(wpProduct.properties?.['Description-en']?.rich_text || []),
    shortDescription_ar: extractText(wpProduct.properties?.['Short Description-ar']?.rich_text || []),
    shortDescription_fr: extractText(wpProduct.properties?.['Short Description-fr']?.rich_text || []),
    shortDescription_en: extractText(wpProduct.properties?.['Short Description-en']?.rich_text || []),
    usage_ar: extractText(wpProduct.properties?.['Usage-ar']?.rich_text || []),
    usage_fr: extractText(wpProduct.properties?.['Usage-fr']?.rich_text || []),
    usage_en: extractText(wpProduct.properties?.['Usage-en']?.rich_text || []),
    price: wpProduct.price?.number || 0,
    old_price: wpProduct['old price']?.number || 0,
    rating: wpProduct.rating?.number || 0,
    type: wpProduct.type || 'simple',
    variations: wpProduct.variations || [],
    images: wpProduct.images || [],
    isActive: true,
    featured: false,
    stock: 100, // Default stock
    sku: `PROD-${Date.now()}`, // Generate unique SKU
    category: 'hair-care' // Default category
  };
};

module.exports = mongoose.model('Product', productSchema);
