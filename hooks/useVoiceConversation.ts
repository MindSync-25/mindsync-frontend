// 🎤 useVoiceConversation Hook - Complete Voice Chat Logic
import { useState, useCallback, useRef, useEffect } from 'react';
import { aiAPI, VoiceConversationResponse } from '../services/aiAPI';
import { voiceService, VoiceRecordingState, VoicePlaybackState } from '../services/voiceService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VoiceConversationHook {
  // Recording state
  recordingState: VoiceRecordingState;
  playbackState: VoicePlaybackState;
  
  // Voice settings
  voiceSettings: {
    audioEnabled: boolean;
    autoPlay: boolean;
    volume: number;
  };
  
  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  sendVoiceMessage: (audioBlob: Blob) => Promise<VoiceConversationResponse>;
  playLastResponse: () => Promise<void>;
  toggleAudioEnabled: () => void;
  setVolume: (volume: number) => void;
  
  // Utilities
  checkMicrophone: () => Promise<boolean>;
  stopCurrentAudio: () => void;
}

interface VoiceConversationCallbacks {
  onTranscript?: (transcript: string) => void;
  onResponse?: (response: string, actions?: any[]) => void;
  onError?: (error: string) => void;
}

export const useVoiceConversation = (userId: string, callbacks?: VoiceConversationCallbacks): VoiceConversationHook => {
  const [recordingState, setRecordingState] = useState<VoiceRecordingState>({
    isRecording: false,
    isProcessing: false,
    audioBlob: null,
    transcript: '',
    error: null
  });

  const [playbackState, setPlaybackState] = useState<VoicePlaybackState>({
    isPlaying: false,
    currentAudio: null,
    progress: 0,
    duration: 0
  });

  const [voiceSettings, setVoiceSettings] = useState({
    audioEnabled: true,
    autoPlay: true,
    volume: 0.8
  });

  const [voiceRequirements, setVoiceRequirements] = useState<any>(null);
  const lastAudioBlobRef = useRef<Blob | null>(null);
  const lastResponseAudioRef = useRef<Blob | null>(null);
  const isProcessingRef = useRef<boolean>(false); // Prevent multiple simultaneous requests

  // Load voice requirements from backend v2 on mount
  useEffect(() => {
    const loadVoiceRequirements = async () => {
      try {
        console.log('📋 Loading voice requirements from backend v2...');
        const requirements = await aiAPI.getVoiceRequirements();
        setVoiceRequirements(requirements);
        console.log('✅ Voice requirements loaded:', requirements);
      } catch (error) {
        console.warn('⚠️ Could not load voice requirements, using defaults');
        setVoiceRequirements({
          format: 'WAV',
          sampleRate: 16000,
          channels: 1,
          endpoint: '/api/voice/v2/conversation'
        });
      }
    };

    if (userId) {
      loadVoiceRequirements();
    }
  }, [userId]);

  // Load voice settings from storage
  const loadVoiceSettings = useCallback(async () => {
    try {
      const settings = await AsyncStorage.getItem('voiceSettings');
      if (settings) {
        setVoiceSettings(JSON.parse(settings));
      }
    } catch (error) {
      console.warn('Could not load voice settings:', error);
    }
  }, []);

  // Save voice settings to storage
  const saveVoiceSettings = useCallback(async (newSettings: typeof voiceSettings) => {
    try {
      await AsyncStorage.setItem('voiceSettings', JSON.stringify(newSettings));
      setVoiceSettings(newSettings);
    } catch (error) {
      console.warn('Could not save voice settings:', error);
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setRecordingState(prev => ({ ...prev, isRecording: true, error: null }));
      
      const result = await voiceService.startRecording();
      
      if (!result.success) {
        setRecordingState(prev => ({ 
          ...prev, 
          isRecording: false, 
          error: result.error || 'Failed to start recording' 
        }));
      }
    } catch (error: any) {
      console.error('Start recording error:', error);
      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: false, 
        error: error.message 
      }));
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      setRecordingState(prev => ({ ...prev, isRecording: false, isProcessing: true }));
      
      const result = await voiceService.stopRecording();
      
      if (result.success && result.audioBlob) {
        setRecordingState(prev => ({ 
          ...prev, 
          audioBlob: result.audioBlob!, 
          isProcessing: false 
        }));
        
        lastAudioBlobRef.current = result.audioBlob;
        
        // Automatically send voice message
        await sendVoiceMessage(result.audioBlob);
      } else {
        setRecordingState(prev => ({ 
          ...prev, 
          isProcessing: false, 
          error: result.error || 'Failed to stop recording' 
        }));
      }
    } catch (error: any) {
      console.error('Stop recording error:', error);
      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isProcessing: false, 
        error: error.message 
      }));
    }
  }, []);

  // Send voice message to AI
  const sendVoiceMessage = useCallback(async (audioBlob: Blob): Promise<VoiceConversationResponse> => {
    // 🚨 PREVENT MULTIPLE SIMULTANEOUS REQUESTS
    if (isProcessingRef.current) {
      console.warn('⚠️ Voice request already in progress, skipping duplicate');
      return {
        transcript: '',
        aiResponse: 'Request already in progress...',
        confidence: 0,
        actions: [],
        hasAudio: false,
        success: false
      };
    }

    try {
      isProcessingRef.current = true;
      setRecordingState(prev => ({ ...prev, isProcessing: true, error: null }));
      
      console.log('🎤 Sending voice message - userId:', userId, 'audioSize:', audioBlob.size);
      
      // Get conversation response (text + metadata)
      const response = await aiAPI.sendVoiceMessage(audioBlob, userId);
      
      console.log('✅ Voice response received:', response);
      
      setRecordingState(prev => ({ 
        ...prev, 
        transcript: response.transcript,
        isProcessing: false 
      }));

      // Trigger callbacks for parent components
      if (callbacks?.onTranscript && response.transcript) {
        callbacks.onTranscript(response.transcript);
      }
      
      if (callbacks?.onResponse && response.aiResponse) {
        callbacks.onResponse(response.aiResponse, response.actions);
      }

      // If audio is enabled and available, play audio response from v2 base64
      if (voiceSettings.audioEnabled && response.hasAudio && response.audioBase64 && voiceSettings.autoPlay) {
        try {
          console.log('🔊 Processing v2 audio response:', {
            hasAudio: response.hasAudio,
            audioFormat: response.audioFormat,
            audioSize: response.audioBase64.length
          });

          // Convert base64 audio response to blob
          const audioBytes = atob(response.audioBase64);
          const audioArray = new Uint8Array(audioBytes.length);
          for (let i = 0; i < audioBytes.length; i++) {
            audioArray[i] = audioBytes.charCodeAt(i);
          }
          const audioBlob = new Blob([audioArray], { type: `audio/${response.audioFormat || 'wav'}` });
          
          lastResponseAudioRef.current = audioBlob;
          await playAudioResponse(audioBlob);
          
          console.log('✅ v2 Audio response played successfully');
        } catch (audioError) {
          console.warn('⚠️ v2 Audio response failed, continuing with text:', audioError);
        }
      }

      return response;
    } catch (error: any) {
      console.error('❌ Send voice message error:', error);
      setRecordingState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: error.message 
      }));
      
      // Trigger error callback
      if (callbacks?.onError) {
        callbacks.onError(error.message);
      }
      
      return {
        transcript: '',
        aiResponse: 'Sorry, I could not process your voice message.',
        confidence: 0,
        actions: [],
        hasAudio: false,
        success: false
      };
    } finally {
      isProcessingRef.current = false; // Always reset the flag
    }
  }, [userId, voiceSettings]);

  // Play audio response
  const playAudioResponse = useCallback(async (audioBlob: Blob) => {
    setPlaybackState(prev => ({ ...prev, isPlaying: true }));
    
    await voiceService.playAudio(
      audioBlob,
      (progress, duration) => {
        setPlaybackState(prev => ({ ...prev, progress, duration }));
      },
      () => {
        setPlaybackState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          progress: 0,
          currentAudio: null 
        }));
      },
      (error) => {
        console.error('Audio playback error:', error);
        setPlaybackState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          progress: 0,
          currentAudio: null 
        }));
      }
    );
  }, []);

  // Play last response audio
  const playLastResponse = useCallback(async () => {
    if (lastResponseAudioRef.current) {
      await playAudioResponse(lastResponseAudioRef.current);
    }
  }, [playAudioResponse]);

  // Toggle audio enabled
  const toggleAudioEnabled = useCallback(() => {
    const newSettings = { ...voiceSettings, audioEnabled: !voiceSettings.audioEnabled };
    saveVoiceSettings(newSettings);
  }, [voiceSettings, saveVoiceSettings]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    const newSettings = { ...voiceSettings, volume };
    saveVoiceSettings(newSettings);
    voiceService.setVolume(volume);
  }, [voiceSettings, saveVoiceSettings]);

  // Check microphone availability
  const checkMicrophone = useCallback(async (): Promise<boolean> => {
    const result = await voiceService.checkMicrophonePermission();
    if (!result.available) {
      setRecordingState(prev => ({ 
        ...prev, 
        error: result.error || 'Microphone not available' 
      }));
    }
    return result.available;
  }, []);

  // Stop current audio
  const stopCurrentAudio = useCallback(() => {
    voiceService.stopAudio();
    setPlaybackState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      progress: 0,
      currentAudio: null 
    }));
  }, []);

  return {
    recordingState,
    playbackState,
    voiceSettings,
    startRecording,
    stopRecording,
    sendVoiceMessage,
    playLastResponse,
    toggleAudioEnabled,
    setVolume,
    checkMicrophone,
    stopCurrentAudio
  };
};

export default useVoiceConversation;
