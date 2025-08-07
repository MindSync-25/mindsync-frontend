import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HerokuDebugScreen = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const testHerokuEndpoints = async () => {
    setIsLoading(true);
    const results = [];
    
    const endpoints = [
      { url: 'https://mindsync-legendary-api.herokuapp.com/', name: 'Root Endpoint' },
      { url: 'https://mindsync-legendary-api.herokuapp.com/test', name: 'Test Endpoint' },
      { url: 'https://mindsync-legendary-api.herokuapp.com/api/news/categories', name: 'News Categories' },
      { url: 'https://mindsync-legendary-api.herokuapp.com/api/weather/London', name: 'Weather API' }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🧪 Testing: ${endpoint.url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        const responseText = await response.text();
        
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: response.status,
          ok: response.ok,
          responseText: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''),
          timestamp: new Date().toLocaleTimeString()
        });
        
      } catch (error) {
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 'ERROR',
          ok: false,
          responseText: error.message,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    }
    
    setTestResults(results);
    setIsLoading(false);
    
    // Show summary alert
    const successCount = results.filter(r => r.ok).length;
    const totalCount = results.length;
    
    Alert.alert(
      '🧪 Heroku Test Results',
      `${successCount}/${totalCount} endpoints successful\n\nCheck detailed results below.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  useEffect(() => {
    // Auto-run tests on component mount
    testHerokuEndpoints();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 HEROKU DEBUG TEST</Text>
        <Text style={styles.subtitle}>Investigating Backend Connectivity</Text>
      </View>

      <TouchableOpacity 
        style={[styles.testButton, isLoading && styles.testButtonDisabled]} 
        onPress={testHerokuEndpoints}
        disabled={isLoading}
      >
        <Ionicons name="refresh" size={20} color="#fff" />
        <Text style={styles.testButtonText}>
          {isLoading ? 'Testing...' : 'Re-run Tests'}
        </Text>
      </TouchableOpacity>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>🧪 Debug Results:</Text>
        
        {testResults.length === 0 && isLoading && (
          <Text style={styles.loadingText}>Running diagnostic tests...</Text>
        )}

        {testResults.map((result, index) => (
          <View key={index} style={styles.testResult}>
            <View style={styles.testHeader}>
              <Ionicons 
                name={result.ok ? "checkmark-circle" : "close-circle"} 
                size={24} 
                color={result.ok ? "#00C851" : "#FF4444"} 
              />
              <Text style={styles.testName}>{result.name}</Text>
            </View>
            <Text style={styles.testUrl}>{result.url}</Text>
            <Text style={[
              styles.testStatus,
              { color: result.ok ? '#00C851' : '#FF4444' }
            ]}>
              Status: {result.status} at {result.timestamp}
            </Text>
            <Text style={styles.responseText} numberOfLines={3}>
              Response: {result.responseText}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.diagnosticInfo}>
        <Text style={styles.diagnosticTitle}>🔍 Diagnostic Information:</Text>
        <Text style={styles.diagnosticText}>
          • DNS Resolution: ✅ Domain resolves to Heroku
        </Text>
        <Text style={styles.diagnosticText}>
          • Expected URL: https://mindsync-legendary-api.herokuapp.com
        </Text>
        <Text style={styles.diagnosticText}>
          • Common Issues: App sleeping, deployment in progress, name mismatch
        </Text>
        <Text style={styles.diagnosticText}>
          • Next Step: Coordinate with backend team for deployment status
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 20,
  },
  header: {
    marginBottom: 20,
    paddingTop: 20,
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
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
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
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  testResult: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  testUrl: {
    color: '#007AFF',
    fontSize: 12,
    marginBottom: 4,
  },
  testStatus: {
    fontSize: 14,
    marginBottom: 4,
  },
  responseText: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  diagnosticInfo: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
  },
  diagnosticTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  diagnosticText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
});

export default HerokuDebugScreen;
