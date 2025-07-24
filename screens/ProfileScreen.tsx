import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const profileOptions = [
  { icon: 'account-edit', label: 'Edit Profile' },
  { icon: 'lock-outline', label: 'Change Password' },
  { icon: 'bell-outline', label: 'Notification Settings' },
  { icon: 'palette-outline', label: 'Theme & Appearance' },
  { icon: 'shield-account-outline', label: 'Privacy & Security' },
  { icon: 'logout', label: 'Logout' },
];

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Profile: undefined;
  ComingSoon: undefined;
};
const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Profile Settings</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="close" size={28} color="#f5f5f5" />
        </TouchableOpacity>
      </View>
      {profileOptions.map((option, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.option}
          onPress={() => {
            if (option.label === 'Edit Profile') return;
            navigation.navigate('ComingSoon');
          }}
        >
          <MaterialCommunityIcons name={option.icon} size={24} color="#f5f5f5" style={styles.icon} />
          <Text style={styles.label}>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#000',
    minHeight: '100%',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  header: {
    fontSize: 28,
    color: '#f5f5f5',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
    borderRadius: 16,
    backgroundColor: '#232323',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 18,
    width: 320,
    maxWidth: '90%',
  },
  icon: {
    marginRight: 18,
  },
  label: {
    color: '#f5f5f5',
    fontSize: 18,
  },
});

export default ProfileScreen;
