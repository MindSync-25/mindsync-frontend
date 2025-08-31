// AI Notifications Widget - Shows AI-powered notifications and alerts
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { aiAPI, AINotification } from '../services/aiAPI';

interface Props {
  userId: string;
  onNotificationPress?: (notification: AINotification) => void;
  maxVisible?: number;
}

const AINotificationsWidget: React.FC<Props> = ({ 
  userId, 
  onNotificationPress,
  maxVisible = 3
}) => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<AINotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await aiAPI.getNotifications(userId);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load AI notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = (notification: AINotification) => {
    if (onNotificationPress) {
      onNotificationPress(notification);
    } else {
      // Default action - mark as read
      markAsRead(notification.id);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await aiAPI.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      await aiAPI.dismissNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline_alert': return 'time-outline';
      case 'overdue_task': return 'warning-outline';
      case 'productivity_insight': return 'bulb-outline';
      case 'suggestion': return 'bulb-outline';
      case 'achievement': return 'trophy-outline';
      case 'reminder': return 'notifications-outline';
      case 'workload_warning': return 'alert-circle-outline';
      case 'focus_suggestion': return 'eye-outline';
      default: return 'information-circle-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'deadline_alert': return '#ff9800';
      case 'overdue_task': return '#f44336';
      case 'productivity_insight': return '#2196f3';
      case 'suggestion': return '#4caf50';
      case 'achievement': return '#9c27b0';
      case 'reminder': return '#607d8b';
      case 'workload_warning': return '#ff5722';
      case 'focus_suggestion': return '#3f51b5';
      default: return '#666';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleDismissAll = () => {
    Alert.alert(
      'Dismiss All',
      'Are you sure you want to dismiss all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Dismiss All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(
                notifications.map(n => aiAPI.dismissNotification(n.id))
              );
              setNotifications([]);
            } catch (error) {
              console.error('Failed to dismiss all notifications:', error);
            }
          }
        }
      ]
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#333',
      boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(255,255,255,0.1)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme === 'light' ? '#000' : '#fff',
      marginLeft: 8,
    },
    badge: {
      backgroundColor: '#f44336',
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: 8,
    },
    badgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    dismissAllButton: {
      padding: 4,
    },
    notificationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
    notificationIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    notificationContent: {
      flex: 1,
    },
    notificationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    notificationTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme === 'light' ? '#000' : '#fff',
      flex: 1,
    },
    priorityIndicator: {
      fontSize: 12,
      marginLeft: 8,
    },
    notificationMessage: {
      fontSize: 13,
      color: theme === 'light' ? '#666' : '#aaa',
      lineHeight: 18,
      marginBottom: 4,
    },
    notificationFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    timestamp: {
      fontSize: 11,
      color: theme === 'light' ? '#999' : '#666',
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      padding: 4,
      marginLeft: 8,
    },
    unreadIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#4caf50',
      marginLeft: 8,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    emptyText: {
      fontSize: 14,
      color: theme === 'light' ? '#666' : '#aaa',
      marginTop: 8,
      textAlign: 'center',
    },
    aiLabel: {
      fontSize: 10,
      color: '#4caf50',
      textAlign: 'center',
      marginTop: 8,
    },
    showMoreButton: {
      alignItems: 'center',
      paddingVertical: 8,
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
    showMoreText: {
      fontSize: 12,
      color: '#4caf50',
      fontWeight: '500',
    },
  });

  const visibleNotifications = notifications.slice(0, maxVisible);
  const hasMore = notifications.length > maxVisible;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotificationItem = ({ item, index }: { item: AINotification; index: number }) => (
    <TouchableOpacity
      style={[
        dynamicStyles.notificationItem,
        index === visibleNotifications.length - 1 && !hasMore && { borderBottomWidth: 0 }
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <Ionicons
        name={getNotificationIcon(item.type)}
        size={20}
        color={getNotificationColor(item.type)}
        style={dynamicStyles.notificationIcon}
      />
      
      <View style={dynamicStyles.notificationContent}>
        <View style={dynamicStyles.notificationHeader}>
          <Text style={dynamicStyles.notificationTitle}>{item.title}</Text>
          <Text style={dynamicStyles.priorityIndicator}>
            {getPriorityIndicator(item.priority)}
          </Text>
          {!item.isRead && <View style={dynamicStyles.unreadIndicator} />}
        </View>
        
        <Text style={dynamicStyles.notificationMessage}>{item.message}</Text>
        
        <View style={dynamicStyles.notificationFooter}>
          <Text style={dynamicStyles.timestamp}>
            {formatTimestamp(item.timestamp)}
          </Text>
          
          <View style={dynamicStyles.actions}>
            {!item.isRead && (
              <TouchableOpacity
                style={dynamicStyles.actionButton}
                onPress={() => markAsRead(item.id)}
              >
                <Ionicons name="checkmark" size={16} color="#4caf50" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => dismissNotification(item.id)}
            >
              <Ionicons name="close" size={16} color="#f44336" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && notifications.length === 0) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center', height: 120 }]}>
        <Ionicons name="notifications" size={32} color="#666" />
        <Text style={dynamicStyles.emptyText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerLeft}>
          <Ionicons name="notifications" size={20} color="#4caf50" />
          <Text style={dynamicStyles.title}>AI Alerts</Text>
          {unreadCount > 0 && (
            <View style={dynamicStyles.badge}>
              <Text style={dynamicStyles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {notifications.length > 0 && (
          <TouchableOpacity style={dynamicStyles.dismissAllButton} onPress={handleDismissAll}>
            <Ionicons name="trash-outline" size={18} color={theme === 'light' ? '#666' : '#aaa'} />
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={dynamicStyles.emptyState}>
          <Ionicons name="checkmark-circle" size={32} color="#4caf50" />
          <Text style={dynamicStyles.emptyText}>All caught up! No new alerts.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={visibleNotifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
          
          {hasMore && (
            <TouchableOpacity style={dynamicStyles.showMoreButton}>
              <Text style={dynamicStyles.showMoreText}>
                View {notifications.length - maxVisible} more notifications
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <Text style={dynamicStyles.aiLabel}>🧠 AI-powered notifications</Text>
    </View>
  );
};

export default AINotificationsWidget;
