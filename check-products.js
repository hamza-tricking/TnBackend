const mongoose = require('mongoose');
const Product = require('./models/Product');

// Connect to MongoDB
mongoose.connect('mongodb+srv://hamzatricks:hamzatricks@cluster0.sjxud.mongodb.net/tn-shopping', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Test product IDs from the suggested products
    const productIds = ['69ee2726797fd249b62e7215', '69ee2726797fd249b62e7222'];
    
    console.log('=== CHECKING PRODUCT EXISTENCE ===');
    
    for (const productId of productIds) {
      console.log(`\nChecking product ID: ${productId}`);
      
      const product = await Product.findOne({ _id: productId });
      
      if (product) {
        console.log('✅ Product found:');
        console.log('  - Name:', product.name);
        console.log('  - isActive:', product.isActive);
        console.log('  - Images:', product.images?.length || 0);
        console.log('  - Price:', product.price);
      } else {
        console.log('❌ Product NOT found');
      }
    }
    
    // Test with the query used in the backend
    console.log('\n=== TESTING BACKEND QUERY ===');
    const products = await Product.find({ _id: { $in: productIds }, 'isActive': true });
    console.log('Found products with isActive=true:', products.length);
    
    products.forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        id: product._id,
        name: product.name,
        isActive: product.isActive
      });
    });
    
    // Test without the isActive filter
    console.log('\n=== TESTING WITHOUT isActive FILTER ===');
    const allProducts = await Product.find({ _id: { $in: productIds } });
    console.log('Found all products:', allProducts.length);
    
    allProducts.forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        id: product._id,
        name: product.name,
        isActive: product.isActive
      });
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
  
}).catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});
