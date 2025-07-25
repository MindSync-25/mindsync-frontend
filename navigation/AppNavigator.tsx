// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ComingSoonScreen from '../screens/ComingSoonScreen';
import TaskManagementScreen from '../screens/TaskManagementScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: theme === 'dark',
        colors: {
          primary: theme === 'dark' ? '#1e90ff' : '#007aff',
          background: theme === 'dark' ? '#000' : '#fff',
          card: theme === 'dark' ? '#181818' : '#f5f5f5',
          text: theme === 'dark' ? '#f5f5f5' : '#000',
          border: theme === 'dark' ? '#232323' : '#e0e0e0',
          notification: theme === 'dark' ? '#ff453a' : '#ff3b30',
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '900' },
        },
      }}
    >
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false, // hide the default headers
        }}
        id={undefined} // Added id property
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ComingSoon" component={ComingSoonScreen} />
        <Stack.Screen name="TaskManagement" component={TaskManagementScreen} options={{ title: 'Tasks' }} />
<Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
