import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import {
  fetchCurrentWeather,
  fetchHourlyForecast,
  fetchWeeklyForecast,
  fetchTaskRecommendations,
  WeatherApiResponse,
  HourlyForecastResponse,
  WeeklyForecastResponse,
  TaskRecommendationResponse,
} from '../services/weatherApi';

export interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  visibility: number;
  uvIndex: number;
  icon: string;
  location: string;
  timestamp: string;
  aiInsights?: string[];
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
  icon: string;
  precipitationChance: number;
}

export interface DailyForecast {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  precipitationChance: number;
  humidity: number;
  windSpeed: number;
}

export interface TaskRecommendation {
  taskId: string;
  recommendation: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface WeatherContextType {
  currentWeather: WeatherData | null;
  hourlyForecast: HourlyForecast[];
  weeklyForecast: DailyForecast[];
  taskRecommendations: TaskRecommendation[];
  isLoading: boolean;
  error: string | null;
  location: { latitude: number; longitude: number } | null;
  
  // Methods
  refreshWeatherData: () => Promise<void>;
  getTaskRecommendations: () => Promise<void>;
  clearWeatherData: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<DailyForecast[]>([]);
  const [taskRecommendations, setTaskRecommendations] = useState<TaskRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Get user location
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      setLocation(coords);
      return coords;
    } catch (err) {
      setError('Failed to get location');
      return null;
    }
  };

  // Load weather data from backend APIs
  const loadWeatherData = async (coords: { latitude: number; longitude: number }) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch current weather
      const currentData = await fetchCurrentWeather(coords.latitude, coords.longitude);
      setCurrentWeather(currentData);

      // Fetch hourly forecast
      try {
        const hourlyData = await fetchHourlyForecast(coords.latitude, coords.longitude);
        setHourlyForecast(hourlyData);
      } catch (err) {
        console.error('Failed to fetch hourly forecast:', err);
      }

      // Fetch weekly forecast
      try {
        const weeklyData = await fetchWeeklyForecast(coords.latitude, coords.longitude);
        setWeeklyForecast(weeklyData);
      } catch (err) {
        console.error('Failed to fetch weekly forecast:', err);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setIsLoading(false);
    }
  };

  // Get AI task recommendations based on weather
  const getTaskRecommendations = async () => {
    try {
      if (!currentWeather) return;

      const recommendations = await fetchTaskRecommendations(currentWeather, []);
      setTaskRecommendations(recommendations);
    } catch (err) {
      console.error('Failed to get task recommendations:', err);
    }
  };

  // Refresh all weather data
  const refreshWeatherData = async () => {
    const coords = location || await getUserLocation();
    if (coords) {
      await loadWeatherData(coords);
      await getTaskRecommendations();
    }
  };

  // Clear all weather data
  const clearWeatherData = () => {
    setCurrentWeather(null);
    setHourlyForecast([]);
    setWeeklyForecast([]);
    setTaskRecommendations([]);
    setError(null);
    setLocation(null);
  };

  // Initialize weather data on mount
  useEffect(() => {
    const initializeWeather = async () => {
      const coords = await getUserLocation();
      if (coords) {
        await loadWeatherData(coords);
      }
    };

    initializeWeather();
  }, []);

  const value: WeatherContextType = {
    currentWeather,
    hourlyForecast,
    weeklyForecast,
    taskRecommendations,
    isLoading,
    error,
    location,
    refreshWeatherData,
    getTaskRecommendations,
    clearWeatherData,
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = (): WeatherContextType => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
