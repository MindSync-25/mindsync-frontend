// Test script to verify backend connectivity and authentication
const axios = require('axios');

async function testBackendFlow() {
  console.log('🧪 Testing MindSync Frontend-Backend Integration\n');
  
  const baseURL = 'http://localhost:8081/api';
  
  try {
    // Test 1: Check if server is responding
    console.log('1️⃣ Testing server connectivity...');
    const healthCheck = await axios.get(baseURL, { timeout: 5000 });
    console.log('✅ Server is responding\n');
    
    // Test 2: Try to get templates (this should require auth and fail)
    console.log('2️⃣ Testing templates endpoint (should require auth)...');
    try {
      const templatesResponse = await axios.get(`${baseURL}/tasks/templates`, { timeout: 5000 });
      console.log('⚠️ Templates endpoint responded without auth - check if auth is required');
      console.log(`   Response: ${templatesResponse.data.length} templates found`);
    } catch (authError) {
      if (authError.response?.status === 401 || authError.response?.status === 403) {
        console.log('✅ Templates endpoint properly requires authentication');
      } else {
        console.log(`❌ Unexpected error: ${authError.response?.status} - ${authError.message}`);
      }
    }
    console.log('');
    
    // Test 3: Check what endpoints are available
    console.log('3️⃣ Testing available auth endpoints...');
    try {
      const authTest = await axios.post(`${baseURL}/auth/login`, {
        email: 'test@test.com',
        password: 'wrong'
      }, { timeout: 5000 });
    } catch (authError) {
      if (authError.response?.status === 401) {
        console.log('✅ Auth login endpoint is working (returns 401 for wrong credentials)');
      } else if (authError.response?.status === 400) {
        console.log('✅ Auth login endpoint is working (returns 400 for invalid request)');
      } else {
        console.log(`   Auth endpoint status: ${authError.response?.status}`);
      }
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Login to your app with valid credentials');
    console.log('2. JWT token should be saved automatically');
    console.log('3. Try creating a task - should work now!');
    console.log('4. Try accessing templates - should work with JWT!');
    
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    console.log('\n💡 Make sure your backend is running on localhost:8081');
  }
}

testBackendFlow().catch(console.error);
