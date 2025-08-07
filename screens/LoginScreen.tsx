import React, { useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { authApi } from '../services/authApi';
import ManualGoogleLogin from '../components/ManualGoogleLogin';

const { width } = Dimensions.get('window');


type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Profile: undefined;
  ComingSoon: undefined;
  NewsInterestsOnboarding: undefined;
};

const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showManualGoogle, setShowManualGoogle] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      // Use the new production-ready auth API
      const response = await authApi.login({
        email: email.trim(),
        password,
      });
      
      console.log('✅ Login successful:', response);
      
      // Check if user has completed news interests onboarding
      const newsOnboardingComplete = await AsyncStorage.getItem('newsOnboardingComplete');
      if (newsOnboardingComplete === 'true') {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else {
        navigation.navigate('NewsInterestsOnboarding');
      }
    } catch (err: any) {
      console.log('❌ Login error:', err);
      console.log('❌ Login error response:', err.response?.data);
      
      // Handle different error types from production API
      if (err.message?.includes('User not found') || err.message?.includes('register first')) {
        setError('Account not found. Please register first or check your email.');
      } else if (err.response?.status === 401 || err.message?.includes('Invalid email or password')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid login credentials.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (err.message?.includes('timeout')) {
        setError('Connection timeout. Please check your internet and try again.');
      } else {
        // Display the actual error message from the backend
        setError(err.message || 'Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Login Handler
  // Google OAuth config
  const clientId = '7201600018-un5ho48dggcpgfqr2hthckv6p5cpf131.apps.googleusercontent.com';

  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest({
    clientId,
    redirectUri: AuthSession.makeRedirectUri({}),
    scopes: ['profile', 'email', 'openid'],
    responseType: AuthSession.ResponseType.Token,
    extraParams: {
      include_granted_scopes: 'true',
    },
    usePKCE: false,
  }, discovery);

  React.useEffect(() => {
    const handleGoogleResponse = async () => {
      console.log('🔍 Google OAuth response received:', response);
      
      // Add timeout check for stuck OAuth
      if (!response) {
        console.log('⏱️ No OAuth response yet...');
        return;
      }
      
      if (response?.type === 'success') {
        console.log('✅ Google OAuth success! Params:', response.params);
        
        if (response.params?.access_token) {
          setGoogleLoading(true);
          try {
            // First, try to get user info from Google directly using the access token
            console.log('📡 Fetching user info from Google...');
            const userInfoResponse = await fetch(
              `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${response.params.access_token}`,
              {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
              }
            );
            
            if (!userInfoResponse.ok) {
              throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
            }
            
            const googleUserInfo = await userInfoResponse.json();
            console.log('👤 Google user info:', googleUserInfo);

            // Try backend authentication first
            try {
              console.log('🔗 Attempting backend authentication...');
              const backendResponse = await axios.post('http://localhost:8081/api/auth/googleLogin', {
                accessToken: response.params.access_token,
                userInfo: googleUserInfo,
              });
              
              if (backendResponse.data.token) {
                await AsyncStorage.setItem('userToken', backendResponse.data.token);
                await AsyncStorage.setItem('userSession', JSON.stringify({
                  userName: backendResponse.data.user?.name || googleUserInfo.name || 'User',
                  userId: backendResponse.data.user?.id || googleUserInfo.id || '',
                  email: backendResponse.data.user?.email || googleUserInfo.email || '',
                }));
                console.log('✅ Google backend login successful:', backendResponse.data);
                navigation.navigate('Home');
                return; // Success - exit early
              }
            } catch (backendError) {
              console.log('⚠️ Backend Google auth not available, using fallback:', backendError);
              
              // Fallback: Create local session with Google user info
              const fallbackToken = `google_fallback_${Date.now()}_${Math.random()}`;
              await AsyncStorage.setItem('userToken', fallbackToken);
              await AsyncStorage.setItem('userSession', JSON.stringify({
                userName: googleUserInfo.name || 'Google User',
                userId: googleUserInfo.id || `google_${Date.now()}`,
                email: googleUserInfo.email || '',
                isGoogleUser: true,
                isFallbackAuth: true,
              }));
              
              console.log('✅ Google fallback login successful with user:', googleUserInfo.name);
              navigation.navigate('Home');
              return;
            }
            
          } catch (err) {
            console.error('❌ Google login failed:', err);
            setError('Google login failed. Please try again or use email/password.');
          } finally {
            setGoogleLoading(false);
          }
        } else {
          console.warn('⚠️ No access token in response params');
          setError('Google login incomplete - no access token received.');
          setGoogleLoading(false);
        }
      } else if (response?.type === 'error') {
        console.log('❌ Google OAuth error:', response.error);
        setError(`Google login error: ${response.error?.message || 'Unknown error'}`);
        setGoogleLoading(false);
      } else if (response?.type === 'cancel') {
        console.log('🚫 Google OAuth cancelled by user');
        setError('Google login was cancelled.');
        setGoogleLoading(false);
      } else if (response?.type === 'dismiss') {
        console.log('🔄 Google OAuth popup dismissed - showing alternative');
        setError('Google popup closed. Please use the alternative login below.');
        setShowManualGoogle(true);
        setGoogleLoading(false);
      }
    };
    
    if (response) {
      handleGoogleResponse();
    }
    
    // Auto-show alternative after 10 seconds if no response
    const timeout = setTimeout(() => {
      if (!response && googleLoading) {
        console.log('⏰ OAuth timeout - showing alternative login');
        setError('OAuth taking too long. Please use the alternative login below.');
        setShowManualGoogle(true);
        setGoogleLoading(false);
      }
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, [response, googleLoading]);

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    
    console.log('🚀 Starting Google login...');
    console.log('Request config:', request);
    console.log('Redirect URI:', AuthSession.makeRedirectUri({}));
    
    try {
      const result = await promptAsync();
      console.log('Google OAuth result:', result);
      
      if (result.type === 'cancel') {
        setError('Google login was cancelled.');
      } else if (result.type === 'error') {
        console.error('Google OAuth error:', result.error);
        setError(`Google login error: ${result.error?.message || 'Unknown error'}`);
      }
      // The useEffect will handle success case
    } catch (error) {
      console.error('Google login prompt error:', error);
      
      // Check if it's a popup blocked error
      if (error.message && error.message.includes('Popup window was blocked')) {
        console.log('🚨 Popup blocked! Showing alternative login...');
        setError('Popup blocked by browser. Please use the alternative login below.');
        setShowManualGoogle(true); // Automatically show the alternative
      } else {
        setError('Failed to open Google login. Please try again.');
      }
    }
    
    setGoogleLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to MindSync</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        {error ? <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{error}</Text> : null}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
        </TouchableOpacity>

        <Text style={styles.or}>or</Text>

        {/* Google Login */}
        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin} disabled={googleLoading}>
          <Ionicons name="logo-google" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.socialButtonText}>{googleLoading ? 'Logging in...' : 'Continue with Google'}</Text>
        </TouchableOpacity>
        
        {/* Alternative Google Login for when OAuth popup is blocked */}
        <TouchableOpacity 
          style={styles.alternativeButton}
          onPress={() => setShowManualGoogle(!showManualGoogle)}
        >
          <Text style={styles.alternativeButtonText}>
            {showManualGoogle ? '↑ Hide Alternative Login' : '↓ Popup Blocked? Use Alternative Login'}
          </Text>
        </TouchableOpacity>

        {/* Manual Google Login Fallback */}
        {showManualGoogle && (
          <ManualGoogleLogin 
            onSuccess={() => {
              setShowManualGoogle(false);
              navigation.navigate('Home');
            }}
          />
        )}

        {/* Apple Login */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        )}

        {/* Apple Login Alternative for Android/Web */}
        {Platform.OS !== 'ios' && (
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => Alert.alert('Apple Sign-In', 'Apple Sign-In is only available on iOS devices')}
          >
            <Ionicons name="logo-apple" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerText}>
         Don't have an account?{' '}
         <Text style={styles.linkText} onPress={() => navigation.navigate('Signup')}>
         Sign Up
        </Text>
        </Text>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Always dark mode
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: width > 480 ? 400 : '100%',
    backgroundColor: '#1c1c1c',
    padding: 24,
    borderRadius: 20,
    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    color: '#fff',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#2a2a2a', // Changed from blue to match image
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    borderColor: '#444',
    borderWidth: 1,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  or: {
    color: '#666',
    marginVertical: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  socialButton: {
    backgroundColor: '#2a2a2a',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  icon: {
    marginLeft: 10,
  },
  footerText: {
  color: '#888',
  fontSize: 14,
  lineHeight: 20, // Make sure this matches
  textAlign: 'center',
  marginTop: 24,
},
linkText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 14,       // Match with footerText
  lineHeight: 20,     // Match with footerText
},
alternativeButton: {
  padding: 8,
  marginVertical: 8,
  alignItems: 'center',
},
alternativeButtonText: {
  color: '#888',
  fontSize: 12,
  textAlign: 'center',
}

});
