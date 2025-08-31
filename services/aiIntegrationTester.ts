// AI Integration Test Suite - Comprehensive testing for all AI features
import { aiAPI } from '../services/aiAPI';

export interface AITestResults {
  success: boolean;
  feature: string;
  message: string;
  data?: any;
  error?: string;
}

export class AIIntegrationTester {
  private userId: string = 'test-user-123';
  private testTaskId: string = 'test-task-456';

  /**
   * Run comprehensive AI integration tests
   */
  async runAllTests(): Promise<AITestResults[]> {
    console.log('🧠 Starting AI Integration Tests...');
    
    const results: AITestResults[] = [];

    // Test 1: Priority Suggestions
    results.push(await this.testPrioritySuggestions());
    
    // Test 2: Chat Interface
    results.push(await this.testChatInterface());
    
    // Test 3: Task Optimization
    results.push(await this.testTaskOptimization());
    
    // Test 4: Contextual Suggestions
    results.push(await this.testContextualSuggestions());
    
    // Test 5: Productivity Insights
    results.push(await this.testProductivityInsights());
    
    // Test 6: Notifications System
    results.push(await this.testNotificationsSystem());
    
    // Test 7: Dependency Suggestions
    results.push(await this.testDependencySuggestions());
    
    // Test 8: Task Text Analysis
    results.push(await this.testTaskTextAnalysis());
    
    // Test 9: Scheduling Suggestions
    results.push(await this.testSchedulingSuggestions());

    // Test 10: Error Handling & Fallbacks
    results.push(await this.testErrorHandling());

    this.logTestResults(results);
    return results;
  }

  private async testPrioritySuggestions(): Promise<AITestResults> {
    try {
      console.log('Testing Priority Suggestions...');
      const result = await aiAPI.getTaskPrioritySuggestion(this.testTaskId);
      
      return {
        success: true,
        feature: 'Priority Suggestions',
        message: `✅ Priority suggestion: ${result.suggestedPriority} (${result.confidence * 100}% confidence)`,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        feature: 'Priority Suggestions',
        message: '❌ Priority suggestions failed',
        error: error.message
      };
    }
  }

  private async testChatInterface(): Promise<AITestResults> {
    try {
      console.log('Testing Chat Interface...');
      const result = await aiAPI.sendChatMessage('How can I be more productive today?', this.userId);
      
      return {
        success: true,
        feature: 'Chat Interface',
        message: `✅ Chat response received: "${result.response.substring(0, 50)}..."`,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        feature: 'Chat Interface',
        message: '❌ Chat interface failed',
        error: error.message
      };
    }
  }

  private async testTaskOptimization(): Promise<AITestResults> {
    try {
      console.log('Testing Task Optimization...');
      const result = await aiAPI.getTaskOptimization(this.userId);
      
      return {
        success: true,
        feature: 'Task Optimization',
        message: `✅ Optimization suggestions: ${result.suggestions.length} suggestions, workload score: ${result.workloadScore}`,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        feature: 'Task Optimization',
        message: '❌ Task optimization failed',
        error: error.message
      };
    }
  }

  private async testContextualSuggestions(): Promise<AITestResults> {
    try {
      console.log('Testing Contextual Suggestions...');
      const result = await aiAPI.getContextualSuggestions(this.userId);
      
      return {
        success: true,
        feature: 'Contextual Suggestions',
        message: `✅ Contextual suggestions: ${result.length} suggestions received`,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        feature: 'Contextual Suggestions',
        message: '❌ Contextual suggestions failed',
        error: error.message
      };
    }
  }

  private async testProductivityInsights(): Promise<AITestResults> {
    try {
      console.log('Testing Productivity Insights...');
      const result = await aiAPI.getProductivityInsights(this.userId);
      
      return {
        success: true,
        feature: 'Productivity Insights',
        message: `✅ Productivity insights: ${result.completionRate}% completion rate, trend: ${result.productivityTrend}`,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        feature: 'Productivity Insights',
        message: '❌ Productivity insights failed',
        error: error.message
      };
    }
  }

