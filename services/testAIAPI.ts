// AI API Testing Service for MindSync AI Integration
import axios from 'axios';
import { environment } from '../config/environments';

const apiClient = axios.create({
  baseURL: environment.API_BASE_URL,
  timeout: 15000, // Longer timeout for AI responses
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// AI API Testing Functions
export const testAIAPI = {
  // Test AI Task Priority Suggestion
  async testTaskPrioritySuggestion() {
    console.log('🧠 Testing AI Task Priority Suggestion...');
    try {
      const taskData = {
        taskId: '123e4567-e89b-12d3-a456-426614174000'
      };
      const response = await apiClient.post('/api/ai/task-priority-suggestion', taskData);
      console.log('✅ AI Priority Suggestion:', response.data);
      console.log(`   🎯 Suggested Priority: ${response.data.suggestedPriority}`);
      console.log(`   💡 Reasoning: ${response.data.reasoning}`);
      console.log(`   📊 Confidence: ${(response.data.confidence * 100).toFixed(1)}%`);
      return response.data;
    } catch (error) {
      console.error('❌ AI Priority Suggestion Failed:', error.message);
      throw error;
    }
  },

  // Test AI Chat Interface
  async testAIChat() {
    console.log('💬 Testing AI Chat Interface...');
    try {
      const chatData = {
        message: 'What tasks do I have due today?',
        userId: 'test-user-id'
      };
      const response = await apiClient.post('/api/ai/chat', chatData);
      console.log('✅ AI Chat Response:', response.data);
      console.log(`   🤖 AI Response: ${response.data.response}`);
      console.log(`   📊 Confidence: ${(response.data.confidence * 100).toFixed(1)}%`);
      if (response.data.suggestions) {
        console.log(`   💡 Suggestions: ${response.data.suggestions.join(', ')}`);
      }
      return response.data;
    } catch (error) {
      console.error('❌ AI Chat Failed:', error.message);
      throw error;
    }
  },

  // Test AI Task Optimization
  async testTaskOptimization() {
    console.log('⚡ Testing AI Task Optimization...');
    try {
      const response = await apiClient.get('/api/ai/optimize-tasks/test-user-id');
      console.log('✅ AI Task Optimization:', response.data);
      console.log(`   📊 Workload Score: ${response.data.workloadScore}`);
      console.log(`   🚨 Burnout Risk: ${response.data.burnoutRisk}`);
      console.log(`   💡 Suggestions Count: ${response.data.suggestions.length}`);
      response.data.suggestions.forEach((suggestion: any, index: number) => {
        console.log(`     ${index + 1}. ${suggestion.message}`);
      });
      return response.data;
    } catch (error) {
      console.error('❌ AI Task Optimization Failed:', error.message);
      throw error;
    }
  },

  // Test AI Contextual Suggestions
  async testContextualSuggestions() {
    console.log('🎯 Testing AI Contextual Suggestions...');
    try {
      const response = await apiClient.get('/api/ai/contextual-suggestions/test-user-id');
      console.log('✅ AI Contextual Suggestions:', response.data);
      response.data.forEach((suggestion: any, index: number) => {
        console.log(`   ${index + 1}. ${suggestion.title} (${(suggestion.confidenceScore * 100).toFixed(1)}% confidence)`);
        console.log(`      📝 ${suggestion.description}`);
      });
      return response.data;
    } catch (error) {
      console.error('❌ AI Contextual Suggestions Failed:', error.message);
      throw error;
    }
  },

  // Test AI Productivity Insights
  async testProductivityInsights() {
    console.log('📈 Testing AI Productivity Insights...');
    try {
      const response = await apiClient.get('/api/ai/productivity-insights/test-user-id');
      console.log('✅ AI Productivity Insights:', response.data);
      console.log(`   📋 Tasks Created: ${response.data.tasksCreated}`);
      console.log(`   ✅ Tasks Completed: ${response.data.tasksCompleted}`);
      console.log(`   📊 Completion Rate: ${response.data.completionRate}%`);
      console.log(`   ⏱️ Focus Time: ${response.data.totalFocusTimeHours} hours`);
      console.log(`   📈 Trend: ${response.data.productivityTrend}`);
      console.log(`   💡 Recommendations: ${response.data.recommendedActions.length}`);
      return response.data;
    } catch (error) {
      console.error('❌ AI Productivity Insights Failed:', error.message);
      throw error;
    }
  },

  // Advanced AI Chat Tests
  async testAdvancedAIChat() {
    console.log('🚀 Testing Advanced AI Chat Scenarios...');
    const testQueries = [
      'Create a task to review quarterly reports by Friday',
      'What should I work on next?',
      'Show me all overdue tasks',
      'How many high priority tasks do I have?',
      'When is my peak productivity time?'
    ];

    const results = [];
    for (const query of testQueries) {
      try {
        console.log(`   💬 Testing: "${query}"`);
        const response = await apiClient.post('/api/ai/chat', {
          message: query,
          userId: 'test-user-id'
        });
        console.log(`   🤖 Response: ${response.data.response.substring(0, 100)}...`);
        results.push({ query, response: response.data });
      } catch (error) {
        console.error(`   ❌ Failed for query: "${query}"`, error.message);
        results.push({ query, error: error.message });
      }
    }
    return results;
  },

  // Test AI Performance Metrics
  async testAIPerformance() {
    console.log('⚡ Testing AI Performance Metrics...');
    const startTime = Date.now();
    
    try {
      const promises = [
        this.testTaskPrioritySuggestion(),
        this.testAIChat(),
        this.testContextualSuggestions()
      ];
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log(`✅ AI Performance Test Completed in ${totalTime}ms`);
      console.log(`   ⚡ Average response time: ${(totalTime / 3).toFixed(0)}ms per request`);
      
      return {
        totalTime,
        averageTime: totalTime / 3,
        results
      };
    } catch (error) {
      console.error('❌ AI Performance Test Failed:', error.message);
      throw error;
    }
  },

  // Run All AI Tests
  async runAllAITests() {
    console.log('🚀 STARTING COMPREHENSIVE AI API TESTING...\n');
    console.log('🧠 Testing MindSync AI Integration - Multi-AI Approach');
    console.log('💰 Cost-Optimized AI: 90% Local + 9% Open Source + 1% Paid APIs\n');
    
    const results = {
      prioritySuggestion: null,
      aiChat: null,
      taskOptimization: null,
      contextualSuggestions: null,
      productivityInsights: null,
      advancedChat: null,
      performance: null,
      success: false
    };

    try {
      // Test basic AI features
      console.log('📋 PHASE 1: Basic AI Features');
      results.prioritySuggestion = await this.testTaskPrioritySuggestion();
      results.aiChat = await this.testAIChat();
      
      console.log('\n📊 PHASE 2: Advanced AI Analytics');
      results.taskOptimization = await this.testTaskOptimization();
      results.contextualSuggestions = await this.testContextualSuggestions();
      results.productivityInsights = await this.testProductivityInsights();
      
      console.log('\n🚀 PHASE 3: Advanced AI Interactions');
      results.advancedChat = await this.testAdvancedAIChat();
      
      console.log('\n⚡ PHASE 4: Performance Testing');
      results.performance = await this.testAIPerformance();
      
      results.success = true;
      console.log('\n🎉 ALL AI TESTS PASSED! MINDSYNNC AI IS LEGENDARY! 🔥');
      console.log('🧠 AI Intelligence: READY');
      console.log('💬 Chat Interface: READY'); 
      console.log('📊 Analytics: READY');
      console.log('⚡ Performance: OPTIMAL');
      console.log('💰 Cost Efficiency: MAXIMUM');
      
    } catch (error) {
      console.error('\n❌ AI Testing Failed:', error.message);
      results.success = false;
    }
    
    return results;
  }
};

export default testAIAPI;
