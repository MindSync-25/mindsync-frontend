import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SignupScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    console.log('Signup', { name, email, password, confirmPassword });
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
          onChangeText={setName}
        />
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
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
         Already have an account?{' '}
         <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
         Log In
        </Text>
        </Text>



        {/* Social Logins */}
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-google" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {(Platform.OS === 'ios' || Platform.OS === 'web') && (
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
};

export default SignupScreen;

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
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2a2a2a',
    padding: 14,
    borderRadius: 12,
    color: '#fff',
    marginBottom: 14,
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
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12
  },
  linkText: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 12
    
  },
});
