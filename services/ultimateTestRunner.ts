// Ultimate Test Runner - Complete validation for production readiness
import { testAPI } from './testAPI';
import { connectionValidator } from './backendConnectionValidator';
import { aiTester } from './aiIntegrationTester';
import { aiDemo } from './aiDemoScript';

export class UltimateTestRunner {
  
  /**
   * Run the complete test suite for production validation
   */
  async runCompleteValidation(): Promise<{
    overall: boolean;
    scores: {
      backendConnection: number;
      aiIntegration: number;
      performance: number;
      mapping: number;
    };
    details: any;
  }> {
    console.log('🎯 ULTIMATE MINDSYNC PRODUCTION VALIDATION');
    console.log('==========================================\n');

    const results = {
      overall: false,
      scores: {
        backendConnection: 0,
        aiIntegration: 0,
        performance: 0,
        mapping: 0
      },
      details: {
        basicTests: null,
        mappingValidation: null,
        aiHealthReport: null,
        loadTest: null
      }
    };

    try {
      // Phase 1: Basic API Tests
      console.log('📋 PHASE 1: BASIC API VALIDATION');
      console.log('=================================\n');
      
      const basicTests = await testAPI.runAllTests();
      results.details.basicTests = basicTests;
      results.scores.backendConnection = basicTests.success ? 100 : 0;
      
      // Phase 2: Frontend ↔ Backend Mapping Validation
      console.log('\n🔗 PHASE 2: MAPPING VALIDATION');
      console.log('===============================\n');
      
      const mappingValidation = await connectionValidator.validateExactMapping();
      results.details.mappingValidation = mappingValidation;
      const successfulMappings = Object.values(mappingValidation.mappingResults).filter(Boolean).length;
      results.scores.mapping = (successfulMappings / Object.keys(mappingValidation.mappingResults).length) * 100;

      // Phase 3: AI Health Report
      console.log('\n🧠 PHASE 3: AI INTEGRATION HEALTH');
      console.log('==================================\n');
      
      const aiHealthReport = await aiTester.generateHealthReport();
      results.details.aiHealthReport = aiHealthReport;
      results.scores.aiIntegration = aiHealthReport.score;

      // Phase 4: Performance Load Test
      console.log('\n⚡ PHASE 4: PERFORMANCE VALIDATION');
      console.log('==================================\n');
      
      const loadTest = await connectionValidator.runLoadTest(3);
      results.details.loadTest = loadTest;
      results.scores.performance = loadTest.success ? 100 : 50;

      // Calculate overall score
      const overallScore = (
        results.scores.backendConnection +
        results.scores.aiIntegration +
        results.scores.performance +
        results.scores.mapping
      ) / 4;

      results.overall = overallScore >= 85;

      // Final Report
      console.log('\n🎯 PRODUCTION READINESS REPORT');
      console.log('==============================');
      console.log(`🔗 Backend Connection: ${results.scores.backendConnection.toFixed(1)}%`);
      console.log(`🧠 AI Integration: ${results.scores.aiIntegration.toFixed(1)}%`);
      console.log(`⚡ Performance: ${results.scores.performance.toFixed(1)}%`);
      console.log(`🎯 Mapping Accuracy: ${results.scores.mapping.toFixed(1)}%`);
      console.log(`📊 Overall Score: ${overallScore.toFixed(1)}%`);

      if (overallScore >= 95) {
        console.log('\n🎉 LEGENDARY! Perfect production readiness! 🚀');
        console.log('✨ Deploy with absolute confidence!');
      } else if (overallScore >= 85) {
        console.log('\n🎯 EXCELLENT! Production ready with minor optimizations needed.');
        console.log('✅ Safe to deploy!');
      } else if (overallScore >= 70) {
        console.log('\n⚠️ GOOD! Some issues need attention before deployment.');
      } else {
        console.log('\n🚨 NOT READY! Critical issues must be resolved.');
      }

      return results;

    } catch (error) {
      console.error('❌ Ultimate validation failed:', error);
      return {
        ...results,
        overall: false
      };
    }
  }

  /**
   * Quick health check for development
   */
  async quickCheck(): Promise<boolean> {
    console.log('⚡ QUICK DEVELOPMENT HEALTH CHECK');
    console.log('=================================\n');

    try {
      // Test basic connectivity
      const backendHealth = await connectionValidator.quickHealthCheck();
      
      // Test AI endpoints
      const aiHealth = await aiTester.runAllTests();
      const aiSuccess = aiHealth.filter(test => test.success).length >= (aiHealth.length * 0.8);

      const isHealthy = backendHealth && aiSuccess;

      if (isHealthy) {
        console.log('\n✅ HEALTHY! Development environment ready!');
      } else {
        console.log('\n⚠️ Issues detected in development environment.');
      }

      return isHealthy;

    } catch (error) {
      console.log('❌ Quick check failed:', error.message);
      return false;
    }
  }

  /**
   * Demo mode - showcase all features
   */
  async runDemoMode(): Promise<void> {
    console.log('🎬 DEMO MODE: SHOWCASING ALL AI FEATURES');
    console.log('========================================\n');

    try {
      // Run feature demonstration
      await aiDemo.runDemoScript();
      
      // Show performance
      await aiDemo.runPerformanceDemo();
      
      // Simulate user journey
      await aiDemo.runUserJourneyDemo();

      console.log('\n🎭 DEMO COMPLETE!');
      console.log('================');
      console.log('✨ All AI features demonstrated successfully!');
      console.log('🚀 Ready to impress users with intelligent productivity!');

    } catch (error) {
      console.error('❌ Demo mode failed:', error);
    }
  }

  /**
   * Continuous monitoring mode
   */
  async startMonitoring(intervalMinutes: number = 5): Promise<void> {
    console.log(`🔄 STARTING CONTINUOUS MONITORING (every ${intervalMinutes} minutes)`);
    console.log('=======================================================\n');

    setInterval(async () => {
      try {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`\n⏰ Health Check - ${timestamp}`);
        
        const isHealthy = await this.quickCheck();
        
        if (!isHealthy) {
          console.log('🚨 ALERT: Health issues detected!');
          // Here you could send notifications, log to external systems, etc.
        }
        
      } catch (error) {
        console.error('❌ Monitoring check failed:', error);
      }
    }, intervalMinutes * 60 * 1000);

    console.log('✅ Monitoring started successfully!');
  }
}

// Export singleton
export const ultimateTestRunner = new UltimateTestRunner();

// Convenient test functions
export const runFullValidation = async (): Promise<boolean> => {
  const result = await ultimateTestRunner.runCompleteValidation();
  return result.overall;
};

export const quickHealthCheck = async (): Promise<boolean> => {
  return await ultimateTestRunner.quickCheck();
};

export const runDemoMode = async (): Promise<void> => {
  await ultimateTestRunner.runDemoMode();
};

// Usage examples in comments:
/*
// For development
await quickHealthCheck();

// For production validation
const isReady = await runFullValidation();

// For demonstrations
await runDemoMode();

// For continuous monitoring
await ultimateTestRunner.startMonitoring(5); // Check every 5 minutes
*/

export default UltimateTestRunner;
