import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MindSyncNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  categoryIdentifier?: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high';
  type: 'task' | 'calendar' | 'ai' | 'system' | 'reminder';
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;
  private notifications: MindSyncNotification[] = [];

  async initialize(): Promise<void> {
    console.log('🔔 Initializing notification service...');
    
    try {
      // Register for push notifications
      await this.registerForPushNotifications();
      
      // Load stored notifications
      await this.loadStoredNotifications();
      
      // Set up notification categories
      await this.setupNotificationCategories();
      
      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
    }
  }

  private async registerForPushNotifications(): Promise<void> {
    if (!Device.isDevice) {
      console.log('⚠️ Must use physical device for push notifications');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Failed to get push token for push notification!');
      return;
    }

    try {
      this.expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('📱 Expo push token:', this.expoPushToken);
      
      // Store token for backend
      await AsyncStorage.setItem('expoPushToken', this.expoPushToken);
    } catch (error) {
      console.error('❌ Error getting push token:', error);
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  private async setupNotificationCategories(): Promise<void> {
    await Notifications.setNotificationCategoryAsync('task', [
      {
        identifier: 'mark_complete',
        buttonTitle: 'Mark Complete',
        options: { opensAppToForeground: false },
      },
      {
        identifier: 'view_task',
        buttonTitle: 'View Task',
        options: { opensAppToForeground: true },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('reminder', [
      {
        identifier: 'snooze',
        buttonTitle: 'Snooze 5m',
        options: { opensAppToForeground: false },
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Dismiss',
        options: { opensAppToForeground: false },
      },
    ]);
  }

  private async loadStoredNotifications(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('mindSyncNotifications');
      if (stored) {
        this.notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        console.log(`📱 Loaded ${this.notifications.length} stored notifications`);
      }
    } catch (error) {
      console.error('❌ Error loading stored notifications:', error);
    }
  }

  private async saveNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem('mindSyncNotifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('❌ Error saving notifications:', error);
    }
  }

  async showNotification(notification: Omit<MindSyncNotification, 'id' | 'timestamp' | 'isRead'>): Promise<string> {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullNotification: MindSyncNotification = {
      id,
      timestamp: new Date(),
      isRead: false,
      ...notification,
    };

    // Add to local storage
    this.notifications.unshift(fullNotification);
    await this.saveNotifications();

    // Show system notification
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          categoryIdentifier: notification.categoryIdentifier,
          priority: this.mapPriorityToExpo(notification.priority),
        },
        trigger: null, // Show immediately
      });

      console.log('📱 Notification shown:', notification.title);
    } catch (error) {
      console.error('❌ Error showing notification:', error);
    }

    return id;
  }

  async scheduleNotification(
    notification: Omit<MindSyncNotification, 'id' | 'timestamp' | 'isRead'>,
    triggerDate: Date
  ): Promise<string> {
    const id = `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullNotification: MindSyncNotification = {
      id,
      timestamp: new Date(),
      isRead: false,
      ...notification,
    };

    this.notifications.unshift(fullNotification);
    await this.saveNotifications();

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: { ...notification.data, notificationId: id },
          categoryIdentifier: notification.categoryIdentifier,
          priority: this.mapPriorityToExpo(notification.priority),
        },
        trigger: triggerDate,
      });

      console.log('📅 Notification scheduled for:', triggerDate);
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
    }

    return id;
  }

  private mapPriorityToExpo(priority: 'low' | 'normal' | 'high'): Notifications.AndroidNotificationPriority {
    switch (priority) {
      case 'low':
        return Notifications.AndroidNotificationPriority.LOW;
      case 'high':
        return Notifications.AndroidNotificationPriority.HIGH;
      default:
        return Notifications.AndroidNotificationPriority.DEFAULT;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      await this.saveNotifications();
    }
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.forEach(n => n.isRead = true);
    await this.saveNotifications();
  }

  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    await this.saveNotifications();
  }

  async clearAllNotifications(): Promise<void> {
    this.notifications = [];
    await this.saveNotifications();
    await Notifications.dismissAllNotificationsAsync();
  }

  getNotifications(): MindSyncNotification[] {
    return [...this.notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  // Convenience methods for common notification types

  async showTaskReminder(taskTitle: string, taskId: string, dueDate?: Date): Promise<string> {
    const timeText = dueDate ? ` (due ${dueDate.toLocaleDateString()})` : '';
    
    return this.showNotification({
      title: 'Task Reminder',
      body: `Don't forget: ${taskTitle}${timeText}`,
      type: 'task',
      priority: 'normal',
      categoryIdentifier: 'task',
      data: { taskId, type: 'reminder' },
    });
  }

  async showTaskOverdue(taskTitle: string, taskId: string): Promise<string> {
    return this.showNotification({
      title: 'Task Overdue ⚠️',
      body: `${taskTitle} is now overdue`,
      type: 'task',
      priority: 'high',
      categoryIdentifier: 'task',
      data: { taskId, type: 'overdue' },
    });
  }

  async showTaskCompleted(taskTitle: string, taskId: string): Promise<string> {
    return this.showNotification({
      title: 'Task Completed! 🎉',
      body: `Great job completing: ${taskTitle}`,
      type: 'task',
      priority: 'low',
      data: { taskId, type: 'completion' },
    });
  }

  async showAIInsight(insight: string): Promise<string> {
    return this.showNotification({
      title: 'AI Insight 💡',
      body: insight,
      type: 'ai',
      priority: 'normal',
      data: { type: 'ai_insight' },
    });
  }

  async showCalendarReminder(eventTitle: string, eventId: string, startTime: Date): Promise<string> {
    const timeText = startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return this.showNotification({
      title: 'Meeting Reminder',
      body: `${eventTitle} starts at ${timeText}`,
      type: 'calendar',
      priority: 'high',
      data: { eventId, type: 'meeting_reminder' },
    });
  }

  async scheduleTaskReminder(taskTitle: string, taskId: string, reminderDate: Date): Promise<string> {
    return this.scheduleNotification({
      title: 'Task Reminder',
      body: `Time to work on: ${taskTitle}`,
      type: 'reminder',
      priority: 'normal',
      categoryIdentifier: 'reminder',
      data: { taskId, type: 'scheduled_reminder' },
    }, reminderDate);
  }

  async scheduleMeetingReminder(
    meetingTitle: string, 
    eventId: string, 
    meetingTime: Date, 
    minutesBefore: number = 15
  ): Promise<string> {
    const reminderTime = new Date(meetingTime.getTime() - (minutesBefore * 60 * 1000));
    
    return this.scheduleNotification({
      title: `Meeting in ${minutesBefore} minutes`,
      body: meetingTitle,
      type: 'calendar',
      priority: 'high',
      data: { eventId, meetingTime: meetingTime.toISOString() },
    }, reminderTime);
  }

  getPushToken(): string | null {
    return this.expoPushToken;
  }

  async updateBadgeCount(): Promise<void> {
    const unreadCount = this.getUnreadCount();
    await Notifications.setBadgeCountAsync(unreadCount);
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Initialize when imported
notificationService.initialize();

export default notificationService;
