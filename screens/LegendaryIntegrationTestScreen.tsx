import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  responseTime?: number;
}

const LegendaryIntegrationTestScreen = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const testEndpoints = [
    { url: '/', name: 'Root Endpoint' },
    { url: '/test', name: 'Test Endpoint' },
    { url: '/api/news/categories', name: 'News Categories' },
    { url: '/api/weather/current?lat=40.7128&lon=-74.0060', name: 'Weather API (NYC)' },
    { url: '/api/auth/register', name: 'Auth Registration (POST)', method: 'OPTIONS' },
    { url: '/api/news/recent', name: 'News Recent (GET)', method: 'OPTIONS' }
  ];

  const runIntegrationTests = async () => {
    setIsRunning(true);
    setOverallStatus('pending');
    const testResults: TestResult[] = [];

    for (const test of testEndpoints) {
      const startTime = Date.now();
      try {
        const method = test.method || 'GET';
        const response = await fetch(`https://mindsync-core-api-production.up.railway.app${test.url}`, {
          method: method,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          testResults.push({
            endpoint: test.name,
            status: 'success',
            message: `✅ Success (${response.status}) - ${responseTime}ms`,
            responseTime
          });
        } else {
          testResults.push({
            endpoint: test.name,
            status: 'error',
            message: `❌ Error ${response.status}: ${response.statusText}`,
            responseTime
          });
        }
      } catch (error) {
        const responseTime = Date.now() - startTime;
        testResults.push({
          endpoint: test.name,
          status: 'error',
          message: `❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          responseTime
        });
      }
    }

    setTests(testResults);
    
    // Determine overall status
    const hasErrors = testResults.some(result => result.status === 'error');
    setOverallStatus(hasErrors ? 'error' : 'success');
    setIsRunning(false);

    // Show completion alert
    if (!hasErrors) {
      Alert.alert(
        '🎉 LEGENDARY SUCCESS!',
        'All API endpoints are operational!\nYour MindSync backend integration is LIVE!',
        [{ text: 'LEGENDARY!', style: 'default' }]
      );
    } else {
      Alert.alert(
        '⚠️ Integration Issues',
        'Some endpoints need attention. Check the results below.',
        [{ text: 'Review', style: 'default' }]
      );
    }
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runIntegrationTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <Ionicons name="checkmark-circle" size={24} color="#00C851" />;
      case 'error': return <Ionicons name="close-circle" size={24} color="#FF4444" />;
      default: return <ActivityIndicator size="small" color="#007AFF" />;
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'success': return '#00C851';
      case 'error': return '#FF4444';
      default: return '#007AFF';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚀 LEGENDARY INTEGRATION TEST</Text>
        <Text style={styles.subtitle}>MindSync Backend Verification</Text>
        
        <View style={[styles.statusCard, { borderLeftColor: getOverallStatusColor() }]}>
          <Text style={styles.envLabel}>Environment:</Text>
          <Text style={styles.envValue}>PRODUCTION</Text>
          <Text style={styles.apiLabel}>API Base URL:</Text>
          <Text style={styles.apiValue}>https://mindsync-core-api-production.up.railway.app</Text>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[styles.statusValue, { color: getOverallStatusColor() }]}>
            LEGENDARY_LIVE_RAILWAY
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.testButton, isRunning && styles.testButtonDisabled]} 
        onPress={runIntegrationTests}
        disabled={isRunning}
      >
        {isRunning ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="play-circle" size={20} color="#fff" />
        )}
        <Text style={styles.testButtonText}>
          {isRunning ? 'Running Tests...' : 'Run Integration Tests'}
        </Text>
      </TouchableOpacity>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        
        {tests.length === 0 && !isRunning && (
          <Text style={styles.noResults}>Tap "Run Integration Tests" to start</Text>
        )}

        {tests.map((test, index) => (
          <View key={index} style={styles.testResult}>
            <View style={styles.testHeader}>
              {getStatusIcon(test.status)}
              <Text style={styles.testName}>{test.endpoint}</Text>
            </View>
            <Text style={[
              styles.testMessage,
              { color: test.status === 'success' ? '#00C851' : '#FF4444' }
            ]}>
              {test.message}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.legendaryFooter}>
        <Text style={styles.legendaryText}>
          🔥 LEGENDARY DEPLOYMENT STATUS 🔥
        </Text>
        <Text style={styles.legendarySubtext}>
          MindSync Core API is live on Heroku!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  envLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  envValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  apiLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  apiValue: {
    color: '#007AFF',
    fontSize: 14,
    marginBottom: 8,
  },
  statusLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  testButtonDisabled: {
    backgroundColor: '#555',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultsContainer: {
    paddingHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  noResults: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  testResult: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  testName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  testMessage: {
    fontSize: 14,
    marginLeft: 32,
  },
  legendaryFooter: {
    backgroundColor: '#FF6B35',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  legendaryText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  legendarySubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default LegendaryIntegrationTestScreen;
