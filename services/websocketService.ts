import AsyncStorage from '@react-native-async-storage/async-storage';

export type WebSocketEventType = 
  | 'task_updated'
  | 'task_created'
  | 'task_deleted'
  | 'comment_added'
  | 'time_log_updated'
  | 'notification'
  | 'user_status';

export interface WebSocketMessage {
  type: WebSocketEventType;
  data: any;
  timestamp: string;
  userId?: string;
}

export interface WebSocketListener {
  (message: WebSocketMessage): void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<WebSocketEventType, WebSocketListener[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private isConnecting = false;
  private url = 'ws://localhost:8081/ws'; // WebSocket endpoint
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeEventMap();
  }

  private initializeEventMap() {
    const eventTypes: WebSocketEventType[] = [
      'task_updated',
      'task_created',
      'task_deleted',
      'comment_added',
      'time_log_updated',
      'notification',
      'user_status'
    ];

    eventTypes.forEach(type => {
      this.listeners.set(type, []);
    });
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      console.log('🔌 WebSocket already connected or connecting');
      return;
    }

    this.isConnecting = true;

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('🔌 No auth token available for WebSocket connection');
        this.isConnecting = false;
        return;
      }

      console.log('🔌 Connecting to WebSocket:', this.url);
      
      // Include auth token in connection
      this.ws = new WebSocket(`${this.url}?token=${encodeURIComponent(token)}`);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', message.type, message.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();
        
        // Attempt to reconnect unless it was a manual close
        if (event.code !== 1000) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    console.log('🔌 Disconnecting WebSocket');
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}`);
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', {});
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    // Handle heartbeat response
    if (message.type === 'ping' as any) {
      console.log('💓 WebSocket heartbeat received');
      return;
    }

    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(message);
        } catch (error) {
          console.error(`❌ Error in WebSocket listener for ${message.type}:`, error);
        }
      });
    }
  }

  send(type: WebSocketEventType | 'ping', data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: type as WebSocketEventType,
        data,
        timestamp: new Date().toISOString(),
      };

      this.ws.send(JSON.stringify(message));
      console.log('📤 WebSocket message sent:', type, data);
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message:', type);
    }
  }

  subscribe(eventType: WebSocketEventType, listener: WebSocketListener): () => void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.push(listener);
      console.log(`📝 Subscribed to WebSocket event: ${eventType}`);
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
          console.log(`📝 Unsubscribed from WebSocket event: ${eventType}`);
        }
      }
    };
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'CONNECTED';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'DISCONNECTED';
      default:
        return 'UNKNOWN';
    }
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();

// Auto-connect when service is imported
// Note: This will be called when the app starts
setTimeout(() => {
  webSocketService.connect();
}, 1000);

// Helper functions for common use cases

export const subscribeToTaskUpdates = (callback: (task: any) => void) => {
  return webSocketService.subscribe('task_updated', (message) => {
    callback(message.data);
  });
};

export const subscribeToTaskCreated = (callback: (task: any) => void) => {
  return webSocketService.subscribe('task_created', (message) => {
    callback(message.data);
  });
};

export const subscribeToTaskDeleted = (callback: (taskId: string) => void) => {
  return webSocketService.subscribe('task_deleted', (message) => {
    callback(message.data.taskId);
  });
};

export const subscribeToComments = (callback: (comment: any) => void) => {
  return webSocketService.subscribe('comment_added', (message) => {
    callback(message.data);
  });
};

export const subscribeToTimeTracking = (callback: (timeLog: any) => void) => {
  return webSocketService.subscribe('time_log_updated', (message) => {
    callback(message.data);
  });
};

export const subscribeToNotifications = (callback: (notification: any) => void) => {
  return webSocketService.subscribe('notification', (message) => {
    callback(message.data);
  });
};

export const notifyTaskUpdate = (task: any) => {
  webSocketService.send('task_updated', task);
};

export const notifyCommentAdded = (comment: any) => {
  webSocketService.send('comment_added', comment);
};

export const notifyTimeLogUpdate = (timeLog: any) => {
  webSocketService.send('time_log_updated', timeLog);
};

export default webSocketService;
