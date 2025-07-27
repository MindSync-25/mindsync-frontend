// src/navigation/AppNavigator.tsx
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import WeatherScreen from '../screens/WeatherScreen';
import NewsFeedScreen from '../screens/NewsFeedScreen';
import NewsInterestsOnboardingScreen from '../screens/NewsInterestsOnboardingScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { theme } = useTheme();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  // Check for existing session on app start
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionStr = await AsyncStorage.getItem('userSession');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session.userId && session.userName) {
            // Check if user has completed news interests onboarding
            const newsOnboardingComplete = await AsyncStorage.getItem('newsOnboardingComplete');
            if (newsOnboardingComplete === 'true') {
              setInitialRoute('Home'); // User is logged in and completed onboarding
            } else {
              setInitialRoute('NewsInterestsOnboarding'); // User is logged in but needs to complete onboarding
            }
          } else {
            setInitialRoute('Login'); // Invalid session, go to Login
          }
        } else {
          setInitialRoute('Login'); // No session, go to Login
        }
      } catch (e) {
        setInitialRoute('Login'); // Error, go to Login
      }
    };

    checkSession();
  }, []);

  // Show loading while checking session
  if (initialRoute === null) {
    return null; // or a loading screen
  }

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
        initialRouteName={initialRoute as any}
        screenOptions={{
          headerShown: false, // hide the default headers
        }}
        id={undefined} // Added id property
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Weather" component={WeatherScreen} />
        <Stack.Screen name="NewsFeed" component={NewsFeedScreen} />
        <Stack.Screen name="NewsInterestsOnboarding" component={NewsInterestsOnboardingScreen} />
        <Stack.Screen name="ComingSoon" component={ComingSoonScreen} />
        <Stack.Screen name="TaskManagement" component={TaskManagementScreen} options={{ title: 'Tasks' }} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
