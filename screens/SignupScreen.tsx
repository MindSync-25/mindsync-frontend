import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
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
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';

console.log('EXPO Redirect URI:', AuthSession.makeRedirectUri({ useProxy: true }));

const GOOGLE_CLIENT_ID = '7201600018-un5ho48dggcpgfqr2hthckv6p5cpf131.apps.googleusercontent.com';
const { width } = Dimensions.get('window');

export default function SignupScreen() {
  const navigation = useNavigation();
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

  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      usePKCE: false,
      extraParams: { nonce: nonce || '' }
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' }
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      axios
        .post('http://192.168.1.188:5000/api/auth/google', { idToken })
        .then((res) => {
          Alert.alert('Success', res.data.message || 'Logged in with Google');
          navigation.navigate('Login');
        })
        .catch((err) => {
          console.error('Google login error', err);
          Alert.alert('Error', err.response?.data?.message || err.message);
        });
    }
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
      const res = await axios.post('http://192.168.1.188:5000/api/auth/apple', { identityToken });
      Alert.alert('Success', res.data.message || 'Logged in with Apple');
      navigation.navigate('Login');
    } catch (err: any) {
      console.error('Apple login error', err);
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  // Regular Signup
  const handleSignup = async () => {
    try {
      console.log('Signup button pressed');
      const res = await axios.post('http://192.168.1.188:5000/api/auth/register', {
        name,
        email,
        password,
        confirmPassword,
      });
      Alert.alert('Success', res.data.message);
      setErrorMessage('');
      navigation.navigate('Login');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Signup failed';
      console.log('Signup error FULL:', JSON.stringify(err.response?.data, null, 2));
      setErrorMessage(msg);
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
          onPress={() => promptAsync({ useProxy: true })}
        >
          <Ionicons name="logo-google" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Apple Sign-In */}
        {(Platform.OS === 'ios' || Platform.OS === 'web') && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={8}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
