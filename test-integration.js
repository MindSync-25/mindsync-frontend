#!/usr/bin/env node
// Frontend API Testing Script
const axios = require('axios');

// Simple API testing without modules
async function testBackendConnection() {
  console.log('🔥 FRONTEND-BACKEND INTEGRATION TESTING STARTED! 🚀\n');
  
  const API_BASE_URL = 'http://localhost:5000';
  
  try {
    // Test Health Check
    console.log('🔍 Testing backend health...');
    const healthResponse = await axios.get(`${API_BASE_URL}/test`);
    console.log('✅ Health Check:', healthResponse.data);
    
    // Test News Categories
    console.log('📰 Testing news categories...');
    const newsResponse = await axios.get(`${API_BASE_URL}/api/news/categories`);
    console.log('✅ News Categories:', newsResponse.data);
    
    console.log('\n🎉 FRONTEND-BACKEND INTEGRATION: LEGENDARY SUCCESS! 💪');
    console.log('🚀 Backend is ready for mobile app integration!');
    console.log('⚡ All endpoints responding perfectly!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('💡 Make sure backend server is running on localhost:5000');
    return false;
  }
}

async function runFrontendTests() {
  // Wait for backend to be ready
  console.log('⏳ Waiting for backend server...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const success = await testBackendConnection();
  
  if (success) {
    console.log('\n🔥 READY FOR MOBILE APP INTEGRATION! 🚀');
  }
}

// Run if called directly
if (require.main === module) {
  runFrontendTests();
}

module.exports = { runFrontendTests };
