// src/navigation/AppNavigator.tsx
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ClassicDashboardScreen from '../screens/ClassicDashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ComingSoonScreen from '../screens/ComingSoonScreen';
import TaskManagementScreen from '../screens/TaskManagementScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ChatScreen from '../screens/ChatScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import WeatherScreen from '../screens/WeatherScreen';
import NewsFeedScreen from '../screens/NewsFeedScreen';
import NewsInterestsOnboardingScreen from '../screens/NewsInterestsOnboardingScreen';
import LegendaryIntegrationTestScreen from '../screens/LegendaryIntegrationTestScreen';
import AuthTestScreen from '../screens/AuthTestScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Task Stack Navigator
const TaskStackNavigator = () => {
  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="TaskList" 
        component={TaskManagementScreen} 
        options={{ title: 'Tasks' }} 
      />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen} 
        options={{ title: 'Task Details' }} 
      />
    </Stack.Navigator>
  );
};

// Calendar Stack Navigator (Placeholder)
const CalendarStackNavigator = () => {
  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="CalendarView" 
        component={CalendarScreen} 
        options={{ title: 'Calendar' }} 
      />
      <Stack.Screen 
        name="EventDetail" 
        component={ComingSoonScreen} 
        options={{ title: 'Event Details' }} 
      />
      <Stack.Screen 
        name="MeetingScheduler" 
        component={ComingSoonScreen} 
        options={{ title: 'Schedule Meeting' }} 
      />
    </Stack.Navigator>
  );
};

// Chat Stack Navigator
const ChatStackNavigator = () => {
  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false, // Hide header since ChatScreen has its own
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="ChatMain" 
        component={ChatScreen} 
        options={{ title: 'AI Assistant' }} 
      />
      <Stack.Screen 
        name="VoiceChat" 
        component={ComingSoonScreen} 
        options={{ title: 'Voice Chat', headerShown: true }} 
      />
      <Stack.Screen 
        name="ChatSettings" 
        component={ComingSoonScreen} 
        options={{ title: 'Chat Settings', headerShown: true }} 
      />
    </Stack.Navigator>
  );
};

// Analytics Stack Navigator
const AnalyticsStackNavigator = () => {
  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false, // Hide header since AnalyticsScreen has its own
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="AnalyticsMain" 
        component={AnalyticsScreen} 
        options={{ title: 'Analytics' }} 
      />
      <Stack.Screen 
        name="DetailedReports" 
        component={ComingSoonScreen} 
        options={{ title: 'Detailed Reports', headerShown: true }} 
      />
      <Stack.Screen 
        name="ExportData" 
        component={ComingSoonScreen} 
        options={{ title: 'Export Data', headerShown: true }} 
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#181818' : '#fff',
          borderTopColor: theme === 'dark' ? '#333' : '#e0e0e0',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={ClassicDashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TaskStackNavigator}
        options={{ tabBarLabel: 'Tasks' }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarStackNavigator}
        options={{ tabBarLabel: 'Calendar' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatStackNavigator}
        options={{ tabBarLabel: 'Chat' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsStackNavigator}
        options={{ tabBarLabel: 'Analytics' }}
      />
    </Tab.Navigator>
  );
};

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
              setInitialRoute('MainApp'); // User is logged in and completed onboarding
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
        {/* Authentication Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="NewsInterestsOnboarding" component={NewsInterestsOnboardingScreen} />
        
        {/* Main App with Tab Navigation */}
        <Stack.Screen name="MainApp" component={MainTabNavigator} />
        <Stack.Screen name="Home" component={MainTabNavigator} />
        
        {/* Legacy/Additional Screens */}
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Weather" component={WeatherScreen} />
        <Stack.Screen name="NewsFeed" component={NewsFeedScreen} />
        <Stack.Screen name="ComingSoon" component={ComingSoonScreen} />
        <Stack.Screen name="LegendaryTest" component={LegendaryIntegrationTestScreen} options={{ title: 'Backend Integration Test' }} />
        <Stack.Screen name="AuthTest" component={AuthTestScreen} options={{ title: 'Auth Testing' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
