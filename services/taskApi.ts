import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api'; // Change to your backend URL

// Helper to get userId from AsyncStorage
async function getUserId() {
  const sessionStr = await AsyncStorage.getItem('userSession');
  if (!sessionStr) return null;
  try {
    const session = JSON.parse(sessionStr);
    return session.userId;
  } catch {
    return null;
  }
}

export async function fetchTasks() {
  const userId = await getUserId();
  if (!userId) throw new Error('No user ID');
  const res = await axios.get(`${API_BASE_URL}/tasks`, { params: { user_id: userId } });
  return res.data;
}

export async function createTask(task) {
  const userId = await getUserId();
  if (!userId) throw new Error('No user ID');
  // Prepare payload with correct field names and ISO strings
  const payload = {
    ...task,
    userId,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
    reminderAt: task.reminder ? new Date(task.reminder).toISOString() : undefined,
  };
  // Remove reminder from payload if present
  delete payload.reminder;
  console.log('[taskApi] createTask PAYLOAD', JSON.stringify(payload, null, 2));
  try {
    const res = await axios.post(`${API_BASE_URL}/tasks`, payload);
    console.log('[taskApi] createTask response', res.data);
    return res.data;
  } catch (err) {
    console.error('[taskApi] createTask error', err);
    throw err;
  }
}


export async function updateTask(id, updates) {
  // Prepare payload with correct field names and ISO strings
  const payload = {
    ...updates,
    priority: updates.priority ? updates.priority.toLowerCase() : updates.priority,
    dueDate: updates.dueDate ? new Date(updates.dueDate).toISOString() : undefined,
    reminderAt: updates.reminder ? new Date(updates.reminder).toISOString() : undefined,
  };
  // Remove reminder from payload if present
  delete payload.reminder;
  // Remove undefined fields (PATCH should only send changed fields)
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
  console.log('[taskApi] updateTask PAYLOAD', JSON.stringify(payload, null, 2));
  try {
    const res = await axios.patch(`${API_BASE_URL}/tasks/${id}`, payload);
    console.log('[taskApi] updateTask response', res.data);
    return res.data;
  } catch (err) {
    console.error('[taskApi] updateTask error', err);
    throw err;
  }
}

export async function deleteTask(id) {
  const res = await axios.delete(`${API_BASE_URL}/tasks/${id}`);
  return res.data;
}
