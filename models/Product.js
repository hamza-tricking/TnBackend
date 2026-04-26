const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['electronics', 'clothing', 'food', 'books', 'home', 'sports', 'other']
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
  images: [{
    url: String,
    alt: String
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
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
  }
}, {
  timestamps: true
});

// Index for search functionality
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Method to check if product is in stock
productSchema.methods.isInStock = function() {
  return this.stock > 0;
};

// Method to update stock
productSchema.methods.updateStock = function(quantity) {
  this.stock -= quantity;
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
