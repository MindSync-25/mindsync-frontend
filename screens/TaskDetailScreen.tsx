import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks, Task } from '../context/TaskContext';

type TaskDetailRouteProp = RouteProp<{ params: { id: string } }, 'params'>;

type Nav = ReturnType<typeof useNavigation>;

const TaskDetailScreen = () => {
  const route = useRoute<TaskDetailRouteProp>();
  const navigation = useNavigation();
  const { state } = useTasks();
  const task = state.tasks.find(t => t.id === route.params.id);

  if (!task) return <View style={styles.container}><Text style={styles.empty}>Task not found.</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.label}>Description:</Text>
      <Text style={styles.value}>{task.description || 'No description'}</Text>
      <Text style={styles.label}>Priority:</Text>
      <Text style={styles.value}>{task.priority}</Text>
      <Text style={styles.label}>Due Date:</Text>
      <Text style={styles.value}>{task.dueDate || '—'}</Text>
      <Text style={styles.label}>Reminder:</Text>
      <Text style={styles.value}>{task.reminder || '—'}</Text>
      <Text style={styles.label}>Tags:</Text>
      <Text style={styles.value}>{task.tags?.join(', ') || '—'}</Text>
      <Text style={styles.label}>Status:</Text>
      <Text style={styles.value}>{task.status}</Text>
      <Text style={styles.label}>Attachments:</Text>
      {task.attachments && task.attachments.length > 0 ? (
        task.attachments.map((a, i) => (
          <Text key={i} style={styles.value}>{a.type}: {a.value}</Text>
        ))
      ) : <Text style={styles.value}>—</Text>}
      <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('TaskManagement', { editId: task.id })}>
        <Ionicons name="pencil" size={20} color="#fff" />
        <Text style={styles.editBtnText}>Edit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#181818',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  label: {
    color: '#aaa',
    fontWeight: '600',
    marginTop: 12,
  },
  value: {
    color: '#fff',
    fontSize: 15,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 32,
    alignSelf: 'flex-start',
  },
  editBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  empty: {
    color: '#aaa',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default TaskDetailScreen;
