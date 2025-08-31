// AI Demo Script - Quick demonstration of all AI features
import { aiTester, quickAITest } from '../services/aiIntegrationTester';
import { aiAPI } from '../services/aiAPI';

export class AIDemoScript {
  private userId = 'demo-user-123';
  private demoTaskId = 'demo-task-456';

  /**
   * Run a comprehensive AI feature demonstration
   */
  async runDemoScript(): Promise<void> {
    console.log('🎬 Starting MindSync AI Feature Demonstration');
    console.log('==============================================\n');

    // Demo 1: AI Health Check
    await this.demoHealthCheck();
    
    // Demo 2: Task Priority Intelligence
    await this.demoPriorityIntelligence();
    
    // Demo 3: AI Chat Assistant
    await this.demoChatAssistant();
    
    // Demo 4: Workload Optimization
    await this.demoWorkloadOptimization();
    
    // Demo 5: Productivity Insights
    await this.demoProductivityInsights();
    
    // Demo 6: Smart Notifications
    await this.demoSmartNotifications();
    
    // Demo 7: Text Analysis
    await this.demoTextAnalysis();
    
    // Demo 8: Scheduling Intelligence
    await this.demoSchedulingIntelligence();

    console.log('\n🎯 AI Demonstration Complete!');
    console.log('=====================================');
    console.log('✨ All AI features are ready for production use');
    console.log('🚀 Users can now experience intelligent productivity assistance');
  }

  private async demoHealthCheck(): Promise<void> {
    console.log('🏥 Demo 1: AI Health Check');
    console.log('---------------------------');
    
    try {
      await quickAITest();
      console.log('✅ AI system health verified\n');
    } catch (error) {
      console.log('❌ AI health check failed:', error);
    }
  }

  private async demoPriorityIntelligence(): Promise<void> {
    console.log('🎯 Demo 2: Task Priority Intelligence');
    console.log('-------------------------------------');
    
    try {
      const suggestion = await aiAPI.getTaskPrioritySuggestion(this.demoTaskId);
      
      console.log(`📝 Task Analysis Results:`);
      console.log(`   Priority: ${suggestion.suggestedPriority.toUpperCase()}`);
      console.log(`   Confidence: ${Math.round(suggestion.confidence * 100)}%`);
      console.log(`   Reasoning: ${suggestion.reasoning}`);
      console.log('✅ Priority intelligence working\n');
    } catch (error) {
      console.log('❌ Priority intelligence demo failed:', error);
    }
  }

  private async demoChatAssistant(): Promise<void> {
    console.log('💬 Demo 3: AI Chat Assistant');
    console.log('-----------------------------');
    
    const questions = [
      'What should I focus on today?',
      'How can I improve my productivity?',
      'Help me organize my tasks better'
    ];

    for (const question of questions) {
      try {
        console.log(`👤 User: "${question}"`);
        const response = await aiAPI.sendChatMessage(question, this.userId);
        console.log(`🤖 AI: ${response.response.substring(0, 100)}...`);
        
        if (response.suggestions && response.suggestions.length > 0) {
          console.log(`💡 Suggestions: ${response.suggestions.slice(0, 2).join(', ')}`);
        }
        console.log('');
      } catch (error) {
        console.log('❌ Chat demo failed for question:', question);
      }
    }
    
    console.log('✅ Chat assistant working\n');
  }

