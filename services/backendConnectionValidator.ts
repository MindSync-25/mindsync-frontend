// Backend Connection Validator - Tests exact frontend ↔ backend mapping
import { testAPI } from './testAPI';
import { aiAPI } from './aiAPI';

export class BackendConnectionValidator {
  
  /**
   * Validate the exact mapping provided:
   * AIWorkloadWidget → /api/ai/optimize-tasks/{userId} ✅
   * AIOptimizationWidget → /api/ai/optimize-tasks/{userId} ✅  
   * AIProductivityWidget → /api/ai/productivity-insights/{userId} ✅
   * AINotificationsWidget → /api/ai/contextual-suggestions/{userId} ✅
   * AIChatInterface → /api/ai/chat ✅
   * AITaskSuggestions → /api/ai/task-priority-suggestion ✅
   */
  async validateExactMapping(): Promise<{
    success: boolean;
    mappingResults: { [key: string]: boolean };
    summary: string;
  }> {
    console.log('🎯 VALIDATING EXACT FRONTEND ↔ BACKEND MAPPING');
    console.log('==============================================\n');

    const mappingResults: { [key: string]: boolean } = {};
    const testUserId = 'connection-test-user-123';
    const testTaskId = 'connection-test-task-456';

    try {
      // Test 1: AIWorkloadWidget → /api/ai/optimize-tasks/{userId}
      console.log('🔍 Testing: AIWorkloadWidget → /api/ai/optimize-tasks/{userId}');
      try {
        const workloadData = await aiAPI.getTaskOptimization(testUserId);
        mappingResults.AIWorkloadWidget = true;
        console.log('✅ AIWorkloadWidget mapping VERIFIED');
        console.log(`   Response: Workload score ${workloadData.workloadScore}, ${workloadData.suggestions.length} suggestions`);
      } catch (error) {
        mappingResults.AIWorkloadWidget = false;
        console.log('❌ AIWorkloadWidget mapping FAILED');
      }

      // Test 2: AIOptimizationWidget → /api/ai/optimize-tasks/{userId}
      console.log('\n🔍 Testing: AIOptimizationWidget → /api/ai/optimize-tasks/{userId}');
      try {
        const optimizationData = await aiAPI.getTaskOptimization(testUserId);
        mappingResults.AIOptimizationWidget = true;
        console.log('✅ AIOptimizationWidget mapping VERIFIED');
        console.log(`   Response: ${optimizationData.suggestions.length} optimization suggestions available`);
      } catch (error) {
        mappingResults.AIOptimizationWidget = false;
        console.log('❌ AIOptimizationWidget mapping FAILED');
      }

      // Test 3: AIProductivityWidget → /api/ai/productivity-insights/{userId}
      console.log('\n🔍 Testing: AIProductivityWidget → /api/ai/productivity-insights/{userId}');
      try {
        const productivityData = await aiAPI.getProductivityInsights(testUserId);
        mappingResults.AIProductivityWidget = true;
        console.log('✅ AIProductivityWidget mapping VERIFIED');
        console.log(`   Response: ${productivityData.completionRate}% completion rate, trend: ${productivityData.productivityTrend}`);
      } catch (error) {
        mappingResults.AIProductivityWidget = false;
        console.log('❌ AIProductivityWidget mapping FAILED');
      }

      // Test 4: AINotificationsWidget → /api/ai/contextual-suggestions/{userId}
      console.log('\n🔍 Testing: AINotificationsWidget → /api/ai/contextual-suggestions/{userId}');
      try {
        const notificationsData = await aiAPI.getContextualSuggestions(testUserId);
        mappingResults.AINotificationsWidget = true;
        console.log('✅ AINotificationsWidget mapping VERIFIED');
        console.log(`   Response: ${notificationsData.length} contextual suggestions available`);
      } catch (error) {
        mappingResults.AINotificationsWidget = false;
        console.log('❌ AINotificationsWidget mapping FAILED');
      }

      // Test 5: AIChatInterface → /api/ai/chat
      console.log('\n🔍 Testing: AIChatInterface → /api/ai/chat');
      try {
        const chatData = await aiAPI.sendChatMessage('Test connection message', testUserId);
        mappingResults.AIChatInterface = true;
        console.log('✅ AIChatInterface mapping VERIFIED');
        console.log(`   Response: "${chatData.response.substring(0, 50)}..."`);
      } catch (error) {
        mappingResults.AIChatInterface = false;
        console.log('❌ AIChatInterface mapping FAILED');
      }

      // Test 6: AITaskSuggestions → /api/ai/task-priority-suggestion
      console.log('\n🔍 Testing: AITaskSuggestions → /api/ai/task-priority-suggestion');
      try {
        const suggestionData = await aiAPI.getTaskPrioritySuggestion(testTaskId);
        mappingResults.AITaskSuggestions = true;
        console.log('✅ AITaskSuggestions mapping VERIFIED');
        console.log(`   Response: Priority ${suggestionData.suggestedPriority}, confidence ${Math.round(suggestionData.confidence * 100)}%`);
      } catch (error) {
        mappingResults.AITaskSuggestions = false;
        console.log('❌ AITaskSuggestions mapping FAILED');
      }

      // Calculate success rate
      const successfulMappings = Object.values(mappingResults).filter(Boolean).length;
      const totalMappings = Object.keys(mappingResults).length;
      const successRate = (successfulMappings / totalMappings) * 100;

      console.log('\n🎯 MAPPING VALIDATION SUMMARY:');
      console.log('==============================');
      console.log(`✅ Successful mappings: ${successfulMappings}/${totalMappings}`);
      console.log(`📊 Success rate: ${successRate.toFixed(1)}%`);

      let summary: string;
      if (successRate === 100) {
        summary = '🎉 PERFECT! All frontend components mapped to backend endpoints!';
        console.log(summary);
        console.log('🚀 Ready for production deployment!');
      } else if (successRate >= 80) {
        summary = '✅ EXCELLENT! Most mappings working, minor fixes needed.';
        console.log(summary);
      } else if (successRate >= 60) {
        summary = '⚠️ GOOD! Some mappings need attention.';
        console.log(summary);
      } else {
        summary = '🚨 ATTENTION! Multiple mapping issues detected.';
        console.log(summary);
      }

      console.log('\nDetailed Results:');
      Object.entries(mappingResults).forEach(([component, success]) => {
        console.log(`${success ? '✅' : '❌'} ${component}`);
      });

      return {
        success: successRate >= 80,
        mappingResults,
        summary
      };

    } catch (error) {
      console.error('❌ Mapping validation failed:', error);
      return {
        success: false,
        mappingResults,
        summary: `Validation failed: ${error.message}`
      };
    }
  }

