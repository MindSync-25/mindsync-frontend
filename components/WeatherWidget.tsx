import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useWeather } from '../context/WeatherContext';

type RootStackParamList = {
  Weather: undefined;
};

const WeatherWidget: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { currentWeather, isLoading } = useWeather();

  const dynamicStyles = StyleSheet.create({
    card: {
      backgroundColor: theme === 'light' ? '#f5f5f5' : '#181818',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#f5f5f5',
      marginBottom: 12,
    },
    listItemText: {
      fontSize: 14,
      color: theme === 'light' ? '#666' : '#aaa',
    },
  });

  const styles = StyleSheet.create({
    gridItem: {
      flex: 1,
      marginHorizontal: 6,
    },
    overviewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    weatherCircle: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#4CAF50',
      marginRight: 8,
    },
    weatherText: {
      color: theme === 'light' ? '#000' : '#f5f5f5',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const getWeatherIcon = (condition: string) => {
    const iconMap: { [key: string]: keyof typeof MaterialCommunityIcons.glyphMap } = {
      'clear': 'weather-sunny',
      'sunny': 'weather-sunny',
      'clouds': 'weather-cloudy',
      'rain': 'weather-rainy',
      'snow': 'weather-snowy',
      'thunderstorm': 'weather-lightning',
      'fog': 'weather-fog',
      'mist': 'weather-fog',
    };
    
    // Handle undefined or null condition
    if (!condition || typeof condition !== 'string') {
      return 'weather-partly-cloudy';
    }
    
    const lowerCondition = condition.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerCondition.includes(key)) {
        return icon;
      }
    }
    return 'weather-partly-cloudy';
  };

  const weatherData = currentWeather ? {
    temperature: Math.round(currentWeather.temperature),
    condition: currentWeather.condition,
    icon: getWeatherIcon(currentWeather.condition)
  } : {
    temperature: isLoading ? '--' : 72,
    condition: isLoading ? 'Loading...' : 'Tap to view weather',
    icon: 'weather-partly-cloudy' as keyof typeof MaterialCommunityIcons.glyphMap
  };

  return (
    <TouchableOpacity 
      style={[dynamicStyles.card, styles.gridItem]} 
      onPress={() => navigation.navigate('Weather')} 
      activeOpacity={0.8}
    >
      <Text style={dynamicStyles.cardTitle}>Weather</Text>
      <View style={styles.overviewRow}>
        <MaterialCommunityIcons
          name={weatherData.icon}
          size={20}
          color={theme === 'light' ? '#666' : '#aaa'}
          style={{ marginRight: 8 }}
        />
        <Text style={styles.weatherText}>{`${weatherData.temperature}°`}</Text>
      </View>
      <Text style={dynamicStyles.listItemText}>{weatherData.condition}</Text>
    </TouchableOpacity>
  );
};

export default WeatherWidget;
