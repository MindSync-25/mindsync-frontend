// API Testing Service for Local Backend Integration
import axios from 'axios';
import { environment } from '../config/environments';

const apiClient = axios.create({
  baseURL: environment.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// API Testing Functions
export const testAPI = {
  // Health Check
  async testHealth() {
    console.log('🔥 Testing Backend Health...');
    try {
      const response = await apiClient.get('/health');
      console.log('✅ Health Check:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Health Check Failed:', error.message);
      throw error;
    }
  },

  // Authentication Test
  async testAuth() {
    console.log('🔐 Testing Authentication...');
    try {
      // Test registration
      const registerData = {
        email: 'test@mindsync.app',
        password: 'TestPassword123!',
        name: 'Frontend Test User'
      };
      
      const registerResponse = await apiClient.post('/api/auth/register', registerData);
      console.log('✅ Registration:', registerResponse.data);
      
      // Test login
      const loginResponse = await apiClient.post('/api/auth/login', {
        email: registerData.email,
        password: registerData.password
      });
      console.log('✅ Login:', loginResponse.data);
      
      return loginResponse.data;
    } catch (error) {
      console.error('❌ Auth Test Failed:', error.message);
      throw error;
    }
  },

  // News API Test
  async testNews() {
    console.log('📰 Testing News API...');
    try {
      const response = await apiClient.get('/api/news/recent');
      console.log('✅ News API:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ News Test Failed:', error.message);
      throw error;
    }
  },

  // Weather API Test
  async testWeather() {
    console.log('🌤️ Testing Weather API...');
    try {
      const response = await apiClient.get('/api/weather/London');
      console.log('✅ Weather API:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Weather Test Failed:', error.message);
      throw error;
    }
  },

  // Run All Tests
  async runAllTests() {
    console.log('🚀 STARTING COMPREHENSIVE API TESTING...\n');
    
    const results = {
      health: null,
      auth: null,
      news: null,
      weather: null,
      success: false
    };

    try {
      // Test Health
      results.health = await this.testHealth();
      
      // Test Authentication
      results.auth = await this.testAuth();
      
      // Test News
      results.news = await this.testNews();
      
      // Test Weather
      results.weather = await this.testWeather();
      
      results.success = true;
      console.log('\n🎉 ALL API TESTS PASSED! LEGENDARY BACKEND IS READY! 🔥');
      
    } catch (error) {
      console.error('\n❌ API Testing Failed:', error.message);
      results.success = false;
    }
    
    return results;
  }
};

export default testAPI;
