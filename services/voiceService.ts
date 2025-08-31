// 🎤 Voice Service - Audio Recording & Playback Utilities
import { Platform } from 'react-native';

export interface VoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  audioBlob: Blob | null;
  transcript: string;
  error: string | null;
}

export interface VoicePlaybackState {
  isPlaying: boolean;
  currentAudio: HTMLAudioElement | null;
  progress: number;
  duration: number;
}

export class VoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordingChunks: BlobPart[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private isCurrentlyRecording: boolean = false;

  /**
   * Start voice recording
   */
  async startRecording(): Promise<{ success: boolean; error?: string }> {
    try {
      // Request microphone permission with EXACT backend requirements
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // EXACT: 16kHz as required by backend v2
          channelCount: 1,   // EXACT: Mono as required by backend v2
          sampleSize: 16     // 16-bit audio
        } 
      });

      // Try to use WAV format if supported (as required by backend v2)
      let mimeType = 'audio/wav';
      if (!MediaRecorder.isTypeSupported('audio/wav')) {
        // Fallback to WebM but we'll convert to WAV
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=pcm')) {
          mimeType = 'audio/webm;codecs=pcm';
        } else {
          mimeType = 'audio/webm;codecs=opus';
        }
        console.warn('⚠️ WAV not supported, using:', mimeType, '(will convert to WAV)');
      }

      console.log('🎤 Using audio format for v2 backend:', mimeType);
      console.log('🔧 Audio constraints:', {
        sampleRate: '16kHz',
        channels: 'Mono', 
        format: 'WAV (required by backend v2)'
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });

      this.recordingChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordingChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isCurrentlyRecording = true;
      console.log('🎤 Voice recording started with format:', mimeType);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Recording start error:', error);
      return { 
        success: false, 
        error: error.message || 'Could not start recording' 
      };
    }
  }

  /**
   * Stop voice recording and return audio blob
   */
  async stopRecording(): Promise<{ success: boolean; audioBlob?: Blob; error?: string }> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve({ success: false, error: 'No active recording' });
        return;
      }

      this.mediaRecorder.onstop = () => {
        try {
          // Create audio blob - ensure WAV format for backend v2
          const originalBlob = new Blob(this.recordingChunks, { 
            type: this.mediaRecorder?.mimeType || 'audio/wav'
          });

          // Convert to WAV if needed (backend v2 requires WAV format)
          this.ensureWavFormat(originalBlob).then((wavBlob) => {
            // Stop all audio tracks
            if (this.mediaRecorder?.stream) {
              this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }

            this.recordingChunks = [];
            this.mediaRecorder = null;
            this.isCurrentlyRecording = false;

            console.log('✅ Voice recording stopped - v2 WAV format:', {
              size: wavBlob.size,
              type: wavBlob.type,
              format: 'WAV (backend v2 compatible)'
            });
            resolve({ success: true, audioBlob: wavBlob });
          }).catch((error) => {
            console.warn('⚠️ WAV conversion failed, using original blob:', error);
            // Fallback to original blob
            if (this.mediaRecorder?.stream) {
              this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
            this.recordingChunks = [];
            this.mediaRecorder = null;
            this.isCurrentlyRecording = false;
            resolve({ success: true, audioBlob: originalBlob });
          });
        } catch (error: any) {
          console.error('❌ Recording stop error:', error);
          resolve({ success: false, error: error.message });
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Ensure audio blob is in WAV format (required by backend v2)
   */
  private async ensureWavFormat(audioBlob: Blob): Promise<Blob> {
    // If it's already WAV, return as-is
    if (audioBlob.type === 'audio/wav') {
      console.log('✅ Audio already in WAV format');
      return audioBlob;
    }

    console.log('🔄 Converting audio to WAV format for backend v2...');
    
    try {
      // Create AudioContext for conversion
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000 // Backend v2 requires 16kHz
      });

      // Convert blob to ArrayBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Convert to WAV format
      const wavBlob = this.audioBufferToWav(audioBuffer);
      
      console.log('✅ Audio converted to WAV format:', {
        originalType: audioBlob.type,
        newType: 'audio/wav',
        originalSize: audioBlob.size,
        newSize: wavBlob.size
      });
      
      return wavBlob;
    } catch (error) {
      console.warn('⚠️ WAV conversion failed, using original blob:', error);
      return audioBlob;
    }
  }

  /**
   * Convert AudioBuffer to WAV blob
   */
  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const numberOfChannels = 1; // Mono as required by backend v2
    const sampleRate = 16000;   // 16kHz as required by backend v2
    const format = 1;           // PCM
    const bitDepth = 16;

    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * bitDepth / 8, true);
    view.setUint16(32, numberOfChannels * bitDepth / 8, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Convert audio data (mono, 16kHz, 16-bit PCM)
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  /**
   * Play audio response with progress tracking
   */
  async playAudio(
    audioBlob: Blob,
    onProgress?: (progress: number, duration: number) => void,
    onComplete?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stopAudio();

      const audioUrl = URL.createObjectURL(audioBlob);
      this.currentAudio = new Audio(audioUrl);

      this.currentAudio.onloadedmetadata = () => {
        console.log('🔊 Audio loaded, duration:', this.currentAudio?.duration);
      };

      this.currentAudio.ontimeupdate = () => {
        if (this.currentAudio && onProgress) {
          onProgress(this.currentAudio.currentTime, this.currentAudio.duration);
        }
      };

      this.currentAudio.onended = () => {
        console.log('🔊 Audio playback completed');
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        onComplete?.();
      };

      this.currentAudio.onerror = (error) => {
        console.error('❌ Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        onError?.('Failed to play audio response');
      };

      await this.currentAudio.play();
      console.log('🔊 Audio playback started');

    } catch (error: any) {
      console.error('❌ Audio play error:', error);
      onError?.(error.message || 'Could not play audio');
    }
  }

  /**
   * Stop currently playing audio
   */
  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      console.log('🔊 Audio playback stopped');
    }
  }

  /**
   * Pause/Resume audio playback
   */
  togglePlayback(): boolean {
    if (this.currentAudio) {
      if (this.currentAudio.paused) {
        this.currentAudio.play();
        return true; // playing
      } else {
        this.currentAudio.pause();
        return false; // paused
      }
    }
    return false;
  }

  /**
   * Set audio volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    if (this.currentAudio) {
      this.currentAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Check if microphone is available
   */
  async checkMicrophonePermission(): Promise<{ available: boolean; error?: string }> {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return { available: true };
    } catch (error: any) {
      console.warn('⚠️ Microphone not available:', error);
      return { 
        available: false, 
        error: error.name === 'NotAllowedError' ? 'Microphone permission denied' : 'Microphone not available'
      };
    }
  }

  /**
   * Get audio duration from blob
   */
  async getAudioDuration(audioBlob: Blob): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src);
        resolve(audio.duration || 0);
      };
      audio.onerror = () => {
        resolve(0);
      };
    });
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.currentAudio && !this.currentAudio.paused;
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.isCurrentlyRecording && this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
export default voiceService;
