const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');

// Create guest order (no authentication required)
router.post('/guest', [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isNumeric().withMessage('Price must be a number'),
  body('customerInfo.fullName').notEmpty().withMessage('Full name is required'),
  body('customerInfo.phone').notEmpty().withMessage('Phone number is required'),
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.wilaya').notEmpty().withMessage('Wilaya is required'),
  body('paymentMethod').isIn(['cash_on_delivery']).withMessage('Only cash on delivery is available for guest orders'),
  body('shippingMethod').isIn(['home', 'bureau']).withMessage('Invalid shipping method')
], async (req, res) => {
  try {
    console.log('Guest order request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { items, customerInfo, shippingAddress, paymentMethod, shippingMethod, notes } = req.body;
    console.log('Extracted order data:', { items, customerInfo, shippingAddress, paymentMethod, shippingMethod, notes });

    // Check if all products exist and have sufficient stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product ${item.product} not found or not available` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product ${product.name}` });
      }
    }

    // Calculate totals
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Get real shipping cost based on wilaya and method
    const Shipping = require('../models/Shipping');
    const shippingPrices = await Shipping.getActivePrices();
    
    // Convert to object format for easy lookup
    const pricesObject = {};
    shippingPrices.forEach(price => {
      pricesObject[price.wilaya] = {
        home: price.home,
        bureau: price.bureau
      };
    });
    
    const shippingCost = pricesObject[shippingAddress.wilaya]?.[shippingMethod] || 
                      (shippingMethod === 'home' ? 600 : 400); // Fallback to default
    
    const tax = 0; // No tax for now
    const total = subtotal + shippingCost + tax;

    // Generate order number manually
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create guest order
    console.log('Creating order with data:', {
      customerInfo,
      items,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      notes,
      subtotal,
      shippingCost,
      tax,
      total,
      orderNumber
    });
    
    const order = new Order({
      customerInfo,
      items,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      notes,
      subtotal,
      shippingCost,
      tax,
      total,
      orderNumber
    });

    console.log('Order object created, saving...');
    await order.save();
    console.log('Order saved successfully:', order);

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    res.status(201).json({
      success: true,
      message: 'Guest order created successfully',
      data: {
        orderNumber: order.orderNumber,
        total: order.total,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        tax: order.tax
      }
    });
  } catch (error) {
    console.error('Error creating guest order:', error);
    res.status(500).json({ success: false, message: 'Error creating order', error: error.message });
  }
});

// Create new order
router.post('/', auth, [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isNumeric().withMessage('Price must be a number'),
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
  body('paymentMethod').isIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Check if all products exist and have sufficient stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product ${item.product} not found or not available` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
      }
    }

    // Create order
    const order = new Order({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      notes
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: req.user.id });

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images')
      .populate('user', 'username email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin only)
router.put('/:id/status', auth, [
  body('orderStatus').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid order status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check Yalidine configuration status (admin only)
router.get('/yalidine-status', auth, adminAuth, async (req, res) => {
  const apiId = process.env.YALIDINE_API_ID;
  const apiToken = process.env.YALIDINE_API_TOKEN;
  res.json({
    configured: !!(apiId && apiToken),
    apiIdSet: !!apiId,
    apiTokenSet: !!apiToken,
    // Only show partial credentials for security
    apiIdPreview: apiId ? `${apiId.slice(0, 6)}...${apiId.slice(-4)}` : null,
  });
});

// Push order to Yalidine (admin only)
router.post('/:id/yalidine', auth, adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.trackingNumber) {
      return res.status(400).json({ message: 'Order already has a tracking number' });
    }

    const yalidineService = require('../services/yalidineService');
    const { trackingNumber, rawResponse } = await yalidineService.createParcel(order);

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
      await order.save();
    }

    res.json({
      success: true,
      message: 'Order sent to Yalidine successfully',
      trackingNumber: trackingNumber || null,
      result: rawResponse
    });
  } catch (error) {
    console.error('Push to Yalidine error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Update payment status (admin only)
router.put('/:id/payment', auth, [
  body('paymentStatus').isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Invalid payment status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Payment status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update full order details (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const {
      customerInfo,
      shippingAddress,
      shippingMethod,
      shippingCost,
      subtotal,
      total,
      orderStatus,
      paymentStatus,
      paymentMethod,
      trackingNumber,
      notes
    } = req.body;

    if (customerInfo) {
      if (!order.customerInfo) order.customerInfo = {};
      if (customerInfo.fullName !== undefined) order.customerInfo.fullName = customerInfo.fullName;
      if (customerInfo.phone !== undefined) order.customerInfo.phone = customerInfo.phone;
      if (customerInfo.email !== undefined) order.customerInfo.email = customerInfo.email;
    }

    if (shippingAddress) {
      if (!order.shippingAddress) order.shippingAddress = {};
      if (shippingAddress.street !== undefined) order.shippingAddress.street = shippingAddress.street;
      if (shippingAddress.city !== undefined) order.shippingAddress.city = shippingAddress.city;
      if (shippingAddress.wilaya !== undefined) order.shippingAddress.wilaya = shippingAddress.wilaya;
      if (shippingAddress.baladiya !== undefined) order.shippingAddress.baladiya = shippingAddress.baladiya;
      if (shippingAddress.zipCode !== undefined) order.shippingAddress.zipCode = shippingAddress.zipCode;
      if (shippingAddress.country !== undefined) order.shippingAddress.country = shippingAddress.country;
    }

    if (shippingMethod !== undefined) order.shippingMethod = shippingMethod;
    if (shippingCost !== undefined && !isNaN(shippingCost)) order.shippingCost = Number(shippingCost);
    if (subtotal !== undefined && !isNaN(subtotal)) order.subtotal = Number(subtotal);
    if (total !== undefined && !isNaN(total)) {
      order.total = Number(total);
    } else if (shippingCost !== undefined || subtotal !== undefined) {
      order.total = (order.subtotal || 0) + (order.shippingCost || 0) + (order.tax || 0);
    }

    if (orderStatus !== undefined) order.orderStatus = orderStatus;
    if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
    if (paymentMethod !== undefined) order.paymentMethod = paymentMethod;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (notes !== undefined) order.notes = notes;

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'username email')
      .populate('items.product', 'name images');

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});


// Cancel order (user can cancel their own pending orders)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order can be cancelled
    if (order.orderStatus !== 'pending') {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({})
      .populate('user', 'username email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({});

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete order (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Restore product stock if order is not cancelled
    if (order.orderStatus !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
