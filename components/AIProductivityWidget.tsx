// AI Productivity Insights Widget - Shows AI-powered analytics
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { aiAPI, AIProductivityInsights } from '../services/aiAPI';

interface Props {
  userId: string;
  onDetailsPress?: () => void;
}

const AIProductivityWidget: React.FC<Props> = ({ userId, onDetailsPress }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<AIProductivityInsights | null>(null);

  useEffect(() => {
    loadInsights();
  }, [userId]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await aiAPI.getProductivityInsights(userId);
      setInsights(data);
    } catch (error) {
      console.error('Failed to load productivity insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return 'trending-up';
      case 'declining': return 'trending-down';
      case 'stable': return 'remove';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#4caf50';
      case 'declining': return '#f44336';
      case 'stable': return '#ff9800';
      default: return '#757575';
    }
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return '#4caf50';
    if (rate >= 60) return '#ff9800';
    if (rate >= 40) return '#ffc107';
    return '#f44336';
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
    trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },
    trendText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
      textTransform: 'capitalize',
    },
    detailsButton: {
      padding: 4,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
      textAlign: 'center',
    },
    completionSection: {
      marginBottom: 16,
    },
    completionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    completionLabel: {
      fontSize: 14,
      color: theme === 'light' ? '#000' : '#fff',
      fontWeight: '500',
    },
    completionRate: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    progressBar: {
      height: 8,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      borderRadius: 4,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    recommendationsSection: {
      marginTop: 8,
    },
    recommendationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 6,
    },
    recommendationText: {
      fontSize: 13,
      color: theme === 'light' ? '#000' : '#fff',
      marginLeft: 8,
      flex: 1,
      lineHeight: 18,
    },
    aiLabel: {
      fontSize: 10,
      color: '#4caf50',
      textAlign: 'center',
      marginTop: 8,
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
  });

  if (loading) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center', height: 160 }]}>
        <ActivityIndicator size="small" color={theme === 'light' ? '#000' : '#fff'} />
        <Text style={[dynamicStyles.aiLabel, { marginTop: 8 }]}>AI analyzing productivity...</Text>
      </View>
    );
  }

  if (!insights) {
    return (
      <TouchableOpacity style={dynamicStyles.container} onPress={loadInsights}>
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.headerLeft}>
            <Ionicons name="analytics" size={20} color="#4caf50" />
            <Text style={dynamicStyles.title}>AI Productivity</Text>
          </View>
        </View>
        <View style={dynamicStyles.emptyState}>
          <Ionicons name="refresh" size={32} color="#666" />
          <Text style={dynamicStyles.emptyText}>Tap to load insights</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={dynamicStyles.container} onPress={onDetailsPress}>
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerLeft}>
          <Ionicons name="analytics" size={20} color="#4caf50" />
          <Text style={dynamicStyles.title}>AI Productivity</Text>
          <View style={[dynamicStyles.trendBadge, { backgroundColor: getTrendColor(insights.productivityTrend) }]}>
            <Ionicons 
              name={getTrendIcon(insights.productivityTrend)} 
              size={12} 
              color="#fff" 
            />
            <Text style={dynamicStyles.trendText}>{insights.productivityTrend}</Text>
          </View>
        </View>
        {onDetailsPress && (
          <TouchableOpacity style={dynamicStyles.detailsButton} onPress={onDetailsPress}>
            <Ionicons name="chevron-forward" size={20} color={theme === 'light' ? '#666' : '#aaa'} />
          </TouchableOpacity>
        )}
      </View>

      <View style={dynamicStyles.statsGrid}>
        <View style={dynamicStyles.statItem}>
          <Text style={[dynamicStyles.statValue, { color: '#2196f3' }]}>
            {insights.tasksCreated}
          </Text>
          <Text style={dynamicStyles.statLabel}>Created</Text>
        </View>
        
        <View style={dynamicStyles.statItem}>
          <Text style={[dynamicStyles.statValue, { color: '#4caf50' }]}>
            {insights.tasksCompleted}
          </Text>
          <Text style={dynamicStyles.statLabel}>Completed</Text>
        </View>
        
        <View style={dynamicStyles.statItem}>
          <Text style={[dynamicStyles.statValue, { color: '#ff9800' }]}>
            {insights.totalFocusTimeHours.toFixed(1)}h
          </Text>
          <Text style={dynamicStyles.statLabel}>Focus Time</Text>
        </View>
      </View>

      <View style={dynamicStyles.completionSection}>
        <View style={dynamicStyles.completionHeader}>
          <Text style={dynamicStyles.completionLabel}>Completion Rate</Text>
          <Text style={[
            dynamicStyles.completionRate, 
            { color: getCompletionRateColor(insights.completionRate) }
          ]}>
            {insights.completionRate.toFixed(1)}%
          </Text>
        </View>
        <View style={dynamicStyles.progressBar}>
          <View 
            style={[
              dynamicStyles.progressFill, 
              { 
                width: `${insights.completionRate}%`,
                backgroundColor: getCompletionRateColor(insights.completionRate)
              }
            ]} 
          />
        </View>
      </View>

      {insights.recommendedActions && insights.recommendedActions.length > 0 && (
        <View style={dynamicStyles.recommendationsSection}>
          {insights.recommendedActions.slice(0, 2).map((recommendation, index) => (
            <View key={index} style={dynamicStyles.recommendationItem}>
              <Ionicons name="bulb-outline" size={14} color="#4caf50" />
              <Text style={dynamicStyles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={dynamicStyles.aiLabel}>🧠 AI-powered insights • Tap for details</Text>
    </TouchableOpacity>
  );
};

export default AIProductivityWidget;
