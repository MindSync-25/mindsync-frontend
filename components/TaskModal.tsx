import React, { useState, useEffect } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView, FlatList } from 'react-native';
// Platform is already imported above
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Ionicons } from '@expo/vector-icons';
import { Task, TaskPriority, TaskStatus } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { fetchAllTasksForDependencies } from '../services/taskApi';

interface Props {
  visible: boolean;
  onClose: () => void;
  editingTask: Task | null;
  onSave: (task: Task) => void;
}

const priorities: TaskPriority[] = ['Low', 'Medium', 'High'];

const TaskModal: React.FC<Props> = ({ visible, onClose, editingTask, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Low');
  const [dueDate, setDueDate] = useState('');
  const [reminder, setReminder] = useState('');
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [dueDateObj, setDueDateObj] = useState<Date | null>(null);
  const [reminderObj, setReminderObj] = useState<Date | null>(null);
  const [tags, setTags] = useState('');
  const [attachments, setAttachments] = useState<Array<{ type: 'file' | 'link'; value: string }>>([]);
  // Hidden AI fields
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | undefined>(undefined);
  const [sourceText, setSourceText] = useState('');
  // ✅ NEW: Dependencies functionality
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [showDependenciesModal, setShowDependenciesModal] = useState(false);
  const [loadingDependencies, setLoadingDependencies] = useState(false);
  const { theme } = useTheme();
  // Validation error for date logic
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (editingTask) {
      console.log('[TaskModal] Editing task:', editingTask);
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      
      // Map backend priority (lowercase) to frontend (capitalized)
      const backendPriority = (editingTask as any).priority || editingTask.priority;
      const mappedPriority = backendPriority 
        ? (backendPriority.charAt(0).toUpperCase() + backendPriority.slice(1).toLowerCase()) as TaskPriority
        : 'Low';
      setPriority(mappedPriority);
      
      setDueDate(editingTask.dueDate || '');
      
      // Map backend reminderAt to frontend reminder
      const backendReminder = (editingTask as any).reminderAt || editingTask.reminder;
      setReminder(backendReminder || '');
      
      setTags((editingTask.tags || []).join(','));
      setAttachments(editingTask.attachments || []);
      setAiGenerated(!!editingTask.aiGenerated);
      setAiConfidence(editingTask.aiConfidence);
      setSourceText(editingTask.sourceText || '');
      
      // ✅ NEW: Set dependencies
      setSelectedDependencies(editingTask.dependsOn || []);
      
      // Set date objects for pickers
      if (editingTask.dueDate) {
        setDueDateObj(new Date(editingTask.dueDate));
      } else {
        setDueDateObj(null);
      }
      
      if (backendReminder) {
        console.log('[TaskModal] Setting reminder:', backendReminder);
        try {
          setReminderObj(new Date(backendReminder));
        } catch (error) {
          console.error('[TaskModal] Error parsing reminder:', error);
          setReminderObj(null);
        }
      } else {
        setReminderObj(null);
      }
    } else {
      setTitle('');
      setDescription('');
      setPriority('Low');
      setDueDate('');
      setReminder('');
      setTags('');
      setAttachments([]);
      setAiGenerated(false);
      setAiConfidence(undefined);
      setSourceText('');
      setDueDateObj(null);
      setReminderObj(null);
      // ✅ NEW: Reset dependencies
      setSelectedDependencies([]);
    }
  }, [editingTask, visible]);

  // ✅ NEW: Load available tasks for dependencies
  const loadAvailableTasks = async () => {
    if (loadingDependencies) return;
    
    setLoadingDependencies(true);
    try {
      console.log('🔗 Loading available tasks for dependencies...');
      const tasks = await fetchAllTasksForDependencies();
      
      // Filter out the current task (if editing) to prevent self-dependency
      const filteredTasks = editingTask 
        ? tasks.filter(task => task.id !== editingTask.id)
        : tasks;
        
      setAvailableTasks(filteredTasks);
      console.log('🔗 Loaded', filteredTasks.length, 'available tasks for dependencies');
    } catch (error) {
      console.error('❌ Failed to load available tasks:', error);
    } finally {
      setLoadingDependencies(false);
    }
  };

  // ✅ NEW: Handle dependency selection
  const handleDependencyToggle = (taskId: string) => {
    setSelectedDependencies(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  // ✅ NEW: Open dependencies selection modal
  const openDependenciesModal = () => {
    loadAvailableTasks();
    setShowDependenciesModal(true);
  };

  // ✅ FIXED: Helper function to format date while preserving local timezone
  const formatDateForBackend = (date: Date): string => {
    // Get local date/time components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    // Format as local datetime that backend can understand
    const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    console.log('📅 Date formatting - Original:', date, 'Formatted:', localDateTime);
    return localDateTime;
  };

  const handleSave = () => {
    setDateError('');
    if (!title.trim()) return;
    // Validation: due date must not be before today
    if (dueDateObj) {
      const now = new Date();
      // Remove seconds/milliseconds for comparison
      now.setSeconds(0, 0);
      if (dueDateObj < now) {
        setDateError('Due date/time cannot be before today.');
        return;
      }
    }
    // Validation: due date must be after reminder
    if (dueDateObj && reminderObj) {
      if (dueDateObj <= reminderObj) {
        setDateError('Reminder date/time must be after the Due time.');
        return;
      }
    }
    // Map frontend status/priority to backend format (lowercase)
    const status = (editingTask?.status || 'Pending').toLowerCase();
    const priorityBackend = priority.toLowerCase();
    
    // ✅ FIXED: Only include ID for existing tasks (updates), not for new tasks (creation)
    // Backend generates ID for new tasks, frontend should not send it
    
    // ✅ FIXED: Prepare dueDate and reminderAt preserving local timezone
    const dueDateIso = dueDateObj ? formatDateForBackend(dueDateObj) : '';
    const reminderAtIso = reminderObj ? formatDateForBackend(reminderObj) : '';
    
    // Create task object with backend field names
    const taskObj: any = {
      // Only include ID if this is an existing task (editing)
      ...(editingTask?.id && { id: editingTask.id }),
      title: title.trim(),
      description,
      priority: priorityBackend,
      dueDate: dueDateIso,
      reminderAt: reminderAtIso,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      attachments,
      status,
      aiGenerated,
      aiConfidence,
      sourceText,
      // ✅ NEW: Include dependencies
      dependsOn: selectedDependencies,
    };
    // Remove empty fields
    Object.keys(taskObj).forEach(key => (taskObj[key] === '' || taskObj[key] === undefined) && delete taskObj[key]);
    console.log('[TaskModal] handleSave', taskObj);
    onSave(taskObj);
  };

  const addAttachment = (type: 'file' | 'link', value: string) => {
    setAttachments([...attachments, { type, value }]);
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        addAttachment('file', file.name);
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  const addLink = () => {
    const link = prompt('Paste link:');
    if (link) {
      addAttachment('link', link);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay, theme === 'light' && { backgroundColor: 'rgba(255,255,255,0.7)' }] }>
        <View style={[styles.modal, theme === 'light' && { backgroundColor: '#fff' }] }>
          <ScrollView>
            <Text style={[styles.header, theme === 'light' && { color: '#000' }]}>{editingTask ? 'Edit Task' : 'New Task'}</Text>
            <TextInput
              style={[styles.input, theme === 'light' && { backgroundColor: '#f5f5f5', color: '#000', borderColor: '#e0e0e0' }]}
              placeholder="Title *"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={theme === 'light' ? '#888' : '#888'}
            />
            <TextInput
              style={[styles.input, { minHeight: 60 }, theme === 'light' && { backgroundColor: '#f5f5f5', color: '#000', borderColor: '#e0e0e0' }]}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={theme === 'light' ? '#888' : '#888'}
              multiline
            />
            <View style={styles.row}>
              <Text style={[styles.label, theme === 'light' && { color: '#000' }]}>Priority:</Text>
              {priorities.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityBtn, priority === p && styles.priorityBtnActive, theme === 'light' && { borderColor: '#e0e0e0', backgroundColor: priority === p ? '#007AFF' : '#f5f5f5' }]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={{ color: priority === p ? '#fff' : (theme === 'light' ? '#000' : '#aaa') }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Date validation error */}
            {dateError ? (
              <Text style={{ color: 'red', marginBottom: 4, fontSize: 13 }}>{dateError}</Text>
            ) : null}
            {/* Due Date Picker - Cross Platform */}
            {Platform.OS === 'web' ? (
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: theme === 'light' ? '#000' : '#fff', marginBottom: 4, display: 'block' }}>Due Date & Time</label>
                <ReactDatePicker
                  selected={dueDateObj}
                  onChange={(date: Date | null) => {
                    setDueDateObj(date);
                    if (date) {
                      // ✅ FIXED: Use local timezone formatting instead of toISOString()
                      const localDateTime = formatDateForBackend(date);
                      setDueDate(localDateTime);
                      console.log('[TaskModal] Picker selected dueDate:', localDateTime);
                    } else {
                      setDueDate('');
                    }
                  }}
                  showTimeSelect
                  dateFormat="yyyy-MM-dd h:mm aa"
                  timeFormat="h:mm aa"
                  className="react-datepicker__input-container"
                  customInput={<input style={{
                    backgroundColor: theme === 'light' ? '#f5f5f5' : '#181818',
                    color: theme === 'light' ? '#000' : '#fff',
                    borderRadius: 8,
                    padding: 12,
                    border: '1px solid #e0e0e0',
                    fontSize: 15,
                    width: '100%'
                  }} />}
                />
              </div>
            ) : (
              <>
                <TouchableOpacity onPress={() => setShowDuePicker(true)}>
                  <View style={{ pointerEvents: 'none' as const }}>
                    <TextInput
                      style={[styles.input, theme === 'light' && { backgroundColor: '#f5f5f5', color: '#000', borderColor: '#e0e0e0' }]}
                      placeholder="Due Date & Time"
                      value={dueDateObj ? formatDateForInput(dueDateObj) : ''}
                      editable={false}
                      placeholderTextColor={theme === 'light' ? '#888' : '#888'}
                    />
                  </View>
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={showDuePicker}
                  mode="datetime"
                  onConfirm={date => {
                    setShowDuePicker(false);
                    setDueDateObj(date);
                    // ✅ FIXED: Use local timezone formatting instead of toISOString()
                    const localDateTime = formatDateForBackend(date);
                    setDueDate(localDateTime);
                    console.log('[TaskModal] Picker selected dueDate:', localDateTime);
                  }}
                  onCancel={() => setShowDuePicker(false)}
                  date={dueDateObj || new Date()}
                  themeVariant={theme}
                />
              </>
            )}
            {/* Reminder Picker - Cross Platform */}
            {Platform.OS === 'web' ? (
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: theme === 'light' ? '#000' : '#fff', marginBottom: 4, display: 'block' }}>Reminder</label>
                <ReactDatePicker
                  selected={reminderObj}
                  onChange={(date: Date | null) => {
                    setReminderObj(date);
                    // ✅ FIXED: Use local timezone formatting instead of toISOString()
                    if (date) setReminder(formatDateForBackend(date));
                    else setReminder('');
                  }}
                  showTimeSelect
                  dateFormat="yyyy-MM-dd h:mm aa"
                  timeFormat="h:mm aa"
                  className="react-datepicker__input-container"
                  customInput={<input style={{
                    backgroundColor: theme === 'light' ? '#f5f5f5' : '#181818',
                    color: theme === 'light' ? '#000' : '#fff',
                    borderRadius: 8,
                    padding: 12,
                    border: '1px solid #e0e0e0',
                    fontSize: 15,
                    width: '100%'
                  }} />}
                />
              </div>
            ) : (
              <>
                <TouchableOpacity onPress={() => setShowReminderPicker(true)}>
                  <View style={{ pointerEvents: 'none' as const }}>
                    <TextInput
                      style={[styles.input, theme === 'light' && { backgroundColor: '#f5f5f5', color: '#000', borderColor: '#e0e0e0' }]}
                      placeholder="Reminder"
                      value={reminder}
                      editable={false}
                      placeholderTextColor={theme === 'light' ? '#888' : '#888'}
                    />
                  </View>
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={showReminderPicker}
                  mode="datetime"
                  onConfirm={date => {
                    setShowReminderPicker(false);
                    setReminderObj(date);
                    // ✅ FIXED: Use local timezone formatting instead of toISOString()
                    setReminder(formatDateForBackend(date));
                  }}
                  onCancel={() => setShowReminderPicker(false)}
                  date={reminderObj || new Date()}
                  themeVariant={theme}
                  is24Hour={false}
                />
              </>
            )}
            <TextInput
              style={[styles.input, theme === 'light' && { backgroundColor: '#f5f5f5', color: '#000', borderColor: '#e0e0e0' }]}
              placeholder="Tags (comma separated)"
              value={tags}
              onChangeText={setTags}
              placeholderTextColor={theme === 'light' ? '#888' : '#888'}
            />

            {/* ✅ NEW: Dependencies Section */}
            <View style={styles.dependenciesSection}>
              <View style={styles.row}>
                <Text style={[styles.label, theme === 'light' && { color: '#000' }]}>Depends On:</Text>
                <TouchableOpacity onPress={openDependenciesModal} style={styles.dependencyButton}>
                  <Ionicons name="link" size={20} color={theme === 'light' ? '#007AFF' : '#007AFF'} />
                  <Text style={[styles.dependencyButtonText, theme === 'light' && { color: '#007AFF' }]}>
                    Select Tasks ({selectedDependencies.length})
                  </Text>
                </TouchableOpacity>
              </View>
              
              {selectedDependencies.length > 0 && (
                <View style={styles.selectedDependencies}>
                  {selectedDependencies.map((depId) => {
                    const depTask = availableTasks.find(task => task.id === depId);
                    return (
                      <View key={depId} style={[styles.dependencyChip, theme === 'light' && styles.dependencyChipLight]}>
                        <Text style={[styles.dependencyChipText, theme === 'light' && { color: '#000' }]}>
                          {depTask?.title || `Task ${depId}`}
                        </Text>
                        <TouchableOpacity onPress={() => handleDependencyToggle(depId)}>
                          <Ionicons name="close" size={16} color={theme === 'light' ? '#666' : '#aaa'} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Attachments: file and link */}
            <View style={styles.row}>
              <Text style={[styles.label, theme === 'light' && { color: '#000' }]}>Attachments:</Text>
              <TouchableOpacity onPress={addLink}>
                <Ionicons name="link" size={22} color={theme === 'light' ? '#007AFF' : '#007AFF'} style={{ marginHorizontal: 8 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={pickFile}>
                <Ionicons name="attach" size={22} color={theme === 'light' ? '#007AFF' : '#007AFF'} style={{ marginHorizontal: 8 }} />
              </TouchableOpacity>
            </View>
            {/* List attachments */}
            {attachments.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                {attachments.map((a, i) => (
                  <Text key={i} style={[styles.attachmentText, theme === 'light' && { color: '#000' }]}>{a.type}: {a.value}</Text>
                ))}
              </View>
            )}
            {/* Hidden AI fields (not shown in UI, but included in state) */}
            <View style={styles.row}>
              <TouchableOpacity style={[styles.saveBtn, theme === 'light' && { backgroundColor: '#007AFF' }]} onPress={handleSave}>
                <Text style={[styles.saveBtnText, theme === 'light' && { color: '#fff' }]}>{editingTask ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelBtn, theme === 'light' && { backgroundColor: '#e0e0e0' }]} onPress={onClose}>
                <Text style={[styles.cancelBtnText, theme === 'light' && { color: '#000' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* ✅ NEW: Dependencies Selection Modal */}
      <Modal
        visible={showDependenciesModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.dependenciesModal, theme === 'light' && styles.dependenciesModalLight]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, theme === 'light' && { color: '#000' }]}>
                Select Dependencies
              </Text>
              <TouchableOpacity onPress={() => setShowDependenciesModal(false)}>
                <Ionicons name="close" size={24} color={theme === 'light' ? '#000' : '#fff'} />
              </TouchableOpacity>
            </View>
            
            {loadingDependencies ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, theme === 'light' && { color: '#000' }]}>
                  Loading tasks...
                </Text>
              </View>
            ) : (
              <FlatList
                data={availableTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.taskItem,
                      selectedDependencies.includes(item.id) && styles.taskItemSelected,
                      theme === 'light' && styles.taskItemLight
                    ]}
                    onPress={() => handleDependencyToggle(item.id)}
                  >
                    <View style={styles.taskItemContent}>
                      <Text style={[styles.taskItemTitle, theme === 'light' && { color: '#000' }]}>
                        {item.title}
                      </Text>
                      {item.description && (
                        <Text style={[styles.taskItemDescription, theme === 'light' && { color: '#666' }]}>
                          {item.description.substring(0, 50)}
                          {item.description.length > 50 ? '...' : ''}
                        </Text>
                      )}
                    </View>
                    {selectedDependencies.includes(item.id) && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, theme === 'light' && { color: '#666' }]}>
                      No tasks available for dependencies
                    </Text>
                  </View>
                )}
              />
            )}
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.doneButton, theme === 'light' && styles.doneButtonLight]}
                onPress={() => setShowDependenciesModal(false)}
              >
                <Text style={[styles.doneButtonText, theme === 'light' && { color: '#007AFF' }]}>
                  Done ({selectedDependencies.length} selected)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

