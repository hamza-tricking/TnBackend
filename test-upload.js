// Test script for Cloudinary upload functionality
// Run this script to test if your Cloudinary setup is working correctly

const { cloudinary } = require('./config/cloudinary');

// Test Cloudinary connection
async function testCloudinaryConnection() {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Test by listing folders (this will work if credentials are correct)
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 1
    });
    
    console.log('✅ Cloudinary connection successful!');
    console.log('Cloud name:', cloudinary.config().cloud_name);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    console.log('\nPlease check your environment variables:');
    console.log('- CLOUDINARY_CLOUD_NAME');
    console.log('- CLOUDINARY_API_KEY');
    console.log('- CLOUDINARY_API_SECRET');
    return false;
  }
}

// Test image upload
async function testImageUpload() {
  try {
    console.log('\nTesting image upload...');
    
    // Create a simple test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'tn-test',
          public_id: `test-image-${Date.now()}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(testImageBuffer);
    });
    
    console.log('✅ Image upload successful!');
    console.log('URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    
    // Clean up test image
    await cloudinary.uploader.destroy(result.public_id);
    console.log('🧹 Test image cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Image upload failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Cloudinary tests...\n');
  
  const connectionTest = await testCloudinaryConnection();
  
  if (connectionTest) {
    await testImageUpload();
  }
  
  console.log('\n🏁 Tests completed!');
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testCloudinaryConnection,
  testImageUpload,
  runTests
};
