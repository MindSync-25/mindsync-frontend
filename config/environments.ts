// MindSync Environment Configuration
import { Platform } from 'react-native';

const environments = {
  development: {
    API_BASE_URL: 'http://localhost:8081', // ✅ SPRING BOOT BACKEND
    UPLOAD_ENDPOINT: 'http://localhost:8081/api/upload',
    WS_URL: 'ws://localhost:8081/ws',
    AWS_REGION: 'us-east-1',
    ENVIRONMENT: 'development',
  },
  staging: {
    API_BASE_URL: 'http://localhost:8081', // ✅ FOR NOW, USE SPRING BOOT
    UPLOAD_ENDPOINT: 'http://localhost:8081/api/upload',
    WS_URL: 'ws://localhost:8081/ws',
    AWS_REGION: 'us-east-1',
    ENVIRONMENT: 'staging',
  },
  production: {
    API_BASE_URL: 'http://localhost:8081', // ✅ SPRING BOOT LOCAL FOR NOW
    UPLOAD_ENDPOINT: 'http://localhost:8081/api/upload',
    WS_URL: 'ws://localhost:8081/ws',
    AWS_REGION: 'us-east-1',
    ENVIRONMENT: 'production',
    DEPLOYMENT_PLATFORM: 'local-spring-boot',
    STATUS: 'SPRING_BOOT_INTEGRATION',
    VERSION: 'SPRING_BOOT_V1'
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
