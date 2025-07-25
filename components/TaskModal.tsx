import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
// Platform is already imported above
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Ionicons } from '@expo/vector-icons';
import { Task, TaskPriority, TaskStatus } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();

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
    }
  }, [editingTask, visible]);

  const handleSave = () => {
    if (!title.trim()) return;
    // Map frontend status/priority to backend format (lowercase)
    const status = (editingTask?.status || 'Pending').toLowerCase();
    const priorityBackend = priority.toLowerCase();
    // Use a valid UUID for new tasks
    const id = editingTask?.id || uuidv4();
    // Prepare dueDate and reminderAt as ISO strings
    const dueDateIso = dueDateObj ? dueDateObj.toISOString() : '';
    const reminderAtIso = reminderObj ? reminderObj.toISOString() : '';
    // Create task object with backend field names
    const taskObj: any = {
      id,
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
    };
    // Remove empty fields
    Object.keys(taskObj).forEach(key => (taskObj[key] === '' || taskObj[key] === undefined) && delete taskObj[key]);
    console.log('[TaskModal] handleSave', taskObj);
    onSave(taskObj);
  };

  const addAttachment = (type: 'file' | 'link', value: string) => {
    setAttachments([...attachments, { type, value }]);
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
            {/* Due Date Picker - Cross Platform */}
            {Platform.OS === 'web' ? (
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: theme === 'light' ? '#000' : '#fff', marginBottom: 4, display: 'block' }}>Due Date & Time</label>
                <ReactDatePicker
                  selected={dueDateObj}
                  onChange={(date: Date | null) => {
                    setDueDateObj(date);
                    if (date) {
                      const iso = date.toISOString();
                      setDueDate(iso);
                      console.log('[TaskModal] Picker selected dueDate:', iso);
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
                  <View pointerEvents="none">
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
                    const iso = date.toISOString();
                    setDueDate(iso);
                    console.log('[TaskModal] Picker selected dueDate:', iso);
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
                    if (date) setReminder(date.toISOString());
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
                  <View pointerEvents="none">
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
                    setReminder(date.toISOString());
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
            {/* Attachments: file and link */}
            <View style={styles.row}>
              <Text style={[styles.label, theme === 'light' && { color: '#000' }]}>Attachments:</Text>
              <TouchableOpacity onPress={() => addAttachment('link', prompt('Paste link:') || '')}>
                <Ionicons name="link" size={22} color={theme === 'light' ? '#007AFF' : '#007AFF'} style={{ marginHorizontal: 8 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => addAttachment('file', prompt('Paste file URL:') || '')}>
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
});

export default TaskModal;
