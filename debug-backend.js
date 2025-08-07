// Simple Node.js script to test backend connectivity
const https = require('https');
const http = require('http');

function testEndpoint(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      method: method,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = protocol.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function debugBackend() {
  console.log('🔍 Testing backend connectivity...\n');
  
  const endpoints = [
    'http://localhost:8081',
    'http://localhost:8081/api',
    'http://localhost:8081/api/tasks',
    'http://localhost:8081/api/tasks/templates',
    'http://localhost:8081/tasks/templates', // Alternative path
    'http://localhost:8081/templates', // Another alternative
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const result = await testEndpoint(endpoint);
      console.log(`✅ Success! Status: ${result.status}`);
      if (result.data.length > 0 && result.data.length < 1000) {
        console.log(`   Response: ${result.data.substring(0, 200)}${result.data.length > 200 ? '...' : ''}`);
      }
      console.log('');
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('💡 Recommendations:');
  console.log('1. Make sure your backend server is running on port 8081');
  console.log('2. Check if the /api/tasks/templates endpoint exists');
  console.log('3. Verify CORS settings allow requests from your frontend');
  console.log('4. Check backend logs for any errors');
}

debugBackend().catch(console.error);
