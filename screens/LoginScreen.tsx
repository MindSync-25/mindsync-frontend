import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to MindSync</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        <Text style={styles.or}>or</Text>

        {/* Google Login */}
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-google" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
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
