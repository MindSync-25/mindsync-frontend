import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';

const profileOptions: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }[] = [
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
  const { theme, toggleTheme } = useTheme();

  const dynamicStyles = StyleSheet.create({
    container: {
      padding: 24,
      backgroundColor: theme === 'light' ? '#fff' : '#000',
      minHeight: '100%',
      alignItems: 'center',
    },
    header: {
      fontSize: 28,
      color: theme === 'light' ? '#000' : '#f5f5f5',
      fontWeight: 'bold',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'light' ? '#f5f5f5' : '#181818',
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 18,
      width: 320,
      maxWidth: '90%',
    },
    label: {
      color: theme === 'light' ? '#000' : '#f5f5f5',
      fontSize: 18,
    },
    closeButton: {
      padding: 4,
      marginLeft: 12,
      borderRadius: 16,
      backgroundColor: theme === 'light' ? '#e0e0e0' : '#232323',
    },
  });

  return (
    <ScrollView contentContainerStyle={dynamicStyles.container}>
      <View style={styles.headerRow}>
        <Text style={dynamicStyles.header}>Profile Settings</Text>
        <TouchableOpacity style={dynamicStyles.closeButton} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="close" size={28} color={theme === 'light' ? '#000' : '#f5f5f5'} />
        </TouchableOpacity>
      </View>
      {profileOptions.map((option, idx) => (
        <TouchableOpacity
          key={idx}
          style={dynamicStyles.option}
          onPress={() => {
            if (option.label === 'Theme & Appearance') {
              toggleTheme();
              return;
            }
            navigation.navigate('ComingSoon');
          }}
        >
          <MaterialCommunityIcons name={option.icon} size={24} color={theme === 'light' ? '#000' : '#f5f5f5'} />
          <Text style={dynamicStyles.label}>{option.label}</Text>
          {option.label === 'Theme & Appearance' && (
            <Text style={styles.themeLabel}>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  themeLabel: {
    marginLeft: 'auto',
    color: '#888',
    fontSize: 14,
  },
});

export default ProfileScreen;