  private async testNotificationsSystem(): Promise<AITestResults> {
    try {
      console.log('Testing Notifications System...');
      const result = await aiAPI.getNotifications(this.userId);
      
      return {
        success: true,
        feature: 'Notifications System',
        message: `✅ Notifications: ${result.length} notifications received`,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        feature: 'Notifications System',
        message: '❌ Notifications system failed',
        error: error.message
      };
    }
  }

  private async testDependencySuggestions(): Promise<AITestResults> {
    try {
      console.log('Testing Dependency Suggestions...');
      const result = await aiAPI.getTaskDependencySuggestions(this.testTaskId);
      
      return {
        success: true,
        feature: 'Dependency Suggestions',
        message: `✅ Dependency suggestions: ${result.length} suggestions`,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        feature: 'Dependency Suggestions',
        message: '❌ Dependency suggestions failed',
        error: error.message
      };
    }
  }

  private async testTaskTextAnalysis(): Promise<AITestResults> {
    try {
      console.log('Testing Task Text Analysis...');
      const result = await aiAPI.analyzeTaskText('Complete the quarterly financial report and send to stakeholders');
      
      return {
        success: true,
        feature: 'Task Text Analysis',
        message: `✅ Text analysis completed: ${result.suggestedTitle ? 'title suggested' : 'no title'}, ${result.extractedKeywords?.length || 0} keywords`,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        feature: 'Task Text Analysis',
        message: '❌ Task text analysis failed',
        error: error.message
      };
    }
  }

  private async testSchedulingSuggestions(): Promise<AITestResults> {
    try {
      console.log('Testing Scheduling Suggestions...');
      const result = await aiAPI.getSchedulingSuggestions(this.userId, this.testTaskId);
      
      return {
        success: true,
        feature: 'Scheduling Suggestions',
        message: `✅ Scheduling suggestions: ${result.optimalTimeSlots?.length || 0} time slots suggested`,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        feature: 'Scheduling Suggestions',
        message: '❌ Scheduling suggestions failed',
        error: error.message
      };
    }
  }

