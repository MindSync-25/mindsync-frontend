// AI Enhanced Types for MindSync Frontend
export interface AITaskPrioritySuggestion {
  taskId: string;
  suggestedPriority: 'low' | 'medium' | 'high' | 'urgent';
  reasoning: string;
  confidence: number;
  impactDescription: string;
}

export interface AIProductivityInsights {
  tasksCreated: number;
  tasksCompleted: number;
  completionRate: number;
  totalFocusTimeHours: number;
  productivityTrend: 'improving' | 'stable' | 'declining';
  workloadScore: number; // 0-100
  burnoutRisk: 'low' | 'medium' | 'high';
  recommendedActions: string[];
  weeklyStats?: {
    avgTasksPerDay: number;
    peakProductivityHour: number;
    longestFocusSession: number;
  };
}

export interface AIContextualSuggestion {
  id: string;
  type: 'morning' | 'afternoon' | 'evening' | 'urgent' | 'focus' | 'break';
  title: string;
  description: string;
  actionText: string;
  confidenceScore: number;
  priority: 'low' | 'medium' | 'high';
  icon: string;
  expiresAt?: string;
}

export interface AIOptimizationSuggestion {
  id: string;
  type: 'break_down_task' | 'reduce_workload' | 'reschedule' | 'dependency_fix' | 'focus_time';
  message: string;
  reasoning: string;
  taskId?: string;
  actionable: boolean;
  estimatedImpact: 'low' | 'medium' | 'high';
}

export interface AISmartTaskSuggestion {
  suggestedTitle?: string;
  suggestedDescription?: string;
  suggestedPriority?: 'low' | 'medium' | 'high' | 'urgent';
  suggestedDuration?: number;
  extractedKeywords?: string[];
  confidence: number;
  reasoning: string;
}

export interface AIWorkloadAnalysis {
  currentWorkload: number; // 0-100
  optimalWorkload: number; // 0-100
  burnoutRisk: 'low' | 'medium' | 'high';
  recommendations: string[];
  suggestedBreaks: Array<{
    time: string;
    duration: number;
    reason: string;
  }>;
}

export interface AIChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type: 'text' | 'suggestion' | 'action' | 'insight';
  actions?: Array<{
    text: string;
    action: string;
    taskId?: string;
  }>;
  confidence?: number;
}

export interface AIVoiceInteraction {
  transcript: string;
  confidence: number;
  intent: 'create_task' | 'query_tasks' | 'get_insights' | 'schedule' | 'general';
  extractedEntities?: {
    taskTitle?: string;
    dueDate?: string;
    priority?: string;
    duration?: number;
  };
}

// AI Settings
export interface AISettings {
  enableSmartSuggestions: boolean;
  enableVoiceInteraction: boolean;
  enableProactiveNotifications: boolean;
  enablePriorityAssistance: boolean;
  enableProductivityInsights: boolean;
  notificationFrequency: 'minimal' | 'moderate' | 'frequent';
  voiceLanguage: string;
}
