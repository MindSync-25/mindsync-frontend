import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTasks, Task, TaskStatus } from '../context/TaskContext';
import TaskModal from '../components/TaskModal';
import TaskItem from '../components/TaskItem';
import { useTheme } from '../context/ThemeContext';

const TaskManagementScreen = () => {
  const { state, dispatch } = useTasks();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { theme } = useTheme();

  const grouped = {
    Today: state.tasks.filter(t => t.status !== 'completed' && !isOverdue(t.dueDate) && isToday(t.dueDate)),
    Upcoming: state.tasks.filter(t => t.status !== 'completed' && !isOverdue(t.dueDate) && !isToday(t.dueDate)),
    Overdue: state.tasks.filter(t => t.status !== 'completed' && isOverdue(t.dueDate)),
    Completed: state.tasks.filter(t => t.status === 'completed'),
  };

  function isToday(date?: string) {
    if (!date) return false;
    // Compare only the local date part (YYYY-MM-DD)
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const d = new Date(date);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return todayStr === dateStr;
  }

  function isOverdue(date?: string) {
    if (!date) return false;
    // Check if the due date and time has passed
    const dueDateTime = new Date(date);
    const now = new Date();
    return dueDateTime < now;
  }

  const navigation = require('@react-navigation/native').useNavigation();
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
                  onStatusChange={status => {
                    console.log('[TaskManagementScreen] Status change from', task.status, 'to', status);
                    dispatch({ type: 'UPDATE_TASK', task: { ...task, status } });
                  }}
                  isOverdue={group === 'Overdue'}
                />
              ))
            )}
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={dynamicStyles.fab} onPress={() => { setEditingTask(null); setModalVisible(true); }}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    paddingTop: 32,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    color: '#fff',
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
    backgroundColor: '#007AFF',
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

export default TaskManagementScreen;
    // Removed static card style to prevent theme override
