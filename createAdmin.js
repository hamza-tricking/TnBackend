const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    let mongoUri = process.env.MONGODB_URI || 'mongodb+srv://hamzatricks:hamzatricks@cluster0.sjxud.mongodb.net/tn-shopping';
    
    // Fix truncated database name if needed
    if (mongoUri.includes('/tn-shopping>')) {
        mongoUri = mongoUri.replace('/tn-shopping>', '/tn-shopping');
        console.log('🔧 Fixed truncated database name in URI');
    }
    
    console.log('🔗 Connecting to MongoDB with URI:', mongoUri);
    await mongoose.connect(mongoUri);
    
    console.log('Connected to MongoDB');

    // Delete existing admin user if it exists
    const existingAdmin = await User.findOne({ username: 'tnshoppingg' });
    if (existingAdmin) {
      console.log('Deleting existing admin user...');
      await User.deleteOne({ username: 'tnshoppingg' });
      console.log('Existing admin user deleted!');
    }

    // Create admin user
    const adminUser = new User({
      username: 'tnshoppingg',
      email: 'admin@tnshopping.com',
      password: 'shoppinggtn',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('Username: tnshoppingg');
    console.log('Password: shoppinggtn');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

createAdminUser();
