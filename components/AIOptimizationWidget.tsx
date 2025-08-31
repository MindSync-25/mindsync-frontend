// AI Optimization Widget - Shows AI suggestions for improving productivity
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { aiAPI, AITaskOptimization } from '../services/aiAPI';

interface Props {
  userId: string;
  onSuggestionPress?: (suggestion: any) => void;
}

const AIOptimizationWidget: React.FC<Props> = ({ userId, onSuggestionPress }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [optimizationData, setOptimizationData] = useState<AITaskOptimization | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadOptimizationData();
  }, [userId]);

  const loadOptimizationData = async () => {
    try {
      setLoading(true);
      const data = await aiAPI.getTaskOptimization(userId);
      setOptimizationData(data);
    } catch (error) {
      console.error('Failed to load optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'deadline_adjust': return 'calendar-outline';
      case 'break_task': return 'list-outline';
      case 'schedule_optimization': return 'time-outline';
      case 'priority_adjustment': return 'flag-outline';
      default: return 'bulb-outline';
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'deadline_adjust': return '#ff9800';
      case 'break_task': return '#2196f3';
      case 'schedule_optimization': return '#9c27b0';
      case 'priority_adjustment': return '#f44336';
      default: return '#4caf50';
    }
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
      marginBottom: 12,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme === 'light' ? '#000' : '#fff',
      marginLeft: 8,
    },
    suggestionCount: {
      backgroundColor: '#4caf50',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginLeft: 8,
    },
    countText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    expandButton: {
      padding: 4,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
    suggestionIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    suggestionContent: {
      flex: 1,
    },
    suggestionMessage: {
      fontSize: 14,
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 4,
    },
    suggestionReasoning: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
      fontStyle: 'italic',
    },
    previewContainer: {
      marginTop: 8,
    },
    previewSuggestion: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
    },
    previewText: {
      fontSize: 14,
      color: theme === 'light' ? '#000' : '#fff',
      marginLeft: 8,
      flex: 1,
    },
    aiLabel: {
      fontSize: 10,
      color: '#666',
      marginTop: 8,
      textAlign: 'center',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    emptyText: {
      fontSize: 14,
      color: theme === 'light' ? '#666' : '#aaa',
      marginTop: 8,
    },
  });

  if (loading) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center', height: 120 }]}>
        <ActivityIndicator size="small" color={theme === 'light' ? '#000' : '#fff'} />
        <Text style={[dynamicStyles.aiLabel, { marginTop: 8 }]}>AI generating suggestions...</Text>
      </View>
    );
  }

  if (!optimizationData || optimizationData.suggestions.length === 0) {
    return (
      <TouchableOpacity style={dynamicStyles.container} onPress={loadOptimizationData}>
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.headerLeft}>
            <Ionicons name="bulb" size={20} color="#4caf50" />
            <Text style={dynamicStyles.title}>AI Suggestions</Text>
          </View>
        </View>
        <View style={dynamicStyles.emptyState}>
          <Ionicons name="checkmark-circle" size={32} color="#4caf50" />
          <Text style={dynamicStyles.emptyText}>You're doing great! No suggestions right now.</Text>
        </View>
        <Text style={dynamicStyles.aiLabel}>🧠 AI-powered optimization • Tap to refresh</Text>
      </TouchableOpacity>
    );
  }

  const visibleSuggestions = expanded ? optimizationData.suggestions : optimizationData.suggestions.slice(0, 2);

  return (
    <View style={dynamicStyles.container}>
      <TouchableOpacity style={dynamicStyles.header} onPress={() => setExpanded(!expanded)}>
        <View style={dynamicStyles.headerLeft}>
          <Ionicons name="bulb" size={20} color="#4caf50" />
          <Text style={dynamicStyles.title}>AI Suggestions</Text>
          <View style={dynamicStyles.suggestionCount}>
            <Text style={dynamicStyles.countText}>{optimizationData.suggestions.length}</Text>
          </View>
        </View>
        <TouchableOpacity style={dynamicStyles.expandButton} onPress={() => setExpanded(!expanded)}>
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={theme === 'light' ? '#666' : '#aaa'} 
          />
        </TouchableOpacity>
      </TouchableOpacity>

      {expanded ? (
        <ScrollView style={{ maxHeight: 200 }}>
          {optimizationData.suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[dynamicStyles.suggestionItem, { borderBottomWidth: index === optimizationData.suggestions.length - 1 ? 0 : 1 }]}
              onPress={() => onSuggestionPress?.(suggestion)}
            >
              <Ionicons 
                name={getSuggestionIcon(suggestion.type)} 
                size={18} 
                color={getSuggestionColor(suggestion.type)}
                style={dynamicStyles.suggestionIcon}
              />
              <View style={dynamicStyles.suggestionContent}>
                <Text style={dynamicStyles.suggestionMessage}>{suggestion.message}</Text>
                <Text style={dynamicStyles.suggestionReasoning}>{suggestion.reasoning}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={dynamicStyles.previewContainer}>
          {visibleSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={dynamicStyles.previewSuggestion}
              onPress={() => onSuggestionPress?.(suggestion)}
            >
              <Ionicons 
                name={getSuggestionIcon(suggestion.type)} 
                size={16} 
                color={getSuggestionColor(suggestion.type)}
              />
              <Text style={dynamicStyles.previewText} numberOfLines={1}>
                {suggestion.message}
              </Text>
            </TouchableOpacity>
          ))}
          {optimizationData.suggestions.length > 2 && (
            <TouchableOpacity style={dynamicStyles.previewSuggestion} onPress={() => setExpanded(true)}>
              <Ionicons name="ellipsis-horizontal" size={16} color="#666" />
              <Text style={[dynamicStyles.previewText, { color: '#666' }]}>
                +{optimizationData.suggestions.length - 2} more suggestions
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Text style={dynamicStyles.aiLabel}>🧠 AI-powered optimization • Tap to interact</Text>
    </View>
  );
};

export default AIOptimizationWidget;
