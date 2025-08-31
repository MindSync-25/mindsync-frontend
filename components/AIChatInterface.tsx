// AI Chat Interface - Floating chat assistant
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { aiAPI, AIChatResponse } from '../services/aiAPI';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  confidence?: number;
  suggestions?: string[];
  actionableItems?: Array<{
    text: string;
    action: string;
    taskId?: string;
  }>;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  userId: string;
  onTaskAction?: (taskId: string) => void;
}

const AIChatInterface: React.FC<Props> = ({ visible, onClose, userId, onTaskAction }) => {
  const { theme } = useTheme();
  const { width } = Dimensions.get('window');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    if (visible) {
      // Slide in from right
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Add welcome message if no messages
      if (messages.length === 0) {
        addWelcomeMessage();
      }
    } else {
      // Slide out to right
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: "Hi! I'm your AI assistant. I can help you manage tasks, provide insights, and answer questions about your productivity. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
      confidence: 1.0,
      suggestions: [
        "What tasks do I have today?",
        "How productive am I?",
        "Create a new task",
        "Show me overdue tasks"
      ]
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await aiAPI.sendChatMessage(inputText, userId);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        confidence: response.confidence,
        suggestions: response.suggestions,
        actionableItems: response.actionableItems,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
        confidence: 0.1,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
  };

  const handleActionPress = (action: any) => {
    if (action.action === 'open_task' && action.taskId && onTaskAction) {
      onTaskAction(action.taskId);
    }
    // Add more action handlers as needed
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const dynamicStyles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
    },
    container: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: Math.min(350, width * 0.85),
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#121212',
      zIndex: 1001,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme === 'light' ? '#000' : '#fff',
    },
    headerSubtitle: {
      fontSize: 12,
      color: '#4caf50',
      marginTop: 2,
    },
    closeButton: {
      padding: 8,
    },
    messagesContainer: {
      flex: 1,
      padding: 16,
    },
    messageWrapper: {
      marginBottom: 16,
    },
    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#2196f3',
      padding: 12,
      borderRadius: 18,
      borderBottomRightRadius: 4,
      maxWidth: '80%',
    },
    aiMessage: {
      alignSelf: 'flex-start',
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      padding: 12,
      borderRadius: 18,
      borderBottomLeftRadius: 4,
      maxWidth: '80%',
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    messageText: {
      fontSize: 14,
      lineHeight: 20,
    },
    userMessageText: {
      color: '#fff',
    },
    aiMessageText: {
      color: theme === 'light' ? '#000' : '#fff',
    },
    timestamp: {
      fontSize: 10,
      color: theme === 'light' ? '#666' : '#aaa',
      marginTop: 4,
      textAlign: 'right',
    },
    confidenceScore: {
      fontSize: 10,
      color: '#4caf50',
      marginTop: 4,
    },
    suggestionsContainer: {
      marginTop: 8,
    },
    suggestionChip: {
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 6,
    },
    suggestionText: {
      fontSize: 12,
      color: theme === 'light' ? '#333' : '#ccc',
    },
    actionableItems: {
      marginTop: 8,
    },
    actionItem: {
      backgroundColor: '#4caf50',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginBottom: 6,
    },
    actionText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderTopWidth: 1,
      borderTopColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    textInput: {
      flex: 1,
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#333',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 12,
      color: theme === 'light' ? '#000' : '#fff',
      fontSize: 14,
    },
    sendButton: {
      backgroundColor: '#2196f3',
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: '#ccc',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      padding: 12,
      borderRadius: 18,
      borderBottomLeftRadius: 4,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    loadingText: {
      marginLeft: 8,
      color: theme === 'light' ? '#666' : '#aaa',
      fontSize: 14,
    },
  });

  if (!visible) return null;

  return (
    <View style={dynamicStyles.overlay}>
      <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
      <Animated.View 
        style={[
          dynamicStyles.container,
          {
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={dynamicStyles.header}>
            <View>
              <Text style={dynamicStyles.headerTitle}>AI Assistant</Text>
              <Text style={dynamicStyles.headerSubtitle}>🧠 Powered by MindSync AI</Text>
            </View>
            <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme === 'light' ? '#000' : '#fff'} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={dynamicStyles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View key={message.id} style={dynamicStyles.messageWrapper}>
                <View style={message.isUser ? dynamicStyles.userMessage : dynamicStyles.aiMessage}>
                  <Text style={[
                    dynamicStyles.messageText,
                    message.isUser ? dynamicStyles.userMessageText : dynamicStyles.aiMessageText
                  ]}>
                    {message.text}
                  </Text>
                  <Text style={dynamicStyles.timestamp}>
                    {formatTime(message.timestamp)}
                  </Text>
                  {!message.isUser && message.confidence && (
                    <Text style={dynamicStyles.confidenceScore}>
                      Confidence: {(message.confidence * 100).toFixed(0)}%
                    </Text>
                  )}
                </View>

                {!message.isUser && message.suggestions && (
                  <View style={dynamicStyles.suggestionsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {message.suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={dynamicStyles.suggestionChip}
                          onPress={() => handleSuggestionPress(suggestion)}
                        >
                          <Text style={dynamicStyles.suggestionText}>{suggestion}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {!message.isUser && message.actionableItems && (
                  <View style={dynamicStyles.actionableItems}>
                    {message.actionableItems.map((action, index) => (
                      <TouchableOpacity
                        key={index}
                        style={dynamicStyles.actionItem}
                        onPress={() => handleActionPress(action)}
                      >
                        <Text style={dynamicStyles.actionText}>{action.text}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {loading && (
              <View style={dynamicStyles.loadingContainer}>
                <ActivityIndicator size="small" color="#4caf50" />
                <Text style={dynamicStyles.loadingText}>AI is thinking...</Text>
              </View>
            )}
          </ScrollView>

          <View style={dynamicStyles.inputContainer}>
            <TextInput
              style={dynamicStyles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about your tasks..."
              placeholderTextColor={theme === 'light' ? '#999' : '#666'}
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                dynamicStyles.sendButton,
                (!inputText.trim() || loading) && dynamicStyles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={(!inputText.trim() || loading) ? '#999' : '#fff'} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
};

export default AIChatInterface;
