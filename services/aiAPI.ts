// MindSync AI API Service - Production Integration
import axios from 'axios';
import { environment } from '../config/environments';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AI API Client with authentication
const createAIClient = async () => {
  const token = await AsyncStorage.getItem('userToken');
  
  const client = axios.create({
    baseURL: environment.API_BASE_URL,
    timeout: 60000, // 60 seconds for AI processing (Ollama + task creation + response)
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : undefined,
    },
    // 🚨 WORKAROUND: Handle malformed JSON from backend serialization issues
    transformResponse: [(data) => {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.warn('⚠️ JSON parse error, returning raw data:', error);
        return data; // Return raw data if JSON parsing fails
      }
    }],
  });

  // Add response interceptor for debugging
  client.interceptors.response.use(
    (response) => {
      console.log('✅ Axios Response Success:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      return response;
    },
    (error) => {
      console.error('❌ Axios Response Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      // 🚨 WORKAROUND: Check if this is a JSON parsing error with 200 status
      if (error.response?.status === 200 && error.message.includes('JSON')) {
        console.log('🔧 JSON parsing error with 200 status - likely backend serialization issue');
        console.log('📝 Raw response text:', error.response?.data);
        
        // Try to extract the response manually if possible
        try {
          const responseText = error.response.data;
          if (typeof responseText === 'string' && responseText.includes('"response"')) {
            // Attempt to parse partial JSON or extract response text
            const responseMatch = responseText.match(/"response"\s*:\s*"([^"]+)"/);
            const confidenceMatch = responseText.match(/"confidence"\s*:\s*([\d.]+)/);
            
            if (responseMatch) {
              console.log('✅ Extracted response from malformed JSON:', responseMatch[1]);
              error.response.data = {
                response: responseMatch[1],
                confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5,
                actions: null // Ignore broken actions array
              };
              return error.response; // Return as successful response
            }
          }
        } catch (parseError) {
          console.warn('⚠️ Could not parse malformed response');
        }
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

// TypeScript Interfaces for AI Responses
export interface AIPrioritySuggestion {
  taskId: string;
  suggestedPriority: 'low' | 'medium' | 'high' | 'urgent';
  reasoning: string;
  confidence: number;
}

export interface AIChatResponse {
  response: string;
  confidence: number;
  suggestions?: string[];
  actionableItems?: Array<{
    text: string;
    action: string;
    taskId?: string;
  }>;
}

export interface AIOptimizationSuggestion {
  type: string;
  taskId?: string;
  message: string;
  reasoning: string;
}

export interface AITaskOptimization {
  suggestions: AIOptimizationSuggestion[];
  workloadScore: number;
  burnoutRisk: 'low' | 'medium' | 'high';
}

export interface AIContextualSuggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  actionText: string;
  confidenceScore: number;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: string;
}

export interface AIProductivityInsights {
  tasksCreated: number;
  tasksCompleted: number;
  completionRate: number;
  totalFocusTimeHours: number;
  productivityTrend: 'improving' | 'stable' | 'declining';
  recommendedActions: string[];
  weeklyStats?: {
    avgTasksPerDay: number;
    peakProductivityHour: number;
    longestFocusSession: number;
  };
}

export interface AINotification {
  id: string;
  type: 'deadline_alert' | 'overdue_task' | 'productivity_insight' | 'suggestion' | 'achievement' | 'reminder' | 'workload_warning' | 'focus_suggestion';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  taskId?: string;
}

// 🎤 Voice Conversation Interfaces
export interface VoiceConversationResponse {
  success: boolean;
  transcript: string;
  confidence: number;
  aiResponse: string;
  audioBase64?: string; // NEW v2 format: Base64 encoded audio from backend
  audioFormat?: string; // NEW v2 format: Audio format (e.g., "wav")
  hasAudio: boolean;
  actions?: Array<{
    text: string;
    action: string;
    taskId?: string;
  }>;
}

export interface VoiceSettings {
  audioEnabled: boolean;
  autoPlay: boolean;
  volume: number;
}

// Main AI API Service
const requestThrottle = new Map<string, number>(); // Track request timestamps

export const aiAPI = {
  /**
   * Get AI-powered task priority suggestion
   */
  async getTaskPrioritySuggestion(taskId: string): Promise<AIPrioritySuggestion> {
    try {
      const client = await createAIClient();
      const response = await client.post('/api/ai/task-priority-suggestion', { taskId });
      return response.data;
    } catch (error: any) {
      console.error('AI Priority Suggestion Error:', error);
      // Fallback for offline or AI service issues
      return {
        taskId,
        suggestedPriority: 'medium',
        reasoning: 'AI service unavailable. Using default priority.',
        confidence: 0.5
      };
    }
  },

  /**
   * Send message to AI chat interface
   */
  async sendChatMessage(message: string, userId: string): Promise<AIChatResponse> {
    // 🚨 THROTTLE: Prevent rapid duplicate requests
    const requestKey = `chat-${userId}-${message}`;
    const now = Date.now();
    const lastRequest = requestThrottle.get(requestKey);
    
    if (lastRequest && (now - lastRequest) < 2000) { // 2 second throttle
      console.warn('⚠️ Request throttled - too similar to recent request');
      return {
        response: "I'm processing your previous request. Please wait a moment.",
        confidence: 0.3,
        suggestions: [],
        actionableItems: []
      };
    }
    
    requestThrottle.set(requestKey, now);
    
    try {
      console.log('🧠 Sending message to AI backend:', { message, userId });
      console.log('🌐 API Base URL:', environment.API_BASE_URL);
      
      const client = await createAIClient();
      
      // Test the endpoint and payload
      console.log('📡 Making request to:', `${environment.API_BASE_URL}/api/ai/chat`);
      console.log('📦 Request payload:', { message, userId });
      
      const response = await client.post('/api/ai/chat', { message, userId });
      
      console.log('✅ Raw backend response status:', response.status);
      console.log('✅ Raw backend response data:', response.data);
      console.log('✅ Response type:', typeof response.data);
      console.log('✅ Response keys:', Object.keys(response.data || {}));
      
      // Validate and clean the response structure
      if (response.data && typeof response.data === 'object') {
        // 🚨 DEFENSIVE: Handle potentially broken actions array
        let cleanActionableItems = [];
        try {
          // Only process actions if they exist and are properly serializable
          if (response.data.actionableItems && Array.isArray(response.data.actionableItems)) {
            cleanActionableItems = response.data.actionableItems;
          } else if (response.data.actions && Array.isArray(response.data.actions)) {
            // Try to process actions array carefully
            cleanActionableItems = response.data.actions.filter(action => 
              action && typeof action === 'object' && !action.toString().includes('@')
            );
          }
        } catch (actionsError) {
          console.warn('⚠️ Skipping broken actions array:', actionsError);
          cleanActionableItems = [];
        }
        
        const cleanedResponse: AIChatResponse = {
          response: response.data.response || '',
          confidence: response.data.confidence || 0.5,
          suggestions: response.data.suggestions || [],
          actionableItems: cleanActionableItems
        };
        
        console.log('🎉 Cleaned AI response:', cleanedResponse);
        return cleanedResponse;
      } else {
        console.warn('⚠️ Unexpected response format:', response.data);
        return {
          response: response.data?.response || 'Unexpected response format',
          confidence: response.data?.confidence || 0.5,
          suggestions: [],
          actionableItems: []
        };
      }
      
    } catch (error: any) {
      console.error('❌ AI Chat Error Details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        responseType: typeof error.response?.data,
        isTimeout: error.code === 'ECONNABORTED' || error.message.includes('timeout'),
        isJSONError: error.message.includes('JSON') || error.message.includes('parse')
      });
      
      // 🚨 WORKAROUND: Handle JSON serialization issues from backend
      if (error.response?.status === 200) {
        console.log('🔧 200 status with error - processing backend serialization issue');
        
        try {
          const responseData = error.response.data;
          
          // If we have response data, try to extract what we can
          if (responseData && typeof responseData === 'object') {
            return {
              response: responseData.response || 'Task processed successfully!',
              confidence: responseData.confidence || 0.5,
              suggestions: responseData.suggestions || [],
              actionableItems: [] // Ignore broken actions array for now
            };
          }
          
          // If response is a string (malformed JSON), try to extract response text
          if (typeof responseData === 'string') {
            const responseMatch = responseData.match(/"response"\s*:\s*"([^"]+)"/);
            if (responseMatch) {
              return {
                response: responseMatch[1],
                confidence: 0.5,
                suggestions: [],
                actionableItems: []
              };
            }
          }
          
          // Fallback for 200 status
          return {
            response: "Your task has been processed successfully! The backend created your task but there's a minor formatting issue with the response.",
            confidence: 0.7,
            suggestions: ['Check your tasks list to see the created task'],
            actionableItems: []
          };
          
        } catch (parseError) {
          console.error('❌ Failed to parse 200 response:', parseError);
        }
      }
      
      // Check if this is a timeout error
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log('⏰ Request timed out - AI is taking longer than expected');
        return {
          response: "The AI is working hard on your request! This might take a moment as I'm processing your task and creating it in the system. Please try again in a few seconds.",
          confidence: 0.3,
          suggestions: ['Try again in a few seconds', 'The AI is processing your request']
        };
      }
      
      // Only use fallback if there's an actual network/server error
      return {
        response: "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again later.",
        confidence: 0.1,
        suggestions: ['Try again later', 'Check your connection']
      };
    }
  },

  /**
   * Get AI task optimization suggestions
   */
  async getTaskOptimization(userId: string): Promise<AITaskOptimization> {
    try {
      const client = await createAIClient();
      const response = await client.get(`/api/ai/optimize-tasks/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('AI Task Optimization Error:', error);
      // Fallback with basic suggestions
      return {
        suggestions: [{
          type: 'general',
          message: 'Focus on completing your highest priority tasks first.',
          reasoning: 'Prioritization helps maintain productivity.'
        }],
        workloadScore: 50,
        burnoutRisk: 'low'
      };
    }
  },

  /**
   * Get contextual AI suggestions based on time/situation
   */
  async getContextualSuggestions(userId: string): Promise<AIContextualSuggestion[]> {
    try {
      const client = await createAIClient();
      const response = await client.get(`/api/ai/contextual-suggestions/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('AI Contextual Suggestions Error:', error);
      // Fallback with time-based suggestion
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      
      return [{
        id: 'fallback-1',
        type: `${timeOfDay}_suggestion`,
        title: `Good ${timeOfDay}!`,
        description: 'Start with your most important task to build momentum.',
        actionText: 'View tasks',
        confidenceScore: 0.5,
        priority: 'medium'
      }];
    }
  },

  /**
   * Get AI-powered productivity insights
   */
  async getProductivityInsights(userId: string): Promise<AIProductivityInsights> {
    try {
      const client = await createAIClient();
      const response = await client.get(`/api/ai/productivity-insights/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('AI Productivity Insights Error:', error);
      // Fallback with basic stats
      return {
        tasksCreated: 0,
        tasksCompleted: 0,
        completionRate: 0,
        totalFocusTimeHours: 0,
        productivityTrend: 'stable',
        recommendedActions: ['Create your first task to get started!']
      };
    }
  },

  /**
   * Get AI suggestions for task dependencies
   */
  async getTaskDependencySuggestions(taskId: string): Promise<string[]> {
    try {
      const client = await createAIClient();
      const response = await client.post('/api/ai/dependency-suggestions', { taskId });
      return response.data.suggestions || [];
    } catch (error: any) {
      console.error('AI Dependency Suggestions Error:', error);
      return [];
    }
  },

  /**
   * Analyze task text and suggest improvements
   */
  async analyzeTaskText(text: string): Promise<{
    suggestedTitle?: string;
    suggestedDescription?: string;
    suggestedPriority?: string;
    suggestedDuration?: number;
    extractedKeywords?: string[];
  }> {
    try {
      const client = await createAIClient();
      const response = await client.post('/api/ai/analyze-task-text', { text });
      return response.data;
    } catch (error: any) {
      console.error('AI Task Text Analysis Error:', error);
      return {};
    }
  },

  /**
   * Get smart scheduling suggestions
   */
  async getSchedulingSuggestions(userId: string, taskId?: string): Promise<{
    suggestedStartTime?: string;
    suggestedDuration?: number;
    optimalTimeSlots?: Array<{ start: string; end: string; score: number }>;
    reasoning?: string;
  }> {
    try {
      const client = await createAIClient();
      const response = await client.post('/api/ai/scheduling-suggestions', { userId, taskId });
      return response.data;
    } catch (error: any) {
      console.error('AI Scheduling Suggestions Error:', error);
      return {};
    }
  },

  /**
   * Get AI-powered notifications and alerts
   */
  async getNotifications(userId: string): Promise<AINotification[]> {
    try {
      const client = await createAIClient();
      const response = await client.get(`/api/ai/notifications/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('AI Notifications Error:', error);
      // Fallback with sample notification
      return [{
        id: 'sample-1',
        type: 'productivity_insight',
        title: 'Daily Productivity Tip',
        message: 'You work best in the morning. Try scheduling important tasks between 9-11 AM.',
        priority: 'medium',
        timestamp: new Date().toISOString(),
        isRead: false
      }];
    }
  },

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const client = await createAIClient();
      await client.patch(`/api/ai/notifications/${notificationId}/read`);
    } catch (error: any) {
      console.error('Mark Notification Read Error:', error);
    }
  },

  /**
   * Dismiss notification
   */
  async dismissNotification(notificationId: string): Promise<void> {
    try {
      const client = await createAIClient();
      await client.delete(`/api/ai/notifications/${notificationId}`);
    } catch (error: any) {
      console.error('Dismiss Notification Error:', error);
    }
  },

  // 🎤 VOICE CONVERSATION API FUNCTIONS

  /**
   * Get voice requirements from backend v2 API
   */
  async getVoiceRequirements(): Promise<any> {
    try {
      console.log('📋 Getting voice requirements from backend v2');
      
      const client = await createAIClient();
      const response = await client.get('/api/voice/v2/requirements');
      
      console.log('✅ Voice requirements:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Voice Requirements Error:', error);
      return {
        format: 'WAV',
        sampleRate: 16000,
        channels: 1,
        endpoint: '/api/voice/v2/conversation'
      };
    }
  },

  /**
   * Send voice message to AI v2 endpoint with proper format
   */
  /**
   * Send voice message to AI v2 endpoint with proper format
   */
  async sendVoiceMessage(audioBlob: Blob, userId: string): Promise<VoiceConversationResponse> {
    // 🚨 THROTTLE: Prevent rapid voice requests
    const requestKey = `voice-${userId}-${audioBlob.size}`;
    const now = Date.now();
    const lastRequest = requestThrottle.get(requestKey);
    
    if (lastRequest && (now - lastRequest) < 3000) { // 3 second throttle for voice
      console.warn('⚠️ Voice request throttled - too rapid');
      return {
        success: false,
        transcript: '',
        confidence: 0.1,
        aiResponse: "Please wait before sending another voice message.",
        hasAudio: false,
        actions: []
      };
    }
    
    requestThrottle.set(requestKey, now);

    try {
      console.log('🎤 Sending voice message to backend v2:', { 
        userId, 
        audioSize: audioBlob.size,
        audioType: audioBlob.type 
      });
      
      const token = await AsyncStorage.getItem('userToken');
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav'); // Use 'audio' field name as specified
      
      // Add debugging information
      console.log('📁 FormData details for v2:', {
        fieldName: 'audio',
        fileName: 'recording.wav',
        fileSize: audioBlob.size,
        fileType: audioBlob.type,
        timestamp: new Date().toISOString()
      });
      
      const response = await axios.post(
        `${environment.API_BASE_URL}/api/voice/v2/conversation`, // v2 endpoint
        formData,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000 // Voice processing takes time
        }
      );

      console.log('✅ Voice v2 conversation response:', {
        success: response.data.success,
        transcript: response.data.transcript,
        confidence: response.data.confidence,
        aiResponse: response.data.aiResponse?.substring(0, 100) + '...',
        hasAudio: response.data.hasAudio,
        audioFormat: response.data.audioFormat,
        audioBase64Length: response.data.audioBase64?.length || 0
      });
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Voice v2 Conversation Error:', error);
      return {
        success: false,
        transcript: '',
        confidence: 0.1,
        aiResponse: "Sorry, I couldn't process your voice message. Please try again.",
        hasAudio: false,
        actions: []
      };
    }
  },

  /**
   * Convert speech to text only (no AI response)
   */
  async speechToText(audioBlob: Blob): Promise<{ transcript: string; confidence: number }> {
    try {
      console.log('🎙️ Converting speech to text');
      
      const token = await AsyncStorage.getItem('userToken');
      
      const formData = new FormData();
      formData.append('audioFile', audioBlob, 'recording.wav');
      
      const response = await axios.post(
        `${environment.API_BASE_URL}/api/voice/speech-to-text`,
        formData,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 30000
        }
      );

      console.log('✅ Speech-to-text response:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Speech-to-Text Error:', error);
      return {
        transcript: '',
        confidence: 0
      };
    }
  }
};

export default aiAPI;
