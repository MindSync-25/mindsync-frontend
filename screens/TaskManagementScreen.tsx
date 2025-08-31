import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, TextInput, Alert, Animated, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTasks, Task, TaskStatus } from '../context/TaskContext';
import TaskModal from '../components/TaskModal';
import TaskItem from '../components/TaskItem';
import { useTheme } from '../context/ThemeContext';
import AITaskSuggestions from '../components/AITaskSuggestions';
import TaskDependencies from '../components/TaskDependencies';
import { 
  toggleTaskCompletion,
  createTaskFromText,
  addTaskDependency,
  getAISuggestions,
  acceptAISuggestion
} from '../services/taskApi';
import { aiAPI } from '../services/aiAPI';
import { authApi } from '../services/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskManagementScreen = ({ navigation }) => {
  // 📱 RESPONSIVE: Device size detection
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const isMobile = width < 768;
  
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
  // 🎯 BACKEND REQUIREMENT: Smart view switching (no Kanban on mobile)
  const [activeView, setActiveView] = useState<'list' | 'kanban' | 'timeline'>(isMobile ? 'list' : 'kanban');
  const [filterPriority, setFilterPriority] = useState<'all' | 'Low' | 'Medium' | 'High'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'created'>('priority');
  
  // 🧠 AI-Enhanced Features State (Backend Requirements)
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [showSmartFilters, setShowSmartFilters] = useState(false);
  const [aiTaskSuggestions, setAiTaskSuggestions] = useState([]);
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

  // 🧠 BACKEND REQUIREMENT: AI-enhanced quick task creation
  const handleQuickTaskCreate = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      // Use AI to analyze the task text and suggest improvements
      const suggestions = await aiAPI.analyzeTaskText(text);
      
      const newTask = {
        title: suggestions.suggestedTitle || text,
        description: suggestions.suggestedDescription || '',
        priority: (suggestions.suggestedPriority as 'Low' | 'Medium' | 'High') || 'Medium',
        status: 'pending' as TaskStatus,
        dueDate: suggestions.suggestedDuration ? 
          new Date(Date.now() + suggestions.suggestedDuration * 24 * 60 * 60 * 1000).toISOString() : 
          undefined,
        createdAt: new Date().toISOString(),
        id: Date.now().toString(),
      };

      dispatch({ type: 'ADD_TASK', task: newTask });
      setQuickTaskText('');
      
      // Show AI suggestions if available
      if (suggestions.extractedKeywords?.length > 0) {
        Alert.alert(
          'AI Suggestions Applied',
          `✨ Keywords: ${suggestions.extractedKeywords.join(', ')}\n🎯 Priority: ${suggestions.suggestedPriority}`,
          [{ text: 'Great!' }]
        );
      }
    } catch (error) {
      console.error('Failed to create smart task:', error);
      
      // Fallback: create basic task
      const basicTask = {
        title: text,
        description: '',
        priority: 'Medium' as 'Low' | 'Medium' | 'High',
        status: 'pending' as TaskStatus,
        createdAt: new Date().toISOString(),
        id: Date.now().toString(),
      };
      dispatch({ type: 'ADD_TASK', task: basicTask });
      setQuickTaskText('');
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

  // 🧠 BACKEND REQUIREMENT: Smart Task Filtering & Sorting Logic
  const groupedFiltered = useMemo(() => {
    const filteredTasks = state.tasks.filter(task => {
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      
      return matchesSearch && matchesPriority;
    });

    // Sort tasks
    filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'created':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return {
      Today: filteredTasks.filter(t => t.status !== 'completed' && !isOverdue(t.dueDate) && isToday(t.dueDate)),
      Upcoming: filteredTasks.filter(t => t.status !== 'completed' && !isOverdue(t.dueDate) && !isToday(t.dueDate)),
      Overdue: filteredTasks.filter(t => t.status !== 'completed' && isOverdue(t.dueDate)),
      Completed: filteredTasks.filter(t => t.status === 'completed'),
    };
  }, [state.tasks, searchQuery, filterPriority, sortBy]);

  // 🎨 Helper functions for Kanban view colors
  const getGroupColor = (group: string) => {
    switch (group) {
      case 'Today': return '#4A9EFF';
      case 'Upcoming': return '#2196F3';
      case 'Overdue': return '#FF5722';
      case 'Completed': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
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

    // 🧠 BACKEND REQUIREMENT: Smart sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'created':
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        default:
          return 0;
      }
    });

    return filtered;
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? '#fff' : '#181818',
      paddingTop: 0, // Remove top padding
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
      right: 20,
      bottom: 20,
      backgroundColor: '#4A9EFF',
      borderRadius: 24,
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    fabSubButton: {
      position: 'absolute',
      right: 20,
      backgroundColor: '#fff',
      borderRadius: 20,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    fabLabel: {
      position: 'absolute',
      right: 70,
      backgroundColor: 'rgba(0,0,0,0.8)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fabLabelText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '500',
    },
    // 🧠 BACKEND REQUIREMENT: Smart Filter & Search Styles
    searchFilterContainer: {
      paddingHorizontal: 16,
      paddingTop: 8, // Minimal gap from header
      paddingBottom: 8,
      backgroundColor: theme === 'light' ? '#fff' : '#181818',
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'light' ? '#f8f8f8' : '#2a2a2a',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: theme === 'light' ? '#000' : '#fff',
    },
    filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 4,
    },
    filterButtonActive: {
      backgroundColor: '#4A9EFF',
    },
    filterText: {
      fontSize: 14,
      color: theme === 'light' ? '#666' : '#aaa',
      fontWeight: '500',
    },
    filterTextActive: {
      color: '#fff',
    },
    quickFilters: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    quickFilterChip: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    quickFilterChipActive: {
      backgroundColor: '#4A9EFF',
      borderColor: '#4A9EFF',
    },
    quickFilterText: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
      fontWeight: '500',
    },
    quickFilterTextActive: {
      color: '#fff',
    },
    quickTaskBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'light' ? '#f8f8f8' : '#2a2a2a',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 2,
      borderColor: 'rgba(74, 158, 255, 0.3)',
      gap: 8,
    },
    quickTaskInput: {
      flex: 1,
      fontSize: 16,
      color: theme === 'light' ? '#000' : '#fff',
    },
    // 🏗️ KANBAN VIEW STYLES
    kanbanContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 16,
      minHeight: '100%',
    },
    kanbanColumn: {
      width: isTablet ? 280 : 250,
      marginRight: 16,
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#2a2a2a',
      borderRadius: 12,
      padding: 12,
      maxHeight: '85%',
    },
    kanbanColumnHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#e0e0e0' : '#444',
    },
    kanbanColumnTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    kanbanColumnBadge: {
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      minWidth: 24,
      alignItems: 'center',
    },
    kanbanColumnCount: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    kanbanColumnScroll: {
      flex: 1,
    },
    kanbanEmptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    kanbanEmptyText: {
      color: '#888',
      fontStyle: 'italic',
      fontSize: 14,
    },
    kanbanTaskCard: {
      backgroundColor: theme === 'light' ? '#fff' : '#333',
      borderRadius: 8,
      marginBottom: 12,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    taskPriorityBar: {
      height: 4,
      width: '100%',
    },
    kanbanTaskContent: {
      padding: 12,
    },
    kanbanTaskTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 8,
    },
    kanbanTaskDescription: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
      marginBottom: 12,
      lineHeight: 16,
    },
    kanbanTaskMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    kanbanTaskDue: {
      fontSize: 11,
      color: theme === 'light' ? '#666' : '#aaa',
      fontWeight: '500',
    },
    kanbanTaskOverdue: {
      color: '#FF5722',
      fontWeight: 'bold',
    },
    kanbanTaskPriority: {
      fontSize: 11,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    kanbanTaskActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
    kanbanActionButton: {
      padding: 6,
      borderRadius: 6,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#444',
    },
    kanbanCompleteButton: {
      backgroundColor: theme === 'light' ? '#e8f5e8' : '#2d4a2d',
    },
    kanbanEditButton: {
      backgroundColor: theme === 'light' ? '#e3f2fd' : '#1a365d',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16, // Reduced gap above header
      paddingBottom: 16,
      backgroundColor: theme === 'light' ? '#fff' : '#181818',
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    compactCloseButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#444',
      alignItems: 'center',
      justifyContent: 'center',
    },
    compactCloseText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    // New styles for compact list view
    compactListContainer: {
      padding: 16,
      paddingBottom: 100,
    },
    compactSection: {
      marginBottom: 24,
    },
    compactSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionIndicator: {
      width: 4,
      height: 24,
      borderRadius: 2,
      marginRight: 8,
    },
    compactSectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    taskGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    compactTaskCard: {
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    taskCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    compactTaskTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: '#333',
      flex: 1,
    },
    completedTaskText: {
      textDecorationLine: 'line-through',
      color: '#aaa',
    },
    compactDueDate: {
      fontSize: 12,
      color: '#666',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Compact Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>
          Task Management
        </Text>
        <TouchableOpacity 
          style={dynamicStyles.compactCloseButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={dynamicStyles.compactCloseText}>×</Text>
        </TouchableOpacity>
      </View>
      
      {/* 🧠 BACKEND REQUIREMENT: Smart Search & Filter Bar */}
      <View style={dynamicStyles.searchFilterContainer}>
        {/* Search Bar */}
        <View style={dynamicStyles.searchBar}>
          <Ionicons name="search" size={20} color={theme === 'light' ? '#666' : '#aaa'} />
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor={theme === 'light' ? '#666' : '#aaa'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme === 'light' ? '#666' : '#aaa'} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter & Sort Row */}
        <View style={dynamicStyles.filterRow}>
          {/* Priority Filter */}
          <TouchableOpacity 
            style={[dynamicStyles.filterButton, filterPriority !== 'all' && dynamicStyles.filterButtonActive]}
            onPress={() => setShowSmartFilters(!showSmartFilters)}
          >
            <Ionicons name="filter" size={16} color={filterPriority !== 'all' ? '#4A9EFF' : (theme === 'light' ? '#666' : '#aaa')} />
            <Text style={[dynamicStyles.filterText, filterPriority !== 'all' && dynamicStyles.filterTextActive]}>
              {filterPriority !== 'all' ? filterPriority : 'Filter'}
            </Text>
          </TouchableOpacity>

          {/* Sort By */}
          <TouchableOpacity 
            style={dynamicStyles.filterButton}
            onPress={() => {
              const sorts = ['priority', 'dueDate', 'created'] as const;
              const currentIndex = sorts.indexOf(sortBy);
              setSortBy(sorts[(currentIndex + 1) % sorts.length]);
            }}
          >
            <Ionicons name="swap-vertical" size={16} color={theme === 'light' ? '#666' : '#aaa'} />
            <Text style={dynamicStyles.filterText}>
              {sortBy === 'priority' ? 'Priority' : sortBy === 'dueDate' ? 'Due Date' : 'Created'}
            </Text>
          </TouchableOpacity>

          {/* View Switcher (Only on Tablet/Desktop) */}
          {isTablet && (
            <TouchableOpacity 
              style={dynamicStyles.filterButton}
              onPress={() => {
                const views = ['list', 'kanban'] as const;
                const currentIndex = views.indexOf(activeView as any);
                setActiveView(views[(currentIndex + 1) % views.length]);
              }}
            >
              <Ionicons 
                name={activeView === 'list' ? 'list' : 'grid'} 
                size={16} 
                color={theme === 'light' ? '#666' : '#aaa'} 
              />
              <Text style={dynamicStyles.filterText}>
                {activeView === 'list' ? 'List' : 'Kanban'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Filters (when smart filters is open) */}
        {showSmartFilters && (
          <View style={dynamicStyles.quickFilters}>
            {['all', 'High', 'Medium', 'Low'].map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  dynamicStyles.quickFilterChip,
                  filterPriority === priority && dynamicStyles.quickFilterChipActive
                ]}
                onPress={() => setFilterPriority(priority as any)}
              >
                <Text style={[
                  dynamicStyles.quickFilterText,
                  filterPriority === priority && dynamicStyles.quickFilterTextActive
                ]}>
                  {priority === 'all' ? 'All Priorities' : priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 🧠 Quick Task Creation Bar */}
        <View style={dynamicStyles.quickTaskBar}>
          <Ionicons name="add-circle" size={20} color="#4A9EFF" />
          <TextInput
            style={dynamicStyles.quickTaskInput}
            placeholder="Quick add: 'Call client about project tomorrow'"
            placeholderTextColor={theme === 'light' ? '#666' : '#aaa'}
            value={quickTaskText}
            onChangeText={setQuickTaskText}
            onSubmitEditing={() => handleQuickTaskCreate(quickTaskText)}
            returnKeyType="done"
          />
          {quickTaskText ? (
            <TouchableOpacity onPress={() => handleQuickTaskCreate(quickTaskText)}>
              <Ionicons name="send" size={20} color="#4A9EFF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {/* 🎯 BACKEND REQUIREMENT: Conditional View Rendering */}
      {activeView === 'list' ? (
        /* 📱 LIST VIEW - Mobile & Desktop */
        <ScrollView contentContainerStyle={dynamicStyles.scrollContent}>
          {(['Today', 'Upcoming', 'Overdue', 'Completed'] as const).map(group => (
            <View key={group} style={dynamicStyles.groupSection}>
              <Text style={dynamicStyles.groupTitle}>{group}</Text>
              {groupedFiltered[group].length === 0 ? (
                <Text style={dynamicStyles.emptyText}>No tasks</Text>
              ) : (
                groupedFiltered[group].map(task => (
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
      ) : (
        /* 📊 KANBAN VIEW - Tablet & Desktop Only */
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamicStyles.kanbanContainer}>
          {(['Today', 'Upcoming', 'Overdue', 'Completed'] as const).map(group => (
            <View key={group} style={dynamicStyles.kanbanColumn}>
              <View style={dynamicStyles.kanbanColumnHeader}>
                <Text style={dynamicStyles.kanbanColumnTitle}>{group}</Text>
                <View style={[dynamicStyles.kanbanColumnBadge, { backgroundColor: getGroupColor(group) }]}>
                  <Text style={dynamicStyles.kanbanColumnCount}>{groupedFiltered[group].length}</Text>
                </View>
              </View>
              <ScrollView style={dynamicStyles.kanbanColumnScroll} showsVerticalScrollIndicator={false}>
                {groupedFiltered[group].length === 0 ? (
                  <View style={dynamicStyles.kanbanEmptyState}>
                    <Text style={dynamicStyles.kanbanEmptyText}>No {group.toLowerCase()} tasks</Text>
                  </View>
                ) : (
                  groupedFiltered[group].map(task => (
                    <TouchableOpacity
                      key={task.id}
                      style={dynamicStyles.kanbanTaskCard}
                      onPress={() => { setEditingTask(task); setModalVisible(true); }}
                    >
                      <View style={[dynamicStyles.taskPriorityBar, { backgroundColor: getPriorityColor(task.priority) }]} />
                      <View style={dynamicStyles.kanbanTaskContent}>
                        <Text style={dynamicStyles.kanbanTaskTitle} numberOfLines={2}>
                          {task.title}
                        </Text>
                        {task.description && (
                          <Text style={dynamicStyles.kanbanTaskDescription} numberOfLines={3}>
                            {task.description}
                          </Text>
                        )}
                        <View style={dynamicStyles.kanbanTaskMeta}>
                          {task.dueDate && (
                            <Text style={[
                              dynamicStyles.kanbanTaskDue,
                              isOverdue(task.dueDate) && dynamicStyles.kanbanTaskOverdue
                            ]}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </Text>
                          )}
                          <Text style={[
                            dynamicStyles.kanbanTaskPriority,
                            { color: getPriorityColor(task.priority) }
                          ]}>
                            {task.priority}
                          </Text>
                        </View>
                        <View style={dynamicStyles.kanbanTaskActions}>
                          <TouchableOpacity
                            style={[dynamicStyles.kanbanActionButton, dynamicStyles.kanbanCompleteButton]}
                            onPress={() => handleTaskStatusChange(task, task.status === 'completed' ? 'pending' : 'completed')}
                          >
                            <Ionicons 
                              name={task.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'} 
                              size={16} 
                              color={task.status === 'completed' ? '#4CAF50' : '#9E9E9E'} 
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[dynamicStyles.kanbanActionButton, dynamicStyles.kanbanEditButton]}
                            onPress={() => { setEditingTask(task); setModalVisible(true); }}
                          >
                            <Ionicons name="create-outline" size={16} color="#2196F3" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      )}
      
      {/* Enhanced FAB Menu */}
      {/* AI Suggestions */}
      <Animated.View style={[
        dynamicStyles.fabSubButton,
        {
          bottom: 20 + 60,
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
          <Ionicons name="bulb" size={18} color="#fff" />
        </TouchableOpacity>
        <Animated.View style={[
          dynamicStyles.fabLabel,
          { bottom: 10, opacity: fabAnimation }
        ]}>
          <Text style={dynamicStyles.fabLabelText}>AI Suggestions</Text>
        </Animated.View>
      </Animated.View>

      {/* ✅ REMOVED: Templates functionality as requested */}

      {/* Dependencies */}
      <Animated.View style={[
        dynamicStyles.fabSubButton,
        {
          bottom: 20 + 110, // Adjusted position after removing voice
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
          <MaterialCommunityIcons name="source-branch" size={18} color="#fff" />
        </TouchableOpacity>
        <Animated.View style={[
          dynamicStyles.fabLabel,
          { bottom: 10, opacity: fabAnimation }
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
          <Ionicons name="add" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
      
      {/* Advanced Feature Modals */}
      <AITaskSuggestions
        visible={showAISuggestions}
        onClose={() => setShowAISuggestions(false)}
        userId="current-user-id"
      />
      
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
