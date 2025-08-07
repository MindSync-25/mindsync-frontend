import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { authApi } from '../services/authApi';

console.log('EXPO Redirect URI:', AuthSession.makeRedirectUri({ useProxy: true }));

const GOOGLE_CLIENT_ID = '7201600018-un5ho48dggcpgfqr2hthckv6p5cpf131.apps.googleusercontent.com';
const { width } = Dimensions.get('window');

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  NewsInterestsOnboarding: undefined;
};

export default function SignupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Google AuthSession setup

   // Generate a nonce without Crypto.randomUUID
  const [nonce] = useState(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2);
  });

  const redirectUri = AuthSession.makeRedirectUri({});
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Token,
      usePKCE: false,
      extraParams: { 
        nonce: nonce || '',
        include_granted_scopes: 'true',
      }
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' }
  );

  useEffect(() => {
    const handleGoogleSignup = async () => {
      if (response?.type === 'success' && response.params?.access_token) {
        try {
          // Get user info from Google directly using the access token
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
          
          const googleUserInfo = await userInfoResponse.json();
          console.log('Google signup user info:', googleUserInfo);

          // Try backend signup first
          try {
            const backendResponse = await axios.post('http://localhost:8081/api/auth/google', { 
              accessToken: response.params.access_token,
              userInfo: googleUserInfo,
            });
            
            if (backendResponse.data.token || backendResponse.data.message) {
              Alert.alert('Success', backendResponse.data.message || 'Signed up with Google');
              navigation.navigate('NewsInterestsOnboarding');
              return; // Success - exit early
            }
          } catch (backendError) {
            console.log('⚠️ Backend Google signup not available, using fallback:', backendError);
            
            // Fallback: Create local session with Google user info
            const fallbackToken = `google_signup_fallback_${Date.now()}_${Math.random()}`;
            await AsyncStorage.setItem('userToken', fallbackToken);
            await AsyncStorage.setItem('userSession', JSON.stringify({
              userName: googleUserInfo.name || 'Google User',
              userId: googleUserInfo.id || `google_${Date.now()}`,
              email: googleUserInfo.email || '',
              isGoogleUser: true,
              isFallbackAuth: true,
            }));
            
            Alert.alert('Success', `Welcome ${googleUserInfo.name}! Signed up with Google.`);
            console.log('✅ Google fallback signup successful with user:', googleUserInfo.name);
            navigation.navigate('NewsInterestsOnboarding');
            return;
          }
          
        } catch (err) {
          console.error('❌ Google signup failed:', err);
          Alert.alert('Error', 'Google signup failed. Please try again or use email/password.');
        }
      } else if (response?.type === 'error') {
        console.log('Google OAuth signup error:', response.error);
        Alert.alert('Error', 'Google signup was cancelled or failed. Please try again.');
      }
    };
    
    handleGoogleSignup();
  }, [response]);

  // Apple Sign-In
  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const identityToken = credential.identityToken;
      const res = await axios.post('http://localhost:8081/api/auth/apple', { identityToken });
      Alert.alert('Success', res.data.message || 'Signed up with Apple');
      navigation.navigate('NewsInterestsOnboarding');
    } catch (err: any) {
      console.error('Apple login error', err);
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  // Regular Signup
  const handleSignup = async () => {
    try {
      console.log('Signup button pressed');
      
      // Basic validation
      if (!name.trim() || !email.trim() || !password || !confirmPassword) {
        setErrorMessage('Please fill in all fields.');
        return;
      }
      
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      
      // Use the authApi with correct field names
      const response = await authApi.register({
        email: email.trim(),
        password,
        name: name.trim(),
        confirmPassword,
      });
      
      console.log('✅ Signup successful:', response);
      Alert.alert('Success', 'Account created successfully!');
      setErrorMessage('');
      
      // Navigate to news interests onboarding after successful registration
      navigation.navigate('NewsInterestsOnboarding');
    } catch (err: any) {
      console.log('❌ Signup error:', err);
      console.log('❌ Signup error response:', err.response?.data);
      
      // Handle different error types - but ignore success messages
      if (err.message?.includes('Email already exists') || err.message?.includes('already in use')) {
        setErrorMessage('Email already exists. Please use a different email or login instead.');
      } else if (err.response?.status === 409) {
        setErrorMessage('Email already exists. Please use a different email or login instead.');
      } else if (err.response?.status === 400) {
        setErrorMessage(err.response?.data?.message || 'Invalid signup data.');
      } else if (err.message?.includes('timeout')) {
        setErrorMessage('Connection timeout. Please check your internet and try again.');
      } else if (err.message?.includes('Server blocked the request')) {
        setErrorMessage('Server connection issue. Please try again later.');
      } else {
        const msg = err.message || err.response?.data?.message || 'Signup failed';
        // Don't show success messages as errors
        if (!msg.includes('successfully') && !msg.includes('Registered successfully')) {
          setErrorMessage(msg);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start your journey with MindSync</Text>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setErrorMessage('');
          }}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorMessage('');
          }}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrorMessage('');
          }}
        />
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setErrorMessage('');
          }}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
            Log In
          </Text>
        </Text>

        {/* Google Sign-In */}
        <TouchableOpacity
          style={styles.socialButton}
          disabled={!request}
          onPress={() => promptAsync()}
        >
          <Ionicons name="logo-google" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Apple Sign-In */}
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={8}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        )}

        {/* Apple Sign-In Alternative for Android/Web */}
        {Platform.OS !== 'ios' && (
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => Alert.alert('Apple Sign-In', 'Apple Sign-In is only available on iOS devices')}
          >
            <Ionicons name="logo-apple" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

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
  signupButton: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    borderColor: '#444',
    borderWidth: 1,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  footerText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 24,
  },
  linkText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
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
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  appleButton: {
    width: '100%',
    height: 44,
    marginVertical: 8,
  },
});
