import React, { useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const { width } = Dimensions.get('window');


type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Profile: undefined;
  ComingSoon: undefined;
};

const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      // For Android emulator use: http://10.0.2.2:5000/api/login
      // For iOS/web: http://localhost:5000/api/login
      // For physical device: http://<your-computer-ip>:5000/api/login
      const response = await axios.post('http://192.168.1.188:5000/api/auth/login', {
        email,
        password,
      });
      if (response.data.token) {
        // Save token for authentication
        await AsyncStorage.setItem('userToken', response.data.token);
        
        // Save user session data for HomeScreen
        await AsyncStorage.setItem('userSession', JSON.stringify({
          userName: response.data.user?.name || response.data.user?.fullName || 'User',
          userId: response.data.user?.id || response.data.user?._id || '',
          email: response.data.user?.email || email
        }));
        console.log('Login response:', response.data);
        navigation.navigate('Home');
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.log('Login error:', err);
      // Try to show backend error message if available
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Network error. Please try again.');
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
    scopes: ['profile', 'email'],
    responseType: AuthSession.ResponseType.Token,
    usePKCE: false,
  }, discovery);

  React.useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === 'success' && response.params?.id_token) {
        setGoogleLoading(true);
        try {
          const backendResponse = await axios.post('http://192.168.1.188:5000/api/auth/googleLogin', {
            idToken: response.params.id_token,
          });
          if (backendResponse.data.token) {
            await AsyncStorage.setItem('userToken', backendResponse.data.token);
            await AsyncStorage.setItem('userSession', JSON.stringify({
              userName: backendResponse.data.user?.name || backendResponse.data.user?.fullName || 'User',
              userId: backendResponse.data.user?.id || backendResponse.data.user?._id || '',
              email: backendResponse.data.user?.email || '',
            }));
            console.log('Google login response:', backendResponse.data);
            navigation.navigate('Home');
          } else {
            setError(backendResponse.data.message || 'Google login failed. Please try again.');
          }
        } catch (err) {
          // Log full error for debugging
          if (axios.isAxiosError(err)) {
            if (err.response) {
              console.log('Google login error response:', err.response);
              setError('Google login error: ' + (err.response.data?.message || err.message));
            } else if (err.request) {
              console.log('Google login error request:', err.request);
              setError('Google login request error: Could not reach backend. Check network and CORS.');
            } else {
              console.log('Google login error:', err.message);
              setError('Google login error: ' + err.message);
            }
          } else {
            console.log('Google login error:', err);
            setError('Network error. Please try again.');
          }
        } finally {
          setGoogleLoading(false);
        }
      }
    };
    handleGoogleResponse();
  }, [response]);

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    await promptAsync();
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

        {/* Apple Login (iOS + web visible) */}
        {(Platform.OS === 'ios' || Platform.OS === 'web') && (
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerText}>
         Already have an account?{' '}
         <Text style={styles.linkText} onPress={() => navigation.navigate('Signup')}>
         Sing Up
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
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
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
}

});