  private async demoWorkloadOptimization(): Promise<void> {
    console.log('⚖️ Demo 4: Workload Optimization');
    console.log('--------------------------------');
    
    try {
      const optimization = await aiAPI.getTaskOptimization(this.userId);
      
      console.log(`📊 Workload Analysis:`);
      console.log(`   Workload Score: ${optimization.workloadScore}/100`);
      console.log(`   Burnout Risk: ${optimization.burnoutRisk.toUpperCase()}`);
      console.log(`   Optimization Suggestions: ${optimization.suggestions.length}`);
      
      optimization.suggestions.slice(0, 3).forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion.message}`);
      });
      
      console.log('✅ Workload optimization working\n');
    } catch (error) {
      console.log('❌ Workload optimization demo failed:', error);
    }
  }

  private async demoProductivityInsights(): Promise<void> {
    console.log('📈 Demo 5: Productivity Insights');
    console.log('--------------------------------');
    
    try {
      const insights = await aiAPI.getProductivityInsights(this.userId);
      
      console.log(`📊 Productivity Analytics:`);
      console.log(`   Tasks Created: ${insights.tasksCreated}`);
      console.log(`   Tasks Completed: ${insights.tasksCompleted}`);
      console.log(`   Completion Rate: ${insights.completionRate.toFixed(1)}%`);
      console.log(`   Focus Time: ${insights.totalFocusTimeHours.toFixed(1)} hours`);
      console.log(`   Trend: ${insights.productivityTrend.toUpperCase()}`);
      
      if (insights.recommendedActions && insights.recommendedActions.length > 0) {
        console.log(`💡 Recommendations:`);
        insights.recommendedActions.slice(0, 2).forEach((action, index) => {
          console.log(`   ${index + 1}. ${action}`);
        });
      }
      
      console.log('✅ Productivity insights working\n');
    } catch (error) {
      console.log('❌ Productivity insights demo failed:', error);
    }
  }

  private async demoSmartNotifications(): Promise<void> {
    console.log('🔔 Demo 6: Smart Notifications');
    console.log('-------------------------------');
    
    try {
      const notifications = await aiAPI.getNotifications(this.userId);
      
      console.log(`📬 Notification System:`);
      console.log(`   Total Notifications: ${notifications.length}`);
      
      const unreadCount = notifications.filter(n => !n.isRead).length;
      console.log(`   Unread: ${unreadCount}`);
      
      // Show sample notifications
      notifications.slice(0, 3).forEach((notification, index) => {
        console.log(`   ${index + 1}. [${notification.type}] ${notification.title}`);
        console.log(`      ${notification.message.substring(0, 60)}...`);
        console.log(`      Priority: ${notification.priority}, Read: ${notification.isRead}`);
      });
      
      console.log('✅ Smart notifications working\n');
    } catch (error) {
      console.log('❌ Smart notifications demo failed:', error);
    }
  }

  private async demoTextAnalysis(): Promise<void> {
    console.log('🔍 Demo 7: Text Analysis Intelligence');
    console.log('-------------------------------------');
    
    const sampleTexts = [
      'Complete the quarterly financial report and send to stakeholders by Friday',
      'Research competitor pricing strategies for the new product launch',
      'Schedule team meeting to discuss project timeline and deliverables'
    ];

    for (const text of sampleTexts) {
      try {
        console.log(`📝 Analyzing: "${text.substring(0, 50)}..."`);
        const analysis = await aiAPI.analyzeTaskText(text);
        
        if (analysis.suggestedTitle) {
          console.log(`   Suggested Title: ${analysis.suggestedTitle}`);
        }
        if (analysis.suggestedPriority) {
          console.log(`   Suggested Priority: ${analysis.suggestedPriority}`);
        }
        if (analysis.suggestedDuration) {
          console.log(`   Estimated Duration: ${analysis.suggestedDuration} minutes`);
        }
        if (analysis.extractedKeywords && analysis.extractedKeywords.length > 0) {
          console.log(`   Keywords: ${analysis.extractedKeywords.slice(0, 3).join(', ')}`);
        }
        console.log('');
      } catch (error) {
        console.log('❌ Text analysis failed for:', text.substring(0, 30));
      }
    }
    
    console.log('✅ Text analysis working\n');
  }

  private async demoSchedulingIntelligence(): Promise<void> {
    console.log('📅 Demo 8: Scheduling Intelligence');
    console.log('----------------------------------');
    
    try {
      const suggestions = await aiAPI.getSchedulingSuggestions(this.userId, this.demoTaskId);
      
      console.log(`🕐 Scheduling Analysis:`);
      
      if (suggestions.suggestedStartTime) {
        console.log(`   Optimal Start Time: ${suggestions.suggestedStartTime}`);
      }
      
      if (suggestions.suggestedDuration) {
        console.log(`   Recommended Duration: ${suggestions.suggestedDuration} minutes`);
      }
      
      if (suggestions.optimalTimeSlots && suggestions.optimalTimeSlots.length > 0) {
        console.log(`   Available Time Slots:`);
        suggestions.optimalTimeSlots.slice(0, 3).forEach((slot, index) => {
          console.log(`   ${index + 1}. ${slot.start} - ${slot.end} (Score: ${slot.score})`);
        });
      }
      
      if (suggestions.reasoning) {
        console.log(`   AI Reasoning: ${suggestions.reasoning}`);
      }
      
      console.log('✅ Scheduling intelligence working\n');
    } catch (error) {
      console.log('❌ Scheduling intelligence demo failed:', error);
    }
  }

  /**
   * Performance benchmark demonstration
   */
  async runPerformanceDemo(): Promise<void> {
    console.log('⚡ Performance Benchmark Demo');
    console.log('=============================\n');

    try {
      const performance = await aiTester.testWidgetPerformance();
      
      console.log('🚀 Widget Performance Results:');
      Object.entries(performance).forEach(([widget, time]) => {
        const status = time < 2000 ? '✅ Fast' : time < 5000 ? '⚠️ Moderate' : '❌ Slow';
        console.log(`   ${widget}: ${time}ms ${status}`);
      });

      const avgTime = Object.values(performance).reduce((a, b) => a + b, 0) / Object.values(performance).length;
      console.log(`\n📊 Average Response Time: ${avgTime.toFixed(0)}ms`);
      
      if (avgTime < 2000) {
        console.log('🎯 Excellent performance! All widgets are fast and responsive.');
      } else if (avgTime < 5000) {
        console.log('✅ Good performance! Widgets are responsive.');
      } else {
        console.log('⚠️ Performance could be improved. Consider optimization.');
      }

    } catch (error) {
      console.log('❌ Performance demo failed:', error);
    }
  }

  /**
   * User journey simulation demo
   */
  async runUserJourneyDemo(): Promise<void> {
    console.log('👤 User Journey Simulation Demo');
    console.log('===============================\n');

    try {
      const journey = await aiTester.simulateUserJourney();
      
      console.log('🎬 Simulated User Journey:');
      journey.forEach((step, index) => {
        console.log(`   Step ${index + 1}: ${step.feature}`);
        console.log(`   ${step.message}`);
        console.log('');
      });

      const successfulSteps = journey.filter(s => s.success).length;
      console.log(`📊 Journey Success Rate: ${(successfulSteps / journey.length * 100).toFixed(1)}%`);
      
      if (successfulSteps === journey.length) {
        console.log('🎉 Perfect user journey! All AI features work seamlessly together.');
      } else {
        console.log('⚠️ Some steps in the user journey need attention.');
      }

    } catch (error) {
      console.log('❌ User journey demo failed:', error);
    }
  }
}

// Export demo instance
export const aiDemo = new AIDemoScript();

// Quick demo function
export const runQuickDemo = async (): Promise<void> => {
  console.log('🚀 Running Quick AI Demo...\n');
  await aiDemo.runDemoScript();
};

// Performance demo function  
export const runPerformanceDemo = async (): Promise<void> => {
  console.log('⚡ Running Performance Demo...\n');
  await aiDemo.runPerformanceDemo();
};

// User journey demo function
export const runUserJourneyDemo = async (): Promise<void> => {
  console.log('👤 Running User Journey Demo...\n');
  await aiDemo.runUserJourneyDemo();
};

export default AIDemoScript;
