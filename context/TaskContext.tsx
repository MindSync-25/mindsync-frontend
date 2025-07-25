import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as taskApi from '../services/taskApi';

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

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
}

export type TaskGroup = 'Today' | 'Upcoming' | 'Completed';

interface TaskState {
  tasks: Task[];
}

type Action =
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; id: string };

const TaskContext = createContext<{
  state: TaskState;
  dispatch: React.Dispatch<Action>;
}>({ state: { tasks: [] }, dispatch: () => {} });

function taskReducer(state: TaskState, action: Action): TaskState {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => (t.id === action.task.id ? action.task : t)),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) };
    default:
      return state;
  }
}


export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, { tasks: [] });

  // Load tasks from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const tasks = await taskApi.fetchTasks();
        if (Array.isArray(tasks)) {
          tasks.forEach(task => {
            dispatch({ type: 'ADD_TASK', task });
          });
        }
      } catch (e) {
        // Optionally handle error
      }
    })();
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
    <TaskContext.Provider value={{ state, dispatch: enhancedDispatch }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
