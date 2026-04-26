const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tn-database', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'tnshoppingg' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
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
