// MindSync Environment Configuration
import { Platform } from 'react-native';

const environments = {
  development: {
    API_BASE_URL: 'http://localhost:5000', // Backend Copilot's local server
    UPLOAD_ENDPOINT: 'http://localhost:5000/api/upload',
    WS_URL: 'ws://localhost:5000/ws',
    AWS_REGION: 'us-east-1',
    ENVIRONMENT: 'development',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.mindsync.app',
    UPLOAD_ENDPOINT: 'https://staging-api.mindsync.app/api/upload',
    WS_URL: 'wss://staging-api.mindsync.app/ws',
    AWS_REGION: 'us-east-1',
    ENVIRONMENT: 'staging',
  },
  production: {
    API_BASE_URL: 'https://api.mindsync.app',
    UPLOAD_ENDPOINT: 'https://api.mindsync.app/api/upload',
    WS_URL: 'wss://api.mindsync.app/ws',
    AWS_REGION: 'us-east-1',
    ENVIRONMENT: 'production',
  }
};

// Get current environment
const getCurrentEnvironment = () => {
  if (__DEV__) return 'development';
  if (process.env.NODE_ENV === 'staging') return 'staging';
  return 'production';
};

export const environment = environments[getCurrentEnvironment()];
export default environment;
