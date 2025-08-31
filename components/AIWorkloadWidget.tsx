// AI Workload Widget - Shows burnout risk and workload score
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { aiAPI, AITaskOptimization } from '../services/aiAPI';

interface Props {
  userId: string;
}

const AIWorkloadWidget: React.FC<Props> = ({ userId }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [workloadData, setWorkloadData] = useState<AITaskOptimization | null>(null);

  useEffect(() => {
    loadWorkloadData();
  }, [userId]);

  const loadWorkloadData = async () => {
    try {
      setLoading(true);
      const data = await aiAPI.getTaskOptimization(userId);
      setWorkloadData(data);
    } catch (error) {
      console.error('Failed to load workload data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBurnoutColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getWorkloadColor = (score: number) => {
    if (score >= 80) return '#f44336';
    if (score >= 60) return '#ff9800';
    if (score >= 40) return '#ffc107';
    return '#4caf50';
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
      marginBottom: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme === 'light' ? '#000' : '#fff',
      marginLeft: 8,
    },
    scoreContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    scoreItem: {
      flex: 1,
      alignItems: 'center',
    },
    scoreValue: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    scoreLabel: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
      textAlign: 'center',
    },
    progressBar: {
      height: 6,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      borderRadius: 3,
      marginVertical: 8,
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    burnoutBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    burnoutText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
      textTransform: 'uppercase',
    },
    aiLabel: {
      fontSize: 10,
      color: '#666',
      marginTop: 4,
      textAlign: 'center',
    },
  });

  if (loading) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center', height: 120 }]}>
        <ActivityIndicator size="small" color={theme === 'light' ? '#000' : '#fff'} />
        <Text style={[dynamicStyles.aiLabel, { marginTop: 8 }]}>AI analyzing workload...</Text>
      </View>
    );
  }

  if (!workloadData) {
    return (
      <TouchableOpacity style={dynamicStyles.container} onPress={loadWorkloadData}>
        <View style={dynamicStyles.header}>
          <Ionicons name="refresh" size={20} color="#666" />
          <Text style={dynamicStyles.title}>AI Workload Monitor</Text>
        </View>
        <Text style={dynamicStyles.scoreLabel}>Tap to retry</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={dynamicStyles.container} onPress={loadWorkloadData}>
      <View style={dynamicStyles.header}>
        <Ionicons name="analytics" size={20} color="#4caf50" />
        <Text style={dynamicStyles.title}>AI Workload Monitor</Text>
      </View>

      <View style={dynamicStyles.scoreContainer}>
        <View style={dynamicStyles.scoreItem}>
          <Text style={[dynamicStyles.scoreValue, { color: getWorkloadColor(workloadData.workloadScore) }]}>
            {workloadData.workloadScore.toFixed(0)}
          </Text>
          <Text style={dynamicStyles.scoreLabel}>Workload Score</Text>
        </View>
        
        <View style={dynamicStyles.scoreItem}>
          <View style={[dynamicStyles.burnoutBadge, { backgroundColor: getBurnoutColor(workloadData.burnoutRisk) }]}>
            <Text style={dynamicStyles.burnoutText}>{workloadData.burnoutRisk}</Text>
          </View>
          <Text style={dynamicStyles.scoreLabel}>Burnout Risk</Text>
        </View>
      </View>

      <View style={dynamicStyles.progressBar}>
        <View 
          style={[
            dynamicStyles.progressFill, 
            { 
              width: `${workloadData.workloadScore}%`,
              backgroundColor: getWorkloadColor(workloadData.workloadScore)
            }
          ]} 
        />
      </View>

      <Text style={dynamicStyles.aiLabel}>🧠 AI-powered analysis • Tap to refresh</Text>
    </TouchableOpacity>
  );
};

export default AIWorkloadWidget;
