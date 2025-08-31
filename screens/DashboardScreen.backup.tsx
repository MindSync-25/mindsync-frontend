import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// AI Components
import AIWorkloadWidget from '../components/AIWorkloadWidget';
import AIOptimizationWidget from '../components/AIOptimizationWidget';
import AIProductivityWidget from '../components/AIProductivityWidget';
import AINotificationsWidget from '../components/AINotificationsWidget';
import AIFloatingButton from '../components/AIFloatingButton';

type RootTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Calendar: undefined;
  Chat: undefined;
  Analytics: undefined;
};

type DashboardNavigationProp = NavigationProp<RootTabParamList>;

interface Feature {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<DashboardNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [collaborationModalVisible, setCollaborationModalVisible] = useState(false);
  const { width } = Dimensions.get('window');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleFeaturePress = (featureId: string) => {
    switch (featureId) {
      case 'tasks':
        navigation.navigate('Tasks');
        break;
      case 'calendar':
        navigation.navigate('Calendar');
        break;
      case 'collaboration':
        setCollaborationModalVisible(true);
        break;
    }
  };

// Section Component - EXACTLY like your reference design
const Section: React.FC<{ title: string; children: React.ReactNode; theme: string }> = ({ 
  title, 
  children, 
  theme 
}) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: theme === 'light' ? '#000' : '#60a5fa' }]}>
      {title}
    </Text>
    <View style={styles.featuresGrid}>
      {children}
    </View>
  </View>
);

// Feature Card Component - EXACTLY like your reference design
const FeatureCard: React.FC<{ 
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
  theme: string;
}> = ({ icon, label, color, onPress, theme }) => (
  <TouchableOpacity 
    style={[
      styles.featureCard,
      { 
        backgroundColor: theme === 'light' ? '#fff' : '#1f2937',
        borderColor: theme === 'light' ? '#e0e0e0' : '#374151'
      }
    ]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.featureIcon}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={[styles.featureText, { color: theme === 'light' ? '#000' : '#fff' }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<DashboardNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleFeaturePress = (featureName: string) => {
    console.log(`🎯 Pressed: ${featureName}`);
    
    // Navigate based on feature
    if (featureName === 'Task System') {
      navigation.navigate('Tasks');
    } else if (featureName === 'Analytics') {
      navigation.navigate('Analytics');
    } else if (featureName === 'Virtual Secretary') {
      navigation.navigate('Chat');
    } else {
      // Show coming soon for other features
      Alert.alert('Coming Soon!', `${featureName} feature will be available soon.`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === 'light' ? '#f8f9fa' : '#111827' }]}>
      {/* Header - EXACTLY like your reference */}
      <View style={[
        styles.header,
        { 
          backgroundColor: theme === 'light' ? '#fff' : '#1f2937',
          borderBottomColor: theme === 'light' ? '#e0e0e0' : '#374151'
        }
      ]}>
        <View>
          <Text style={[styles.greeting, { color: theme === 'light' ? '#000' : '#fff' }]}>
            Hello Anil 👋
          </Text>
          <Text style={[styles.subtitle, { color: theme === 'light' ? '#666' : '#9ca3af' }]}>
            Ready to be productive today?
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: theme === 'light' ? '#f0f0f0' : '#374151' }]}
          onPress={() => navigation.navigate('Profile' as never)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="person-circle-outline" 
            size={32} 
            color={theme === 'light' ? '#007AFF' : '#60a5fa'} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Essential Daily Assistance */}
        <Section title="Essential Daily Assistance" theme={theme}>
          <FeatureCard 
            icon="checkbox-outline" 
            label="Task System" 
            color="#4CAF50"
            onPress={() => handleFeaturePress('Task System')} 
            theme={theme} 
          />
          <FeatureCard 
            icon="heart-outline" 
            label="Health Reminders" 
            color="#E91E63"
            onPress={() => handleFeaturePress('Health Reminders')} 
            theme={theme} 
          />
          <FeatureCard 
            icon="card-outline" 
            label="Finance Tracker" 
            color="#FF9800"
            onPress={() => handleFeaturePress('Finance Tracker')} 
            theme={theme} 
          />
          <FeatureCard 
            icon="bag-outline" 
            label="Smart Shopping" 
            color="#9C27B0"
            onPress={() => handleFeaturePress('Smart Shopping')} 
            theme={theme} 
          />
        </Section>

        {/* Productivity & Work */}
        <Section title="Productivity & Work" theme={theme}>
          <FeatureCard 
            icon="person-outline" 
            label="Virtual Secretary" 
            color="#2196F3"
            onPress={() => handleFeaturePress('Virtual Secretary')} 
            theme={theme} 
          />
          <FeatureCard 
            icon="briefcase-outline" 
            label="Productivity Hub" 
            color="#607D8B"
            onPress={() => handleFeaturePress('Productivity Hub')} 
            theme={theme} 
          />
          <FeatureCard 
            icon="analytics-outline" 
            label="Analytics" 
            color="#FF5722"
            onPress={() => handleFeaturePress('Analytics')} 
            theme={theme} 
          />
          <FeatureCard 
            icon="document-text-outline" 
            label="Legal Assistant" 
            color="#795548"
            onPress={() => handleFeaturePress('Legal Assistant')} 
            theme={theme} 
          />
        </Section>

        {/* Travel & Mobility */}
        <Section title="Travel & Mobility" theme={theme}>
          <FeatureCard 
            icon="map-outline" 
            label="Route Planner" 
            color="#3F51B5"
            onPress={() => handleFeaturePress('Route Planner')} 
            theme={theme} 
          />
          <FeatureCard 
            icon="airplane-outline" 
            label="Travel Planner" 
            color="#00BCD4"
            onPress={() => handleFeaturePress('Travel Planner')} 
            theme={theme} 
          />
          <FeatureCard 
            icon="wallet-outline" 
            label="Travel Expenses" 
            color="#4CAF50"
            onPress={() => handleFeaturePress('Travel Expenses')} 
            theme={theme} 
          />
          <FeatureCard 
            icon="globe-outline" 
            label="Culture Guide" 
            color="#FF9800"
            onPress={() => handleFeaturePress('Culture Guide')} 
            theme={theme} 
          />
        </Section>

        {/* Smart Lifestyle & Wellness */}
        <Section title="Smart Lifestyle & Wellness" theme={theme}>
          <FeatureCard 
            icon="musical-notes-outline" 
            label="Music & Movies" 
            color="#E91E63"
            onPress={() => handleFeaturePress('Music & Movies')} 
            theme={theme} 
          />
          <FeatureCard 
            icon="school-outline" 
            label="Hobbies Coach" 
            color="#9C27B0"
            onPress={() => handleFeaturePress('Hobbies Coach')} 
            theme={theme} 
          />
          <FeatureCard 
            icon="fitness-outline" 
            label="Mental Health" 
            color="#4CAF50"
            onPress={() => handleFeaturePress('Mental Health')} 
            theme={theme} 
          />
          <FeatureCard 
            icon="partly-sunny-outline" 
            label="Weather Alerts" 
            color="#FF9800"
            onPress={() => handleFeaturePress('Weather Alerts')} 
            theme={theme} 
          />
        </Section>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4b5563',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%', // EXACTLY two columns like your reference
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

