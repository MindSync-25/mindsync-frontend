import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';

const { width } = Dimensions.get('window');

interface AISuggestion {
  id: string;
  type: 'task_optimization' | 'schedule_suggestion' | 'productivity_tip' | 'collaboration' | 'automation';
  title: string;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  actionHandler?: () => void;
}

interface AIAssistantWidgetProps {
  onSuggestionAction?: (suggestion: AISuggestion) => void;
}

const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  onSuggestionAction,
}) => {
  const { theme } = useTheme();
  const { state } = useTasks();
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [isExpanded, setIsExpanded] = useState(false);

  // AI suggestions based on user data and context
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  useEffect(() => {
    generateContextualSuggestions();
  }, [state.tasks]);

  const generateContextualSuggestions = () => {
    const now = new Date();
    const overdueTasks = state.tasks.filter(task => task.isOverdue && task.status !== 'completed');
    const todayTasks = state.tasks.filter(task => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate).toDateString() === now.toDateString();
    });
    const highPriorityTasks = state.tasks.filter(task => task.priority === 'high' && task.status !== 'completed');

    const newSuggestions: AISuggestion[] = [];

    // Task optimization suggestions
    if (overdueTasks.length > 0) {
      newSuggestions.push({
        id: 'overdue_focus',
        type: 'task_optimization',
        title: 'Focus on Overdue Tasks',
        description: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Consider prioritizing these first.`,
        action: 'Review Overdue Tasks',
        priority: 'high',
        icon: 'alert-circle',
        color: '#F44336',
      });
    }

    if (todayTasks.length > 3) {
      newSuggestions.push({
        id: 'time_blocking',
        type: 'schedule_suggestion',
        title: 'Time Blocking Recommended',
        description: `You have ${todayTasks.length} tasks due today. Consider time blocking for better focus.`,
        action: 'Create Schedule',
        priority: 'medium',
        icon: 'calendar-clock',
        color: '#FF9800',
      });
    }

    if (highPriorityTasks.length > 0) {
      newSuggestions.push({
        id: 'priority_focus',
        type: 'task_optimization',
        title: 'High Priority Tasks Pending',
        description: `${highPriorityTasks.length} high-priority task${highPriorityTasks.length > 1 ? 's need' : ' needs'} your attention.`,
        action: 'View Priority Tasks',
        priority: 'high',
        icon: 'star',
        color: '#4CAF50',
      });
    }

    // Productivity tips based on patterns
    if (state.tasks.length > 10) {
      newSuggestions.push({
        id: 'task_automation',
        type: 'automation',
        title: 'Automate Recurring Tasks',
        description: 'I noticed you create similar tasks often. Consider setting up recurring tasks.',
        action: 'Setup Automation',
        priority: 'medium',
        icon: 'robot',
        color: '#9C27B0',
      });
    }

    // Collaboration suggestions
    if (state.tasks.some(task => task.description?.includes('team') || task.description?.includes('meeting'))) {
      newSuggestions.push({
        id: 'team_collaboration',
        type: 'collaboration',
        title: 'Team Collaboration Opportunity',
        description: 'Some tasks could benefit from team collaboration. Consider delegating or sharing.',
        action: 'Open Team Workspace',
        priority: 'low',
        icon: 'account-group',
        color: '#2196F3',
      });
    }

    // General productivity tips
    newSuggestions.push({
      id: 'pomodoro_technique',
      type: 'productivity_tip',
      title: 'Try the Pomodoro Technique',
      description: 'Break your work into 25-minute focused sessions for better productivity.',
      action: 'Start Focus Session',
      priority: 'low',
      icon: 'timer',
      color: '#FF5722',
    });

    newSuggestions.push({
      id: 'weekly_review',
      type: 'productivity_tip',
      title: 'Weekly Review Recommended',
      description: 'Regular reviews help you stay on track and adjust your goals.',
      action: 'Start Review',
      priority: 'low',
      icon: 'chart-line',
      color: '#607D8B',
    });

    setSuggestions(newSuggestions);
  };

  useEffect(() => {
    if (suggestions.length > 1) {
      const interval = setInterval(() => {
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        setCurrentSuggestion((prev) => (prev + 1) % suggestions.length);
      }, 8000); // Change suggestion every 8 seconds

      return () => clearInterval(interval);
    }
  }, [suggestions, fadeAnim]);

  const handleSuggestionAction = (suggestion: AISuggestion) => {
    if (onSuggestionAction) {
      onSuggestionAction(suggestion);
    }
    // Default actions can be handled here
    console.log('AI Suggestion action:', suggestion.action);
  };

  const getPriorityColor = (priority: AISuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    aiIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#007AFF20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    subtitle: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
      marginTop: 2,
    },
    expandButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      alignItems: 'center',
      justifyContent: 'center',
    },
    suggestionContainer: {
      minHeight: 80,
    },
    suggestionCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 12,
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#2a2a2a',
      borderRadius: 12,
      marginBottom: 8,
    },
    suggestionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    suggestionContent: {
      flex: 1,
    },
    suggestionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 4,
    },
    suggestionDescription: {
      fontSize: 14,
      color: theme === 'light' ? '#666' : '#aaa',
      lineHeight: 20,
      marginBottom: 8,
    },
    actionButton: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: '#007AFF20',
    },
    actionButtonText: {
      fontSize: 12,
      color: '#007AFF',
      fontWeight: '500',
    },
    priorityIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: 8,
      marginTop: 4,
    },
    expandedContainer: {
      maxHeight: 300,
    },
    collapsedContainer: {
      height: 120,
      overflow: 'hidden',
    },
    suggestionCounter: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    counterDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginHorizontal: 3,
    },
    activeDot: {
      backgroundColor: '#007AFF',
    },
    inactiveDot: {
      backgroundColor: theme === 'light' ? '#ccc' : '#555',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    emptyText: {
      fontSize: 14,
      color: theme === 'light' ? '#666' : '#aaa',
      textAlign: 'center',
      marginTop: 8,
    },
  });

  if (suggestions.length === 0) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.headerLeft}>
            <View style={dynamicStyles.aiIcon}>
              <MaterialCommunityIcons name="robot" size={16} color="#007AFF" />
            </View>
            <View>
              <Text style={dynamicStyles.title}>AI Assistant</Text>
              <Text style={dynamicStyles.subtitle}>Smart suggestions</Text>
            </View>
          </View>
        </View>
        <View style={dynamicStyles.emptyState}>
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={32}
            color={theme === 'light' ? '#ccc' : '#555'}
          />
          <Text style={dynamicStyles.emptyText}>
            I'm analyzing your tasks to provide personalized suggestions
          </Text>
        </View>
      </View>
    );
  }

  const renderSuggestion = (suggestion: AISuggestion, index: number) => (
    <Animated.View
      key={suggestion.id}
      style={[
        dynamicStyles.suggestionCard,
        index === currentSuggestion && !isExpanded && { opacity: fadeAnim },
      ]}
    >
      <View
        style={[
          dynamicStyles.suggestionIcon,
          { backgroundColor: suggestion.color + '20' },
        ]}
      >
        <MaterialCommunityIcons
          name={suggestion.icon}
          size={20}
          color={suggestion.color}
        />
      </View>
      <View style={dynamicStyles.suggestionContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={dynamicStyles.suggestionTitle}>{suggestion.title}</Text>
          <View
            style={[
              dynamicStyles.priorityIndicator,
              { backgroundColor: getPriorityColor(suggestion.priority) },
            ]}
          />
        </View>
        <Text style={dynamicStyles.suggestionDescription}>
          {suggestion.description}
        </Text>
        <TouchableOpacity
          style={dynamicStyles.actionButton}
          onPress={() => handleSuggestionAction(suggestion)}
        >
          <Text style={dynamicStyles.actionButtonText}>{suggestion.action}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerLeft}>
          <View style={dynamicStyles.aiIcon}>
            <MaterialCommunityIcons name="robot" size={16} color="#007AFF" />
          </View>
          <View>
            <Text style={dynamicStyles.title}>AI Assistant</Text>
            <Text style={dynamicStyles.subtitle}>
              {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''} available
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={dynamicStyles.expandButton}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme === 'light' ? '#666' : '#aaa'}
          />
        </TouchableOpacity>
      </View>

      <View
        style={[
          dynamicStyles.suggestionContainer,
          isExpanded ? dynamicStyles.expandedContainer : dynamicStyles.collapsedContainer,
        ]}
      >
        {isExpanded ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {suggestions.map((suggestion, index) => renderSuggestion(suggestion, index))}
          </ScrollView>
        ) : (
          suggestions.length > 0 && renderSuggestion(suggestions[currentSuggestion], currentSuggestion)
        )}
      </View>

      {!isExpanded && suggestions.length > 1 && (
        <View style={dynamicStyles.suggestionCounter}>
          {suggestions.map((_, index) => (
            <View
              key={index}
              style={[
                dynamicStyles.counterDot,
                index === currentSuggestion
                  ? dynamicStyles.activeDot
                  : dynamicStyles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default AIAssistantWidget;
