import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, TextInput, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTasks, Task, TaskStatus } from '../context/TaskContext';
import TaskModal from '../components/TaskModal';
import TaskItem from '../components/TaskItem';
import { useTheme } from '../context/ThemeContext';
import { 
  toggleTaskCompletion
} from '../services/taskApi';

const TaskManagementScreen = ({ navigation }) => {
  // ✅ AUTO-REFRESH OVERDUE STATUS EVERY MINUTE
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1); // Force re-render
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const { state, dispatch } = useTasks();
  const tasks = state.tasks;
  const { theme } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [quickTaskText, setQuickTaskText] = useState('');
  const [activeView, setActiveView] = useState<'list' | 'kanban' | 'timeline'>('list');
  const [filterPriority, setFilterPriority] = useState<'all' | 'Low' | 'Medium' | 'High'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ HANDLE TASK COMPLETION TOGGLE WITH API CALL
  const handleTaskStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      console.log('[TaskManagementScreen] Status change for task:', task.id, 'from', task.status, 'to', newStatus);
      
      if (newStatus === 'completed' || task.status === 'completed') {
        // This is a completion toggle - use API
        const updatedTask = await toggleTaskCompletion(task);
        console.log('[TaskManagementScreen] API returned:', updatedTask);
        
        // Update local state with the API response
        dispatch({ type: 'UPDATE_TASK', task: updatedTask });
      } else {
        // Just a status change, update locally for now
        dispatch({ type: 'UPDATE_TASK', task: { ...task, status: newStatus } });
      }
    } catch (error) {
      console.error('[TaskManagementScreen] Failed to update task:', error);
    }
  };

  const grouped = {
    Today: state.tasks.filter(t => t.status !== 'completed' && !isOverdue(t.dueDate) && isToday(t.dueDate)),
    Upcoming: state.tasks.filter(t => t.status !== 'completed' && !isOverdue(t.dueDate) && !isToday(t.dueDate)),
    Overdue: state.tasks.filter(t => t.status !== 'completed' && isOverdue(t.dueDate)),
    Completed: state.tasks.filter(t => t.status === 'completed'),
  };

  function isToday(date?: string) {
    if (!date) return false;
    // ✅ FIXED: Better timezone handling for date comparison
    const today = new Date();
    const taskDate = new Date(date);
    
    // Compare dates in local timezone
    const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const taskDateLocal = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
    
    console.log('📅 Date comparison - Today:', todayLocal, 'Task:', taskDateLocal);
    return todayLocal.getTime() === taskDateLocal.getTime();
  }

  function isOverdue(date?: string) {
    if (!date) return false;
    // ✅ FIXED: More accurate overdue detection with timezone awareness
    const dueDateTime = new Date(date);
    const now = new Date();
    return dueDateTime < now;
  }

  // Filter tasks based on search and priority
  const getFilteredTasks = (tasks: Task[]) => {
    let filtered = tasks;
    
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    return filtered;
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? '#fff' : '#181818',
      paddingTop: 32,
    },
    closeButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      zIndex: 10,
      backgroundColor: theme === 'light' ? '#e0e0e0' : 'rgba(0,0,0,0.3)',
      borderRadius: 20,
      padding: 4,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
    },
    groupSection: {
      marginBottom: 32,
    },
    groupTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 12,
    },
    emptyText: {
      color: '#888',
      fontStyle: 'italic',
      marginBottom: 8,
    },
    fab: {
      position: 'absolute',
      right: 24,
      bottom: 32,
      backgroundColor: theme === 'light' ? '#007AFF' : '#007AFF',
      borderRadius: 32,
      width: 64,
      height: 64,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* X button for closing (top left) */}
      <TouchableOpacity
        style={dynamicStyles.closeButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={32} color={theme === 'light' ? '#000' : '#fff'} />
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={dynamicStyles.scrollContent}>
        {(['Today', 'Upcoming', 'Overdue', 'Completed'] as const).map(group => (
          <View key={group} style={dynamicStyles.groupSection}>
            <Text style={dynamicStyles.groupTitle}>{group}</Text>
            {grouped[group].length === 0 ? (
              <Text style={dynamicStyles.emptyText}>No tasks</Text>
            ) : (
              grouped[group].map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onEdit={() => { setEditingTask(task); setModalVisible(true); }}
                  onStatusChange={status => handleTaskStatusChange(task, status)}
                  isOverdue={group === 'Overdue'}
                />
              ))
            )}
          </View>
        ))}
      </ScrollView>
      
      {/* Simple FAB */}
      <TouchableOpacity 
        style={dynamicStyles.fab} 
        onPress={() => { setEditingTask(null); setModalVisible(true); }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
      
      <TaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        editingTask={editingTask}
        onSave={task => {
          console.log('[TaskManagementScreen] onSave called', task);
          dispatch({ type: editingTask ? 'UPDATE_TASK' : 'ADD_TASK', task });
          setModalVisible(false);
        }}
      />
    </View>
  );
};

export default TaskManagementScreen;
