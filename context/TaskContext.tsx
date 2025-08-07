import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as taskApi from '../services/taskApi';

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

// Enhanced task comment interface
export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// Time tracking interface
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

// Task dependency interface
export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  dependsOnTaskTitle: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  reminder?: string;
  tags?: string[];
  attachments?: Array<{ type: 'file' | 'link'; value: string }>;
  status: TaskStatus;
  aiGenerated?: boolean;
  aiConfidence?: number;
  sourceText?: string;
  // ✅ Backend-provided fields
  isOverdue?: boolean;     // Server-calculated overdue status
  completed?: boolean;     // Alternative completion field for frontend/backend mapping
  createdAt?: string;      // Timestamp from backend
  updatedAt?: string;      // Timestamp from backend
  
  // ✅ ENHANCED FIELDS
  assigneeId?: string;           // User ID of assignee
  assigneeName?: string;         // Display name of assignee
  dependsOn?: string[];          // Array of task IDs this task depends on (matches backend API)
  dependencies?: string[];       // Alternative field name for compatibility
  recurringPattern?: 'daily' | 'weekly' | 'monthly';  // Recurring task pattern
  recurringEndDate?: string;     // When recurring pattern ends
  estimatedHours?: number;       // Estimated time to complete
  actualHours?: number;          // Actual time spent
  progressPercentage?: number;   // Progress percentage (0-100)
  comments?: TaskComment[];      // Task comments
  timeLogs?: TimeLog[];          // Time tracking logs
  dependencyDetails?: TaskDependency[];  // Detailed dependency information
}

export type TaskGroup = 'Today' | 'Upcoming' | 'Completed';

interface TaskState {
  tasks: Task[];
}

type Action =
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'CLEAR_ALL_TASKS' };

const TaskContext = createContext<{
  state: TaskState;
  dispatch: React.Dispatch<Action>;
  clearAllTasks: () => void;
  reloadTasks: () => Promise<void>;
}>({ state: { tasks: [] }, dispatch: () => {}, clearAllTasks: () => {}, reloadTasks: async () => {} });

function taskReducer(state: TaskState, action: Action): TaskState {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] };
    case 'UPDATE_TASK':
      console.log('[TaskReducer] UPDATE_TASK:', action.task);
      // ✅ Handle completed field from backend API
      let updatedTask = action.task;
      if ('completed' in action.task) {
        updatedTask = {
          ...action.task,
          status: action.task.completed ? 'completed' : 'pending'
        };
        console.log('[TaskReducer] Mapped completed field:', action.task.completed, '→ status:', updatedTask.status);
      }
      
      return {
        ...state,
        tasks: state.tasks.map(t => (t.id === updatedTask.id ? updatedTask : t)),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) };
    case 'CLEAR_ALL_TASKS':
      return { ...state, tasks: [] };
    default:
      return state;
  }
}


export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, { tasks: [] });

  // Clear all tasks function
  const clearAllTasks = () => {
    dispatch({ type: 'CLEAR_ALL_TASKS' });
  };

  // Load tasks from backend
  const loadTasks = async () => {
    try {
      const tasks = await taskApi.fetchTasks();
      if (Array.isArray(tasks)) {
        // Clear existing tasks first
        dispatch({ type: 'CLEAR_ALL_TASKS' });
        // Add new tasks
        tasks.forEach(task => {
          dispatch({ type: 'ADD_TASK', task });
        });
      }
    } catch (e) {
      // Optionally handle error
    }
  };

  // Watch for user session changes and reload tasks
  useEffect(() => {
    const checkAndLoadTasks = async () => {
      try {
        const sessionStr = await AsyncStorage.getItem('userSession');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session.userId) {
            await loadTasks();
          }
        } else {
          dispatch({ type: 'CLEAR_ALL_TASKS' });
        }
      } catch (e) {
        // Handle error
      }
    };

    // Load tasks immediately when TaskProvider mounts
    checkAndLoadTasks();
  }, []);

  // Wrap dispatch to sync with backend
  const enhancedDispatch = async (action: any) => {
    console.log('[TaskContext] enhancedDispatch CALLED', action);
    switch (action.type) {
      case 'ADD_TASK': {
        try {
          const created = await taskApi.createTask(action.task);
          console.log('[TaskContext] ADD_TASK created', created);
          dispatch({ type: 'ADD_TASK', task: created });
        } catch (e) {
          console.error('[TaskContext] ADD_TASK error', e);
        }
        break;
      }
      case 'UPDATE_TASK': {
        try {
          const updated = await taskApi.updateTask(action.task.id, action.task);
          console.log('[TaskContext] UPDATE_TASK updated', updated);
          dispatch({ type: 'UPDATE_TASK', task: updated });
        } catch (e) {
          console.error('[TaskContext] UPDATE_TASK error', e);
        }
        break;
      }
      case 'DELETE_TASK': {
        try {
          await taskApi.deleteTask(action.id);
          console.log('[TaskContext] DELETE_TASK deleted', action.id);
          dispatch({ type: 'DELETE_TASK', id: action.id });
        } catch (e) {
          console.error('[TaskContext] DELETE_TASK error', e);
        }
        break;
      }
      default:
        dispatch(action);
    }
  };

  return (
    <TaskContext.Provider value={{ state, dispatch: enhancedDispatch, clearAllTasks, reloadTasks: loadTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
