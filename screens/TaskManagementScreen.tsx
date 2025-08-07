import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, TextInput, Alert, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTasks, Task, TaskStatus } from '../context/TaskContext';
import TaskModal from '../components/TaskModal';
import TaskItem from '../components/TaskItem';
import { useTheme } from '../context/ThemeContext';
import VoiceTaskCreator from '../components/VoiceTaskCreator';
import AITaskSuggestions from '../components/AITaskSuggestions';
import TaskDependencies from '../components/TaskDependencies';
import { 
  toggleTaskCompletion,
  createTaskFromVoice,
  createTaskFromText,
  addTaskDependency,
  getAISuggestions,
  acceptAISuggestion
} from '../services/taskApi';
import { authApi } from '../services/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  
  // Enhanced Features State
  const [showVoiceCreator, setShowVoiceCreator] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  
  // Animation values
  const fabAnimation = useState(new Animated.Value(0))[0];
  
  // ✅ HANDLE TASK COMPLETION TOGGLE WITH API CALL
  const handleTaskStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      console.log('[TaskManagementScreen] Status change for task:', task.id, 'from', task.status, 'to', newStatus);
      
      // Don't make API call here since TaskItem already handled it
      // Just update local state with the new status
      const updatedTask = { 
        ...task, 
        status: newStatus,
        isCompleted: newStatus === 'completed'
      };
      dispatch({ type: 'UPDATE_TASK', task: updatedTask });
    } catch (error) {
      console.error('[TaskManagementScreen] Failed to update task:', error);
    }
  };

  // Enhanced Feature Handlers
  const handleAcceptAISuggestion = async (suggestion: any) => {
    try {
      await acceptAISuggestion(suggestion.id);
      dispatch({ type: 'UPDATE_TASK', task: suggestion.task });
      setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    } catch (error) {
      console.error('Failed to accept AI suggestion:', error);
    }
  };

  const handleVoiceTaskCreate = async (voiceData: any) => {
    try {
      const newTask = await createTaskFromVoice(voiceData);
      dispatch({ type: 'ADD_TASK', task: { ...newTask, status: 'pending' as TaskStatus } });
      setShowVoiceCreator(false);
    } catch (error) {
      console.error('Failed to create voice task:', error);
    }
  };

  const handleQuickTaskCreate = async (text: string) => {
    try {
      const task = await createTaskFromText(text);
      dispatch({ type: 'ADD_TASK', task: { ...task, status: 'pending' as TaskStatus } });
      setQuickTaskText('');
    } catch (error) {
      console.error('Failed to create task from text:', error);
    }
  };

  // ✅ REMOVED: Template functionality as requested
  // Templates are no longer part of the task creation workflow

  const handleAddDependency = async (taskId: string, dependsOnTaskId: string) => {
    try {
      await addTaskDependency(taskId, dependsOnTaskId);
      // Refresh tasks to show updated dependencies
    } catch (error) {
      console.error('Failed to add dependency:', error);
    }
  };

  const handleRemoveDependency = async (taskId: string, dependsOnTaskId: string) => {
    try {
      await addTaskDependency(taskId, dependsOnTaskId);
      // Refresh tasks to show updated dependencies
    } catch (error) {
      console.error('Failed to remove dependency:', error);
    }
  };

  // FAB Menu Animation
  const toggleFabMenu = () => {
    const toValue = fabExpanded ? 0 : 1;
    setFabExpanded(!fabExpanded);
    
    Animated.spring(fabAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 5,
    }).start();
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
      top: 40,
      right: 16,
      zIndex: 10,
      backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
      borderRadius: 20,
      padding: 8,
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
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
      elevation: 4,
    },
    fabSubButton: {
      position: 'absolute',
      right: 24,
      backgroundColor: '#fff',
      borderRadius: 28,
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
      elevation: 3,
    },
    fabLabel: {
      position: 'absolute',
      right: 88,
      backgroundColor: 'rgba(0,0,0,0.8)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fabLabelText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '500',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* X button for closing (top left) */}
      <TouchableOpacity
        style={dynamicStyles.closeButton}
        onPress={() => navigation.navigate('Dashboard')}
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
      
      {/* Enhanced FAB Menu */}
      {/* Voice Task Creator */}
      <Animated.View style={[
        dynamicStyles.fabSubButton,
        {
          bottom: 32 + 80,
          opacity: fabAnimation,
          transform: [{
            scale: fabAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          }],
        }
      ]}>
        <TouchableOpacity 
          style={[dynamicStyles.fabSubButton, { backgroundColor: '#FF4444' }]}
          onPress={() => setShowVoiceCreator(true)}
        >
          <Ionicons name="mic" size={24} color="#fff" />
        </TouchableOpacity>
        <Animated.View style={[
          dynamicStyles.fabLabel,
          { bottom: 16, opacity: fabAnimation }
        ]}>
          <Text style={dynamicStyles.fabLabelText}>Voice</Text>
        </Animated.View>
      </Animated.View>

      {/* AI Suggestions */}
      <Animated.View style={[
        dynamicStyles.fabSubButton,
        {
          bottom: 32 + 160,
          opacity: fabAnimation,
          transform: [{
            scale: fabAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          }],
        }
      ]}>
        <TouchableOpacity 
          style={[dynamicStyles.fabSubButton, { backgroundColor: '#4ECDC4' }]}
          onPress={() => setShowAISuggestions(true)}
        >
          <Ionicons name="bulb" size={24} color="#fff" />
        </TouchableOpacity>
        <Animated.View style={[
          dynamicStyles.fabLabel,
          { bottom: 16, opacity: fabAnimation }
        ]}>
          <Text style={dynamicStyles.fabLabelText}>AI Suggestions</Text>
        </Animated.View>
      </Animated.View>

      {/* ✅ REMOVED: Templates functionality as requested */}

      {/* Dependencies */}
      <Animated.View style={[
        dynamicStyles.fabSubButton,
        {
          bottom: 32 + 240, // Adjusted position after removing templates
          opacity: fabAnimation,
          transform: [{
            scale: fabAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          }],
        }
      ]}>
        <TouchableOpacity 
          style={[dynamicStyles.fabSubButton, { backgroundColor: '#2ECC71' }]}
          onPress={() => setShowDependencies(true)}
        >
          <MaterialCommunityIcons name="source-branch" size={24} color="#fff" />
        </TouchableOpacity>
        <Animated.View style={[
          dynamicStyles.fabLabel,
          { bottom: 16, opacity: fabAnimation }
        ]}>
          <Text style={dynamicStyles.fabLabelText}>Dependencies</Text>
        </Animated.View>
      </Animated.View>

      {/* Main FAB */}
      <TouchableOpacity 
        style={dynamicStyles.fab} 
        onPress={() => {
          if (fabExpanded) {
            // If menu is expanded, close it and open regular task creation
            setFabExpanded(false);
            Animated.spring(fabAnimation, {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 5,
            }).start();
            setEditingTask(null);
            setModalVisible(true);
          } else {
            // If menu is closed, expand it
            toggleFabMenu();
          }
        }}
      >
        <Animated.View style={{
          transform: [{
            rotate: fabAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '45deg'],
            }),
          }],
        }}>
          <Ionicons name="add" size={32} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
      
      {/* Advanced Feature Modals */}
      <VoiceTaskCreator
        visible={showVoiceCreator}
        onClose={() => setShowVoiceCreator(false)}
        onTaskCreated={handleVoiceTaskCreate}
      />
      
      <AITaskSuggestions
        visible={showAISuggestions}
        onClose={() => setShowAISuggestions(false)}
        userId="current-user-id"
      />
      
      {/* ✅ REMOVED: TaskTemplates component as requested */}
      
      <TaskDependencies
        visible={showDependencies}
        onClose={() => setShowDependencies(false)}
        taskId={editingTask?.id || ''}
      />
      
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
