import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import * as taskApi from '../services/taskApi';

interface VoiceTaskCreatorProps {
  visible: boolean;
  onClose: () => void;
  onTaskCreated: (task: any) => void;
}

const VoiceTaskCreator: React.FC<VoiceTaskCreatorProps> = ({
  visible,
  onClose,
  onTaskCreated,
}) => {
  const { theme } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedTask, setParsedTask] = useState<any>(null);

  const startRecording = async () => {
    setIsRecording(true);
    // Simulate recording - in real implementation, use expo-av or react-native-voice
    setTimeout(() => {
      setIsRecording(false);
      setIsProcessing(true);
      
      // Simulate AI processing
      setTimeout(() => {
        const mockTranscript = "Create a task to review quarterly budget with high priority due tomorrow";
        const mockTask = {
          title: "Review quarterly budget",
          description: "Quarterly financial review and analysis",
          priority: "High",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        
        setTranscript(mockTranscript);
        setParsedTask(mockTask);
        setIsProcessing(false);
      }, 2000);
    }, 3000);
  };

  const createTask = async () => {
    if (parsedTask) {
      onTaskCreated(parsedTask);
      onClose();
      resetState();
    }
  };

  const resetState = () => {
    setIsRecording(false);
    setIsProcessing(false);
    setTranscript('');
    setParsedTask(null);
  };

  const dynamicStyles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderRadius: 20,
      padding: 24,
      margin: 20,
      width: '90%',
      maxWidth: 400,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
    recordingArea: {
      alignItems: 'center',
      marginBottom: 24,
    },
    recordButton: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: isRecording ? '#FF3B30' : '#007AFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    recordButtonPulse: {
      transform: [{ scale: isRecording ? 1.1 : 1 }],
    },
    statusText: {
      fontSize: 16,
      color: theme === 'light' ? '#666' : '#aaa',
      textAlign: 'center',
      marginBottom: 8,
    },
    transcript: {
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#2a2a2a',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    transcriptText: {
      fontSize: 14,
      color: theme === 'light' ? '#000' : '#fff',
      lineHeight: 20,
    },
    taskPreview: {
      backgroundColor: theme === 'light' ? '#e3f2fd' : '#1e3a8a',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 8,
    },
    taskDetail: {
      fontSize: 14,
      color: theme === 'light' ? '#666' : '#aaa',
      marginBottom: 4,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    primaryButton: {
      backgroundColor: '#007AFF',
    },
    secondaryButton: {
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    primaryButtonText: {
      color: '#fff',
    },
    secondaryButtonText: {
      color: theme === 'light' ? '#000' : '#fff',
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={dynamicStyles.modal}>
        <View style={dynamicStyles.container}>
          {/* Header */}
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.title}>Voice Task Creator</Text>
            <TouchableOpacity
              style={dynamicStyles.closeButton}
              onPress={() => {
                onClose();
                resetState();
              }}
            >
              <Ionicons name="close" size={20} color={theme === 'light' ? '#000' : '#fff'} />
            </TouchableOpacity>
          </View>

          {/* Recording Area */}
          <View style={dynamicStyles.recordingArea}>
            <TouchableOpacity
              style={[
                dynamicStyles.recordButton,
                isRecording && dynamicStyles.recordButtonPulse,
              ]}
              onPress={startRecording}
              disabled={isRecording || isProcessing}
            >
              <MaterialCommunityIcons
                name={isRecording ? "microphone" : "microphone-outline"}
                size={40}
                color="#fff"
              />
            </TouchableOpacity>

            <Text style={dynamicStyles.statusText}>
              {isRecording
                ? "Listening... Speak naturally"
                : isProcessing
                ? "Processing your request..."
                : "Tap to start recording"}
            </Text>
          </View>

          {/* Transcript */}
          {transcript && (
            <View style={dynamicStyles.transcript}>
              <Text style={dynamicStyles.transcriptText}>"{transcript}"</Text>
            </View>
          )}

          {/* Task Preview */}
          {parsedTask && (
            <View style={dynamicStyles.taskPreview}>
              <Text style={dynamicStyles.taskTitle}>{parsedTask.title}</Text>
              <Text style={dynamicStyles.taskDetail}>
                Priority: {parsedTask.priority}
              </Text>
              <Text style={dynamicStyles.taskDetail}>
                Due: {new Date(parsedTask.dueDate).toLocaleDateString()}
              </Text>
              {parsedTask.description && (
                <Text style={dynamicStyles.taskDetail}>
                  {parsedTask.description}
                </Text>
              )}
            </View>
          )}

          {/* Actions */}
          {parsedTask && (
            <View style={dynamicStyles.actions}>
              <TouchableOpacity
                style={[dynamicStyles.button, dynamicStyles.secondaryButton]}
                onPress={() => {
                  setParsedTask(null);
                  setTranscript('');
                }}
              >
                <Text style={[dynamicStyles.buttonText, dynamicStyles.secondaryButtonText]}>
                  Try Again
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.button, dynamicStyles.primaryButton]}
                onPress={createTask}
              >
                <Text style={[dynamicStyles.buttonText, dynamicStyles.primaryButtonText]}>
                  Create Task
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default VoiceTaskCreator;
