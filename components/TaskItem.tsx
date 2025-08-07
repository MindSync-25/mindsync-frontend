import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Task, TaskStatus } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { toggleTaskCompletion } from '../services/taskApi';

interface Props {
  task: Task;
  onEdit: () => void;
  onStatusChange: (status: TaskStatus) => void;
  isOverdue?: boolean;
}

const statusOrder: TaskStatus[] = ['pending', 'in_progress', 'completed'];
const priorityColors = { Low: '#4CAF50', Medium: '#FFC107', High: '#F44336' };

const TaskItem: React.FC<Props> = ({ task, onEdit, onStatusChange, isOverdue }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-clear error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  
  const titleColor = theme === 'light' ? '#222' : '#fff';
  
  const nextStatus = () => {
    // Simple toggle: if completed, go back to pending; otherwise go to completed
    if (task.status === 'completed') {
      return 'pending';
    } else {
      return 'completed';
    }
  };

  const handleTaskPress = () => {
    // Navigate to TaskDetail screen with the task object
    (navigation as any).navigate('TaskDetail', { task });
  };

  const handleStatusCirclePress = async () => {
    // Clear any previous error message
    setErrorMessage(null);
    
    try {
      const updatedTask = await toggleTaskCompletion(task);
      // Map isCompleted to correct status
      const newStatus = updatedTask.isCompleted ? 'completed' : 'pending';
      console.log('🔄 TaskItem: Setting status to', newStatus, 'based on isCompleted:', updatedTask.isCompleted);
      onStatusChange(newStatus);
    } catch (error: any) {
      console.log('🚨 TaskItem error details:', error);
      console.log('🚨 Error response:', error?.response);
      console.log('🚨 Error response data:', error?.response?.data);
      
      // Get error message from new backend format
      const backendMsg = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Unknown error';
      console.log('🚨 Backend message:', backendMsg);
      
      // Set error message to display above the task
      if (error?.response?.status === 400 && (!error?.response?.data || error?.response?.data === '')) {
        setErrorMessage('This task cannot be completed because it depends on other tasks that are not completed yet.');
      } else if (backendMsg && (backendMsg.includes('dependencies') || backendMsg.includes('Cannot complete'))) {
        setErrorMessage(backendMsg);
      } else if (error?.response?.status === 400) {
        setErrorMessage(backendMsg || 'This task has incomplete dependencies or cannot be completed at this time.');
      } else {
        setErrorMessage(backendMsg || 'Failed to update task status');
      }
    }
  };

  const itemBg = theme === 'light' ? '#f5f5f5' : '#232323';
  const statusCircleBg = theme === 'light' ? '#fff' : '#181818';

  // Determine circle color based on overdue status
  const circleColor = isOverdue ? '#F44336' : (theme === 'light' ? '#181818' : '#fff');

  // Match ProfileScreen option style, responsive
  const { width } = Dimensions.get('window');
  const cardWidth = Math.min(320, width - 32); // 16px margin on each side
  const itemStyle = [
    styles.item,
    {
      backgroundColor: itemBg,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 18,
      width: cardWidth,
      maxWidth: cardWidth,
      alignSelf: 'center' as const,
    },
  ];

  return (
    <View>
      {/* Error Message Display - Plain text above widget */}
      {errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
      
      <View style={itemStyle}>
        <View style={styles.left}>
          <TouchableOpacity
            style={[styles.statusCircle, { borderColor: isOverdue ? '#F44336' : priorityColors[task.priority], backgroundColor: statusCircleBg }]}
            onPress={handleStatusCirclePress}
          >
            {task.status === 'completed' ? (
              <Ionicons name="checkmark" size={18} color={isOverdue ? '#F44336' : priorityColors[task.priority]} />
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskContent} onPress={handleTaskPress}>
          <Text style={[styles.title, { color: titleColor }]}>{task.title}</Text>
          {isOverdue && (
            <Text style={[styles.overdueText]}>OVERDUE</Text>
          )}
          <View style={styles.metaRow}>
            <View style={[styles.priorityDot, { backgroundColor: priorityColors[task.priority] }]} />
            <Text style={styles.metaText}>{task.priority}</Text>
            {task.dueDate && (
              <Text style={styles.metaText}>
                {' '}• Due: {formatDateForDisplay(task.dueDate)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.right}>
        <TouchableOpacity onPress={onEdit}>
          <MaterialCommunityIcons name="pencil" size={20} color="#aaa" />
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232323',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskContent: {
    flex: 1,
  },
  statusCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#181818',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  metaText: {
    color: '#aaa',
    fontSize: 12,
    marginRight: 6,
  },
  overdueText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  right: {
    marginLeft: 8,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
    alignSelf: 'center',
  },
});

// Format date for UI display only - does not affect backend
function formatDateForDisplay(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    // Always show date and time in AM/PM format
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true  // This ensures AM/PM format
    });
  } catch (error) {
    return dateString;
  }
}

export default TaskItem;
