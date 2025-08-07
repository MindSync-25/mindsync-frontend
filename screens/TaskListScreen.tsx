import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { useNavigation } from '@react-navigation/native';

const TaskListScreen: React.FC = () => {
  const { theme } = useTheme();
  const { state } = useTasks();
  const navigation = useNavigation();

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
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#007AFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    taskItem: {
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 4,
    },
    taskDescription: {
      fontSize: 14,
      color: theme === 'light' ? '#666' : '#aaa',
      marginBottom: 8,
    },
    taskMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: '#007AFF20',
    },
    statusText: {
      fontSize: 12,
      color: '#007AFF',
      fontWeight: '500',
    },
    dueDate: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 18,
      color: theme === 'light' ? '#666' : '#aaa',
      textAlign: 'center',
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme === 'light' ? '#999' : '#666',
      textAlign: 'center',
      marginTop: 8,
    },
  });

  const renderTaskItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={dynamicStyles.taskItem}>
      <Text style={dynamicStyles.taskTitle}>{item.title}</Text>
      {item.description && (
        <Text style={dynamicStyles.taskDescription}>{item.description}</Text>
      )}
      <View style={dynamicStyles.taskMeta}>
        <View style={dynamicStyles.statusBadge}>
          <Text style={dynamicStyles.statusText}>
            {item.status?.toUpperCase() || 'PENDING'}
          </Text>
        </View>
        {item.dueDate && (
          <Text style={dynamicStyles.dueDate}>
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Tasks</Text>
        <TouchableOpacity style={dynamicStyles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {state.tasks.length > 0 ? (
        <FlatList
          data={state.tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      ) : (
        <View style={dynamicStyles.emptyState}>
          <Ionicons
            name="checkbox-outline"
            size={80}
            color={theme === 'light' ? '#ccc' : '#555'}
          />
          <Text style={dynamicStyles.emptyText}>No tasks yet</Text>
          <Text style={dynamicStyles.emptySubtext}>
            Tap the + button to create your first task
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default TaskListScreen;
