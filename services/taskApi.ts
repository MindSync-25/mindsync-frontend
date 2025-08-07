import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// 🎯 TASK TYPE DEFINITION WITH DEPENDENCIES
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate?: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
  isOverdue?: boolean;
  dependsOn?: string[]; // Array of task IDs that this task depends on
}

// 🚀 PRODUCTION-READY BACKEND API
const API_BASE_URL = 'http://localhost:8081/api';

// Configure axios instance with JWT authentication
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests automatically
apiClient.interceptors.request.use(async (config) => {
  try {
    // First try to get the main JWT token
    const userToken = await AsyncStorage.getItem('userToken');
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
      console.log('✅ Added JWT token to request');
      return config;
    }
    
    // Fallback: try to get token from user session
    const sessionStr = await AsyncStorage.getItem('userSession');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
        console.log('✅ Added session token to request');
        return config;
      }
    }
    
    console.log('⚠️ No authentication token found');
  } catch (error) {
    console.log('❌ Error adding auth token:', error);
  }
  return config;
});

// 🚀 NEW ENHANCED TASK CREATION FUNCTIONS

// Create task from voice input
export const createTaskFromVoice = async (voiceData: any): Promise<Task> => {
  try {
    console.log('🎤 Creating task from voice:', voiceData);
    
    const formData = new FormData();
    formData.append('audio', {
      uri: voiceData.audioUri,
      type: 'audio/m4a',
      name: 'voice_task.m4a',
    } as any);
    formData.append('timestamp', voiceData.timestamp);
    
    const response = await apiClient.post('/tasks/create-from-voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.task) {
      return transformTaskFromBackend(response.data.task);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('❌ Voice task creation failed:', error);
    throw error;
  }
};

// Create task from natural language text
export const createTaskFromText = async (text: string): Promise<Task> => {
  try {
    console.log('📝 Creating task from text:', text);
    
    const response = await apiClient.post('/tasks/create-from-text', {
      text: text.trim(),
      timestamp: new Date().toISOString(),
    });

    if (response.data && response.data.task) {
      return transformTaskFromBackend(response.data.task);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('❌ Text task creation failed:', error);
    throw error;
  }
};

// Get AI suggestions for task optimization
export const getAISuggestions = async (userId: string): Promise<any[]> => {
  try {
    console.log('🤖 Getting AI suggestions for user:', userId);
    
    const response = await apiClient.get(`/tasks/ai-suggestions/${userId}`);
    return response.data.suggestions || [];
  } catch (error) {
    console.error('❌ Failed to get AI suggestions:', error);
    return [];
  }
};

// Accept AI suggestion
export const acceptAISuggestion = async (suggestionId: string): Promise<void> => {
  try {
    await apiClient.post(`/tasks/ai-suggestions/${suggestionId}/accept`);
  } catch (error) {
    console.error('❌ Failed to accept AI suggestion:', error);
    throw error;
  }
};

// Reject AI suggestion
export const rejectAISuggestion = async (suggestionId: string): Promise<void> => {
  try {
    await apiClient.post(`/tasks/ai-suggestions/${suggestionId}/reject`);
  } catch (error) {
    console.error('❌ Failed to reject AI suggestion:', error);
    throw error;
  }
};

// ✅ REMOVED: Template functionality as requested
// Templates are no longer part of task creation workflow

// 🎯 ENHANCED INTERFACES FOR NEW FEATURES
export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeLog {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  description?: string;
  createdAt: string;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  dependsOnTaskTitle: string;
  createdAt: string;
}

export interface TaskPrioritySuggestion {
  taskId?: string;
  suggestedPriority: 'high' | 'medium' | 'low';
  reasoning: string;
  confidence: number;
}

export interface TaskOptimizationSuggestion {
  suggestions: OptimizationSuggestion[];
  workloadScore: number;
  burnoutRisk: 'low' | 'medium' | 'high';
}

export interface OptimizationSuggestion {
  type: 'reassign' | 'deadline_adjust' | 'break_task' | 'delegate';
  taskId: string;
  description: string;
  impact: string;
}

// 🎯 BACKEND RESPONSE FORMAT (Updated)
// Backend now provides:
// - id: number
// - title: string
// - description: string
// - priority: number (1=high, 2=medium, 3=low)
// - dueDate: string (format: "YYYY-MM-DDTHH:mm:ss")
// - isOverdue: boolean (server-calculated)
// - isCompleted: boolean
// - createdAt: string (format: "YYYY-MM-DDTHH:mm:ss")
// - updatedAt: string (format: "YYYY-MM-DDTHH:mm:ss")

// 🎯 TIMEZONE-AWARE DATE FORMATTING FUNCTION
const formatDateForBackend = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Format as YYYY-MM-DDTHH:mm:ss (local timezone, no UTC conversion)
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// 🎯 PRIORITY MAPPING TO MATCH BACKEND CONTRACT
const mapPriorityToInteger = (priority: string): number => {
  switch (priority.toLowerCase()) {
    case 'high': return 1;
    case 'medium': return 2;
    case 'low': return 3;
    default: return 2; // Default to medium
  }
};

// 🎯 REVERSE MAPPING FOR BACKEND RESPONSES
const mapPriorityToString = (priority: number): string => {
  switch (priority) {
    case 1: return 'high';
    case 2: return 'medium';
    case 3: return 'low';
    default: return 'medium';
  }
};

// 🎯 TRANSFORM TASK DATA FOR BACKEND
const transformTaskForBackend = (taskData: any, isUpdate = false) => {
  console.log('🔄 Transforming for backend:', taskData, 'isUpdate:', isUpdate);
  
  // ✅ FIXED: Ensure dueDate preserves local timezone (no UTC conversion)
  let formattedDueDate = taskData.dueDate;
  if (formattedDueDate) {
    const date = new Date(formattedDueDate);
    if (!isNaN(date.getTime())) {
      // ✅ Use timezone-aware formatting instead of toISOString()
      formattedDueDate = formatDateForBackend(date);
      console.log('🔄 Date transformation (LOCAL):', taskData.dueDate, '→', formattedDueDate);
    }
  }
  
  // For update, only send isCompleted field if toggling completion
  if (isUpdate && Object.keys(taskData).length === 1 && taskData.isCompleted !== undefined) {
    const transformed = { isCompleted: taskData.isCompleted };
    console.log('🔄 Transformed result (completion only):', transformed);
    return transformed;
  }
  // Otherwise, preserve original transformation for other cases
  const transformed = {
    title: taskData.title,
    description: taskData.description,
    priority: typeof taskData.priority === 'string' 
      ? mapPriorityToInteger(taskData.priority) 
      : taskData.priority,
    dueDate: formattedDueDate,
    isCompleted: taskData.isCompleted !== undefined ? taskData.isCompleted : false,
    dependsOn: taskData.dependsOn || []
  };
  console.log('🔄 Transformed result:', transformed);
  return transformed;
};

// 🎯 TRANSFORM TASK DATA FROM BACKEND
const transformTaskFromBackend = (taskData: any) => {
  console.log('🔄 Transforming from backend:', taskData);
  
  const transformed = {
    ...taskData,
    priority: typeof taskData.priority === 'number' 
      ? mapPriorityToString(taskData.priority) 
      : taskData.priority,
    // ✅ FIXED: Backend returns 'isCompleted', frontend needs 'completed'
    completed: taskData.isCompleted !== undefined ? taskData.isCompleted : 
               taskData.completed !== undefined ? taskData.completed : false,
    // ✅ NEW: Include server-calculated overdue status and timestamps
    isOverdue: taskData.isOverdue || false,
    createdAt: taskData.createdAt,
    updatedAt: taskData.updatedAt,
    // ✅ NEW: Include dependencies
    dependsOn: taskData.dependsOn || []
  };
  
  console.log('🔄 Transformed result:', transformed);
  return transformed;
};

// Helper function to get auth headers with debugging
const getAuthHeaders = async () => {
  // Try to get token from both possible storage keys
  let token = await AsyncStorage.getItem('userToken');
  
  if (!token) {
    // Fallback: try to get from user session
    const sessionData = await AsyncStorage.getItem('userSession');
    if (sessionData) {
      const session = JSON.parse(sessionData);
      token = session.token;
      // Save to userToken for consistency
      if (token) {
        await AsyncStorage.setItem('userToken', token);
      }
    }
  }
  
  console.log('🔑 Token from storage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  
  console.log('📋 Headers being sent:', {
    ...headers,
    Authorization: headers.Authorization ? `Bearer ${headers.Authorization.substring(7, 27)}...` : 'NO AUTH'
  });
  
  return headers;
};

export const fetchTasks = async () => {
  try {
    const response = await apiClient.get('/tasks');
    
    console.log('📋 Production backend response:', response.data);
    
    // Handle paginated or direct array responses from production API
    let tasksArray = [];
    if (response.data?.content) {
      // Paginated response from Spring Boot
      tasksArray = response.data.content;
    } else if (Array.isArray(response.data)) {
      // Direct array response
      tasksArray = response.data;
    } else {
      console.log('📋 Unexpected response format, creating empty array');
      tasksArray = [];
    }
    
    // Transform all tasks from backend format to frontend format
    const transformedTasks = tasksArray.map(transformTaskFromBackend);
    console.log('📋 Tasks fetched and transformed:', transformedTasks);
    return transformedTasks;
  } catch (error) {
    console.log('📋 Fetch tasks error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userSession');
      throw new Error('Session expired. Please login again.');
    }
    // Return empty array on error to prevent crashes
    console.log('📋 Returning empty array due to error');
    return [];
  }
};

// Fetch all tasks for dependencies selection (same as fetchTasks but with clearer naming)
export const fetchAllTasksForDependencies = async (): Promise<Task[]> => {
  try {
    console.log('🔗 Fetching all tasks for dependencies selection...');
    const response = await apiClient.get('/tasks');
    
    // Handle paginated or direct array responses from production API
    let tasksArray = [];
    if (response.data?.content) {
      // Paginated response from Spring Boot
      tasksArray = response.data.content;
    } else if (Array.isArray(response.data)) {
      // Direct array response
      tasksArray = response.data;
    } else {
      console.log('📋 Unexpected response format, creating empty array');
      tasksArray = [];
    }
    
    // Transform all tasks from backend format to frontend format
    const transformedTasks = tasksArray.map(transformTaskFromBackend);
    console.log('🔗 Available tasks for dependencies:', transformedTasks.length);
    return transformedTasks;
  } catch (error) {
    console.error('❌ Failed to fetch tasks for dependencies:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userSession');
      throw new Error('Session expired. Please login again.');
    }
    return [];
  }
};

export const createTask = async (taskData: any) => {
  try {
    console.log('📋 Original task data:', taskData);
    
    // Transform task data to match backend contract (exclude ID for creation - backend generates it)
    const backendTaskData = transformTaskForBackend(taskData, false);
    console.log('📋 Transformed task data for backend:', backendTaskData);
    
    // Use apiClient which automatically includes JWT token
    const response = await apiClient.post('/tasks', backendTaskData);
    
    // Transform response back to frontend format
    const transformedResponse = transformTaskFromBackend(response.data);
    console.log('📋 Task created successfully:', transformedResponse);
    return transformedResponse;
  } catch (error) {
    console.log('📋 Create task error:', error);
    console.log('📋 Error response:', error.response?.data);
    console.log('📋 Error status:', error.response?.status);
    console.log('📋 Error headers:', error.response?.headers);
    
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

export const updateTask = async (taskId: string, updateData: any) => {
  try {
    console.log('📋 Original update data:', updateData);
    
    // Transform update data to match backend contract (exclude ID for updates)
    const backendUpdateData = transformTaskForBackend(updateData, true);
    console.log('📋 Transformed update data for backend:', backendUpdateData);
    
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, backendUpdateData, {
      headers,
    });
    
    // Transform response back to frontend format
    const transformedResponse = transformTaskFromBackend(response.data);
    console.log('📋 Task updated successfully:', transformedResponse);
    return transformedResponse;
  } catch (error) {
    console.log('📋 Update task error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const headers = await getAuthHeaders();
    await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
      headers,
    });
    console.log('📋 Task deleted successfully:', taskId);
  } catch (error) {
    console.log('📋 Delete task error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

// 🎯 ADDITIONAL HELPER FUNCTIONS FOR COMPONENTS
export const getPriorityDisplayValue = (priority: string | number): string => {
  if (typeof priority === 'number') {
    return mapPriorityToString(priority);
  }
  return priority.toLowerCase();
};

export const getPriorityApiValue = (priority: string): number => {
  return mapPriorityToInteger(priority);
};

export const toggleTaskCompletion = async (task: any) => {
  try {
    const newIsCompleted = !task.isCompleted;
    console.log('[TaskToggle] Status change from', task.isCompleted, 'to', newIsCompleted);
    console.log('🔄 Toggling task:', task.id, 'from', task.isCompleted, 'to', newIsCompleted);
    // Only send isCompleted field for update
    // Only send isCompleted field for completion toggle
    const updatedTask = await updateTask(task.id, {
      isCompleted: newIsCompleted
    });
    console.log('✅ Task toggle successful:', updatedTask);
    return updatedTask;
  } catch (error) {
    console.error('[TaskToggle] Error:', error);
    throw error;
  }
};

// 🎯 ENHANCED TASK MANAGEMENT APIS

// Task Dependencies
export const addTaskDependency = async (taskId: string, dependsOnTaskId: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/dependencies`, {
      dependsOnTaskId
    }, { headers });
    
    console.log('✅ Task dependency added:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Add task dependency error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

export const removeTaskDependency = async (taskId: string, dependencyId: string) => {
  try {
    const headers = await getAuthHeaders();
    await axios.delete(`${API_BASE_URL}/tasks/${taskId}/dependencies/${dependencyId}`, { headers });
    
    console.log('✅ Task dependency removed:', dependencyId);
  } catch (error) {
    console.error('❌ Remove task dependency error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

export const getTaskDependencies = async (taskId: string): Promise<TaskDependency[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}/dependencies`, { headers });
    
    console.log('✅ Task dependencies fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get task dependencies error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

// Task Progress
export const updateTaskProgress = async (taskId: string, progressPercentage: number) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}/progress`, {
      progressPercentage
    }, { headers });
    
    console.log('✅ Task progress updated:', response.data);
    return transformTaskFromBackend(response.data);
  } catch (error) {
    console.error('❌ Update task progress error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

// Task Comments
export const addTaskComment = async (taskId: string, comment: string): Promise<TaskComment> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/comments`, {
      comment
    }, { headers });
    
    console.log('✅ Task comment added:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Add task comment error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

export const getTaskComments = async (taskId: string): Promise<TaskComment[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}/comments`, { headers });
    
    console.log('✅ Task comments fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get task comments error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

// Time Tracking
export const startTimeTracking = async (taskId: string, description?: string): Promise<TimeLog> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/api/time-logs/start`, {
      taskId,
      description
    }, { headers });
    
    console.log('✅ Time tracking started:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Start time tracking error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

export const stopTimeTracking = async (logId: string): Promise<TimeLog> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_BASE_URL}/api/time-logs/${logId}/stop`, {}, { headers });
    
    console.log('✅ Time tracking stopped:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Stop time tracking error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

export const getTaskTimeLogs = async (taskId: string): Promise<TimeLog[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/api/time-logs/task/${taskId}`, { headers });
    
    console.log('✅ Task time logs fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get task time logs error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

export const getUserTimeLogs = async (userId: string): Promise<TimeLog[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/api/time-logs/user/${userId}`, { headers });
    
    console.log('✅ User time logs fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get user time logs error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

// Recurring Tasks
export const setRecurringTask = async (taskId: string, pattern: 'daily' | 'weekly' | 'monthly', endDate?: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/recurring`, {
      recurringPattern: pattern,
      recurringEndDate: endDate
    }, { headers });
    
    console.log('✅ Recurring task set:', response.data);
    return transformTaskFromBackend(response.data);
  } catch (error) {
    console.error('❌ Set recurring task error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

export const getUpcomingRecurringTasks = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/tasks/recurring/upcoming`, { headers });
    
    const transformedTasks = response.data.map(transformTaskFromBackend);
    console.log('✅ Upcoming recurring tasks fetched:', transformedTasks);
    return transformedTasks;
  } catch (error) {
    console.error('❌ Get upcoming recurring tasks error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

export const skipRecurringTaskOccurrence = async (taskId: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_BASE_URL}/tasks/recurring/${taskId}/skip`, {}, { headers });
    
    console.log('✅ Recurring task occurrence skipped:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Skip recurring task error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

// 🎯 AI-POWERED FEATURES

// Task Priority AI
export const getTaskPrioritySuggestion = async (taskData: any): Promise<TaskPrioritySuggestion> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/api/ai/task-priority-suggestion`, taskData, { headers });
    
    console.log('✅ Task priority suggestion received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get task priority suggestion error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

// Task Optimization AI
export const getTaskOptimization = async (userId: string): Promise<TaskOptimizationSuggestion> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/api/ai/task-optimization/${userId}`, { headers });
    
    console.log('✅ Task optimization suggestions received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get task optimization error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

// Analytics & Reporting
export const getTimeTrackingAnalytics = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/api/analytics/time-summary`, { headers });
    
    console.log('✅ Time tracking analytics fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get time tracking analytics error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};
