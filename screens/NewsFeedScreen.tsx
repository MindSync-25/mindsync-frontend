import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  RefreshControl,
  Share,
  ActivityIndicator 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useNews, NewsArticle } from '../context/NewsContext';
import NewsCard from '../components/NewsCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Home: undefined;
  NewsInterestsOnboarding: undefined;
};

interface NewsFeedScreenProps {
  currentMood?: string;
  isTriggeredByMood?: boolean;
}

const NewsFeedScreen: React.FC<NewsFeedScreenProps> = ({ 
  currentMood, 
  isTriggeredByMood = false 
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const {
    newsArticles,
    isLoading,
    error,
    loadPersonalizedNews,
    toggleBookmark,
    markAsRead,
    isOnboardingComplete,
    preferences
  } = useNews();

  const [refreshing, setRefreshing] = useState(false);
  const [newsPermissionGranted, setNewsPermissionGranted] = useState(false);
  const [activeTab, setActiveTab] = useState<'personalized' | 'trending' | 'bookmarks'>('personalized');

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#000',
    },
    header: {
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      paddingTop: 60,
      paddingBottom: 16,
      paddingHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      textAlign: 'center',
      flex: 1,
    },
    headerSpacer: {
      width: 40, // Same width as close button to center title
    },
    moodIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      backgroundColor: theme === 'light' ? '#e3f2fd' : '#1e3a8a',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      alignSelf: 'center',
    },
    moodText: {
      fontSize: 14,
      color: theme === 'light' ? '#1976d2' : '#60a5fa',
      fontWeight: '600',
      marginLeft: 8,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 20,
      marginHorizontal: 4,
    },
    activeTab: {
      backgroundColor: theme === 'light' ? '#007AFF' : '#0066CC',
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme === 'light' ? '#666' : '#aaa',
    },
    activeTabText: {
      color: '#fff',
    },
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    permissionIcon: {
      marginBottom: 24,
    },
    permissionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      textAlign: 'center',
      marginBottom: 16,
    },
    permissionSubtitle: {
      fontSize: 16,
      color: theme === 'light' ? '#666' : '#aaa',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    permissionButtons: {
      width: '100%',
    },
    allowButton: {
      backgroundColor: theme === 'light' ? '#007AFF' : '#0066CC',
      paddingVertical: 16,
      borderRadius: 25,
      alignItems: 'center',
      marginBottom: 12,
    },
    allowButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
    denyButton: {
      paddingVertical: 16,
      alignItems: 'center',
    },
    denyButtonText: {
      color: theme === 'light' ? '#666' : '#aaa',
      fontSize: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: theme === 'light' ? '#666' : '#aaa',
      textAlign: 'center',
      lineHeight: 22,
    },
    setupButton: {
      backgroundColor: theme === 'light' ? '#007AFF' : '#0066CC',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
      marginTop: 20,
    },
    setupButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  useEffect(() => {
    checkNewsPermission();
  }, []);

  useEffect(() => {
    if (isTriggeredByMood && currentMood && newsPermissionGranted) {
      showMoodNewsPermission();
    }
  }, [isTriggeredByMood, currentMood, newsPermissionGranted]);

  const checkNewsPermission = async () => {
    try {
      const permission = await AsyncStorage.getItem('newsPermissionGranted');
      setNewsPermissionGranted(permission === 'true');
    } catch (error) {
      console.error('Error checking news permission:', error);
    }
  };

  const showMoodNewsPermission = () => {
    const moodEmoji = getMoodEmoji(currentMood || 'happy');
    
    Alert.alert(
      `${moodEmoji} Feeling ${currentMood}?`,
      `We have some uplifting and positive news that might brighten your day! Would you like to see personalized news based on your current mood?`,
      [
        {
          text: 'Not Now',
          style: 'cancel',
        },
        {
          text: 'Show Me News! 📰',
          onPress: () => {
            loadMoodBasedNews();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const loadMoodBasedNews = async () => {
    try {
      await loadPersonalizedNews(currentMood, true);
    } catch (error) {
      console.error('Error loading mood-based news:', error);
    }
  };

  const handleAllowNewsAccess = async () => {
    try {
      await AsyncStorage.setItem('newsPermissionGranted', 'true');
      setNewsPermissionGranted(true);
      
      if (!isOnboardingComplete) {
        navigation.navigate('NewsInterestsOnboarding');
      } else {
        await loadPersonalizedNews(currentMood, true);
      }
    } catch (error) {
      console.error('Error granting news permission:', error);
    }
  };

  const handleDenyNewsAccess = () => {
    navigation.goBack();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPersonalizedNews(currentMood, true);
    } catch (error) {
      console.error('Error refreshing news:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleShare = async (article: NewsArticle) => {
    try {
      await Share.share({
        message: `${article.title}\n\n${article.description}\n\nRead more: ${article.url}`,
        url: article.url,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const handleBookmark = async (articleId: string) => {
    try {
      await toggleBookmark(articleId);
    } catch (error) {
      console.error('Error bookmarking article:', error);
    }
  };

  const handleRead = async (articleId: string) => {
    try {
      await markAsRead(articleId, currentMood);
    } catch (error) {
      console.error('Error marking article as read:', error);
    }
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
    return emojiMap[mood] || '😊';
  };

  const renderHeader = () => (
    <View style={dynamicStyles.header}>
      <View style={dynamicStyles.headerContent}>
        <TouchableOpacity 
          style={dynamicStyles.closeButton} 
          onPress={() => navigation.navigate('Home')}
        >
          <MaterialCommunityIcons 
            name="close" 
            size={24} 
            color={theme === 'light' ? '#000' : '#fff'} 
          />
        </TouchableOpacity>
        
        <Text style={dynamicStyles.headerTitle}>
          {isTriggeredByMood ? 'Mood News' : 'News Feed'}
        </Text>
        
        <View style={dynamicStyles.headerSpacer} />
      </View>
      
      {currentMood && (
        <View style={dynamicStyles.moodIndicator}>
          <Text style={{ fontSize: 16 }}>{getMoodEmoji(currentMood)}</Text>
          <Text style={dynamicStyles.moodText}>
            {isTriggeredByMood ? `Curated for your ${currentMood} mood` : `Current mood: ${currentMood}`}
          </Text>
        </View>
      )}
    </View>
  );

  // Permission Request Screen
  if (!newsPermissionGranted) {
    return (
      <View style={dynamicStyles.container}>
        {renderHeader()}
        <View style={dynamicStyles.permissionContainer}>
          <MaterialCommunityIcons
            name="newspaper-variant-outline"
            size={80}
            color={theme === 'light' ? '#007AFF' : '#0066CC'}
            style={dynamicStyles.permissionIcon}
          />
          <Text style={dynamicStyles.permissionTitle}>
            Stay Informed & Positive! 📰✨
          </Text>
          <Text style={dynamicStyles.permissionSubtitle}>
            Get personalized news that matches your mood. We focus on uplifting, educational, and healthy content to keep you informed without overwhelming you.
          </Text>
          <View style={dynamicStyles.permissionButtons}>
            <TouchableOpacity
              style={dynamicStyles.allowButton}
              onPress={handleAllowNewsAccess}
            >
              <Text style={dynamicStyles.allowButtonText}>Allow News Access</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.denyButton}
              onPress={handleDenyNewsAccess}
            >
              <Text style={dynamicStyles.denyButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Loading State
  if (isLoading && newsArticles.length === 0) {
    return (
      <View style={dynamicStyles.container}>
        {renderHeader()}
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme === 'light' ? '#007AFF' : '#0066CC'} />
          <Text style={[dynamicStyles.emptyText, { marginTop: 16 }]}>
            Loading your personalized news...
          </Text>
        </View>
      </View>
    );
  }

  // Empty State
  if (!isLoading && newsArticles.length === 0) {
    return (
      <View style={dynamicStyles.container}>
        {renderHeader()}
        <View style={dynamicStyles.emptyContainer}>
          <MaterialCommunityIcons
            name="newspaper-variant-outline"
            size={64}
            color={theme === 'light' ? '#ccc' : '#555'}
            style={{ marginBottom: 16 }}
          />
          <Text style={dynamicStyles.emptyTitle}>No News Available</Text>
          <Text style={dynamicStyles.emptyText}>
            {!isOnboardingComplete 
              ? "Set up your interests to get personalized news recommendations."
              : "Pull down to refresh or check your internet connection."
            }
          </Text>
          {!isOnboardingComplete && (
            <TouchableOpacity
              style={dynamicStyles.setupButton}
              onPress={() => navigation.navigate('NewsInterestsOnboarding')}
            >
              <Text style={dynamicStyles.setupButtonText}>Set Up Interests</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {renderHeader()}
      
      <FlatList
        data={newsArticles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NewsCard
            article={item}
            onBookmark={handleBookmark}
            onShare={handleShare}
            onRead={handleRead}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme === 'light' ? '#007AFF' : '#0066CC'}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
  );
};

export default NewsFeedScreen;
