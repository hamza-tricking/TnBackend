const mongoose = require('mongoose');
const { HomeContent } = require('./models/HomeContent');

// Connect to MongoDB
mongoose.connect('mongodb+srv://hamzatricks:hamzatricks@cluster0.sjxud.mongodb.net/tn-shopping', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Find current home content
    const homeContent = await HomeContent.findOne();
    
    if (!homeContent) {
      console.log('No home content found');
      process.exit(0);
    }
    
    console.log('=== CURRENT HOME CONTENT ===');
    console.log('Hero Slides:', homeContent.heroSlides?.length || 0);
    console.log('About Us:', homeContent.aboutUs ? 'Present' : 'Missing');
    console.log('Videos:', homeContent.videos?.length || 0);
    console.log('Suggested Products:', homeContent.suggestedProducts?.length || 0);
    console.log('Reels:', homeContent.reels?.length || 0);
    console.log('Reviews:', homeContent.reviews?.length || 0);
    console.log('Brazilian Content:', homeContent.brazilian ? 'Present' : 'Missing');
    
    if (homeContent.suggestedProducts && homeContent.suggestedProducts.length > 0) {
      console.log('\n=== SUGGESTED PRODUCTS DETAIL ===');
      homeContent.suggestedProducts.forEach((product, index) => {
        console.log(`Product ${index + 1}:`, {
          productId: product.productId,
          hasProductId: !!product.productId,
          productIdType: typeof product.productId,
          fullObject: product
        });
      });
    } else {
      console.log('\n❌ NO SUGGESTED PRODUCTS FOUND');
    }
    
    console.log('\n=== TESTING WITH SAMPLE DATA ===');
    
    // Test adding sample suggested products
    const testProducts = [
      { productId: '69ee2726797fd249b62e7215' },
      { productId: '69ee2726797fd249b62e7222' }
    ];
    
    console.log('Setting test suggested products:', testProducts);
    homeContent.suggestedProducts = testProducts;
    
    await homeContent.save();
    console.log('✅ Test products saved successfully');
    
    // Verify the save
    const updatedContent = await HomeContent.findOne();
    console.log('After save - Suggested Products:', updatedContent.suggestedProducts?.length || 0);
    
    if (updatedContent.suggestedProducts && updatedContent.suggestedProducts.length > 0) {
      updatedContent.suggestedProducts.forEach((product, index) => {
        console.log(`Saved Product ${index + 1}:`, {
          productId: product.productId,
          hasProductId: !!product.productId
        });
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
  
}).catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});
