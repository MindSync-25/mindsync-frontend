import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AITaskSuggestion {
  id: string;
  type: 'priority_adjustment' | 'deadline_extension' | 'task_breakdown' | 'delegation' | 'automation';
  title: string;
  description: string;
  confidence: number; // 0-1
  reasoning: string;
  actionable: boolean;
  data: any;
}

export interface AIProductivityInsight {
  id: string;
  category: 'time_management' | 'task_completion' | 'workload' | 'focus' | 'breaks';
  insight: string;
  recommendation: string;
  impact: 'low' | 'medium' | 'high';
  dataPoints: {
    label: string;
    value: number;
    unit: string;
  }[];
}

export interface AIScheduleOptimization {
  id: string;
  originalSchedule: any[];
  optimizedSchedule: any[];
  improvements: {
    description: string;
    timeSaved: number; // minutes
    energyGain: number; // 0-100
  }[];
  reasoning: string;
}

export interface AIChatResponse {
  message: string;
  confidence: number;
  suggestedActions?: {
    type: string;
    label: string;
    action: string;
    data?: any;
  }[];
  followUpQuestions?: string[];
}

class AIService {
  private apiEndpoint = 'http://localhost:8081/api/ai';
  private fallbackMode = true; // Use mock responses when backend is not available

  async getTaskSuggestions(userId: string, tasks: any[]): Promise<AITaskSuggestion[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      if (!this.fallbackMode) {
        const response = await fetch(`${this.apiEndpoint}/task-suggestions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ userId, tasks }),
        });

        if (response.ok) {
          return await response.json();
        }
      }

      // Fallback: Generate mock suggestions
      return this.generateMockTaskSuggestions(tasks);
    } catch (error) {
      console.error('❌ Error getting AI task suggestions:', error);
      return this.generateMockTaskSuggestions(tasks);
    }
  }

  async getProductivityInsights(userId: string, timeframe: 'week' | 'month'): Promise<AIProductivityInsight[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      if (!this.fallbackMode) {
        const response = await fetch(`${this.apiEndpoint}/productivity-insights`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ userId, timeframe }),
        });

        if (response.ok) {
          return await response.json();
        }
      }

      // Fallback: Generate mock insights
      return this.generateMockProductivityInsights();
    } catch (error) {
      console.error('❌ Error getting AI productivity insights:', error);
      return this.generateMockProductivityInsights();
    }
  }

  async optimizeSchedule(userId: string, schedule: any[]): Promise<AIScheduleOptimization> {
    try {
      const headers = await this.getAuthHeaders();
      
      if (!this.fallbackMode) {
        const response = await fetch(`${this.apiEndpoint}/optimize-schedule`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ userId, schedule }),
        });

        if (response.ok) {
          return await response.json();
        }
      }

      // Fallback: Generate mock optimization
      return this.generateMockScheduleOptimization(schedule);
    } catch (error) {
      console.error('❌ Error getting AI schedule optimization:', error);
      return this.generateMockScheduleOptimization(schedule);
    }
  }

  async chatWithAI(message: string, context?: any): Promise<AIChatResponse> {
    try {
      const headers = await this.getAuthHeaders();
      
      if (!this.fallbackMode) {
        const response = await fetch(`${this.apiEndpoint}/chat`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ message, context }),
        });

        if (response.ok) {
          return await response.json();
        }
      }

      // Fallback: Generate mock response
      return this.generateMockChatResponse(message);
    } catch (error) {
      console.error('❌ Error chatting with AI:', error);
      return this.generateMockChatResponse(message);
    }
  }

  async analyzeWorkload(userId: string, tasks: any[]): Promise<{
    workloadScore: number;
    burnoutRisk: 'low' | 'medium' | 'high';
    recommendations: string[];
  }> {
    try {
      const headers = await this.getAuthHeaders();
      
      if (!this.fallbackMode) {
        const response = await fetch(`${this.apiEndpoint}/analyze-workload`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ userId, tasks }),
        });

        if (response.ok) {
          return await response.json();
        }
      }

      // Fallback: Generate mock analysis
      return this.generateMockWorkloadAnalysis(tasks);
    } catch (error) {
      console.error('❌ Error analyzing workload:', error);
      return this.generateMockWorkloadAnalysis(tasks);
    }
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem('userToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private generateMockTaskSuggestions(tasks: any[]): AITaskSuggestion[] {
    const suggestions: AITaskSuggestion[] = [];
    
    // Find overdue tasks
    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && !task.completed;
    });

    if (overdueTasks.length > 0) {
      suggestions.push({
        id: 'overdue_priority',
        type: 'priority_adjustment',
        title: 'Prioritize Overdue Tasks',
        description: `You have ${overdueTasks.length} overdue task(s). Consider prioritizing these first.`,
        confidence: 0.9,
        reasoning: 'Overdue tasks can create stress and impact productivity. Addressing them first helps maintain momentum.',
        actionable: true,
        data: { taskIds: overdueTasks.map(t => t.id) },
      });
    }

    // Find large tasks that could be broken down
    const largeTasks = tasks.filter(task => 
      task.description && task.description.length > 200 && !task.completed
    );

    if (largeTasks.length > 0) {
      suggestions.push({
        id: 'task_breakdown',
        type: 'task_breakdown',
        title: 'Break Down Complex Tasks',
        description: `${largeTasks.length} task(s) seem complex and could benefit from being broken into smaller subtasks.`,
        confidence: 0.7,
        reasoning: 'Breaking complex tasks into smaller chunks improves focus and provides more frequent wins.',
        actionable: true,
        data: { taskIds: largeTasks.map(t => t.id) },
      });
    }

    // Suggest automation for recurring patterns
    if (tasks.length > 10) {
      suggestions.push({
        id: 'automation_suggestion',
        type: 'automation',
        title: 'Automate Recurring Tasks',
        description: 'I noticed some patterns in your tasks. Consider setting up recurring tasks for routine activities.',
        confidence: 0.6,
        reasoning: 'Automating recurring tasks reduces mental overhead and ensures consistency.',
        actionable: true,
        data: { patterns: ['weekly review', 'email cleanup', 'status updates'] },
      });
    }

    return suggestions;
  }

  private generateMockProductivityInsights(): AIProductivityInsight[] {
    return [
      {
        id: 'focus_time',
        category: 'focus',
        insight: 'Your most productive hours are between 10 AM and 12 PM',
        recommendation: 'Schedule your most important tasks during this time window',
        impact: 'high',
        dataPoints: [
          { label: 'Peak productivity time', value: 10, unit: 'AM' },
          { label: 'Focus duration', value: 120, unit: 'minutes' },
          { label: 'Tasks completed', value: 75, unit: '%' },
        ],
      },
      {
        id: 'task_completion',
        category: 'task_completion',
        insight: 'You complete 85% of tasks when they have clear deadlines',
        recommendation: 'Set specific deadlines for all your tasks, even self-imposed ones',
        impact: 'medium',
        dataPoints: [
          { label: 'With deadlines', value: 85, unit: '%' },
          { label: 'Without deadlines', value: 62, unit: '%' },
          { label: 'Improvement potential', value: 23, unit: '%' },
        ],
      },
      {
        id: 'break_timing',
        category: 'breaks',
        insight: 'Taking breaks every 90 minutes increases your task completion rate',
        recommendation: 'Set reminders to take 10-minute breaks every 90 minutes',
        impact: 'medium',
        dataPoints: [
          { label: 'Optimal break interval', value: 90, unit: 'minutes' },
          { label: 'Recommended break duration', value: 10, unit: 'minutes' },
          { label: 'Productivity increase', value: 18, unit: '%' },
        ],
      },
    ];
  }

  private generateMockScheduleOptimization(schedule: any[]): AIScheduleOptimization {
    return {
      id: `optimization_${Date.now()}`,
      originalSchedule: schedule,
      optimizedSchedule: schedule, // In real implementation, this would be optimized
      improvements: [
        {
          description: 'Grouped similar tasks together to reduce context switching',
          timeSaved: 45,
          energyGain: 20,
        },
        {
          description: 'Moved high-focus tasks to your peak productivity hours',
          timeSaved: 30,
          energyGain: 35,
        },
        {
          description: 'Added buffer time between meetings',
          timeSaved: 0,
          energyGain: 25,
        },
      ],
      reasoning: 'The optimization focuses on reducing cognitive load and aligning tasks with your natural energy patterns.',
    };
  }

  private generateMockChatResponse(message: string): AIChatResponse {
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('task') || lowercaseMessage.includes('todo')) {
      return {
        message: "I can help you with task management! I can create new tasks, suggest priorities, break down complex tasks, or analyze your workload. What would you like to do?",
        confidence: 0.9,
        suggestedActions: [
          { type: 'create_task', label: 'Create New Task', action: 'create_task' },
          { type: 'analyze_workload', label: 'Analyze Workload', action: 'analyze_workload' },
          { type: 'suggest_priorities', label: 'Suggest Priorities', action: 'suggest_priorities' },
        ],
        followUpQuestions: [
          "What type of task would you like to create?",
          "Would you like me to analyze your current workload?",
          "Do you need help prioritizing your existing tasks?"
        ],
      };
    }
    
    if (lowercaseMessage.includes('schedule') || lowercaseMessage.includes('calendar')) {
      return {
        message: "I can help optimize your schedule! I can suggest the best times for different types of work based on your productivity patterns and help you plan meetings more effectively.",
        confidence: 0.85,
        suggestedActions: [
          { type: 'optimize_schedule', label: 'Optimize Schedule', action: 'optimize_schedule' },
          { type: 'find_meeting_time', label: 'Find Meeting Time', action: 'find_meeting_time' },
        ],
        followUpQuestions: [
          "Would you like me to optimize your current schedule?",
          "Do you need help finding the best time for a meeting?"
        ],
      };
    }
    
    if (lowercaseMessage.includes('productive') || lowercaseMessage.includes('efficiency')) {
      return {
        message: "Based on your usage patterns, I can see you're most productive in the mornings. Your task completion rate is highest when you work in 90-minute focused sessions with short breaks.",
        confidence: 0.8,
        suggestedActions: [
          { type: 'view_insights', label: 'View Detailed Insights', action: 'view_insights' },
          { type: 'set_focus_timer', label: 'Set Focus Timer', action: 'set_focus_timer' },
        ],
        followUpQuestions: [
          "Would you like to see detailed productivity insights?",
          "Shall I help you set up a focus timer for your next work session?"
        ],
      };
    }
    
    // Default response
    return {
      message: "I'm here to help you stay productive and organized! I can assist with task management, schedule optimization, productivity insights, and more. What would you like to work on?",
      confidence: 0.7,
      suggestedActions: [
        { type: 'show_capabilities', label: 'Show All Capabilities', action: 'show_capabilities' },
        { type: 'quick_help', label: 'Quick Help', action: 'quick_help' },
      ],
      followUpQuestions: [
        "What's your biggest productivity challenge right now?",
        "Would you like me to analyze your current tasks and schedule?",
        "How can I help you be more productive today?"
      ],
    };
  }

  private generateMockWorkloadAnalysis(tasks: any[]): {
    workloadScore: number;
    burnoutRisk: 'low' | 'medium' | 'high';
    recommendations: string[];
  } {
    const totalTasks = tasks.length;
    const incompleteTasks = tasks.filter(t => !t.completed).length;
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && !t.completed;
    }).length;

    const workloadScore = Math.min(100, (incompleteTasks * 10) + (overdueTasks * 20));
    
    let burnoutRisk: 'low' | 'medium' | 'high' = 'low';
    if (workloadScore > 70) burnoutRisk = 'high';
    else if (workloadScore > 40) burnoutRisk = 'medium';

    const recommendations = [];
    
    if (overdueTasks > 0) {
      recommendations.push(`You have ${overdueTasks} overdue task(s). Consider extending deadlines or delegating if possible.`);
    }
    
    if (incompleteTasks > 15) {
      recommendations.push('Your task list is quite long. Consider breaking down large tasks or deferring non-urgent items.');
    }
    
    if (burnoutRisk === 'high') {
      recommendations.push('Take regular breaks and consider discussing workload with your team or manager.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Your workload looks manageable. Keep up the good work!');
    }

    return {
      workloadScore,
      burnoutRisk,
      recommendations,
    };
  }

  setFallbackMode(enabled: boolean): void {
    this.fallbackMode = enabled;
  }

  isFallbackMode(): boolean {
    return this.fallbackMode;
  }
}

// Create singleton instance
export const aiService = new AIService();

export default aiService;
