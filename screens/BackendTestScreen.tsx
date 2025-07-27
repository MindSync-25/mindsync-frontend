import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNews } from '../context/NewsContext';

const BackendTestScreen: React.FC = () => {
  const { loadPersonalizedNews, newsArticles, isLoading, error } = useNews();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testBackendConnection = async () => {
    addTestResult('🔥 Testing backend connection...');
    
    try {
      // Test basic health endpoint
      const response = await fetch('http://localhost:5000/test');
      const data = await response.json();
      addTestResult(`✅ Health check: ${data.message}`);
      
      // Test news API
      const newsResponse = await fetch('http://localhost:5000/api/news/categories');
      const newsData = await newsResponse.json();
      addTestResult(`✅ News categories loaded: ${newsData.length || 0} categories`);
      
      addTestResult('🚀 Backend connection successful!');
      
    } catch (error: any) {
      addTestResult(`❌ Backend test failed: ${error.message}`);
    }
  };

  const testNewsLoading = async () => {
    addTestResult('📰 Testing news loading with mood...');
    try {
      await loadPersonalizedNews('happy', true);
      addTestResult(`✅ News loaded: ${newsArticles.length} articles`);
    } catch (error: any) {
      addTestResult(`❌ News loading failed: ${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔥 Backend Integration Test</Text>
      
      <TouchableOpacity style={styles.button} onPress={testBackendConnection}>
        <Text style={styles.buttonText}>Test Backend Connection</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testNewsLoading}>
        <Text style={styles.buttonText}>Test News Loading</Text>
      </TouchableOpacity>
      
      {isLoading && <Text style={styles.loading}>Loading...</Text>}
      {error && <Text style={styles.error}>Error: {error}</Text>}
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.result}>{result}</Text>
        ))}
      </View>
      
      <View style={styles.articlesContainer}>
        <Text style={styles.resultsTitle}>Loaded Articles ({newsArticles.length}):</Text>
        {newsArticles.slice(0, 3).map((article, index) => (
          <View key={index} style={styles.articlePreview}>
            <Text style={styles.articleTitle}>{article.title}</Text>
            <Text style={styles.articleSource}>{article.source} - {article.category}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loading: {
    color: '#FFD700',
    textAlign: 'center',
    marginVertical: 10,
  },
  error: {
    color: '#FF6B35',
    textAlign: 'center',
    marginVertical: 10,
  },
  resultsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  resultsTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  result: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  articlesContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  articlePreview: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
  },
  articleTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  articleSource: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 5,
  },
});

export default BackendTestScreen;
