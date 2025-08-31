// 🎤 VoiceChatButton - Reusable Voice Chat Component
import React, { useEffect, useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  Animated 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import useVoiceConversation from '../hooks/useVoiceConversation';

interface VoiceChatButtonProps {
  userId: string;
  onTranscript?: (transcript: string) => void;
  onResponse?: (response: string, actions?: any[]) => void;
  onError?: (error: string) => void;
  size?: 'small' | 'medium' | 'large';
  style?: any;
  disabled?: boolean;
}

const VoiceChatButton: React.FC<VoiceChatButtonProps> = ({
  userId,
  onTranscript,
  onResponse,
  onError,
  size = 'medium',
  style,
  disabled = false
}) => {
  const { theme } = useTheme();
  
  // Create callbacks object for the hook
  const voiceCallbacks = {
    onTranscript,
    onResponse,
    onError
  };

  const {
    recordingState,
    playbackState,
    voiceSettings,
    startRecording,
    stopRecording,
    playLastResponse,
    toggleAudioEnabled,
    checkMicrophone,
    stopCurrentAudio
  } = useVoiceConversation(userId, voiceCallbacks);

  const [pulseAnim] = useState(new Animated.Value(1));
  const [micPermission, setMicPermission] = useState<boolean>(true);
  const [lastActionTime, setLastActionTime] = useState<number>(0); // Debounce button presses

  // Check microphone permission on mount
  useEffect(() => {
    const checkMic = async () => {
      const available = await checkMicrophone();
      setMicPermission(available);
    };
    checkMic();
  }, []);

  // Pulse animation during recording
  useEffect(() => {
    if (recordingState.isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [recordingState.isRecording]);

  const handleVoicePress = async () => {
    if (disabled) return;

    // 🚨 DEBOUNCE: Prevent rapid button presses
    const now = Date.now();
    if (now - lastActionTime < 1000) { // 1 second debounce
      console.warn('⚠️ Button press too fast, ignoring');
      return;
    }
    setLastActionTime(now);

    if (recordingState.isRecording) {
      await stopRecording();
    } else if (playbackState.isPlaying) {
      stopCurrentAudio();
    } else {
      if (!micPermission) {
        const available = await checkMicrophone();
        if (!available) return;
        setMicPermission(true);
      }
      await startRecording();
    }
  };

  const getButtonColor = () => {
    if (disabled) return theme === 'light' ? '#ccc' : '#666';
    if (recordingState.isRecording) return '#ff3b30';
    if (playbackState.isPlaying) return '#ff9500';
    return '#007AFF';
  };

  const getButtonIcon = () => {
    if (recordingState.isProcessing) return 'loading';
    if (recordingState.isRecording) return 'stop';
    if (playbackState.isPlaying) return 'stop';
    return 'microphone';
  };

  const getButtonText = () => {
    if (recordingState.isProcessing) return 'Processing...';
    if (recordingState.isRecording) return 'Stop Recording';
    if (playbackState.isPlaying) return 'Stop Audio';
    return 'Voice Chat';
  };

  const sizeStyles = {
    small: { width: 40, height: 40, borderRadius: 20 },
    medium: { width: 50, height: 50, borderRadius: 25 },
    large: { width: 60, height: 60, borderRadius: 30 }
  };

  const iconSizes = {
    small: 20,
    medium: 24,
    large: 28
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    voiceButton: {
      ...sizeStyles[size],
      backgroundColor: getButtonColor(),
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    buttonText: {
      color: theme === 'light' ? '#333' : '#fff',
      fontSize: 12,
      marginTop: 4,
      textAlign: 'center',
    },
    audioControls: {
      flexDirection: 'row',
      marginTop: 8,
      alignItems: 'center',
      gap: 12,
    },
    audioButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      gap: 8,
    },
    progressBar: {
      flex: 1,
      height: 4,
      backgroundColor: theme === 'light' ? '#e0e0e0' : '#666',
      borderRadius: 2,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#007AFF',
      borderRadius: 2,
    },
    progressText: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
    },
    errorText: {
      color: '#ff3b30',
      fontSize: 12,
      marginTop: 4,
      textAlign: 'center',
    },
    settingsButton: {
      position: 'absolute',
      top: -5,
      right: -5,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme === 'light' ? '#fff' : '#333',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#666',
    }
  });

  if (!micPermission) {
    return (
      <View style={[dynamicStyles.container, style]}>
        <TouchableOpacity
          style={[dynamicStyles.voiceButton, { backgroundColor: '#ff3b30' }]}
          onPress={checkMicrophone}
        >
          <MaterialCommunityIcons 
            name="microphone-off" 
            size={iconSizes[size]} 
            color="#fff" 
          />
        </TouchableOpacity>
        <Text style={dynamicStyles.errorText}>Mic Permission</Text>
      </View>
    );
  }

  return (
    <View style={[dynamicStyles.container, style]}>
      {/* Main Voice Button */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={dynamicStyles.voiceButton}
          onPress={handleVoicePress}
          disabled={disabled}
        >
          {recordingState.isProcessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons 
              name={getButtonIcon()} 
              size={iconSizes[size]} 
              color="#fff" 
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Settings Button */}
      <TouchableOpacity 
        style={dynamicStyles.settingsButton}
        onPress={toggleAudioEnabled}
      >
        <MaterialCommunityIcons 
          name={voiceSettings.audioEnabled ? "volume-high" : "volume-off"} 
          size={12} 
          color={theme === 'light' ? '#666' : '#aaa'} 
        />
      </TouchableOpacity>

      {/* Button Label */}
      {size !== 'small' && (
        <Text style={dynamicStyles.buttonText}>
          {getButtonText()}
        </Text>
      )}

      {/* Audio Controls */}
      {playbackState.isPlaying && (
        <View style={dynamicStyles.progressContainer}>
          <View style={dynamicStyles.progressBar}>
            <View 
              style={[
                dynamicStyles.progressFill, 
                { width: `${(playbackState.progress / playbackState.duration) * 100}%` }
              ]} 
            />
          </View>
          <Text style={dynamicStyles.progressText}>
            {Math.floor(playbackState.progress)}s
          </Text>
        </View>
      )}

      {/* Audio Controls Row */}
      {!recordingState.isRecording && !recordingState.isProcessing && (
        <View style={dynamicStyles.audioControls}>
          <TouchableOpacity 
            style={dynamicStyles.audioButton}
            onPress={playLastResponse}
            disabled={!voiceSettings.audioEnabled}
          >
            <MaterialCommunityIcons 
              name="replay" 
              size={16} 
              color={theme === 'light' ? '#666' : '#aaa'} 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Error Message */}
      {recordingState.error && (
        <Text style={dynamicStyles.errorText}>
          {recordingState.error}
        </Text>
      )}
    </View>
  );
};

export default VoiceChatButton;
