import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Task, TaskComment, TimeLog } from '../context/TaskContext';
import * as taskApi from '../services/taskApi';

interface TaskDetailScreenProps {}

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { task: initialTask } = route.params as { task: Task };

  const [task, setTask] = useState<Task>(initialTask);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isTimeTracking, setIsTimeTracking] = useState(false);
  const [activeTimeLog, setActiveTimeLog] = useState<TimeLog | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(task.progressPercentage || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTaskDetails();
  }, [task.id]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      
      // Load comments
      const taskComments = await taskApi.getTaskComments(task.id);
      setComments(taskComments);
      
      // Load time logs
      const taskTimeLogs = await taskApi.getTaskTimeLogs(task.id);
      setTimeLogs(taskTimeLogs);
      
      // Check if there's an active time log
      const activeLog = taskTimeLogs.find(log => !log.endTime);
      if (activeLog) {
        setActiveTimeLog(activeLog);
        setIsTimeTracking(true);
      }
    } catch (error) {
      console.error('Error loading task details:', error);
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const comment = await taskApi.addTaskComment(task.id, newComment.trim());
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleStartTimeTracking = async () => {
    try {
      const timeLog = await taskApi.startTimeTracking(task.id, 'Working on task');
      setActiveTimeLog(timeLog);
      setIsTimeTracking(true);
      setTimeLogs(prev => [timeLog, ...prev]);
    } catch (error) {
      console.error('Error starting time tracking:', error);
      Alert.alert('Error', 'Failed to start time tracking');
    }
  };

  const handleStopTimeTracking = async () => {
    if (!activeTimeLog) return;

    try {
      const updatedTimeLog = await taskApi.stopTimeTracking(activeTimeLog.id);
      setActiveTimeLog(null);
      setIsTimeTracking(false);
      setTimeLogs(prev => 
        prev.map(log => log.id === updatedTimeLog.id ? updatedTimeLog : log)
      );
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      Alert.alert('Error', 'Failed to stop time tracking');
    }
  };

  const handleUpdateProgress = async (newProgress: number) => {
    try {
      const updatedTask = await taskApi.updateTaskProgress(task.id, newProgress);
      setTask(updatedTask);
      setProgressPercentage(newProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
      Alert.alert('Error', 'Failed to update progress');
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTotalTimeSpent = (): number => {
    return timeLogs
      .filter(log => log.durationMinutes)
      .reduce((total, log) => total + (log.durationMinutes || 0), 0);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Task Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.priorityBadge}>
          <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
            {task.priority}
          </Text>
        </View>
      </View>

      {/* Task Description */}
      {task.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>
      )}

      {/* Progress Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress ({progressPercentage}%)</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
            />
          </View>
          <View style={styles.progressButtons}>
            {[0, 25, 50, 75, 100].map(progress => (
              <TouchableOpacity
                key={progress}
                style={[
                  styles.progressButton,
                  progressPercentage === progress && styles.progressButtonActive
                ]}
                onPress={() => handleUpdateProgress(progress)}
              >
                <Text style={[
                  styles.progressButtonText,
                  progressPercentage === progress && styles.progressButtonTextActive
                ]}>
                  {progress}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Time Tracking Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Time Tracking</Text>
          <TouchableOpacity
            style={[
              styles.timeTrackingButton,
              isTimeTracking ? styles.stopButton : styles.startButton
            ]}
            onPress={isTimeTracking ? handleStopTimeTracking : handleStartTimeTracking}
          >
            <Text style={styles.timeTrackingButtonText}>
              {isTimeTracking ? 'Stop' : 'Start'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.timeStats}>
          <View style={styles.timeStat}>
            <Text style={styles.timeStatLabel}>Total Time</Text>
            <Text style={styles.timeStatValue}>{formatDuration(getTotalTimeSpent())}</Text>
          </View>
          {task.estimatedHours && (
            <View style={styles.timeStat}>
              <Text style={styles.timeStatLabel}>Estimated</Text>
              <Text style={styles.timeStatValue}>{task.estimatedHours}h</Text>
            </View>
          )}
        </View>

        {/* Recent Time Logs */}
        {timeLogs.length > 0 && (
          <View style={styles.timeLogsList}>
            <Text style={styles.subSectionTitle}>Recent Sessions</Text>
            {timeLogs.slice(0, 3).map(log => (
              <View key={log.id} style={styles.timeLogItem}>
                <Text style={styles.timeLogTime}>
                  {new Date(log.startTime).toLocaleDateString()} - {' '}
                  {log.durationMinutes ? formatDuration(log.durationMinutes) : 'In progress...'}
                </Text>
                {log.description && (
                  <Text style={styles.timeLogDescription}>{log.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Comments Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
        
        {/* Add Comment */}
        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.addCommentButton,
              !newComment.trim() && styles.addCommentButtonDisabled
            ]}
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Text style={styles.addCommentButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* Comments List */}
        {comments.length > 0 ? (
          <View style={styles.commentsList}>
            {comments.map(comment => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.userName}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.commentText}>{comment.comment}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noCommentsText}>No comments yet</Text>
        )}
      </View>

      {/* Task Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Task Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Due Date</Text>
            <Text style={styles.infoValue}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Unknown'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>{task.status}</Text>
          </View>
          {task.assigneeName && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Assignee</Text>
              <Text style={styles.infoValue}>{task.assigneeName}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'high': return '#FF4444';
    case 'medium': return '#FFA500';
    case 'low': return '#4CAF50';
    default: return '#666';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 16,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
    marginTop: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  progressContainer: {
    gap: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  progressButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  progressButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  progressButtonTextActive: {
    color: 'white',
  },
  timeTrackingButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#FF4444',
  },
  timeTrackingButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  timeStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  timeStat: {
    flex: 1,
    alignItems: 'center',
  },
  timeStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timeStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  timeLogsList: {
    marginTop: 8,
  },
  timeLogItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeLogTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  timeLogDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  addCommentContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  addCommentButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addCommentButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addCommentButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  commentsList: {
    gap: 12,
  },
  commentItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },
});

export default TaskDetailScreen;
