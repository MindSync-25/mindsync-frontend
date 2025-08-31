// AI Floating Action Button - Provides quick access to AI features
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Props {
  onChatPress: () => void;
  onVoicePress?: () => void;
  onSuggestionsPress?: () => void;
}

const AIFloatingButton: React.FC<Props> = ({ 
  onChatPress, 
  onVoicePress, 
  onSuggestionsPress 
}) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(rotateAnim, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAction = (action: () => void) => {
    action();
    toggleExpand(); // Close the menu after action
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const dynamicStyles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 90, // Above the tab bar
      right: 20,
      alignItems: 'center',
      zIndex: 1000,
    },
    mainButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#4caf50',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    subButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    chatButton: {
      backgroundColor: '#2196f3',
    },
    voiceButton: {
      backgroundColor: '#ff4444',
    },
    suggestionsButton: {
      backgroundColor: '#ff9800',
    },
    label: {
      position: 'absolute',
      right: 60,
      backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      minWidth: 80,
    },
    labelText: {
      color: theme === 'light' ? '#fff' : '#000',
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
    },
    aiIndicator: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#4caf50',
      alignItems: 'center',
      justifyContent: 'center',
    },
    aiIndicatorText: {
      color: '#fff',
      fontSize: 8,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Chat Button */}
      <Animated.View style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        }
      ]}>
        <TouchableOpacity
          style={[dynamicStyles.subButton, dynamicStyles.chatButton]}
          onPress={() => handleAction(onChatPress)}
        >
          <Ionicons name="chatbubbles" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={dynamicStyles.label}>
          <Text style={dynamicStyles.labelText}>AI Chat</Text>
        </View>
      </Animated.View>

      {/* Voice Button (if provided) */}
      {onVoicePress && (
        <Animated.View style={[
          {
            transform: [{ scale: scaleAnim }],
            opacity: scaleAnim,
          }
        ]}>
          <TouchableOpacity
            style={[dynamicStyles.subButton, dynamicStyles.voiceButton]}
            onPress={() => handleAction(onVoicePress)}
          >
            <Ionicons name="mic" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={dynamicStyles.label}>
            <Text style={dynamicStyles.labelText}>Voice AI</Text>
          </View>
        </Animated.View>
      )}

      {/* Suggestions Button (if provided) */}
      {onSuggestionsPress && (
        <Animated.View style={[
          {
            transform: [{ scale: scaleAnim }],
            opacity: scaleAnim,
          }
        ]}>
          <TouchableOpacity
            style={[dynamicStyles.subButton, dynamicStyles.suggestionsButton]}
            onPress={() => handleAction(onSuggestionsPress)}
          >
            <Ionicons name="bulb" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={dynamicStyles.label}>
            <Text style={dynamicStyles.labelText}>AI Tips</Text>
          </View>
        </Animated.View>
      )}

      {/* Main AI Button */}
      <TouchableOpacity
        style={dynamicStyles.mainButton}
        onPress={toggleExpand}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="add" size={28} color="#fff" />
        </Animated.View>
        
        {/* AI Indicator */}
        <View style={dynamicStyles.aiIndicator}>
          <Text style={dynamicStyles.aiIndicatorText}>AI</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default AIFloatingButton;
