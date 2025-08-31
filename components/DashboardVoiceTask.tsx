// 🎤 Dashboard Voice Task Component
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import VoiceChatButton from './VoiceChatButton';

interface DashboardVoiceTaskProps {
  userId: string;
  onTaskCreated?: (task: any) => void;
  style?: any;
}

const DashboardVoiceTask: React.FC<DashboardVoiceTaskProps> = ({
  userId,
  onTaskCreated,
  style
}) => {
  const { theme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [taskResponse, setTaskResponse] = useState<string>('');

  const handleVoiceTranscript = (transcript: string) => {
    console.log('📝 Voice transcript received:', transcript);
  };

  const handleVoiceResponse = (response: string, actions?: any[]) => {
    console.log('🤖 Voice response received:', response);
    setTaskResponse(response);
    
    // Look for task creation actions
    if (actions && actions.length > 0) {
      const taskActions = actions.filter(action => 
        action.type === 'create_task' || 
        action.action === 'create_task' ||
        action.text?.toLowerCase().includes('task')
      );
      
      if (taskActions.length > 0 && onTaskCreated) {
        taskActions.forEach(task => {
          onTaskCreated(task);
        });
        
        Alert.alert(
          'Task Created! ✅',
          'Your voice task has been created successfully.',
          [{ text: 'OK', onPress: () => setIsModalVisible(false) }]
        );
      }
    }
  };

  const handleVoiceError = (error: string) => {
    console.error('❌ Voice error:', error);
    Alert.alert('Voice Error', error);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    voiceTaskButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'light' ? '#fff' : '#2a2a2a',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#333',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    voiceTaskText: {
      color: theme === 'light' ? '#333' : '#fff',
      fontSize: 16,
      marginLeft: 12,
      fontWeight: '500',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme === 'light' ? '#fff' : '#2a2a2a',
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 16,
      textAlign: 'center',
    },
    modalSubtitle: {
      fontSize: 14,
      color: theme === 'light' ? '#666' : '#aaa',
      marginBottom: 24,
      textAlign: 'center',
    },
    closeButton: {
      marginTop: 20,
      backgroundColor: '#007AFF',
      borderRadius: 8,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    closeButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    responseText: {
      color: theme === 'light' ? '#333' : '#fff',
      fontSize: 14,
      lineHeight: 20,
      marginVertical: 16,
      textAlign: 'center',
    }
  });

  return (
    <View style={[dynamicStyles.container, style]}>
      {/* Voice Task Button */}
      <TouchableOpacity
        style={dynamicStyles.voiceTaskButton}
        onPress={() => setIsModalVisible(true)}
      >
        <MaterialCommunityIcons 
          name="microphone-plus" 
          size={24} 
          color="#007AFF" 
        />
        <Text style={dynamicStyles.voiceTaskText}>
          Create Task with Voice
        </Text>
      </TouchableOpacity>

      {/* Voice Task Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={dynamicStyles.modalContainer}>
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>
              🎤 Voice Task Creator
            </Text>
            
            <Text style={dynamicStyles.modalSubtitle}>
              Speak to create a new task. The AI will listen and help you organize your thoughts into actionable items.
            </Text>

            {/* Voice Chat Component */}
            <VoiceChatButton
              userId={userId}
              onTranscript={handleVoiceTranscript}
              onResponse={handleVoiceResponse}
              onError={handleVoiceError}
              size="large"
              disabled={!userId}
            />

            {/* Response Display */}
            {taskResponse && (
              <Text style={dynamicStyles.responseText}>
                {taskResponse}
              </Text>
            )}

            {/* Close Button */}
            <TouchableOpacity
              style={dynamicStyles.closeButton}
              onPress={() => {
                setIsModalVisible(false);
                setTaskResponse('');
              }}
            >
              <Text style={dynamicStyles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DashboardVoiceTask;
