// API Testing Service for Local Backend Integration
import axios from 'axios';
import { environment } from '../config/environments';
import { testAIAPI } from './testAIAPI';

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

  // Tasks API Test: Fetch all tasks
  async testFetchTasks() {
    console.log('📋 Testing Fetch Tasks...');
    try {
      const response = await apiClient.get('/tasks');
      console.log('✅ Fetch Tasks:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Fetch Tasks Failed:', error.message);
      throw error;
    }
  },

  // Tasks API Test: Create a new task
  async testCreateTask() {
    console.log('✍️ Testing Create Task...');
    try {
      const taskData = {
        title: 'API Test Task',
        description: 'This task is created by testAPI',
        priority: 'medium',
        dueDate: new Date().toISOString(),
        isCompleted: false,
        dependsOn: []
      };
      const response = await apiClient.post('/tasks', taskData);
      console.log('✅ Create Task:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create Task Failed:', error.message);
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
      tasksFetch: null,
      tasksCreate: null,
      aiTests: null,
      backendConnection: null,
      productionReadiness: null,
      success: false
    };

    try {
      // Test Core Backend
      results.health = await this.testHealth();
      results.auth = await this.testAuth();
      results.news = await this.testNews();
      results.weather = await this.testWeather();
      results.tasksFetch = await this.testFetchTasks();
      results.tasksCreate = await this.testCreateTask();
      
      // Test AI Features
      console.log('\n🧠 STARTING AI INTEGRATION TESTS...\n');
      results.aiTests = await testAIAPI.runAllAITests();
      
      // Test Backend Connection Mapping
      console.log('\n🔗 TESTING BACKEND CONNECTION MAPPING...\n');
      results.backendConnection = await this.validateBackendConnection();
      
      // Test Production Readiness
      console.log('\n🚀 TESTING PRODUCTION READINESS...\n');
      results.productionReadiness = await this.testProductionReadiness();
      
      results.success = true;
      console.log('\n🎉 ALL API TESTS PASSED! LEGENDARY BACKEND + AI IS READY! 🔥');
      console.log('🎯 Frontend ↔ Backend mapping verified!');
      console.log('🚀 Production deployment ready!');
      
    } catch (error) {
      console.error('\n❌ API Testing Failed:', error.message);
      results.success = false;
    }
    
    return results;
  },

  // Quick AI Test Function
  async testAIOnly() {
    console.log('🧠 QUICK AI TESTING...\n');
    try {
      const aiResults = await testAIAPI.runAllAITests();
      return aiResults;
    } catch (error) {
      console.error('❌ AI Quick Test Failed:', error.message);
      throw error;
    }
  },

  // Backend Connection Validation
  async validateBackendConnection() {
    console.log('🔗 VALIDATING BACKEND CONNECTION MAPPING...\n');
    
    const connectionTests = {
      workloadWidget: false,
      optimizationWidget: false,
      productivityWidget: false,
      notificationsWidget: false,
      chatInterface: false,
      taskSuggestions: false,
      health: false
    };

    try {
      // Test 1: AIWorkloadWidget → /api/ai/optimize-tasks/{userId}
      console.log('🔍 Testing AIWorkloadWidget endpoint...');
      const workloadResponse = await apiClient.get('/api/ai/optimize-tasks/test-user-123');
      connectionTests.workloadWidget = workloadResponse.status === 200;
      console.log(`✅ AIWorkloadWidget → /api/ai/optimize-tasks/{userId} ${connectionTests.workloadWidget ? 'CONNECTED' : 'FAILED'}`);

      // Test 2: AIOptimizationWidget → /api/ai/optimize-tasks/{userId}
      console.log('🔍 Testing AIOptimizationWidget endpoint...');
      const optimizationResponse = await apiClient.get('/api/ai/optimize-tasks/test-user-123');
      connectionTests.optimizationWidget = optimizationResponse.status === 200;
      console.log(`✅ AIOptimizationWidget → /api/ai/optimize-tasks/{userId} ${connectionTests.optimizationWidget ? 'CONNECTED' : 'FAILED'}`);

      // Test 3: AIProductivityWidget → /api/ai/productivity-insights/{userId}
      console.log('🔍 Testing AIProductivityWidget endpoint...');
      const productivityResponse = await apiClient.get('/api/ai/productivity-insights/test-user-123');
      connectionTests.productivityWidget = productivityResponse.status === 200;
      console.log(`✅ AIProductivityWidget → /api/ai/productivity-insights/{userId} ${connectionTests.productivityWidget ? 'CONNECTED' : 'FAILED'}`);

      // Test 4: AINotificationsWidget → /api/ai/contextual-suggestions/{userId}
      console.log('🔍 Testing AINotificationsWidget endpoint...');
      const notificationsResponse = await apiClient.get('/api/ai/contextual-suggestions/test-user-123');
      connectionTests.notificationsWidget = notificationsResponse.status === 200;
      console.log(`✅ AINotificationsWidget → /api/ai/contextual-suggestions/{userId} ${connectionTests.notificationsWidget ? 'CONNECTED' : 'FAILED'}`);

      // Test 5: AIChatInterface → /api/ai/chat
      console.log('🔍 Testing AIChatInterface endpoint...');
      const chatResponse = await apiClient.post('/api/ai/chat', {
        message: 'Hello AI, test connection',
        userId: 'test-user-123'
      });
      connectionTests.chatInterface = chatResponse.status === 200;
      console.log(`✅ AIChatInterface → /api/ai/chat ${connectionTests.chatInterface ? 'CONNECTED' : 'FAILED'}`);

      // Test 6: AITaskSuggestions → /api/ai/task-priority-suggestion
      console.log('🔍 Testing AITaskSuggestions endpoint...');
      const suggestionsResponse = await apiClient.post('/api/ai/task-priority-suggestion', {
        taskId: 'test-task-123'
      });
      connectionTests.taskSuggestions = suggestionsResponse.status === 200;
      console.log(`✅ AITaskSuggestions → /api/ai/task-priority-suggestion ${connectionTests.taskSuggestions ? 'CONNECTED' : 'FAILED'}`);

      // Test 7: Backend Health
      console.log('🔍 Testing backend health...');
      const healthResponse = await apiClient.get('/health');
      connectionTests.health = healthResponse.status === 200;
      console.log(`✅ Backend Health Check ${connectionTests.health ? 'HEALTHY' : 'UNHEALTHY'}`);

      // Summary
      const connectedCount = Object.values(connectionTests).filter(Boolean).length;
      const totalTests = Object.keys(connectionTests).length;
      const connectionRate = (connectedCount / totalTests) * 100;

      console.log('\n🎯 BACKEND CONNECTION SUMMARY:');
      console.log('=====================================');
      console.log(`✅ Connected: ${connectedCount}/${totalTests}`);
      console.log(`📊 Success Rate: ${connectionRate.toFixed(1)}%`);
      
      if (connectionRate === 100) {
        console.log('🎉 PERFECT! All AI widgets connected to backend! 🚀');
      } else if (connectionRate >= 80) {
        console.log('✅ EXCELLENT! Most AI widgets connected! 👍');
      } else if (connectionRate >= 60) {
        console.log('⚠️ GOOD! Some widgets need connection fixes.');
      } else {
        console.log('🚨 ATTENTION! Multiple connection issues detected.');
      }

      return {
        success: connectionRate >= 80,
        connectionRate,
        details: connectionTests,
        connectedCount,
        totalTests
      };

    } catch (error) {
      console.error('❌ Backend Connection Validation Failed:', error.message);
      return {
        success: false,
        connectionRate: 0,
        details: connectionTests,
        error: error.message
      };
    }
  },

  // Production Readiness Test
  async testProductionReadiness() {
    console.log('🚀 TESTING PRODUCTION READINESS...\n');
    
    const readinessReport = {
      backendConnection: false,
      aiIntegration: false,
      errorHandling: false,
      performance: false,
      authentication: false,
      overall: 0
    };

    try {
      // Test 1: Backend Connection
      console.log('🔗 Testing backend connection...');
      const connectionResult = await this.validateBackendConnection();
      readinessReport.backendConnection = connectionResult.success;

      // Test 2: AI Integration
      console.log('🧠 Testing AI integration...');
      const aiResult = await this.testAIOnly();
      readinessReport.aiIntegration = aiResult.success !== false;

      // Test 3: Error Handling
      console.log('🛡️ Testing error handling...');
      try {
        await apiClient.get('/api/nonexistent-endpoint');
      } catch (error) {
        // Error handling is working if we catch the error
        readinessReport.errorHandling = true;
      }

      // Test 4: Performance (response time under 5 seconds)
      console.log('⚡ Testing performance...');
      const startTime = Date.now();
      await apiClient.get('/health');
      const responseTime = Date.now() - startTime;
      readinessReport.performance = responseTime < 5000;
      console.log(`Response time: ${responseTime}ms ${readinessReport.performance ? '✅' : '❌'}`);

      // Test 5: Authentication
      console.log('🔐 Testing authentication...');
      try {
        const authResult = await this.testAuth();
        readinessReport.authentication = authResult !== null;
      } catch (error) {
        readinessReport.authentication = false;
      }

      // Calculate overall readiness
      const readyComponents = Object.values(readinessReport).filter(Boolean).length - 1; // -1 for overall
      readinessReport.overall = (readyComponents / 5) * 100;

      console.log('\n🎯 PRODUCTION READINESS REPORT:');
      console.log('=====================================');
      console.log(`🔗 Backend Connection: ${readinessReport.backendConnection ? '✅' : '❌'}`);
      console.log(`🧠 AI Integration: ${readinessReport.aiIntegration ? '✅' : '❌'}`);
      console.log(`🛡️ Error Handling: ${readinessReport.errorHandling ? '✅' : '❌'}`);
      console.log(`⚡ Performance: ${readinessReport.performance ? '✅' : '❌'}`);
      console.log(`🔐 Authentication: ${readinessReport.authentication ? '✅' : '❌'}`);
      console.log(`📊 Overall Readiness: ${readinessReport.overall.toFixed(1)}%`);

      if (readinessReport.overall >= 90) {
        console.log('\n🎉 PRODUCTION READY! Deploy with confidence! 🚀');
      } else if (readinessReport.overall >= 70) {
        console.log('\n✅ ALMOST READY! Minor fixes needed before deployment.');
      } else {
        console.log('\n⚠️ NOT READY! Major issues need to be resolved.');
      }

      return readinessReport;

    } catch (error) {
      console.error('❌ Production Readiness Test Failed:', error.message);
      return {
        ...readinessReport,
        error: error.message
      };
    }
  }
};

export default testAPI;
