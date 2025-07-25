// App.tsx

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';

// Hide scrollbar on web
if (typeof window !== 'undefined') {
  require('./hide-scrollbar.css');
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <TaskProvider>
          <AppNavigator />
        </TaskProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