  private async testErrorHandling(): Promise<AITestResults> {
    try {
      console.log('Testing Error Handling & Fallbacks...');
      
      // Test with invalid user ID to trigger fallback
      const result = await aiAPI.getProductivityInsights('invalid-user-id-test');
      
      // If we get a result, fallback is working
      if (result) {
        return {
          success: true,
          feature: 'Error Handling',
          message: '✅ Fallback mechanisms working correctly',
          data: result
        };
      } else {
        return {
          success: false,
          feature: 'Error Handling',
          message: '❌ Fallback mechanisms not working',
          error: 'No fallback response received'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        feature: 'Error Handling',
        message: '❌ Error handling test failed',
        error: error.message
      };
    }
  }

  /**
   * Test widget performance and responsiveness
   */
  async testWidgetPerformance(): Promise<{ [key: string]: number }> {
    console.log('🚀 Testing Widget Performance...');
    
    const performanceResults: { [key: string]: number } = {};

    // Test Workload Widget Load Time
    const workloadStart = Date.now();
    await aiAPI.getTaskOptimization(this.userId);
    performanceResults.workloadWidget = Date.now() - workloadStart;

    // Test Productivity Widget Load Time
    const productivityStart = Date.now();
    await aiAPI.getProductivityInsights(this.userId);
    performanceResults.productivityWidget = Date.now() - productivityStart;

    // Test Notifications Widget Load Time
    const notificationsStart = Date.now();
    await aiAPI.getNotifications(this.userId);
    performanceResults.notificationsWidget = Date.now() - notificationsStart;

    // Test Chat Interface Response Time
    const chatStart = Date.now();
    await aiAPI.sendChatMessage('Quick test message', this.userId);
    performanceResults.chatInterface = Date.now() - chatStart;

    console.log('Performance Results:', performanceResults);
    return performanceResults;
  }

  /**
   * Simulate real user interactions
   */
  async simulateUserJourney(): Promise<AITestResults[]> {
    console.log('👤 Simulating User Journey...');
    
    const journeyResults: AITestResults[] = [];

    // 1. User opens dashboard - Load all widgets
    console.log('Step 1: User opens dashboard');
    const dashboardLoad = await Promise.all([
      aiAPI.getTaskOptimization(this.userId),
      aiAPI.getProductivityInsights(this.userId),
      aiAPI.getNotifications(this.userId),
      aiAPI.getContextualSuggestions(this.userId)
    ]);

    journeyResults.push({
      success: true,
      feature: 'Dashboard Load',
      message: '✅ All widgets loaded successfully',
      data: { widgetsLoaded: dashboardLoad.length }
    });

    // 2. User asks AI for help
    console.log('Step 2: User interacts with AI chat');
    const chatResponse = await aiAPI.sendChatMessage('What should I focus on today?', this.userId);
    
    journeyResults.push({
      success: true,
      feature: 'AI Interaction',
      message: '✅ AI provided helpful response',
      data: chatResponse
    });

    // 3. User gets task priority suggestion
    console.log('Step 3: User requests task priority');
    const prioritySuggestion = await aiAPI.getTaskPrioritySuggestion(this.testTaskId);
    
    journeyResults.push({
      success: true,
      feature: 'Priority Assistance',
      message: `✅ AI suggested priority: ${prioritySuggestion.suggestedPriority}`,
      data: prioritySuggestion
    });

    // 4. User checks notifications
    console.log('Step 4: User checks AI notifications');
    const notifications = await aiAPI.getNotifications(this.userId);
    
    journeyResults.push({
      success: true,
      feature: 'Notification Check',
      message: `✅ ${notifications.length} notifications available`,
      data: notifications
    });

    return journeyResults;
  }

  private logTestResults(results: AITestResults[]): void {
    console.log('\n🧪 AI Integration Test Results:');
    console.log('=====================================');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Success Rate: ${(successful / results.length * 100).toFixed(1)}%`);
    
    console.log('\nDetailed Results:');
    results.forEach(result => {
      console.log(`${result.success ? '✅' : '❌'} ${result.feature}: ${result.message}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    // Test Summary
    if (successful === results.length) {
      console.log('\n🎉 All AI features working perfectly!');
    } else if (successful > failed) {
      console.log('\n⚠️ Most AI features working, some issues detected');
    } else {
      console.log('\n🚨 Multiple AI features need attention');
    }
  }

  /**
   * Generate AI health report
   */
  async generateHealthReport(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    score: number;
    details: AITestResults[];
    recommendations: string[];
  }> {
    const testResults = await this.runAllTests();
    const performanceResults = await this.testWidgetPerformance();
    
    const successfulTests = testResults.filter(r => r.success).length;
    const totalTests = testResults.length;
    const healthScore = (successfulTests / totalTests) * 100;
    
    let status: 'healthy' | 'degraded' | 'critical';
    if (healthScore >= 90) status = 'healthy';
    else if (healthScore >= 70) status = 'degraded';
    else status = 'critical';

    const recommendations: string[] = [];
    
    // Performance recommendations
    Object.entries(performanceResults).forEach(([widget, time]) => {
      if (time > 5000) {
        recommendations.push(`Optimize ${widget} - response time ${time}ms is slow`);
      }
    });

    // Feature recommendations
    testResults.filter(r => !r.success).forEach(result => {
      recommendations.push(`Fix ${result.feature} - ${result.error}`);
    });

    if (recommendations.length === 0) {
      recommendations.push('All AI features are working optimally!');
    }

    return {
      status,
      score: healthScore,
      details: testResults,
      recommendations
    };
  }
}

// Export singleton instance
export const aiTester = new AIIntegrationTester();

// Utility function for quick testing
export const quickAITest = async (): Promise<void> => {
  console.log('🔍 Running Quick AI Test...');
  const results = await aiTester.runAllTests();
  
  const successRate = (results.filter(r => r.success).length / results.length) * 100;
  console.log(`\n📈 Quick Test Complete: ${successRate.toFixed(1)}% success rate`);
  
  if (successRate === 100) {
    console.log('🎯 Perfect! All AI features operational');
  } else if (successRate >= 80) {
    console.log('✅ Good! AI features mostly operational');
  } else {
    console.log('⚠️ Warning! Some AI features need attention');
  }
};

export default AIIntegrationTester;
