const mongoose = require('mongoose');
const Product = require('./models/Product');

// Update existing products to set isActive: true
const updateExistingProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tn-shopping');
    console.log('Connected to MongoDB');
    
    // Find all products that have isActive not set to true
    const result = await Product.updateMany(
      { 
        $or: [
          { isActive: { $ne: true } },
          { isActive: { $exists: false } }
        ]
      },
      { 
        $set: { 
          isActive: true 
        } 
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} products to active status`);
    
    if (result.modifiedCount > 0) {
      console.log('📊 Updated Products:');
      const updatedProducts = await Product.find({
        $or: [
          { isActive: { $ne: true } },
          { isActive: { $exists: false } }
        ]
      });
      
      updatedProducts.forEach(product => {
        console.log(`  - ${product.name} (SKU: ${product.sku})`);
      });
    } else {
      console.log('ℹ️ All products already have isActive: true');
    }
    
  } catch (error) {
    console.error('❌ Error updating products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the update
updateExistingProducts();
