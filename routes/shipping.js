const express = require('express');
const router = express.Router();
const {
  getShippingPrices,
  getShippingPriceByWilaya,
  updateShippingPrice,
  bulkUpdateShippingPrices,
  initializeDefaultPrices,
  deleteShippingPrice
} = require('../controllers/shippingController');

// GET /api/shipping - Get all shipping prices
router.get('/', getShippingPrices);

// GET /api/shipping/:wilaya - Get shipping price for specific wilaya
router.get('/:wilaya', getShippingPriceByWilaya);

// PUT /api/shipping/:wilaya - Update shipping price for specific wilaya
router.put('/:wilaya', updateShippingPrice);

// POST /api/shipping/bulk - Bulk update shipping prices
router.post('/bulk', bulkUpdateShippingPrices);

// POST /api/shipping/initialize - Initialize default shipping prices
router.post('/initialize', initializeDefaultPrices);

// DELETE /api/shipping/:wilaya - Delete shipping price for specific wilaya
router.delete('/:wilaya', deleteShippingPrice);

module.exports = router;
