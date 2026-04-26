const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');

// Get all products with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    let filter = { isActive: true };
    
    // Include inactive products if requested
    if (req.query.includeInactive === 'true') {
      filter = {}; // No filter - get all products
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.minPrice) {
      filter.price = { ...filter.price, $gte: parseFloat(req.query.minPrice) };
    }
    
    if (req.query.maxPrice) {
      filter.price = { ...filter.price, $lte: parseFloat(req.query.maxPrice) };
    }
    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (!product.isActive) {
      return res.status(404).json({ message: 'Product not available' });
    }
    
    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new product (admin only - you'll need to add auth middleware)
router.post('/', [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').isIn(['electronics', 'clothing', 'food', 'books', 'home', 'sports', 'other']).withMessage('Invalid category'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (admin only)
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (admin only - soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured products
router.get('/featured/list', async (req, res) => {
  try {
    const products = await Product.find({ featured: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({ products });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ 
      category: req.params.category, 
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments({ 
      category: req.params.category, 
      isActive: true 
    });
    
    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
