import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';

interface AnalyticsData {
  productivity: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    tasksCompleted: number;
    totalTasks: number;
  };
  timeTracking: {
    totalTime: number;
    focusTime: number;
    breakTime: number;
    mostProductiveHour: string;
  };
  goals: {
    daily: { target: number; completed: number };
    weekly: { target: number; completed: number };
    monthly: { target: number; completed: number };
  };
  insights: string[];
}

const AnalyticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { state } = useTasks();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const completedTasks = state.tasks.filter(task => task.completed).length;
      const totalTasks = state.tasks.length;
      
      const mockData: AnalyticsData = {
        productivity: {
          score: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          trend: 'up',
          tasksCompleted: completedTasks,
          totalTasks: totalTasks,
        },
        timeTracking: {
          totalTime: 480, // 8 hours in minutes
          focusTime: 360, // 6 hours in minutes
          breakTime: 120, // 2 hours in minutes
          mostProductiveHour: '10:00 AM',
        },
        goals: {
          daily: { target: 5, completed: completedTasks },
          weekly: { target: 25, completed: completedTasks * 3 },
          monthly: { target: 100, completed: completedTasks * 12 },
        },
        insights: [
          "Your productivity is 15% higher than last week",
          "Best focus time: 10AM - 12PM",
          "Consider shorter breaks for better flow",
          "You completed 80% of high-priority tasks",
        ],
      };
      
      setAnalyticsData(mockData);
      setIsLoading(false);
    }, 1000);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return '#34C759';
    if (percentage >= 60) return '#FF9500';
    return '#FF3B30';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <Ionicons name="trending-up" size={20} color="#34C759" />;
      case 'down':
        return <Ionicons name="trending-down" size={20} color="#FF3B30" />;
      default:
        return <Ionicons name="remove" size={20} color="#999" />;
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
      paddingBottom: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      textAlign: 'center',
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    periodSelector: {
      flexDirection: 'row',
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderRadius: 12,
      padding: 4,
      marginBottom: 20,
    },
    periodButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    periodButtonActive: {
      backgroundColor: '#007AFF',
    },
    periodButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme === 'light' ? '#666' : '#aaa',
    },
    periodButtonTextActive: {
      color: '#fff',
    },
    card: {
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 16,
    },
    productivityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    productivityScore: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#007AFF',
    },
    trendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    statLabel: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
      marginTop: 4,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      borderRadius: 4,
      marginVertical: 8,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    goalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
    goalLabel: {
      fontSize: 16,
      color: theme === 'light' ? '#000' : '#fff',
      fontWeight: '500',
    },
    goalProgress: {
      fontSize: 14,
      color: theme === 'light' ? '#666' : '#aaa',
    },
    insightItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 8,
      gap: 12,
    },
    insightText: {
      flex: 1,
      fontSize: 14,
      color: theme === 'light' ? '#000' : '#fff',
      lineHeight: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme === 'light' ? '#666' : '#aaa',
      marginTop: 12,
    },
    refreshButton: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
      alignItems: 'center',
      marginTop: 16,
    },
    refreshButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  if (isLoading) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerTitle}>Analytics</Text>
        </View>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={dynamicStyles.loadingText}>
            Analyzing your productivity data...
          </Text>
        </View>
      </View>
    );
  }

  if (!analyticsData) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerTitle}>Analytics</Text>
        </View>
        <View style={dynamicStyles.loadingContainer}>
          <Text style={dynamicStyles.loadingText}>No data available</Text>
          <TouchableOpacity
            style={dynamicStyles.refreshButton}
            onPress={loadAnalyticsData}
          >
            <Text style={dynamicStyles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>Analytics</Text>
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={dynamicStyles.periodSelector}>
          {(['day', 'week', 'month'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                dynamicStyles.periodButton,
                selectedPeriod === period && dynamicStyles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  dynamicStyles.periodButtonText,
                  selectedPeriod === period && dynamicStyles.periodButtonTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Productivity Score */}
        <View style={dynamicStyles.card}>
          <Text style={dynamicStyles.cardTitle}>Productivity Score</Text>
          <View style={dynamicStyles.productivityHeader}>
            <Text style={dynamicStyles.productivityScore}>
              {analyticsData.productivity.score}%
            </Text>
            <View style={dynamicStyles.trendContainer}>
              {getTrendIcon(analyticsData.productivity.trend)}
            </View>
          </View>
          <View style={dynamicStyles.statsRow}>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statValue}>
                {analyticsData.productivity.tasksCompleted}
              </Text>
              <Text style={dynamicStyles.statLabel}>Completed</Text>
            </View>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statValue}>
                {analyticsData.productivity.totalTasks}
              </Text>
              <Text style={dynamicStyles.statLabel}>Total Tasks</Text>
            </View>
          </View>
        </View>

        {/* Time Tracking */}
        <View style={dynamicStyles.card}>
          <Text style={dynamicStyles.cardTitle}>Time Tracking</Text>
          <View style={dynamicStyles.statsRow}>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statValue}>
                {formatDuration(analyticsData.timeTracking.totalTime)}
              </Text>
              <Text style={dynamicStyles.statLabel}>Total Time</Text>
            </View>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statValue}>
                {formatDuration(analyticsData.timeTracking.focusTime)}
              </Text>
              <Text style={dynamicStyles.statLabel}>Focus Time</Text>
            </View>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statValue}>
                {analyticsData.timeTracking.mostProductiveHour}
              </Text>
              <Text style={dynamicStyles.statLabel}>Peak Time</Text>
            </View>
          </View>
        </View>

        {/* Goals Progress */}
        <View style={dynamicStyles.card}>
          <Text style={dynamicStyles.cardTitle}>Goals Progress</Text>
          
          <View style={dynamicStyles.goalRow}>
            <Text style={dynamicStyles.goalLabel}>Daily Goal</Text>
            <Text style={dynamicStyles.goalProgress}>
              {analyticsData.goals.daily.completed}/{analyticsData.goals.daily.target}
            </Text>
          </View>
          <View style={dynamicStyles.progressBar}>
            <View
              style={[
                dynamicStyles.progressFill,
                {
                  width: `${Math.min(
                    (analyticsData.goals.daily.completed / analyticsData.goals.daily.target) * 100,
                    100
                  )}%`,
                  backgroundColor: getProgressColor(
                    (analyticsData.goals.daily.completed / analyticsData.goals.daily.target) * 100
                  ),
                },
              ]}
            />
          </View>

          <View style={dynamicStyles.goalRow}>
            <Text style={dynamicStyles.goalLabel}>Weekly Goal</Text>
            <Text style={dynamicStyles.goalProgress}>
              {analyticsData.goals.weekly.completed}/{analyticsData.goals.weekly.target}
            </Text>
          </View>
          <View style={dynamicStyles.progressBar}>
            <View
              style={[
                dynamicStyles.progressFill,
                {
                  width: `${Math.min(
                    (analyticsData.goals.weekly.completed / analyticsData.goals.weekly.target) * 100,
                    100
                  )}%`,
                  backgroundColor: getProgressColor(
                    (analyticsData.goals.weekly.completed / analyticsData.goals.weekly.target) * 100
                  ),
                },
              ]}
            />
          </View>

          <View style={[dynamicStyles.goalRow, { borderBottomWidth: 0 }]}>
            <Text style={dynamicStyles.goalLabel}>Monthly Goal</Text>
            <Text style={dynamicStyles.goalProgress}>
              {analyticsData.goals.monthly.completed}/{analyticsData.goals.monthly.target}
            </Text>
          </View>
          <View style={dynamicStyles.progressBar}>
            <View
              style={[
                dynamicStyles.progressFill,
                {
                  width: `${Math.min(
                    (analyticsData.goals.monthly.completed / analyticsData.goals.monthly.target) * 100,
                    100
                  )}%`,
                  backgroundColor: getProgressColor(
                    (analyticsData.goals.monthly.completed / analyticsData.goals.monthly.target) * 100
                  ),
                },
              ]}
            />
          </View>
        </View>

        {/* Insights */}
        <View style={dynamicStyles.card}>
          <Text style={dynamicStyles.cardTitle}>AI Insights</Text>
          {analyticsData.insights.map((insight, index) => (
            <View key={index} style={dynamicStyles.insightItem}>
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={20}
                color="#007AFF"
              />
              <Text style={dynamicStyles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>

        {/* Refresh Button */}
        <TouchableOpacity
          style={dynamicStyles.refreshButton}
          onPress={loadAnalyticsData}
        >
          <Text style={dynamicStyles.refreshButtonText}>Refresh Analytics</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AnalyticsScreen;
