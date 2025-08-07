import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🚀 PRODUCTION-READY AUTHENTICATION API
const API_BASE_URL = 'http://localhost:8081/api';

const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: string; // UUID format
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface UserSession {
  token: string;
  refreshToken: string;
  userId: string;
  userName: string;
  email: string;
}

export const authApi = {
  // Standard email/password login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await authClient.post('/auth/login', credentials);
      
      console.log('🔍 Backend login response:', response.data);
      
      // Check if backend returned an error response (only throw for actual errors)
      if (response.data.success === false) {
        // Handle backend error messages properly
        if (response.data.message === 'Not a user, register' || response.data.message?.includes('Invalid email or password')) {
          throw new Error('Invalid email or password. Please try again.');
        } else if (response.data.message === 'Invalid credentials') {
          throw new Error('Invalid email or password. Please try again.');
        } else {
          throw new Error(response.data.message || 'Login failed');
        }
      }
      
      // Check for success message (don't throw error for success!)
      if (response.data.success === true || response.data.message === 'Logged in successfully') {
        console.log('✅ Login successful!');
      }
      
      // Handle successful login response
      const user = response.data.user || response.data;
      const token = response.data.token;
      
      if (!user || !token) {
        throw new Error('Invalid login response format - missing user or token');
      }
      
      // Save session to AsyncStorage with flexible user data structure
      const session: UserSession = {
        token: token,
        refreshToken: response.data.refreshToken || '',
        userId: user.id || user.userId || 'unknown',
        userName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName || 'User',
        email: user.email || '',
      };
      
      // Also save token separately for axios interceptors
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userSession', JSON.stringify(session));
      
      console.log('✅ Session saved successfully:', session);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // User registration
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await authClient.post('/auth/register', userData);
      
      console.log('🔍 Backend registration response:', response.data);
      
      // Check if backend returned an error response (only throw for actual errors)
      if (response.data.success === false) {
        // Handle backend error messages properly
        if (response.data.message?.includes('already exists') || response.data.message?.includes('duplicate') || response.data.error?.includes('already in use')) {
          throw new Error('Email already exists. Please use a different email or login instead.');
        } else if (response.data.message?.includes('Invalid email')) {
          throw new Error('Invalid email format. Please enter a valid email.');
        } else if (response.data.message?.includes('Password')) {
          throw new Error(response.data.message || 'Password requirements not met.');
        } else {
          throw new Error(response.data.message || response.data.error || 'Registration failed');
        }
      }
      
      // Check for success message (don't throw error for success!)
      if (response.data.success === true || response.data.message === 'Registered successfully') {
        console.log('✅ Registration successful!');
      }
      
      // Handle successful registration response
      const user = response.data.user || response.data;
      const token = response.data.token;
      
      if (token) {
        // Save session to AsyncStorage after successful registration
        const session: UserSession = {
          token: token,
          refreshToken: response.data.refreshToken || '',
          userId: user.id || user.userId || 'unknown',
          userName: user.name || userData.name || 'User',
          email: user.email || userData.email,
        };
        
        // Also save token separately for axios interceptors
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userSession', JSON.stringify(session));
        
        console.log('✅ Registration session saved successfully:', session);
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Registration error response:', error.response?.data);
      console.error('Registration error status:', error.response?.status);
      
      // Handle specific error responses
      if (error.response?.status === 409) {
        // Conflict - usually email already exists
        const errorMsg = error.response.data?.error || error.response.data?.message || 'Email already in use';
        throw new Error(`Email already exists: ${errorMsg}`);
      } else if (error.response?.status === 403) {
        throw new Error('Server blocked the request. This might be a CORS issue or the registration endpoint is not available.');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response.data?.error || error.response.data?.message || 'Invalid registration data';
        throw new Error(errorMsg);
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        throw new Error('Cannot connect to server. Please make sure the backend is running on localhost:8081.');
      }
      
      throw error;
    }
  },

  // Google OAuth login
  async googleLogin(googleToken: string): Promise<AuthResponse> {
    try {
      const response = await authClient.post('/auth/google', {
        token: googleToken,
      });
      
      // Save session to AsyncStorage
      const session: UserSession = {
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        userId: response.data.user.id,
        userName: `${response.data.user.firstName} ${response.data.user.lastName}`,
        email: response.data.user.email,
      };
      
      await AsyncStorage.setItem('userSession', JSON.stringify(session));
      
      return response.data;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  // Apple OAuth login
  async appleLogin(appleToken: string): Promise<AuthResponse> {
    try {
      const response = await authClient.post('/auth/apple', {
        token: appleToken,
      });
      
      // Save session to AsyncStorage
      const session: UserSession = {
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        userId: response.data.user.id,
        userName: `${response.data.user.firstName} ${response.data.user.lastName}`,
        email: response.data.user.email,
      };
      
      await AsyncStorage.setItem('userSession', JSON.stringify(session));
      
      return response.data;
    } catch (error) {
      console.error('Apple login error:', error);
      throw error;
    }
  },

  // Refresh JWT token
  async refreshToken(): Promise<string> {
    try {
      const sessionStr = await AsyncStorage.getItem('userSession');
      if (!sessionStr) {
        throw new Error('No session found');
      }
      
      const session = JSON.parse(sessionStr);
      
      const response = await authClient.post('/auth/refresh', {
        refreshToken: session.refreshToken,
      });
      
      // Update token in session
      const updatedSession = {
        ...session,
        token: response.data.token,
      };
      
      await AsyncStorage.setItem('userSession', JSON.stringify(updatedSession));
      
      return response.data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear session on refresh failure
      await AsyncStorage.removeItem('userSession');
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      const sessionStr = await AsyncStorage.getItem('userSession');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        
        // Call logout endpoint with token
        await authClient.post('/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Always clear local session
      await AsyncStorage.removeItem('userSession');
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const sessionStr = await AsyncStorage.getItem('userSession');
      if (!sessionStr) {
        return false;
      }
      
      const session = JSON.parse(sessionStr);
      return !!(session.token && session.userId);
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  },

  // Get current user session
  async getCurrentSession(): Promise<UserSession | null> {
    try {
      const sessionStr = await AsyncStorage.getItem('userSession');
      if (!sessionStr) {
        return null;
      }
      
      return JSON.parse(sessionStr);
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  // Get authentication headers for API calls
  async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const sessionStr = await AsyncStorage.getItem('userSession');
      if (!sessionStr) {
        return {};
      }
      
      const session = JSON.parse(sessionStr);
      return {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      };
    } catch (error) {
      console.error('Get auth headers error:', error);
      return {};
    }
  },
};
