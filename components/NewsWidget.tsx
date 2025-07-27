import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useNews } from '../context/NewsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  NewsFeed: { currentMood: string; isTriggeredByMood: boolean };
  NewsInterestsOnboarding: undefined;
};

interface NewsWidgetProps {
  currentMood?: string;
}

const NewsWidget: React.FC<NewsWidgetProps> = ({ currentMood }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { newsArticles, isOnboardingComplete, preferences, loadPersonalizedNews, isLoading } = useNews();
  const [newsPermissionGranted, setNewsPermissionGranted] = useState(false);

  const dynamicStyles = StyleSheet.create({
    widget: {
      backgroundColor: theme === 'light' ? '#f5f5f5' : '#181818',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      minHeight: 120, // Consistent with other grid items
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#f5f5f5',
    },
    subtitle: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
      marginBottom: 12,
      lineHeight: 16,
    },
    setupContainer: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    setupIcon: {
      marginBottom: 8,
    },
    setupText: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
      textAlign: 'center',
      marginBottom: 8,
      lineHeight: 16,
    },
    setupButton: {
      backgroundColor: theme === 'light' ? '#007AFF' : '#0066CC',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    setupButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    newsPreview: {
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#1a1a1a',
      borderRadius: 8,
      padding: 8,
      marginBottom: 6,
    },
    newsContent: {
      flex: 1,
    },
    newsTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 2,
    },
    newsSource: {
      fontSize: 10,
      color: theme === 'light' ? '#666' : '#aaa',
    },
    viewAllButton: {
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 6,
    },
    viewAllText: {
      fontSize: 12,
      color: theme === 'light' ? '#007AFF' : '#60a5fa',
      fontWeight: '500',
    },
    moodIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'light' ? '#e3f2fd' : '#1e3a8a',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    moodText: {
      fontSize: 10,
      color: theme === 'light' ? '#1976d2' : '#60a5fa',
      marginLeft: 2,
      fontWeight: '500',
    },
  });

  useEffect(() => {
    checkNewsPermission();
  }, []);

  // Auto-load news when user has completed onboarding and no articles are available
  useEffect(() => {
    if (newsPermissionGranted && isOnboardingComplete && newsArticles.length === 0) {
      // Add a small delay to avoid multiple calls
      const timer = setTimeout(() => {
        loadPersonalizedNews(currentMood || 'happy', false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [newsPermissionGranted, isOnboardingComplete, newsArticles.length, currentMood, loadPersonalizedNews]);

  const checkNewsPermission = async () => {
    try {
      const permission = await AsyncStorage.getItem('newsPermissionGranted');
      setNewsPermissionGranted(permission === 'true');
    } catch (error) {
      console.error('Error checking news permission:', error);
    }
  };

  const handleSetupNews = () => {
    if (!isOnboardingComplete) {
      navigation.navigate('NewsInterestsOnboarding');
    } else {
      navigation.navigate('NewsFeed', { currentMood: currentMood || 'happy', isTriggeredByMood: false });
    }
  };

  const handleViewAllNews = () => {
    navigation.navigate('NewsFeed', { currentMood: currentMood || 'happy', isTriggeredByMood: false });
  };

  const getMoodEmoji = (mood: string): string => {
    const emojiMap: Record<string, string> = {
      happy: '😊',
      sad: '😔',
      excited: '🔥',
      stressed: '🌱',
      motivated: '💪',
      curious: '🤔',
      relaxed: '😌',
    };
    return emojiMap[mood] || '📰';
  };

  // If user hasn't granted permission or completed onboarding
  if (!newsPermissionGranted || !isOnboardingComplete) {
    return (
      <View style={dynamicStyles.widget}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>🌟 What's Happening</Text>
        </View>
        
        <View style={dynamicStyles.setupContainer}>
          <MaterialCommunityIcons
            name="newspaper-variant-outline"
            size={32}
            color={theme === 'light' ? '#007AFF' : '#60a5fa'}
            style={dynamicStyles.setupIcon}
          />
          <Text style={dynamicStyles.setupText}>
            Get personalized news
          </Text>
          <TouchableOpacity style={dynamicStyles.setupButton} onPress={handleSetupNews}>
            <Text style={dynamicStyles.setupButtonText}>
              {!isOnboardingComplete ? 'Set Up' : 'Enable'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If user has news enabled, show preview
  const previewArticles = newsArticles.slice(0, 2);

  return (
    <View style={dynamicStyles.widget}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>🌟 What's Happening</Text>
        {currentMood && (
          <View style={dynamicStyles.moodIndicator}>
            <Text>{getMoodEmoji(currentMood)}</Text>
            <Text style={dynamicStyles.moodText}>{currentMood}</Text>
          </View>
        )}
      </View>

      {preferences?.interests && preferences.interests.length > 0 && (
        <Text style={dynamicStyles.subtitle}>
          {preferences.interests.slice(0, 2).join(', ')}
          {preferences.interests.length > 2 && ` +${preferences.interests.length - 2}`}
        </Text>
      )}

      {previewArticles.length > 0 ? (
        <>
          {previewArticles.slice(0, 1).map((article) => ( // Show only 1 article for compact view
            <View key={article.id} style={dynamicStyles.newsPreview}>
              <View style={dynamicStyles.newsContent}>
                <Text style={dynamicStyles.newsTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <Text style={dynamicStyles.newsSource}>
                  {article.source} • {article.readTime}
                </Text>
              </View>
            </View>
          ))}
          
          <TouchableOpacity style={dynamicStyles.viewAllButton} onPress={handleViewAllNews}>
            <Text style={dynamicStyles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={dynamicStyles.setupContainer}>
          <MaterialCommunityIcons
            name="newspaper-variant-outline"
            size={24}
            color={theme === 'light' ? '#666' : '#aaa'}
            style={dynamicStyles.setupIcon}
          />
          <Text style={dynamicStyles.setupText}>
            {isLoading ? 'Loading news...' : 'No recent news'}
          </Text>
          <TouchableOpacity 
            style={dynamicStyles.setupButton} 
            onPress={() => loadPersonalizedNews(currentMood || 'happy', true)}
            disabled={isLoading}
          >
            <Text style={dynamicStyles.setupButtonText}>
              {isLoading ? 'Loading...' : 'Refresh News'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default NewsWidget;