  /**
   * Quick connection health check
   */
  async quickHealthCheck(): Promise<boolean> {
    console.log('⚡ QUICK BACKEND CONNECTION HEALTH CHECK');
    console.log('========================================\n');

    try {
      // Test a few key endpoints quickly
      const healthTests = await Promise.allSettled([
        aiAPI.getTaskOptimization('health-check-user'),
        aiAPI.getProductivityInsights('health-check-user'),
        aiAPI.sendChatMessage('Health check', 'health-check-user')
      ]);

      const successfulTests = healthTests.filter(test => test.status === 'fulfilled').length;
      const healthScore = (successfulTests / healthTests.length) * 100;

      console.log(`🏥 Backend Health Score: ${healthScore.toFixed(1)}%`);
      
      if (healthScore >= 70) {
        console.log('✅ Backend is healthy and ready!');
        return true;
      } else {
        console.log('⚠️ Backend health issues detected.');
        return false;
      }

    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      return false;
    }
  }

  /**
   * Load test for production readiness
   */
  async runLoadTest(iterations: number = 5): Promise<{
    success: boolean;
    averageResponseTime: number;
    maxResponseTime: number;
    minResponseTime: number;
  }> {
    console.log(`🔥 RUNNING LOAD TEST (${iterations} iterations)`);
    console.log('=====================================\n');

    const responseTimes: number[] = [];
    let successfulRequests = 0;

    for (let i = 1; i <= iterations; i++) {
      console.log(`🔄 Load test iteration ${i}/${iterations}`);
      
      const startTime = Date.now();
      
      try {
        // Test multiple endpoints simultaneously
        await Promise.all([
          aiAPI.getTaskOptimization(`load-test-user-${i}`),
          aiAPI.getProductivityInsights(`load-test-user-${i}`),
          aiAPI.sendChatMessage(`Load test message ${i}`, `load-test-user-${i}`)
        ]);
        
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
        successfulRequests++;
        
        console.log(`✅ Iteration ${i}: ${responseTime}ms`);
        
      } catch (error) {
        console.log(`❌ Iteration ${i}: Failed`);
      }
    }

    const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    const successRate = (successfulRequests / iterations) * 100;

    console.log('\n📊 LOAD TEST RESULTS:');
    console.log('=====================');
    console.log(`✅ Successful requests: ${successfulRequests}/${iterations} (${successRate.toFixed(1)}%)`);
    console.log(`⚡ Average response time: ${averageResponseTime.toFixed(0)}ms`);
    console.log(`🚀 Fastest response: ${minResponseTime}ms`);
    console.log(`🐌 Slowest response: ${maxResponseTime}ms`);

    const isHealthy = successRate >= 90 && averageResponseTime < 5000;
    
    if (isHealthy) {
      console.log('🎉 LOAD TEST PASSED! Backend is production-ready!');
    } else {
      console.log('⚠️ Load test indicates performance issues.');
    }

    return {
      success: isHealthy,
      averageResponseTime,
      maxResponseTime,
      minResponseTime
    };
  }
}

// Export singleton instance
export const connectionValidator = new BackendConnectionValidator();

// Quick validation function
export const validateConnection = async (): Promise<boolean> => {
  const result = await connectionValidator.validateExactMapping();
  return result.success;
};

// Export for use in other files
export default BackendConnectionValidator;
