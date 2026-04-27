const Shipping = require('../models/Shipping');

// Get all shipping prices
const getShippingPrices = async (req, res) => {
  try {
    const prices = await Shipping.getActivePrices();
    
    // Convert to the format expected by frontend
    const pricesObject = {};
    prices.forEach(price => {
      pricesObject[price.wilaya] = {
        home: price.home,
        bureau: price.bureau
      };
    });

    res.status(200).json({
      success: true,
      data: pricesObject
    });
  } catch (error) {
    console.error('Error fetching shipping prices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shipping prices',
      error: error.message
    });
  }
};

// Get shipping price for specific wilaya
const getShippingPriceByWilaya = async (req, res) => {
  try {
    const { wilaya } = req.params;
    
    if (!wilaya) {
      return res.status(400).json({
        success: false,
        message: 'Wilaya name is required'
      });
    }

    const price = await Shipping.getPriceForWilaya(wilaya);
    
    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'Shipping price not found for this wilaya'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        wilaya: price.wilaya,
        home: price.home,
        bureau: price.bureau,
        isActive: price.isActive,
        notes: price.notes
      }
    });
  } catch (error) {
    console.error('Error fetching shipping price:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shipping price',
      error: error.message
    });
  }
};

// Update shipping price for specific wilaya
const updateShippingPrice = async (req, res) => {
  try {
    const { wilaya } = req.params;
    const { home, bureau, isActive, notes } = req.body;

    if (!wilaya) {
      return res.status(400).json({
        success: false,
        message: 'Wilaya name is required'
      });
    }

    // Validate prices
    if (home !== undefined && (typeof home !== 'number' || home < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Home price must be a non-negative number'
      });
    }

    if (bureau !== undefined && (typeof bureau !== 'number' || bureau < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Bureau price must be a non-negative number'
      });
    }

    const updateData = {};
    if (home !== undefined) updateData.home = home;
    if (bureau !== undefined) updateData.bureau = bureau;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (notes !== undefined) updateData.notes = notes;

    const price = await Shipping.findOneAndUpdate(
      { wilaya },
      updateData,
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Shipping price updated successfully',
      data: price
    });
  } catch (error) {
    console.error('Error updating shipping price:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating shipping price',
      error: error.message
    });
  }
};

// Bulk update shipping prices
const bulkUpdateShippingPrices = async (req, res) => {
  try {
    const { prices } = req.body;

    if (!prices || !Array.isArray(prices)) {
      return res.status(400).json({
        success: false,
        message: 'Prices array is required'
      });
    }

    // Validate each price entry
    for (const price of prices) {
      if (!price.wilaya) {
        return res.status(400).json({
          success: false,
          message: 'Each price entry must have a wilaya name'
        });
      }

      if (price.home !== undefined && (typeof price.home !== 'number' || price.home < 0)) {
        return res.status(400).json({
          success: false,
          message: `Invalid home price for ${price.wilaya}`
        });
      }

      if (price.bureau !== undefined && (typeof price.bureau !== 'number' || price.bureau < 0)) {
        return res.status(400).json({
          success: false,
          message: `Invalid bureau price for ${price.wilaya}`
        });
      }
    }

    const result = await Shipping.bulkUpdatePrices(prices);

    res.status(200).json({
      success: true,
      message: 'Shipping prices updated successfully',
      data: {
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount
      }
    });
  } catch (error) {
    console.error('Error bulk updating shipping prices:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk updating shipping prices',
      error: error.message
    });
  }
};

// Initialize default shipping prices
const initializeDefaultPrices = async (req, res) => {
  try {
    const result = await Shipping.initializeDefaults();

    res.status(200).json({
      success: true,
      message: 'Default shipping prices initialized successfully',
      data: {
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount
      }
    });
  } catch (error) {
    console.error('Error initializing default prices:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing default prices',
      error: error.message
    });
  }
};

// Delete shipping price for specific wilaya
const deleteShippingPrice = async (req, res) => {
  try {
    const { wilaya } = req.params;

    if (!wilaya) {
      return res.status(400).json({
        success: false,
        message: 'Wilaya name is required'
      });
    }

    const price = await Shipping.findOneAndDelete({ wilaya });

    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'Shipping price not found for this wilaya'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Shipping price deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shipping price:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting shipping price',
      error: error.message
    });
  }
};

module.exports = {
  getShippingPrices,
  getShippingPriceByWilaya,
  updateShippingPrice,
  bulkUpdateShippingPrices,
  initializeDefaultPrices,
  deleteShippingPrice
};
