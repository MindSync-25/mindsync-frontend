// App.tsx

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { WeatherProvider } from './context/WeatherContext';
import { NewsProvider } from './context/NewsContext';

// Hide scrollbar on web
if (typeof window !== 'undefined') {
  require('./hide-scrollbar.css');
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <TaskProvider>
          <WeatherProvider>
            <NewsProvider>
              <AppNavigator />
            </NewsProvider>
          </WeatherProvider>
        </TaskProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

