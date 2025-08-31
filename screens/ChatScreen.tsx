import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { aiAPI } from '../services/aiAPI';
import { authApi } from '../services/authApi';
import VoiceChatButton from '../components/VoiceChatButton';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'task' | 'calendar' | 'voice';
  audioUrl?: string;
}

const ChatScreen: React.FC = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Load user session and get real user ID from JWT token
  useEffect(() => {
    const loadUserSession = async () => {
      try {
        const session = await authApi.getCurrentSession();
        if (session && session.userId) {
          setUserId(session.userId);
          console.log('✅ Loaded user session for chat:', session.userId);
        } else {
          console.warn('⚠️ No user session found, user may need to login');
        }
      } catch (error) {
        console.error('❌ Error loading user session:', error);
      }
    };
    
    loadUserSession();
  }, []);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      text: "Hello! I'm your AI assistant. I'm connected directly to the backend and ready to help you with tasks, productivity insights, and more. What can I do for you?",
      isUser: false,
      timestamp: new Date(),
      type: 'text',
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Call backend AI
    await sendToBackend(inputText.trim());
    setIsLoading(false);
  };

  // Handle voice transcript
  const handleVoiceTranscript = (transcript: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: transcript,
      isUser: true,
      timestamp: new Date(),
      type: 'voice',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // 🚨 DON'T CALL sendToBackend here - the voice API already handles the AI response
    // sendToBackend(transcript); // REMOVED - this was causing duplicate requests
  };

  // Handle voice response
  const handleVoiceResponse = (response: string, actions?: any[]) => {
    setIsLoading(false);
    
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: response,
      isUser: false,
      timestamp: new Date(),
      type: 'voice',
    };

    setMessages(prev => [...prev, aiMessage]);

    // Handle actionable items if provided
    if (actions && actions.length > 0) {
      const actionMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: `I can help you with:\n${actions.map(item => `• ${item.text || item.description || item}`).join('\n')}`,
        isUser: false,
        timestamp: new Date(),
        type: 'suggestion',
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, actionMessage]);
      }, 500);
    }
  };

  // Handle voice errors
  const handleVoiceError = (error: string) => {
    setIsLoading(false);
    
    const errorMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: `Voice error: ${error}`,
      isUser: false,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, errorMessage]);
  };

  const sendToBackend = async (userInput: string): Promise<void> => {
    try {
      console.log('🧠 Sending to backend with JWT auth:', userInput);
      console.log('🔑 User ID:', userId);
      
      // Direct call to backend AI API with JWT token
      const aiResponse = await aiAPI.sendChatMessage(userInput, userId);
      
      console.log('✅ Backend response received:', {
        response: aiResponse.response,
        confidence: aiResponse.confidence,
        actionableItems: aiResponse.actionableItems
      });

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.response,
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle actionable items if provided
      if (aiResponse.actionableItems && aiResponse.actionableItems.length > 0) {
        const actionMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          text: `I can help you with:\n${aiResponse.actionableItems.map(item => `• ${item.text}`).join('\n')}`,
          isUser: false,
          timestamp: new Date(),
          type: 'suggestion',
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, actionMessage]);
        }, 500);
      }

    } catch (error) {
      console.error('❌ Backend error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to the backend right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

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
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      textAlign: 'center',
    },
    messagesContainer: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    messageWrapper: {
      marginVertical: 4,
    },
    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#007AFF',
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxWidth: '80%',
      marginLeft: '20%',
    },
    aiMessage: {
      alignSelf: 'flex-start',
      backgroundColor: theme === 'light' ? '#fff' : '#2a2a2a',
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxWidth: '80%',
      marginRight: '20%',
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    voiceMessage: {
      borderLeftWidth: 4,
      borderLeftColor: '#007AFF',
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
    },
    userMessageText: {
      color: '#fff',
    },
    aiMessageText: {
      color: theme === 'light' ? '#000' : '#fff',
    },
    timestamp: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
      marginTop: 4,
      textAlign: 'center',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderTopWidth: 1,
      borderTopColor: theme === 'light' ? '#e0e0e0' : '#333',
      gap: 12,
    },
    textInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#333',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#2a2a2a',
      color: theme === 'light' ? '#000' : '#fff',
      maxHeight: 100,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#007AFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: theme === 'light' ? '#fff' : '#2a2a2a',
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginVertical: 4,
      marginRight: '20%',
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    loadingText: {
      color: theme === 'light' ? '#666' : '#aaa',
      marginLeft: 8,
      fontSize: 16,
    },
  });

  return (
    <KeyboardAvoidingView 
      style={dynamicStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>AI Assistant</Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={dynamicStyles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View key={message.id} style={dynamicStyles.messageWrapper}>
            <View
              style={[
                message.isUser ? dynamicStyles.userMessage : dynamicStyles.aiMessage,
                message.type === 'voice' ? dynamicStyles.voiceMessage : null,
              ]}
            >
              <Text
                style={[
                  dynamicStyles.messageText,
                  message.isUser 
                    ? dynamicStyles.userMessageText 
                    : dynamicStyles.aiMessageText,
                ]}
              >
                {message.text}
              </Text>
              {message.type === 'voice' && (
                <Text style={[
                  dynamicStyles.timestamp, 
                  { marginTop: 8, textAlign: 'left', fontSize: 10 }
                ]}>
                  🎤 Voice message
                </Text>
              )}
            </View>
            <Text style={dynamicStyles.timestamp}>
              {formatTime(message.timestamp)}
            </Text>
          </View>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <View style={dynamicStyles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={dynamicStyles.loadingText}>AI is processing your request...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={dynamicStyles.inputContainer}>
        <TextInput
          style={dynamicStyles.textInput}
          placeholder="Type your message..."
          placeholderTextColor={theme === 'light' ? '#999' : '#666'}
          value={inputText}
          onChangeText={setInputText}
          multiline
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />

        {/* Voice Chat Button */}
        <VoiceChatButton
          userId={userId}
          onTranscript={handleVoiceTranscript}
          onResponse={handleVoiceResponse}
          onError={handleVoiceError}
          size="medium"
          disabled={!userId || isLoading}
        />

        <TouchableOpacity
          style={dynamicStyles.sendButton}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
