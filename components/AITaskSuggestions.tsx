import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AISuggestionsProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

interface AISuggestion {
  id: string;
  type: 'priority_change' | 'deadline_extension' | 'task_break' | 'reassignment';
  taskId: string;
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  impact: string;
}

const AITaskSuggestions: React.FC<AISuggestionsProps> = ({ visible, onClose, userId }) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSuggestions();
    }
  }, [visible]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      // Mock suggestions for now - replace with actual API call
      const mockSuggestions: AISuggestion[] = [
        {
          id: '1',
          type: 'priority_change',
          taskId: '123',
          title: 'Increase Priority: Project Report',
          description: 'Consider increasing priority to High',
          reasoning: 'Due date is approaching and this task has dependencies',
          confidence: 0.85,
          impact: 'Prevents potential delays in dependent tasks'
        },
        {
          id: '2',
          type: 'deadline_extension',
          taskId: '124',
          title: 'Extend Deadline: Code Review',
          description: 'Suggest extending deadline by 2 days',
          reasoning: 'Your current workload suggests this deadline may be too aggressive',
          confidence: 0.72,
          impact: 'Reduces stress and improves code quality'
        },
        {
          id: '3',
          type: 'task_break',
          taskId: '125',
          title: 'Break Down: Website Redesign',
          description: 'Split into smaller, manageable tasks',
          reasoning: 'Large tasks tend to be procrastinated based on your patterns',
          confidence: 0.90,
          impact: 'Increases completion rate by 40%'
        }
      ];
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Failed to load AI suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSuggestion = async (suggestion: AISuggestion) => {
    try {
      // Implement API call to accept suggestion
      console.log('Accepting suggestion:', suggestion.id);
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    } catch (error) {
      console.error('Failed to accept suggestion:', error);
    }
  };

  const handleRejectSuggestion = async (suggestion: AISuggestion) => {
    try {
      // Implement API call to reject suggestion
      console.log('Rejecting suggestion:', suggestion.id);
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    } catch (error) {
      console.error('Failed to reject suggestion:', error);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'priority_change': return 'flag-outline';
      case 'deadline_extension': return 'time-outline';
      case 'task_break': return 'git-branch-outline';
      case 'reassignment': return 'people-outline';
      default: return 'bulb-outline';
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>🤖 AI Suggestions</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#C6D0F5" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <Text style={styles.loading}>Analyzing your tasks...</Text>
          ) : suggestions.length === 0 ? (
            <Text style={styles.empty}>No suggestions at the moment. Great job staying on track! 🎉</Text>
          ) : (
            suggestions.map(suggestion => (
              <View key={suggestion.id} style={styles.suggestionCard}>
                <View style={styles.suggestionHeader}>
                  <Ionicons 
                    name={getIconForType(suggestion.type)} 
                    size={20} 
                    color="#C6D0F5" 
                  />
                  <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                  <View style={styles.confidence}>
                    <Text style={styles.confidenceText}>
                      {Math.round(suggestion.confidence * 100)}%
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.suggestionDescription}>
                  {suggestion.description}
                </Text>
                
                <Text style={styles.suggestionReasoning}>
                  💡 {suggestion.reasoning}
                </Text>
                
                <Text style={styles.suggestionImpact}>
                  📈 Impact: {suggestion.impact}
                </Text>
                
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAcceptSuggestion(suggestion)}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    <Text style={styles.actionText}>Accept</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleRejectSuggestion(suggestion)}
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                    <Text style={styles.actionText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '95%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C6D0F5',
  },
  content: {
    maxHeight: 400,
  },
  loading: {
    textAlign: 'center',
    color: '#CCCCCC',
    fontSize: 16,
    padding: 20,
  },
  empty: {
    textAlign: 'center',
    color: '#CCCCCC',
    fontSize: 16,
    padding: 20,
  },
  suggestionCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C6D0F5',
    flex: 1,
    marginLeft: 8,
  },
  confidence: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  suggestionReasoning: {
    fontSize: 13,
    color: '#FFA500',
    marginBottom: 8,
  },
  suggestionImpact: {
    fontSize: 13,
    color: '#00C896',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#00C896',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default AITaskSuggestions;
