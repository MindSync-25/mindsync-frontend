import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface TaskDependenciesProps {
  visible: boolean;
  onClose: () => void;
  taskId: string;
}

const TaskDependencies: React.FC<TaskDependenciesProps> = ({ 
  visible, 
  onClose, 
  taskId 
}) => {
  const { theme } = useTheme();
  const [dependencies, setDependencies] = useState<string[]>([]);

  if (!visible) return null;

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: theme === 'light' ? '#fff' : '#2a2a2a',
      borderRadius: 20,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    content: {
      flex: 1,
    },
    emptyText: {
      color: '#888',
      textAlign: 'center',
      marginTop: 40,
    },
  });

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Task Dependencies</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={theme === 'light' ? '#000' : '#fff'} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <Text style={styles.emptyText}>
            Dependencies feature coming soon...
          </Text>
        </ScrollView>
      </View>
    </View>
  );
};

export default TaskDependencies;