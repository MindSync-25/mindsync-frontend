import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useWeather } from '../context/WeatherContext';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  Weather: undefined;
};

const WeatherScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const {
    currentWeather,
    hourlyForecast,
    weeklyForecast,
    taskRecommendations,
    isLoading,
    error,
    refreshWeatherData,
  } = useWeather();
  
  const [activeTab, setActiveTab] = useState<'hourly' | 'weekly' | 'insights'>('hourly');

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? '#fff' : '#000',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      paddingTop: 50,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
    },
    currentWeatherCard: {
      margin: 20,
      padding: 24,
      borderRadius: 20,
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#1a1a1a',
      alignItems: 'center',
    },
    location: {
      fontSize: 18,
      color: theme === 'light' ? '#666' : '#aaa',
      marginBottom: 8,
    },
    temperature: {
      fontSize: 48,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 8,
    },
    condition: {
      fontSize: 20,
      color: theme === 'light' ? '#333' : '#ccc',
      marginBottom: 16,
    },
    weatherDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      width: '100%',
    },
    detailItem: {
      alignItems: 'center',
      marginHorizontal: 12,
      marginVertical: 8,
    },
    detailLabel: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
      marginTop: 4,
    },
    detailValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme === 'light' ? '#000' : '#fff',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      margin: 20,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: theme === 'light' ? '#fff' : '#555',
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme === 'light' ? '#666' : '#aaa',
    },
    activeTabText: {
      color: theme === 'light' ? '#000' : '#fff',
    },
    forecastContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    hourlyScroll: {
      paddingVertical: 16,
    },
    hourlyItem: {
      alignItems: 'center',
      marginRight: 16,
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#1a1a1a',
      minWidth: 80,
    },
    hourlyTime: {
      fontSize: 12,
      color: theme === 'light' ? '#666' : '#aaa',
      marginBottom: 8,
    },
    hourlyTemp: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      marginVertical: 8,
    },
    weeklyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#1a1a1a',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    dayName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme === 'light' ? '#000' : '#fff',
      width: 60,
    },
    weeklyCondition: {
      flex: 1,
      fontSize: 14,
      color: theme === 'light' ? '#666' : '#aaa',
      marginLeft: 16,
    },
    tempRange: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    insightsContainer: {
      padding: 20,
    },
    insightCard: {
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#1a1a1a',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    insightTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 8,
    },
    insightText: {
      fontSize: 14,
      color: theme === 'light' ? '#666' : '#aaa',
      lineHeight: 20,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      color: '#ff4444',
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: '#007AFF',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      hour12: true 
    });
  };

  const getWeatherIcon = (condition: string) => {
    const iconMap: { [key: string]: keyof typeof MaterialCommunityIcons.glyphMap } = {
      'clear': 'weather-sunny',
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

  if (error) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerTitle}>Weather</Text>
          <TouchableOpacity
            style={dynamicStyles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={theme === 'light' ? '#000' : '#fff'}
            />
          </TouchableOpacity>
        </View>
        <View style={dynamicStyles.errorContainer}>
          <Text style={dynamicStyles.errorText}>{error}</Text>
          <TouchableOpacity
            style={dynamicStyles.retryButton}
            onPress={refreshWeatherData}
          >
            <Text style={dynamicStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading && !currentWeather) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerTitle}>Weather</Text>
          <TouchableOpacity
            style={dynamicStyles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={theme === 'light' ? '#000' : '#fff'}
            />
          </TouchableOpacity>
        </View>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[dynamicStyles.insightText, { marginTop: 16 }]}>
            Loading weather data...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>Weather</Text>
        <TouchableOpacity
          style={dynamicStyles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={theme === 'light' ? '#000' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshWeatherData}
            tintColor={theme === 'light' ? '#000' : '#fff'}
          />
        }
      >
        {/* Current Weather */}
        {currentWeather && (
          <View style={dynamicStyles.currentWeatherCard}>
            <Text style={dynamicStyles.location}>{currentWeather.location}</Text>
            <Text style={dynamicStyles.temperature}>
              {Math.round(currentWeather.temperature)}°
            </Text>
            <Text style={dynamicStyles.condition}>{currentWeather.condition}</Text>
            
            <View style={dynamicStyles.weatherDetails}>
              <View style={dynamicStyles.detailItem}>
                <MaterialCommunityIcons
                  name="thermometer"
                  size={20}
                  color={theme === 'light' ? '#666' : '#aaa'}
                />
                <Text style={dynamicStyles.detailValue}>
                  {Math.round(currentWeather.feelsLike)}°
                </Text>
                <Text style={dynamicStyles.detailLabel}>Feels like</Text>
              </View>
              
              <View style={dynamicStyles.detailItem}>
                <MaterialCommunityIcons
                  name="water-percent"
                  size={20}
                  color={theme === 'light' ? '#666' : '#aaa'}
                />
                <Text style={dynamicStyles.detailValue}>{currentWeather.humidity}%</Text>
                <Text style={dynamicStyles.detailLabel}>Humidity</Text>
              </View>
              
              <View style={dynamicStyles.detailItem}>
                <MaterialCommunityIcons
                  name="weather-windy"
                  size={20}
                  color={theme === 'light' ? '#666' : '#aaa'}
                />
                <Text style={dynamicStyles.detailValue}>
                  {Math.round(currentWeather.windSpeed)} mph
                </Text>
                <Text style={dynamicStyles.detailLabel}>Wind</Text>
              </View>
              
              <View style={dynamicStyles.detailItem}>
                <MaterialCommunityIcons
                  name="white-balance-sunny"
                  size={20}
                  color={theme === 'light' ? '#666' : '#aaa'}
                />
                <Text style={dynamicStyles.detailValue}>{currentWeather.uvIndex}</Text>
                <Text style={dynamicStyles.detailLabel}>UV Index</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab Navigation */}
        <View style={dynamicStyles.tabContainer}>
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'hourly' && dynamicStyles.activeTab]}
            onPress={() => setActiveTab('hourly')}
          >
            <Text style={[
              dynamicStyles.tabText,
              activeTab === 'hourly' && dynamicStyles.activeTabText
            ]}>
              Hourly
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'weekly' && dynamicStyles.activeTab]}
            onPress={() => setActiveTab('weekly')}
          >
            <Text style={[
              dynamicStyles.tabText,
              activeTab === 'weekly' && dynamicStyles.activeTabText
            ]}>
              5-Day
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'insights' && dynamicStyles.activeTab]}
            onPress={() => setActiveTab('insights')}
          >
            <Text style={[
              dynamicStyles.tabText,
              activeTab === 'insights' && dynamicStyles.activeTabText
            ]}>
              AI Insights
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={dynamicStyles.forecastContainer}>
          {activeTab === 'hourly' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={dynamicStyles.hourlyScroll}
            >
              {(Array.isArray(hourlyForecast) ? hourlyForecast : []).slice(0, 12).map((hour, index) => (
                <View key={index} style={dynamicStyles.hourlyItem}>
                  <Text style={dynamicStyles.hourlyTime}>
                    {formatTime(hour.time)}
                  </Text>
                  <MaterialCommunityIcons
                    name={getWeatherIcon(hour.condition)}
                    size={24}
                    color={theme === 'light' ? '#666' : '#aaa'}
                  />
                  <Text style={dynamicStyles.hourlyTemp}>
                    {Math.round(hour.temperature)}°
                  </Text>
                  <Text style={dynamicStyles.detailLabel}>
                    {hour.precipitationChance}%
                  </Text>
                </View>
              ))}
              {(!hourlyForecast || hourlyForecast.length === 0) && (
                <View style={dynamicStyles.hourlyItem}>
                  <Text style={dynamicStyles.detailLabel}>No hourly data available</Text>
                </View>
              )}
            </ScrollView>
          )}

          {activeTab === 'weekly' && (
            <View>
              {(Array.isArray(weeklyForecast) ? weeklyForecast : []).map((day, index) => (
                <View key={index} style={dynamicStyles.weeklyItem}>
                  <Text style={dynamicStyles.dayName}>{day.day}</Text>
                  <MaterialCommunityIcons
                    name={getWeatherIcon(day.condition)}
                    size={24}
                    color={theme === 'light' ? '#666' : '#aaa'}
                  />
                  <Text style={dynamicStyles.weeklyCondition}>{day.condition}</Text>
                  <Text style={dynamicStyles.tempRange}>
                    {Math.round(day.high)}° / {Math.round(day.low)}°
                  </Text>
                </View>
              ))}
              {(!weeklyForecast || weeklyForecast.length === 0) && (
                <View style={dynamicStyles.weeklyItem}>
                  <Text style={dynamicStyles.detailLabel}>No weekly forecast available</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'insights' && (
            <View style={dynamicStyles.insightsContainer}>
              {currentWeather?.aiInsights && currentWeather.aiInsights.length > 0 ? (
                currentWeather.aiInsights.map((insight, index) => (
                  <View key={index} style={dynamicStyles.insightCard}>
                    <Text style={dynamicStyles.insightText}>{insight}</Text>
                  </View>
                ))
              ) : (
                <View style={dynamicStyles.insightCard}>
                  <Text style={dynamicStyles.insightTitle}>AI Weather Insights</Text>
                  <Text style={dynamicStyles.insightText}>
                    AI insights will appear here based on current weather conditions and your tasks.
                    Make sure to enable location services and sync your tasks for personalized recommendations.
                  </Text>
                </View>
              )}
              
              {taskRecommendations.length > 0 && (
                <>
                  <Text style={[dynamicStyles.insightTitle, { marginTop: 16, marginBottom: 16 }]}>
                    Task Recommendations
                  </Text>
                  {taskRecommendations.map((rec, index) => (
                    <View key={index} style={dynamicStyles.insightCard}>
                      <Text style={dynamicStyles.insightTitle}>
                        {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                      </Text>
                      <Text style={dynamicStyles.insightText}>{rec.recommendation}</Text>
                      <Text style={[dynamicStyles.detailLabel, { marginTop: 8 }]}>
                        {rec.reason}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default WeatherScreen;
