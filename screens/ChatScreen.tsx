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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'task' | 'calendar';
}

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  action: () => void;
}

const ChatScreen: React.FC = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Mock AI suggestions
  const [suggestions] = useState<AISuggestion[]>([
    {
      id: '1',
      title: 'Create Task',
      description: 'Add a new task to your list',
      action: () => handleSuggestion('Create a new task for me'),
    },
    {
      id: '2',
      title: 'Schedule Meeting',
      description: 'Set up a meeting with someone',
      action: () => handleSuggestion('Help me schedule a meeting'),
    },
    {
      id: '3',
      title: 'Daily Summary',
      description: 'Get your daily productivity summary',
      action: () => handleSuggestion('Show me my daily summary'),
    },
    {
      id: '4',
      title: 'Time Analysis',
      description: 'Analyze how you spend your time',
      action: () => handleSuggestion('Analyze my time usage'),
    },
  ]);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      text: "Hello! I'm your AI assistant. I can help you with tasks, scheduling, productivity insights, and more. How can I assist you today?",
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

    // Simulate AI response
    await simulateAIResponse(inputText.trim());
    setIsLoading(false);
  };

  const handleSuggestion = async (suggestionText: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: suggestionText,
      isUser: true,
      timestamp: new Date(),
      type: 'suggestion',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    await simulateAIResponse(suggestionText);
    setIsLoading(false);
  };

  const simulateAIResponse = async (userInput: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let responseText = '';
        let responseType: 'text' | 'task' | 'calendar' = 'text';

        // Simple AI response simulation based on keywords
        const input = userInput.toLowerCase();
        
        if (input.includes('task') || input.includes('todo')) {
          responseText = "I can help you create a task! What would you like to add to your task list? Please provide a title and any details.";
          responseType = 'task';
        } else if (input.includes('meeting') || input.includes('schedule') || input.includes('calendar')) {
          responseText = "I'll help you schedule a meeting. What's the meeting about, and when would you like to schedule it?";
          responseType = 'calendar';
        } else if (input.includes('summary') || input.includes('report')) {
          responseText = `📊 **Daily Summary**\n\n✅ Tasks Completed: 3/5\n⏰ Time Tracked: 4h 30m\n📈 Productivity Score: 85%\n\nYou're doing great! Consider taking a short break to maintain your productivity.`;
        } else if (input.includes('time') || input.includes('analysis')) {
          responseText = `⏱️ **Time Analysis**\n\n🔥 Most Productive: 10AM - 12PM\n📱 Focus Time: 3h 15m\n⚡ Breaks Taken: 4\n\nTip: Your productivity peaks in the morning. Schedule important tasks then!`;
        } else if (input.includes('hello') || input.includes('hi')) {
          responseText = "Hello! I'm here to help you stay productive and organized. You can ask me to create tasks, schedule meetings, analyze your time, or get productivity insights.";
        } else {
          responseText = "I understand you're looking for assistance. I can help with:\n\n• Creating and managing tasks\n• Scheduling meetings and events\n• Productivity analysis\n• Daily summaries\n• Time tracking insights\n\nWhat would you like to work on?";
        }

        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: responseText,
          isUser: false,
          timestamp: new Date(),
          type: responseType,
        };

        setMessages(prev => [...prev, aiMessage]);
        resolve();
      }, 1000 + Math.random() * 1000); // 1-2 second delay
    });
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    
    if (!isListening) {
      // Simulate voice recognition
      Alert.alert(
        'Voice Input',
        'Voice recognition would be integrated here with speech-to-text services.',
        [{ text: 'OK' }]
      );
      
      setTimeout(() => {
        setIsListening(false);
      }, 3000);
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
    suggestionsContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    suggestionsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 12,
    },
    suggestionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    suggestionCard: {
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#1a1a1a',
      borderRadius: 12,
      padding: 12,
      width: '48%',
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    suggestionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 4,
    },
    suggestionDescription: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
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
    voiceButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isListening ? '#FF3B30' : '#007AFF',
      alignItems: 'center',
      justifyContent: 'center',
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
            <Text style={dynamicStyles.loadingText}>AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Suggestions */}
      {messages.length === 1 && ( // Only show on initial welcome
        <View style={dynamicStyles.suggestionsContainer}>
          <Text style={dynamicStyles.suggestionsTitle}>Quick Actions</Text>
          <View style={dynamicStyles.suggestionsGrid}>
            {suggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={dynamicStyles.suggestionCard}
                onPress={suggestion.action}
              >
                <Text style={dynamicStyles.suggestionTitle}>{suggestion.title}</Text>
                <Text style={dynamicStyles.suggestionDescription}>
                  {suggestion.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Input */}
      <View style={dynamicStyles.inputContainer}>
        <TouchableOpacity
          style={dynamicStyles.voiceButton}
          onPress={handleVoiceInput}
        >
          <MaterialCommunityIcons
            name={isListening ? "microphone" : "microphone-outline"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

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
