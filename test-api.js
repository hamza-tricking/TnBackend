// Test the home-content API directly
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/home-content',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('=== API RESPONSE ===');
    try {
      const parsed = JSON.parse(data);
      console.log('Suggested Products:', parsed.suggestedProducts?.length || 0);
      if (parsed.suggestedProducts && parsed.suggestedProducts.length > 0) {
        parsed.suggestedProducts.forEach((product, index) => {
          console.log(`Product ${index + 1}:`, {
            id: product.id,
            name: product.name,
            enabled: product.enabled
          });
        });
      }
    } catch (error) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();
