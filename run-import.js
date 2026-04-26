const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting WordPress products import...\n');

// Run the import script
const importScript = path.join(__dirname, 'import-wordpress-products.js');

exec(`node "${importScript}"`, (error, stdout, stderr) => {
    if (error) {
        console.error('❌ Error running import:', error);
        return;
    }
    
    if (stderr) {
        console.error('❌ Import stderr:', stderr);
        return;
    }
    
    console.log(stdout);
    console.log('\n✅ Import script completed!');
});