// Format date for input field (e.g., 'Jul 25, 2025, 2:30 PM')
function formatDateForInput(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 20,
    width: Platform.OS === 'web' ? 400 : '90%',
    maxHeight: '90%',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#181818',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#aaa',
    fontSize: 15,
    marginRight: 8,
  },
  priorityBtn: {
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#444',
  },
  priorityBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginRight: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cancelBtn: {
    backgroundColor: '#444',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 15,
  },
  attachmentText: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 2,
  },
  // ✅ NEW: Dependencies styles
  dependenciesSection: {
    marginBottom: 12,
  },
  dependencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#181818',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  dependencyButtonText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 6,
  },
  selectedDependencies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  dependencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    margin: 2,
  },
  dependencyChipLight: {
    backgroundColor: '#e0e0e0',
  },
  dependencyChipText: {
    color: '#fff',
    fontSize: 12,
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dependenciesModal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
  },
  dependenciesModalLight: {
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#aaa',
    fontSize: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#333',
  },
  taskItemLight: {
    backgroundColor: '#f5f5f5',
  },
  taskItemSelected: {
    backgroundColor: '#007AFF20',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  taskItemContent: {
    flex: 1,
  },
  taskItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  taskItemDescription: {
    fontSize: 14,
    color: '#aaa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
  },
  modalFooter: {
    marginTop: 16,
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  doneButtonLight: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TaskModal;
