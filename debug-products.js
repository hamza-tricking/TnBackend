const mongoose = require('mongoose');
const Product = require('./models/Product');

// Debug script to check products in database
const debugProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tn-shopping');
    console.log('Connected to MongoDB');
    
    // Check database name
    const db = mongoose.connection.db;
    console.log('Database name:', db.databaseName);
    
    // List all collections
    const collections = await db.listCollections();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check products collection
    const productsCollection = db.collection('products');
    const count = await productsCollection.countDocuments();
    console.log('Total documents in products collection:', count);
    
    // Check all documents (no filter)
    const allProducts = await productsCollection.find({}).toArray();
    console.log('All products (no filter):', allProducts.length);
    
    // Check active products
    const activeProducts = await productsCollection.find({ isActive: true }).toArray();
    console.log('Active products:', activeProducts.length);
    
    // Show sample product data
    if (allProducts.length > 0) {
      console.log('Sample product:', JSON.stringify(allProducts[0], null, 2));
    }
    
    // Check if isActive field exists
    const hasIsActiveField = await productsCollection.findOne({ isActive: { $exists: true } });
    console.log('Has isActive field:', !!hasIsActiveField);
    
  } catch (error) {
    console.error('❌ Error debugging products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the debug
debugProducts();
