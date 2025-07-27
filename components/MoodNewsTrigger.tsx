import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  NewsFeed: { currentMood: string; isTriggeredByMood: boolean };
};

interface MoodNewsTriggerProps {
  currentMood: string;
  onMoodSelect: (mood: string) => void;
}

const MoodNewsTrigger: React.FC<MoodNewsTriggerProps> = ({ currentMood, onMoodSelect }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [newsPermissionGranted, setNewsPermissionGranted] = useState(false);

  const dynamicStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderRadius: 20,
      padding: 24,
      width: '85%',
      maxWidth: 350,
      alignItems: 'center',
    },
    modalIcon: {
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      textAlign: 'center',
      marginBottom: 12,
    },
    modalSubtitle: {
      fontSize: 16,
      color: theme === 'light' ? '#666' : '#aaa',
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
    },
    buttonContainer: {
      width: '100%',
      gap: 12,
    },
    primaryButton: {
      backgroundColor: theme === 'light' ? '#007AFF' : '#0066CC',
      paddingVertical: 14,
      borderRadius: 25,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      paddingVertical: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#333',
      borderRadius: 25,
    },
    secondaryButtonText: {
      color: theme === 'light' ? '#666' : '#aaa',
      fontSize: 16,
    },
    denyButton: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    denyButtonText: {
      color: theme === 'light' ? '#999' : '#666',
      fontSize: 14,
    },
  });

  useEffect(() => {
    checkNewsPermission();
  }, []);

  const checkNewsPermission = async () => {
    try {
      const permission = await AsyncStorage.getItem('newsPermissionGranted');
      setNewsPermissionGranted(permission === 'true');
    } catch (error) {
      console.error('Error checking news permission:', error);
    }
  };

  const handleMoodPress = async (mood: string) => {
    onMoodSelect(mood);

    // Always show permission request when user presses mood emoji
    // This creates a natural, healthy way to access news
    setShowPermissionModal(true);
  };

  const handleAllowNews = async () => {
    try {
      await AsyncStorage.setItem('newsPermissionGranted', 'true');
      setNewsPermissionGranted(true);
      setShowPermissionModal(false);
      
      // Navigate to news feed with mood context
      navigation.navigate('NewsFeed', { 
        currentMood, 
        isTriggeredByMood: true 
      });
    } catch (error) {
      console.error('Error granting news permission:', error);
    }
  };

  const handleLaterPress = async () => {
    setShowPermissionModal(false);
    
    // Store that user declined for this session to avoid being pushy
    await AsyncStorage.setItem('newsDeclinedThisSession', 'true');
  };

  const handleNeverAsk = async () => {
    setShowPermissionModal(false);
    await AsyncStorage.setItem('newsPermissionDenied', 'true');
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

  const getMoodNewsMessage = (mood: string): { title: string; subtitle: string } => {
    const messages: Record<string, { title: string; subtitle: string }> = {
      happy: {
        title: "Great to see you're happy! 😊",
        subtitle: "Would you like some uplifting news and positive stories to keep the good vibes going?"
      },
      sad: {
        title: "We're here for you 😔",
        subtitle: "Let us share some heartwarming stories and positive news that might brighten your day."
      },
      excited: {
        title: "Love your energy! 🔥",
        subtitle: "Check out some exciting breakthroughs and inspiring stories that match your enthusiasm!"
      },
      stressed: {
        title: "Take a breather 🌱",
        subtitle: "We have some calming, wellness-focused content that might help you feel more centered."
      },
      motivated: {
        title: "You're unstoppable! 💪",
        subtitle: "Get inspired with success stories and motivational content to fuel your ambition."
      },
      curious: {
        title: "Feed your curiosity! 🤔",
        subtitle: "Discover fascinating articles about science, technology, and educational content."
      },
      relaxed: {
        title: "Perfect moment to learn 😌",
        subtitle: "Enjoy some peaceful reading with lifestyle and wellness content at your own pace."
      },
    };
    
    return messages[mood] || messages.happy;
  };

  const newsMessage = getMoodNewsMessage(currentMood);

  return (
    <>
      <Modal
        visible={showPermissionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View style={dynamicStyles.overlay}>
          <View style={dynamicStyles.modal}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>
              {getMoodEmoji(currentMood)}
            </Text>
            
            <Text style={dynamicStyles.modalTitle}>
              {newsMessage.title}
            </Text>
            
            <Text style={dynamicStyles.modalSubtitle}>
              {newsMessage.subtitle}
            </Text>
            
            <View style={dynamicStyles.buttonContainer}>
              <TouchableOpacity
                style={dynamicStyles.primaryButton}
                onPress={handleAllowNews}
              >
                <Text style={dynamicStyles.primaryButtonText}>
                  Yes, show me news! 📰
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={dynamicStyles.secondaryButton}
                onPress={handleLaterPress}
              >
                <Text style={dynamicStyles.secondaryButtonText}>
                  Maybe later
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={dynamicStyles.denyButton}
                onPress={handleNeverAsk}
              >
                <Text style={dynamicStyles.denyButtonText}>
                  Don't ask again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default MoodNewsTrigger;