const getStatsCards = (
  totalTasks: number,
  completedTasks: number,
  todayTasks: number,
  overdueTasks: number
) => [
  {
    id: 'completion_rate',
    label: 'Completion Rate',
    value: totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%',
    icon: 'chart-line',
    color: '#4CAF50',
    trend: 'up',
  },
  {
    id: 'today_tasks',
    label: 'Due Today',
    value: todayTasks.toString(),
    icon: 'calendar-today',
    color: '#2196F3',
  },
  {
    id: 'overdue',
    label: 'Overdue',
    value: overdueTasks.toString(),
    icon: 'alert-circle',
    color: overdueTasks > 0 ? '#F44336' : '#4CAF50',
    trend: overdueTasks > 0 ? 'up' : 'stable',
  },
  {
    id: 'focus_time',
    label: 'Focus Time',
    value: '3h 45m',
    icon: 'timer',
    color: '#9C27B0',
    trend: 'up',
  },
];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleVoiceTaskCreated = (task: any) => {
    // This would integrate with the task creation system
    console.log('Voice task created:', task);
    navigation.navigate('Tasks');
  };

  const handleLocationReminderCreated = (reminder: any) => {
    // This would integrate with the reminder system
    console.log('Location reminder created:', reminder);
    // Show success message or navigate to reminders view
  };

  const handleAISuggestionAction = (suggestion: any) => {
    console.log('AI Suggestion selected:', suggestion);
    
    switch (suggestion.type) {
      case 'task_optimization':
        navigation.navigate('Tasks');
        break;
      case 'schedule_suggestion':
        navigation.navigate('Calendar');
        break;
      case 'collaboration':
        setCollaborationModalVisible(true);
        break;
      case 'automation':
        // Navigate to automation settings
        break;
      default:
        // Handle other suggestion types
        break;
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#000',
    },
    header: {
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#e0e0e0' : '#333',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    greeting: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme === 'light' ? '#666' : '#aaa',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 16,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    quickActionCard: {
      width: (width - 56) / 2,
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    quickActionIcon: {
      marginBottom: 12,
    },
    quickActionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme === 'light' ? '#000' : '#fff',
      textAlign: 'center',
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    metricCard: {
      width: (width - 56) / 2,
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    metricHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    metricIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metricTrend: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metricValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 4,
    },
    metricLabel: {
      fontSize: 14,
      color: theme === 'light' ? '#666' : '#aaa',
    },
    upcomingCard: {
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    upcomingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
    upcomingIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    upcomingContent: {
      flex: 1,
    },
    upcomingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 4,
    },
    upcomingTime: {
      fontSize: 14,
      color: theme === 'light' ? '#666' : '#aaa',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    emptyText: {
      fontSize: 16,
      color: theme === 'light' ? '#666' : '#aaa',
      textAlign: 'center',
      marginTop: 12,
    },
    profileButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
  });

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <Ionicons name="trending-up" size={16} color="#4CAF50" />;
      case 'down':
        return <Ionicons name="trending-down" size={16} color="#F44336" />;
      default:
        return null;
    }
  };

  const upcomingEvents = [
    {
      id: '1',
      title: 'Team Standup',
      time: '10:00 AM',
      type: 'meeting',
      color: '#2196F3',
    },
    {
      id: '2',
      title: 'Review Budget Report',
      time: '2:00 PM',
      type: 'task',
      color: '#FF9800',
    },
    {
      id: '3',
      title: 'Client Call',
      time: '4:30 PM',
      type: 'meeting',
      color: '#4CAF50',
    },
  ];

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <View>
          <Text style={dynamicStyles.greeting}>Good morning! 👋</Text>
          <Text style={dynamicStyles.subtitle}>Ready to make today productive?</Text>
        </View>
        <TouchableOpacity
          style={dynamicStyles.profileButton}
          onPress={() => navigation.navigate('Profile' as never)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="person-circle-outline" 
            size={32} 
            color={theme === 'light' ? '#007AFF' : '#1e90ff'} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={dynamicStyles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Quick Actions</Text>
          <View style={dynamicStyles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={dynamicStyles.quickActionCard}
                onPress={action.action}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    dynamicStyles.quickActionIcon,
                    { backgroundColor: action.color + '20' },
                    { borderRadius: 12, padding: 12 },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={action.icon}
                    size={24}
                    color={action.color}
                  />
                </View>
                <Text style={dynamicStyles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Assistant Widget */}
        <AIAssistantWidget onSuggestionAction={handleAISuggestionAction} />

        {/* Productivity Metrics */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Today's Metrics</Text>
          <View style={dynamicStyles.metricsGrid}>
            {productivityMetrics.map((metric) => (
              <View key={metric.id} style={dynamicStyles.metricCard}>
                <View style={dynamicStyles.metricHeader}>
                  <View
                    style={[
                      dynamicStyles.metricIcon,
                      { backgroundColor: metric.color + '20' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={metric.icon}
                      size={16}
                      color={metric.color}
                    />
                  </View>
                  {metric.trend && (
                    <View style={dynamicStyles.metricTrend}>
                      {getTrendIcon(metric.trend)}
                    </View>
                  )}
                </View>
                <Text style={dynamicStyles.metricValue}>{metric.value}</Text>
                <Text style={dynamicStyles.metricLabel}>{metric.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Upcoming</Text>
          <View style={dynamicStyles.upcomingCard}>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, index) => (
                <View
                  key={event.id}
                  style={[
                    dynamicStyles.upcomingItem,
                    index === upcomingEvents.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View
                    style={[
                      dynamicStyles.upcomingIcon,
                      { backgroundColor: event.color + '20' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={event.type === 'meeting' ? 'video' : 'checkbox-marked-circle'}
                      size={16}
                      color={event.color}
                    />
                  </View>
                  <View style={dynamicStyles.upcomingContent}>
                    <Text style={dynamicStyles.upcomingTitle}>{event.title}</Text>
                    <Text style={dynamicStyles.upcomingTime}>{event.time}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={dynamicStyles.emptyState}>
                <MaterialCommunityIcons
                  name="calendar-check"
                  size={48}
                  color={theme === 'light' ? '#ccc' : '#555'}
                />
                <Text style={dynamicStyles.emptyText}>
                  No upcoming events today
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Voice Task Creator Modal */}
      <VoiceTaskCreator
        visible={voiceModalVisible}
        onClose={() => setVoiceModalVisible(false)}
        onTaskCreated={handleVoiceTaskCreated}
      />

      {/* Location Reminder Creator Modal */}
      <LocationReminderCreator
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onReminderCreated={handleLocationReminderCreated}
      />

      {/* Collaboration Workspace Modal */}
      <CollaborationWorkspace
        visible={collaborationModalVisible}
        onClose={() => setCollaborationModalVisible(false)}
      />
    </View>
  );
};

export default DashboardScreen;
