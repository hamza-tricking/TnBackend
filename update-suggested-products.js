const mongoose = require('mongoose');
require('dotenv').config();
const { HomeContent } = require('./models/HomeContent');
const Product = require('./models/Product');

// MongoDB connection
let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tn-shopping';

// Fix truncated database name if needed
if (mongoUri.includes('/tn-shopping>')) {
    mongoUri = mongoUri.replace('/tn-shopping>', '/tn-shopping');
    console.log('🔧 Fixed truncated database name in URI');
}

async function updateSuggestedProducts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get current home content
    console.log('📋 Fetching current home content...');
    const homeContent = await HomeContent.findOne();
    
    if (!homeContent) {
      console.log('❌ No home content found');
      return;
    }

    console.log(`📦 Found ${homeContent.suggestedProducts?.length || 0} suggested products`);

    // Get all products from database
    console.log('🛍️  Fetching all products...');
    const products = await Product.find({ isActive: true });
    console.log(`📦 Found ${products.length} active products`);

    // Create a map of product names to product IDs for easy lookup
    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product.name.toLowerCase(), product._id);
      // Also add some variations for matching
      productMap.set(product.name.toLowerCase().trim(), product._id);
    });

    console.log('\n🔍 Available products:');
    products.forEach(product => {
      console.log(`- ${product.name} (${product._id})`);
    });

    // Update suggested products with productId
    const updatedSuggestedProducts = [];
    
    for (const suggestedProduct of homeContent.suggestedProducts || []) {
      console.log(`\n🔄 Processing: ${suggestedProduct.name}`);
      
      // Try to find matching product
      let matchedProductId = null;
      
      // Exact match
      if (productMap.has(suggestedProduct.name.toLowerCase())) {
        matchedProductId = productMap.get(suggestedProduct.name.toLowerCase());
        console.log(`✅ Exact match found: ${matchedProductId}`);
      }
      // Try partial match
      else {
        const suggestedName = suggestedProduct.name.toLowerCase();
        for (const [productName, productId] of productMap) {
          if (productName.includes(suggestedName) || suggestedName.includes(productName)) {
            matchedProductId = productId;
            console.log(`✅ Partial match found: ${productName} -> ${matchedProductId}`);
            break;
          }
        }
      }

      if (matchedProductId) {
        // Update with productId but keep other fields for backward compatibility
        const updatedProduct = {
          ...suggestedProduct,
          productId: matchedProductId
        };
        updatedSuggestedProducts.push(updatedProduct);
        console.log(`✅ Updated: ${suggestedProduct.name} -> productId: ${matchedProductId}`);
      } else {
        // Keep as is if no match found
        updatedSuggestedProducts.push(suggestedProduct);
        console.log(`⚠️  No match found for: ${suggestedProduct.name} (keeping as is)`);
      }
    }

    // Update home content
    homeContent.suggestedProducts = updatedSuggestedProducts;
    await homeContent.save();

    console.log('\n📊 Update Summary:');
    console.log(`- Total suggested products: ${updatedSuggestedProducts.length}`);
    console.log(`- Products with productId: ${updatedSuggestedProducts.filter(p => p.productId).length}`);
    console.log(`- Products without productId: ${updatedSuggestedProducts.filter(p => !p.productId).length}`);

    console.log('\n✅ Suggested products updated successfully!');

  } catch (error) {
    console.error('❌ Error during update:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the update
if (require.main === module) {
  updateSuggestedProducts();
}

module.exports = updateSuggestedProducts;
