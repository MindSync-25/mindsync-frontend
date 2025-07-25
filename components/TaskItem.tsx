import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Task, TaskStatus } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';

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
  const titleColor = theme === 'light' ? '#222' : '#fff';
  const nextStatus = () => {
    // Simple toggle: if completed, go back to pending; otherwise go to completed
    if (task.status === 'completed') {
      return 'pending';
    } else {
      return 'completed';
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
    <View style={itemStyle}>
      <View style={styles.left}>
        <TouchableOpacity
          style={[styles.statusCircle, { borderColor: isOverdue ? '#F44336' : priorityColors[task.priority], backgroundColor: statusCircleBg }]}
          onPress={() => onStatusChange(nextStatus())}
        >
          {task.status === 'completed' ? (
            <Ionicons name="checkmark" size={18} color={isOverdue ? '#F44336' : priorityColors[task.priority]} />
          ) : null}
        </TouchableOpacity>
        <View>
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
          {/* ...existing code... */}

          </View>
        </View>
      </View>
      <View style={styles.right}>
        <TouchableOpacity onPress={onEdit}>
          <MaterialCommunityIcons name="pencil" size={20} color="#aaa" />
        </TouchableOpacity>
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
