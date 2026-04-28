const mongoose = require('mongoose');
const { HomeContent } = require('./models/HomeContent');

// Connect to MongoDB
mongoose.connect('mongodb+srv://hamzatricks:hamzatricks@cluster0.sjxud.mongodb.net/tn-shopping', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Find the home content document
    const homeContent = await HomeContent.findOne();
    
    if (!homeContent) {
      console.log('No home content found');
      process.exit(0);
    }
    
    console.log('Current suggested products:', homeContent.suggestedProducts);
    
    // Reset suggested products to empty array
    homeContent.suggestedProducts = [];
    
    // Save the changes
    await homeContent.save();
    
    console.log('✅ Suggested products reset successfully');
    console.log('📋 Now you can add new products from the admin dashboard');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error resetting suggested products:', error);
    process.exit(1);
  }
  
}).catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});
