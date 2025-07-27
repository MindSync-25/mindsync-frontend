import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { NewsArticle } from '../context/NewsContext';

interface NewsCardProps {
  article: NewsArticle;
  onBookmark: (articleId: string) => void;
  onShare: (article: NewsArticle) => void;
  onRead: (articleId: string) => void;
  style?: any;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.95, 400); // Max width for larger screens

const NewsCard: React.FC<NewsCardProps> = ({ article, onBookmark, onShare, onRead, style }) => {
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);

  // Responsive design variables
  const isTablet = width > 600;
  const isSmallScreen = width < 375;

  const dynamicStyles = StyleSheet.create({
    card: {
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderRadius: 16,
      marginVertical: 8,
      marginHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      width: CARD_WIDTH,
      alignSelf: 'center',
    },
    imageContainer: {
      width: '100%',
      height: Math.min(200, width * 0.5), // Responsive height
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      overflow: 'hidden',
      backgroundColor: theme === 'light' ? '#f5f5f5' : '#2a2a2a',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#2a2a2a',
    },
    content: {
      padding: isSmallScreen ? 12 : isTablet ? 20 : 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    sourceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    source: {
      fontSize: isSmallScreen ? 11 : isTablet ? 14 : 12,
      color: theme === 'light' ? '#666' : '#aaa',
      fontWeight: '500',
    },
    readTime: {
      fontSize: isSmallScreen ? 11 : isTablet ? 14 : 12,
      color: theme === 'light' ? '#666' : '#aaa',
      marginLeft: 8,
    },
    moodTags: {
      flexDirection: 'row',
      marginLeft: 8,
    },
    title: {
      fontSize: isSmallScreen ? 16 : isTablet ? 22 : 18,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      lineHeight: isSmallScreen ? 22 : isTablet ? 30 : 24,
      marginBottom: 8,
    },
    description: {
      fontSize: isSmallScreen ? 13 : isTablet ? 16 : 14,
      color: theme === 'light' ? '#333' : '#ccc',
      lineHeight: isSmallScreen ? 18 : isTablet ? 24 : 20,
      marginBottom: 16,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      marginLeft: 16,
      padding: 8,
    },
    readButton: {
      backgroundColor: theme === 'light' ? '#007AFF' : '#0066CC',
      paddingHorizontal: isSmallScreen ? 12 : isTablet ? 20 : 16,
      paddingVertical: isSmallScreen ? 6 : isTablet ? 10 : 8,
      borderRadius: 20,
    },
    readButtonText: {
      color: '#fff',
      fontSize: isSmallScreen ? 13 : isTablet ? 16 : 14,
      fontWeight: '600',
    },
    categoryBadge: {
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 8,
      alignSelf: 'flex-start',
    },
    categoryText: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
      fontWeight: '500',
      textTransform: 'capitalize',
    },
  });

  const handleReadMore = async () => {
    onRead(article.id);
    try {
      const canOpen = await Linking.canOpenURL(article.url);
      if (canOpen) {
        await Linking.openURL(article.url);
      } else {
        // Fallback for invalid URLs - try to open a general news site
        await Linking.openURL('https://news.google.com');
      }
    } catch (error) {
      console.error('Error opening article URL:', error);
      // Try fallback URL
      try {
        await Linking.openURL('https://news.google.com');
      } catch (fallbackError) {
        console.error('Error opening fallback URL:', fallbackError);
      }
    }
  };

  const getMoodEmoji = (moodTag: string): string => {
    const emojiMap: Record<string, string> = {
      happy: '😊',
      exciting: '🔥',
      fun: '🎉',
      positive: '✨',
      inspiring: '💡',
      motivating: '🚀',
      informative: '📚',
      serious: '🤔',
      important: '⚡',
      local: '📍',
      innovative: '💡',
      educational: '🎓',
      health: '💚',
      entertaining: '🎭',
    };
    return emojiMap[moodTag] || '📰';
  };

  return (
    <View style={[dynamicStyles.card, style]}>
      {/* Image */}
      <View style={dynamicStyles.imageContainer}>
        {article.imageUrl && !imageError ? (
          <Image
            source={{ uri: article.imageUrl }}
            style={dynamicStyles.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={dynamicStyles.imagePlaceholder}>
            <MaterialCommunityIcons
              name="newspaper"
              size={48}
              color={theme === 'light' ? '#ccc' : '#555'}
            />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={dynamicStyles.content}>
        {/* Category Badge */}
        <View style={dynamicStyles.categoryBadge}>
          <Text style={dynamicStyles.categoryText}>{article.category}</Text>
        </View>

        {/* Header */}
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.sourceContainer}>
            <Text style={dynamicStyles.source}>{article.source}</Text>
            <Text style={dynamicStyles.readTime}>• {article.readTime}</Text>
            <View style={dynamicStyles.moodTags}>
              {article.moodTags.slice(0, 2).map((tag, index) => (
                <Text key={index} style={{ 
                  fontSize: isSmallScreen ? 12 : isTablet ? 16 : 14, 
                  marginLeft: 4 
                }}>
                  {getMoodEmoji(tag)}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={dynamicStyles.title} numberOfLines={3}>
          {article.title}
        </Text>

        {/* Description */}
        <Text style={dynamicStyles.description} numberOfLines={3}>
          {article.description}
        </Text>

        {/* Footer */}
        <View style={dynamicStyles.footer}>
          <TouchableOpacity style={dynamicStyles.readButton} onPress={handleReadMore}>
            <Text style={dynamicStyles.readButtonText}>Read More</Text>
          </TouchableOpacity>

          <View style={dynamicStyles.actionButtons}>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => onBookmark(article.id)}
            >
              <MaterialCommunityIcons
                name={article.isBookmarked ? "bookmark" : "bookmark-outline"}
                size={isSmallScreen ? 20 : isTablet ? 26 : 22}
                color={article.isBookmarked ? '#FFD700' : (theme === 'light' ? '#666' : '#aaa')}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => onShare(article)}
            >
              <MaterialCommunityIcons
                name="share-outline"
                size={isSmallScreen ? 20 : isTablet ? 26 : 22}
                color={theme === 'light' ? '#666' : '#aaa'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default NewsCard;
